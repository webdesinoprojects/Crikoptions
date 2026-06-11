package orders

import (
	"context"
	"errors"

	"go.mongodb.org/mongo-driver/bson/primitive"
	"go.mongodb.org/mongo-driver/mongo"

	"github.com/webdesinoprojects/Crikoptions/backend/internal/modules/markets"
)

var errMarketNotFound = errors.New("market not found")
var errInvalidSide = errors.New("invalid side, must be 'buy' or 'sell'")
var errInvalidQuantity = errors.New("quantity must be positive")
var errInvalidPrice = errors.New("price must be positive")

type Service struct {
	repo        Repository
	marketsSvc *markets.Service
}

func NewService(repo Repository, marketsSvc *markets.Service) *Service {
	return &Service{repo: repo, marketsSvc: marketsSvc}
}

func (s *Service) GetUserOrders(ctx context.Context, userID primitive.ObjectID, status, matchID string) []Order {
	return s.repo.GetByUserID(ctx, userID, status, matchID)
}

func (s *Service) GetOrderByID(ctx context.Context, id primitive.ObjectID) (*Order, error) {
	return s.repo.GetByID(ctx, id)
}

func (s *Service) CreateOrder(ctx context.Context, userID primitive.ObjectID, req CreateOrderRequest) (*Order, error) {
	// Validate market exists
	market, err := s.marketsSvc.GetMarketByID(ctx, req.MarketID)
	if err != nil || market == nil {
		return nil, errMarketNotFound
	}

	// Validate side
	if req.Side != "buy" && req.Side != "sell" {
		return nil, errInvalidSide
	}

	// Validate quantity and price
	if req.Quantity <= 0 {
		return nil, errInvalidQuantity
	}
	if req.Price <= 0 {
		return nil, errInvalidPrice
	}

	order := Order{
		UserID:    userID,
		MatchID:   req.MatchID,
		MarketID:  req.MarketID,
		Side:      req.Side,
		Quantity: req.Quantity,
		Price:    req.Price,
	}

	return s.repo.Create(ctx, order)
}

func (s *Service) CancelOrder(ctx context.Context, id, userID primitive.ObjectID) (*Order, error) {
	existing, err := s.repo.GetByID(ctx, id)
	if err != nil {
		if errors.Is(err, mongo.ErrNoDocuments) {
			return nil, nil
		}
		return nil, err
	}
	if existing == nil {
		return nil, nil
	}
	if existing.UserID != userID {
		return nil, nil
	}

	return s.repo.Cancel(ctx, id, userID)
}