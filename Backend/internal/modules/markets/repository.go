package markets

import (
	"sync"
	"time"
)

type Repository interface {
	GetByMatchID(matchID string) []Market
	GetByID(id string) (*Market, error)
}

type MemoryRepository struct {
	markets []Market
	mu      sync.RWMutex
}

func NewMemoryRepository() *MemoryRepository {
	return &MemoryRepository{
		markets: getSampleMarkets(),
	}
}

func (r *MemoryRepository) GetByMatchID(matchID string) []Market {
	r.mu.RLock()
	defer r.mu.RUnlock()

	var result []Market
	for i := range r.markets {
		if r.markets[i].MatchID == matchID {
			result = append(result, r.markets[i])
		}
	}
	return result
}

func (r *MemoryRepository) GetByID(id string) (*Market, error) {
	r.mu.RLock()
	defer r.mu.RUnlock()

	for i := range r.markets {
		if r.markets[i].ID == id {
			return &r.markets[i], nil
		}
	}
	return nil, nil
}

func getSampleMarkets() []Market {
	return []Market{
		{
			ID:          "market-1",
			MatchID:     "1",
			Title:       "CSK vs MI Match Depth",
			Type:        "match_depth",
			Status:      "active",
			BuyerPrice:  155,
			SellerPrice: 157,
			LTP:         156,
			Open:        124,
			High:        160,
			Low:         124,
			QuantityLadder: []LadderEntry{
				{BuyerQty: 570, BuyerPrice: 155, SellerPrice: 155.5, SellerQty: 400},
				{BuyerQty: 320, BuyerPrice: 156, SellerPrice: 156.5, SellerQty: 250},
				{BuyerQty: 150, BuyerPrice: 157, SellerPrice: 157.5, SellerQty: 180},
			},
			CreatedAt: time.Now().Add(-1 * time.Hour),
			UpdatedAt: time.Now(),
		},
		{
			ID:          "market-2",
			MatchID:     "1",
			Title:       "CSK vs MI - 1st Innings Score",
			Type:        "future",
			Status:      "active",
			BuyerPrice:  160,
			SellerPrice: 162,
			LTP:         161,
			Open:        150,
			High:        170,
			Low:         140,
			QuantityLadder: []LadderEntry{
				{BuyerQty: 200, BuyerPrice: 160, SellerPrice: 161, SellerQty: 150},
				{BuyerQty: 100, BuyerPrice: 161, SellerPrice: 162, SellerQty: 80},
			},
			CreatedAt: time.Now().Add(-2 * time.Hour),
			UpdatedAt: time.Now(),
		},
		{
			ID:          "market-3",
			MatchID:     "1",
			Title:       "CSK vs MI - Wicket Fall",
			Type:        "technical",
			Status:      "active",
			BuyerPrice:  45,
			SellerPrice: 47,
			LTP:        46,
			Open:        40,
			High:        55,
			Low:        35,
			QuantityLadder: []LadderEntry{
				{BuyerQty: 300, BuyerPrice: 45, SellerPrice: 46, SellerQty: 200},
				{BuyerQty: 150, BuyerPrice: 46, SellerPrice: 47, SellerQty: 100},
			},
			CreatedAt: time.Now().Add(-2 * time.Hour),
			UpdatedAt: time.Now(),
		},
		{
			ID:          "market-4",
			MatchID:     "2",
			Title:       "RCB vs KKR Match Depth",
			Type:        "match_depth",
			Status:      "active",
			BuyerPrice:  100,
			SellerPrice: 102,
			LTP:         101,
			Open:        98,
			High:        105,
			Low:         95,
			QuantityLadder: []LadderEntry{
				{BuyerQty: 400, BuyerPrice: 100, SellerPrice: 101, SellerQty: 300},
				{BuyerQty: 200, BuyerPrice: 101, SellerPrice: 102, SellerQty: 150},
			},
			CreatedAt: time.Now().Add(-3 * time.Hour),
			UpdatedAt: time.Now(),
		},
		{
			ID:          "market-5",
			MatchID:     "3",
			Title:       "DC vs SRH Match Depth",
			Type:        "match_depth",
			Status:      "closed",
			BuyerPrice:  180,
			SellerPrice: 182,
			LTP:         181,
			Open:        165,
			High:        190,
			Low:        160,
			QuantityLadder: []LadderEntry{
				{BuyerQty: 100, BuyerPrice: 180, SellerPrice: 181, SellerQty: 50},
			},
			CreatedAt: time.Now().Add(-10 * time.Hour),
			UpdatedAt: time.Now(),
		},
	}
}