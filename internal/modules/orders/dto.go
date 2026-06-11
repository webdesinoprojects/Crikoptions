package orders

import "time"

type CreateOrderRequest struct {
	MatchID  string `json:"matchId"`
	MarketID string `json:"marketId"`
	Side     string `json:"side"`  // "buy" or "sell"
	Quantity int    `json:"quantity"`
	Price    float64 `json:"price"`
}

type OrderResponse struct {
	ID        string    `json:"_id"`
	UserID    string    `json:"userId"`
	MatchID   string    `json:"matchId"`
	MarketID string    `json:"marketId"`
	Side     string    `json:"side"`
	Quantity int       `json:"quantity"`
	Price    float64   `json:"price"`
	Status   string    `json:"status"`
	CreatedAt time.Time `json:"createdAt"`
	UpdatedAt time.Time `json:"updatedAt"`
}

type CancelOrderRequest struct {
	Reason string `json:"reason"`
}