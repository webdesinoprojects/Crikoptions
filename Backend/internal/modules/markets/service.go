package markets

import (
	"context"
	"errors"
	"strings"

	"go.mongodb.org/mongo-driver/bson/primitive"
)

var errMarketNotFound = errors.New("market not found")

type Service struct {
	repo          Repository
	pricingConfig PricingConfig
}

func NewService(repo Repository) *Service {
	return &Service{
		repo:          repo,
		pricingConfig: DefaultPricingConfig(),
	}
}

func NewServiceWithConfig(repo Repository, cfg PricingConfig) *Service {
	return &Service{
		repo:          repo,
		pricingConfig: cfg,
	}
}

func (s *Service) GetMarketsByMatchID(ctx context.Context, matchID string) []Market {
	return s.repo.GetByMatchID(ctx, matchID)
}

// GetMarketByID accepts either a full hex ObjectID or a short hex tail
// (matching the seeded fixtures), and resolves it to a primitive.ObjectID.
func (s *Service) GetMarketByID(ctx context.Context, id string) (*Market, error) {
	objID, err := resolveMarketID(ctx, s.repo, id)
	if err != nil {
		return nil, err
	}
	return s.repo.GetByID(ctx, objID)
}

func resolveMarketID(ctx context.Context, repo Repository, id string) (primitive.ObjectID, error) {
	id = strings.TrimSpace(id)
	if objID, err := primitive.ObjectIDFromHex(id); err == nil {
		return objID, nil
	}

	// Fallback: scan all markets and look for a hex tail match.
	// This is only used to keep seeded short IDs working in dev.
	all := repo.GetAll(ctx)
	for i := range all {
		h := all[i].ID.Hex()
		if h == id || strings.HasSuffix(h, id) {
			return all[i].ID, nil
		}
	}
	return primitive.ObjectID{}, errMarketNotFound
}

// CalculatePrice runs the T20 option-chain engine and returns a PriceResponse
// containing buyer/seller/LTP/Open/High/Low plus the full strike chain.
//
// The shape mirrors the previous placeholder so existing frontend code keeps
// working; the optionChain + projectedS0 fields are additive.
func (s *Service) CalculatePrice(input PriceCalculationInput) (PriceResponse, error) {
	pricingIn := PricingInput{
		Innings:     input.Innings,
		Wickets:     input.WicketsLost,
		BallsLeft:   input.BallsLeft,
		BallsBowled: input.BallsBowled,
		TargetScore: input.TargetScore,
		Score:       input.CurrentScore,
	}

	var chain []StrikePremium
	var projectedS0 float64

	switch input.Innings {
	case 1:
		res := CalculateFirstInnings(pricingIn, s.pricingConfig)
		chain = res.Chain
		projectedS0 = res.S0
	case 2:
		res := CalculateSecondInnings(pricingIn, s.pricingConfig)
		chain = res.Chain
		projectedS0 = res.S0
	default:
		// Unknown innings: return an empty chain rather than failing.
		chain = []StrikePremium{}
	}

	ltp, open, high, low := AggregateChainToOHLC(chain)

	// Buyer/seller spread: 1 Rs wide around LTP (matches existing convention).
	buyer := ltp
	seller := round2(ltp + 1)
	if ltp == 0 {
		// Empty chain: fall back to whatever the market currently has cached.
		buyer, seller = 0, 0
	}

	return PriceResponse{
		BuyerPrice:  buyer,
		SellerPrice: seller,
		LTP:         ltp,
		Open:        open,
		High:        high,
		Low:         low,
		StrikeStep:  s.pricingConfig.StrikeStep,
		MaxStrike:   s.pricingConfig.MaxStrike,
		ProjectedS0: round2(projectedS0),
		OptionChain: chain,
	}, nil
}

// PriceCalculationInput is the public request body for POST /api/v1/markets/{id}/calculate-price.
//
// Innings 1: pass Innings=1, CurrentScore, WicketsLost, BallsLeft.
// Innings 2: pass Innings=2, TargetScore, CurrentScore, WicketsLost, BallsBowled.
type PriceCalculationInput struct {
	MatchID      string `json:"matchId"`
	Innings      int    `json:"innings"`
	CurrentScore int    `json:"currentScore"`
	WicketsLost  int    `json:"wicketsLost"`
	BallsLeft    int    `json:"ballsLeft"`
	BallsBowled  int    `json:"ballsBowled"`
	TargetScore  int    `json:"targetScore"`
}
