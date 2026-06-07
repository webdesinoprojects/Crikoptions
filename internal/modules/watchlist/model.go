package watchlist

import "time"

type WatchlistItem struct {
	ID        string    `json:"_id"`
	UserID    string    `json:"userId"`
	MarketID string    `json:"marketId"`
	Market  *MarketSummary `json:"market,omitempty"`
	CreatedAt time.Time `json:"createdAt"`
}

type MarketSummary struct {
	ID     string `json:"_id"`
	MatchID string `json:"matchId"`
	Title  string `json:"title"`
	Type  string `json:"type"`
	LTP    float64 `json:"ltp"`
}