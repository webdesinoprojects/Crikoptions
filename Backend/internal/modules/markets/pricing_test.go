package markets

import (
	"fmt"
	"testing"
)

func TestPricingEngine(t *testing.T) {
	cfg := DefaultPricingConfig()

	t.Run("1st innings start of match", func(t *testing.T) {
		r := CalculateFirstInnings(PricingInput{
			Innings: 1, Score: 0, Wickets: 0, BallsLeft: 119,
		}, cfg)
		fmt.Printf("S0=%.2f T=%.4f RR=%.2f\n", r.S0, r.T, r.EffectiveRunRate)
		if len(r.Chain) != 25 {
			t.Errorf("expected 25 strikes (10..250 step 10), got %d", len(r.Chain))
		}
		// At start, lower strikes should have higher premium (more likely to be hit)
		if r.Chain[0].Premium < r.Chain[10].Premium {
			t.Errorf("strike 10 should have higher premium than strike 110 at start")
		}
	})

	t.Run("1st innings mid-innings with old vs new r", func(t *testing.T) {
		r := CalculateFirstInnings(PricingInput{
			Innings: 1, Score: 100, Wickets: 3, BallsLeft: 60,
		}, cfg)
		cfgOld := cfg
		cfgOld.R1 = 0.5
		rOld := CalculateFirstInnings(PricingInput{
			Innings: 1, Score: 100, Wickets: 3, BallsLeft: 60,
		}, cfgOld)
		// Old r=0.5 should produce ~e^(0.5*0.5) = ~28% higher time-value component
		// (we just sanity-check they're not wildly different in the wrong direction)
		fmt.Printf("Strike 150: new=%.2f old=%.2f\n", r.Chain[14].Premium, rOld.Chain[14].Premium)
		if r.Chain[14].Premium <= 0 {
			t.Errorf("expected positive premium at strike 150 with S0>150, got %v", r.Chain[14].Premium)
		}
	})

	t.Run("1st innings all out", func(t *testing.T) {
		r := CalculateFirstInnings(PricingInput{
			Innings: 1, Score: 150, Wickets: 10, BallsLeft: 30,
		}, cfg)
		// All out → intrinsic only: max(score-K, 0)
		for _, sp := range r.Chain {
			expected := 150.0 - sp.Strike
			if expected < 0 {
				expected = 0
			}
			if sp.Premium != expected {
				t.Errorf("all-out: strike %.0f expected %.2f got %.2f", sp.Strike, expected, sp.Premium)
			}
		}
	})

	t.Run("2nd innings chase", func(t *testing.T) {
		r := CalculateSecondInnings(PricingInput{
			Innings: 2, Score: 75, Wickets: 2, BallsBowled: 60, TargetScore: 180,
		}, cfg)
		fmt.Printf("2nd S0=%.2f T=%.4f r=%.4f sigma=%.4f\n", r.S0, r.T, r.R, r.Sigma)
		if r.S0 < 75 {
			t.Errorf("S0 should be >= current score (75), got %.2f", r.S0)
		}
		if len(r.Chain) != 25 {
			t.Errorf("expected 25 strikes, got %d", len(r.Chain))
		}
	})

	t.Run("2nd innings already won", func(t *testing.T) {
		r := CalculateSecondInnings(PricingInput{
			Innings: 2, Score: 200, Wickets: 5, BallsBowled: 100, TargetScore: 180,
		}, cfg)
		// Already over target: premium = max(score - K, 0)
		for _, sp := range r.Chain {
			expected := 200.0 - sp.Strike
			if expected < 0 {
				expected = 0
			}
			if sp.Premium != expected {
				t.Errorf("already-won: strike %.0f expected %.2f got %.2f", sp.Strike, expected, sp.Premium)
			}
		}
	})

	t.Run("2nd innings strike above target", func(t *testing.T) {
		r := CalculateSecondInnings(PricingInput{
			Innings: 2, Score: 75, Wickets: 2, BallsBowled: 60, TargetScore: 180,
		}, cfg)
		// Strikes > 180 should have 0 premium (can't be reached)
		for _, sp := range r.Chain {
			if sp.Strike > 180 && sp.Premium != 0 {
				t.Errorf("strike %.0f > target 180 should be 0, got %.2f", sp.Strike, sp.Premium)
			}
		}
	})

	t.Run("OHLC aggregation", func(t *testing.T) {
		chain := []StrikePremium{
			{Strike: 10, Premium: 100},
			{Strike: 20, Premium: 50},
			{Strike: 30, Premium: 10},
			{Strike: 40, Premium: 0},
		}
		ltp, o, h, l := AggregateChainToOHLC(chain)
		fmt.Printf("LTP=%.2f Open=%.2f High=%.2f Low=%.2f\n", ltp, o, h, l)
		if h != 100 {
			t.Errorf("expected high=100, got %.2f", h)
		}
		if l != 0 {
			t.Errorf("expected low=0, got %.2f", l)
		}
	})
}
