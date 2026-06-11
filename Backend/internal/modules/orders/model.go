package orders

import "time"

type Order struct {
	ID        string    `json:"_id"`
	UserID    string    `json:"userId"`
	MatchID   string    `json:"matchId"`
	MarketID string    `json:"marketId"`
	Side     string    `json:"side"`  // "buy" or "sell"
	Quantity int       `json:"quantity"`
	Price    float64   `json:"price"`
	Status   string    `json:"status"` // "open", "executed", "cancelled", "closed"
	CreatedAt time.Time `json:"createdAt"`
	UpdatedAt time.Time `json:"updatedAt"`
}