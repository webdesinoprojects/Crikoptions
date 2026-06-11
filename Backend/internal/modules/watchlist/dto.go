package watchlist

import "time"

type AddWatchlistRequest struct {
	MarketID string `json:"marketId"`
}

type WatchlistResponse struct {
	ID        string    `json:"_id"`
	UserID    string    `json:"userId"`
	MarketID string    `json:"marketId"`
	CreatedAt time.Time `json:"createdAt"`
}