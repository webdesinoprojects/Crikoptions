package markets

import (
	"math"
)

// PricingConfig holds tunable parameters for the option-chain engine.
// All values have sane T20 defaults but can be overridden per-call.
type PricingConfig struct {
	// 1st innings parameters
	Sigma1         float64 // volatility (default 0.30)
	R1             float64 // risk-free rate (default 0.05, not 0.5)
	MaxProjectedS0 float64 // ceiling on projected final score (default 260)
	Alpha          float64 // capping factor (default 1.0)
	DefaultRunRate float64 // fallback RR when no info (default 1.2)
	MinRunRateBase float64 // floor for effective RR (default 1.0)
	Beta           float64 // wicket-driven RR discount (default 0.2)

	// 2nd innings parameters
	SigmaBase  float64 // base vol when 0 balls remain (default 0.10)
	SigmaScale float64 // vol scale as balls remain (default 0.20)
	R2Base     float64 // base rate (default 0.02)
	R2TargetCo float64 // rate sensitivity to target (default 0.0001 = 1/10000)

	// Chain configuration
	StrikeStep float64 // spacing between strikes (default 10)
	MaxStrike  float64 // highest strike priced (default 250)
	BallsTotal int     // T20 = 120, configurable for other formats
}

// DefaultPricingConfig returns the standard T20 pricing configuration.
func DefaultPricingConfig() PricingConfig {
	return PricingConfig{
		Sigma1:         0.30,
		R1:             0.5,
		MaxProjectedS0: 260,
		Alpha:          1.0,
		DefaultRunRate: 1.2,
		MinRunRateBase: 1.0,
		Beta:           0.2,

		SigmaBase:  0.10,
		SigmaScale: 0.20,
		R2Base:     0.02,
		R2TargetCo: 0.0001,

		StrikeStep: 10,
		MaxStrike:  250,
		BallsTotal: 120,
	}
}

// PricingInput is the unified input for both innings.
// Innings 1: use Score + Wickets + BallsLeft (BallsBowled = BallsTotal - BallsLeft).
// Innings 2: use TargetScore + CurrentScore + WicketsLost + BallsBowled.
type PricingInput struct {
	Innings      int
	Score        int // 1st innings: current run total. 2nd innings: chase current score.
	Wickets      int // 0-10
	BallsLeft    int // 1st innings only (0-120)
	BallsBowled  int // 2nd innings only (0-120)
	TargetScore  int // 2nd innings only
}

// FirstInningsResult holds the chain + metadata for a 1st innings calc.
type FirstInningsResult struct {
	S0       float64
	T        float64
	Chain    []StrikePremium
	EffectiveRunRate float64
}

// SecondInningsResult holds the chain + metadata for a 2nd innings calc.
type SecondInningsResult struct {
	S0     float64
	T      float64
	Sigma  float64
	R      float64
	Chain  []StrikePremium
}

// CalculateFirstInnings projects the 1st innings final score S0 and prices a
// Black-Scholes call option chain against strikes from StrikeStep to MaxStrike.
func CalculateFirstInnings(in PricingInput, cfg PricingConfig) FirstInningsResult {
	res := FirstInningsResult{}

	if in.Wickets < 0 || in.Wickets > 10 || in.BallsLeft < 0 || in.BallsLeft > cfg.BallsTotal {
		return res
	}
	if in.Score < 0 {
		return res
	}

	ballsBowled := cfg.BallsTotal - in.BallsLeft

	// Effective run rate.
	var effectiveRR float64
	if in.Score == 0 || ballsBowled == 0 {
		effectiveRR = cfg.DefaultRunRate
	} else {
		currRR := float64(in.Score) / float64(ballsBowled)
		effectiveRR = math.Max(currRR, cfg.MinRunRateBase-cfg.Beta*(float64(in.Wickets)/10.0))
	}
	res.EffectiveRunRate = effectiveRR

	// Project final score.
	baseProj := float64(in.BallsLeft) * effectiveRR
	remain := cfg.MaxProjectedS0 - float64(in.Score)
	if remain < 0 {
		remain = 0
	}
	cappedProj := remain / (1.0 + cfg.Alpha*(float64(in.BallsLeft)/float64(cfg.BallsTotal)))
	S0 := float64(in.Score) + math.Min(baseProj, cappedProj)
	res.S0 = S0

	// Time decay factor.
	T := (float64(in.BallsLeft) / float64(cfg.BallsTotal)) * (1.0 - float64(in.Wickets)*0.1)
	if T < 0 {
		T = 0
	}
	res.T = T

	// Price each strike.
	res.Chain = make([]StrikePremium, 0, int(cfg.MaxStrike/cfg.StrikeStep))
	for K := cfg.StrikeStep; K <= cfg.MaxStrike; K += cfg.StrikeStep {
		premium := 0.0
		if in.Wickets >= 10 || in.BallsLeft <= 0 {
			premium = math.Max(float64(in.Score)-K, 0)
		} else {
			if T > 0 && S0 > 0 && K > 0 {
				sqrtT := math.Sqrt(T)
				sigma := cfg.Sigma1
				d1 := (math.Log(S0/K) + (cfg.R1+0.5*sigma*sigma)*T) / (sigma * sqrtT)
				d2 := d1 - sigma*sqrtT
				bs := S0*normCdf(d1) - K*math.Exp(-cfg.R1*T)*normCdf(d2)
				intrinsic := math.Max(S0-K, 0)
				premium = math.Max(bs, intrinsic)
			} else {
				premium = math.Max(S0-K, 0)
			}
		}
		res.Chain = append(res.Chain, StrikePremium{Strike: K, Premium: round2(premium)})
	}

	return res
}

