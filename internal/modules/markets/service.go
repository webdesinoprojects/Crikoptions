package markets

type Service struct {
	repo Repository
}

func NewService(repo Repository) *Service {
	return &Service{repo: repo}
}

func (s *Service) GetMarketsByMatchID(matchID string) []Market {
	return s.repo.GetByMatchID(matchID)
}

func (s *Service) GetMarketByID(id string) (*Market, error) {
	return s.repo.GetByID(id)
}

func (s *Service) CalculatePrice(input PriceCalculationInput) (PriceResponse, error) {
	// Placeholder algorithm - will be replaced with client's algorithm later
	// For now, return static prices based on simple rules

	response := PriceResponse{
		BuyerPrice:  155,
		SellerPrice: 157,
		LTP:         156,
		Open:        124,
		High:        160,
		Low:         124,
	}

	return response, nil
}

type PriceCalculationInput struct {
	MatchID      string `json:"matchId"`
	Innings      int    `json:"innings"`
	CurrentScore int    `json:"currentScore"`
	WicketsLost  int    `json:"wicketsLost"`
	BallsLeft    int    `json:"ballsLeft"`
}