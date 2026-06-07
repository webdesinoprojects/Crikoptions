package watchlist

import (
	"github.com/webdesinoprojects/Crikoptions/backend/internal/modules/markets"
)

type Service struct {
	repo       Repository
	marketsRepo markets.Repository
}

func NewService(repo Repository, marketsRepo markets.Repository) *Service {
	return &Service{repo: repo, marketsRepo: marketsRepo}
}

func (s *Service) GetUserWatchlist(userID string) []WatchlistItem {
	items := s.repo.GetByUserID(userID)

	// Add market details for each item
	for i := range items {
		if market, err := s.marketsRepo.GetByID(items[i].MarketID); err == nil && market != nil {
			items[i].Market = &MarketSummary{
				ID:     market.ID,
				MatchID: market.MatchID,
				Title:  market.Title,
				Type:   market.Type,
				LTP:    market.LTP,
			}
		}
	}

	return items
}

func (s *Service) AddToWatchlist(userID string, req AddWatchlistRequest) (*WatchlistItem, error) {
	// Validate market exists
	_, err := s.marketsRepo.GetByID(req.MarketID)
	if err != nil {
		return nil, err
	}

	return s.repo.Add(userID, req.MarketID)
}

func (s *Service) RemoveFromWatchlist(userID string, marketID string) error {
	return s.repo.Remove(userID, marketID)
}