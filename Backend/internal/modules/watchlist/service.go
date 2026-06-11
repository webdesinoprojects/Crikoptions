package watchlist

import (
	"context"
	"errors"

	"go.mongodb.org/mongo-driver/bson/primitive"

	"github.com/webdesinoprojects/Crikoptions/backend/internal/modules/markets"
)

var errMarketNotFound = errors.New("market not found")

type Service struct {
	repo       Repository
	marketsSvc *markets.Service
}

func NewService(repo Repository, marketsSvc *markets.Service) *Service {
	return &Service{repo: repo, marketsSvc: marketsSvc}
}

func (s *Service) GetUserWatchlist(ctx context.Context, userID primitive.ObjectID) []WatchlistItem {
	items := s.repo.GetByUserID(ctx, userID)

	for i := range items {
		if market, err := s.marketsSvc.GetMarketByID(ctx, items[i].MarketID); err == nil && market != nil {
			items[i].Market = &MarketSummary{
				ID:      market.ID.Hex(),
				MatchID: market.MatchID,
				Title:   market.Title,
				Type:    market.Type,
				LTP:     market.LTP,
			}
		}
	}

	return items
}

func (s *Service) AddToWatchlist(ctx context.Context, userID primitive.ObjectID, req AddWatchlistRequest) (*WatchlistItem, error) {
	market, err := s.marketsSvc.GetMarketByID(ctx, req.MarketID)
	if err != nil || market == nil {
		return nil, errMarketNotFound
	}

	return s.repo.Add(ctx, userID, req.MarketID)
}

func (s *Service) RemoveFromWatchlist(ctx context.Context, userID primitive.ObjectID, marketID string) error {
	return s.repo.Remove(ctx, userID, marketID)
}
