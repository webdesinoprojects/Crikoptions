package watchlist

import (
	"sync"
	"time"
)

type Repository interface {
	GetByUserID(userID string) []WatchlistItem
	Add(userID, marketID string) (*WatchlistItem, error)
	Remove(userID, marketID string) error
	GetByUserAndMarket(userID, marketID string) (*WatchlistItem, error)
}

type MemoryRepository struct {
	items   []WatchlistItem
	mu      sync.RWMutex
}

func NewMemoryRepository() *MemoryRepository {
	return &MemoryRepository{
		items: getSampleWatchlist(),
	}
}

func (r *MemoryRepository) GetByUserID(userID string) []WatchlistItem {
	r.mu.RLock()
	defer r.mu.RUnlock()

	var result []WatchlistItem
	for i := range r.items {
		if r.items[i].UserID == userID {
			result = append(result, r.items[i])
		}
	}
	return result
}

func (r *MemoryRepository) Add(userID, marketID string) (*WatchlistItem, error) {
	r.mu.Lock()
	defer r.mu.Unlock()

	// Check if already exists
	for i := range r.items {
		if r.items[i].UserID == userID && r.items[i].MarketID == marketID {
			return &r.items[i], nil
		}
	}

	item := WatchlistItem{
		ID:        generateWatchlistID(),
		UserID:    userID,
		MarketID:  marketID,
		CreatedAt: time.Now(),
	}

	r.items = append(r.items, item)
	return &item, nil
}

func (r *MemoryRepository) Remove(userID, marketID string) error {
	r.mu.Lock()
	defer r.mu.Unlock()

	for i := range r.items {
		if r.items[i].UserID == userID && r.items[i].MarketID == marketID {
			r.items = append(r.items[:i], r.items[i+1:]...)
			return nil
		}
	}
	return nil
}

func (r *MemoryRepository) GetByUserAndMarket(userID, marketID string) (*WatchlistItem, error) {
	r.mu.RLock()
	defer r.mu.RUnlock()

	for i := range r.items {
		if r.items[i].UserID == userID && r.items[i].MarketID == marketID {
			return &r.items[i], nil
		}
	}
	return nil, nil
}

func getSampleWatchlist() []WatchlistItem {
	return []WatchlistItem{
		{
			ID:        "watchlist-1",
			UserID:    "user-1",
			MarketID:  "market-1",
			CreatedAt: time.Now().Add(-2 * time.Hour),
		},
	}
}

func generateWatchlistID() string {
	return "watchlist-" + time.Now().Format("20060102150405")
}