// CalculateSecondInnings prices a chase option chain for the 2nd innings.
func CalculateSecondInnings(in PricingInput, cfg PricingConfig) SecondInningsResult {
	res := SecondInningsResult{}

	if in.TargetScore <= 0 || in.Score < 0 {
		return res
	}
	if in.Wickets < 0 || in.Wickets > 10 {
		return res
	}
	if in.BallsBowled < 0 || in.BallsBowled > cfg.BallsTotal {
		return res
	}

	ballsRemaining := cfg.BallsTotal - in.BallsBowled

	// Project achievable score S0.
	var S0 float64
	if ballsRemaining == 0 || in.Wickets == 10 {
		S0 = float64(in.Score)
	} else {
		wicketFactor := 1.0 + (10.0-float64(in.Wickets))/25.0
		potential := float64(in.TargetScore) *
			math.Pow(float64(ballsRemaining)/float64(cfg.BallsTotal), 0.8) *
			0.5 * wicketFactor
		gap := float64(in.TargetScore - in.Score)
		if gap < 0 {
			gap = 0
		}
		S0 = math.Max(float64(in.Score), float64(in.Score)+math.Min(gap, potential))
	}
	res.S0 = S0

	// Dynamic r and sigma.
	r := cfg.R2Base + float64(in.TargetScore)*cfg.R2TargetCo
	sigma := cfg.SigmaBase + cfg.SigmaScale*(float64(ballsRemaining)/float64(cfg.BallsTotal))
	res.R = r
	res.Sigma = sigma

	// Time factor.
	T := (float64(ballsRemaining) / float64(cfg.BallsTotal)) * (1.0 - float64(in.Wickets)*0.1)
	if T < 0 {
		T = 0
	}
	res.T = T

	// Price each strike.
	res.Chain = make([]StrikePremium, 0, int(cfg.MaxStrike/cfg.StrikeStep))
	for K := cfg.StrikeStep; K <= cfg.MaxStrike; K += cfg.StrikeStep {
		C := 0.0
		switch {
		case float64(in.Score) > float64(in.TargetScore):
			// Already passed the target.
			C = math.Max(float64(in.Score)-K, 0)
		case K > float64(in.TargetScore):
			// Strike above target — worthless for a Yes call.
			C = 0
		case ballsRemaining == 0 || in.Wickets == 10:
			// Innings over: cap payoff between 0 and target-K.
			C = math.Max(0, math.Min(float64(in.TargetScore)-K, float64(in.Score)-K))
		default:
			if T > 0 && S0 > 0 && K > 0 && sigma > 0 {
				sqrtT := math.Sqrt(T)
				lnS0K := math.Log(S0 / K)
				sigmaSq := sigma * sigma
				numerator := lnS0K + (r+sigmaSq/2.0)*T
				denom := sigma * sqrtT
				if denom == 0 {
					denom = 1e-10
				}
				d1 := numerator / denom
				d2 := d1 - sigma*sqrtT
				Nd1 := normCdf(d1)
				Nd2 := normCdf(d2)
				discount := math.Exp(-r * T)
				C = math.Max(0, S0*Nd1-K*discount*Nd2)
			} else {
				C = math.Max(0, S0-K)
			}
		}
		res.Chain = append(res.Chain, StrikePremium{Strike: K, Premium: round2(C)})
	}

	return res
}

// AggregateChainToOHLC collapses an option chain into a single "fair" price plus
// OHLC-style stats that match the existing PriceResponse shape.
// Heuristic: LTP = chain mid, Open/High/Low = min/premium bands across strikes.
func AggregateChainToOHLC(chain []StrikePremium) (ltp, open, high, low float64) {
	if len(chain) == 0 {
		return 0, 0, 0, 0
	}

	// LTP: take the strike closest to the median premium (most-traded strike proxy).
	premiums := make([]float64, len(chain))
	hi, lo := chain[0].Premium, chain[0].Premium
	sum := 0.0
	for i, sp := range chain {
		premiums[i] = sp.Premium
		sum += sp.Premium
		if sp.Premium > hi {
			hi = sp.Premium
		}
		if sp.Premium < lo {
			lo = sp.Premium
		}
	}
	avg := sum / float64(len(chain))

	// Open: lowest non-zero premium (first "open" bid on the book).
	openPrice := lo
	for _, p := range premiums {
		if p > 0 && p < openPrice {
			openPrice = p
		}
	}
	if openPrice <= 0 {
		openPrice = avg
	}

	return round2(avg), round2(openPrice), round2(hi), round2(lo)
}

// normCdf returns the standard normal cumulative distribution function.
// Unified implementation (replaces two different approximations in original JS).
// Uses math.Erfc for accuracy to ~1e-15.
func normCdf(x float64) float64 {
	return 0.5 * math.Erfc(-x/math.Sqrt2)
}

func round2(v float64) float64 {
	if math.IsNaN(v) || math.IsInf(v, 0) {
		return 0
	}
	return math.Round(v*100) / 100
}
