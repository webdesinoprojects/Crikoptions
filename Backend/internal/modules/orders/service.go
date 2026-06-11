package orders

import (
	"github.com/webdesinoprojects/Crikoptions/backend/internal/modules/markets"
)

type Service struct {
	repo        Repository
	marketsRepo markets.Repository
}

func NewService(repo Repository, marketsRepo markets.Repository) *Service {
	return &Service{repo: repo, marketsRepo: marketsRepo}
}

func (s *Service) GetUserOrders(userID, status, matchID string) []Order {
	return s.repo.GetByUserID(userID, status, matchID)
}

func (s *Service) GetOrderByID(id string) (*Order, error) {
	return s.repo.GetByID(id)
}

func (s *Service) CreateOrder(userID string, req CreateOrderRequest) (*Order, error) {
	// Validate market exists
	market, err := s.marketsRepo.GetByID(req.MarketID)
	if err != nil || market == nil {
		return nil, err
	}

	// Validate side
	if req.Side != "buy" && req.Side != "sell" {
		return nil, nil // Will return error
	}

	// Validate quantity and price
	if req.Quantity <= 0 || req.Price <= 0 {
		return nil, nil
	}

	order := Order{
		UserID:    userID,
		MatchID:   req.MatchID,
		MarketID:  req.MarketID,
		Side:      req.Side,
		Quantity: req.Quantity,
		Price:    req.Price,
	}

	return s.repo.Create(order)
}

func (s *Service) CancelOrder(id string) (*Order, error) {
	return s.repo.Cancel(id)
}