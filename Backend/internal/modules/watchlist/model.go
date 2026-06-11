package watchlist

import (
	"time"

	"go.mongodb.org/mongo-driver/bson/primitive"
)

type WatchlistItem struct {
	ID        primitive.ObjectID `json:"_id" bson:"_id,omitempty"`
	UserID    primitive.ObjectID `json:"userId" bson:"userId"`
	MarketID  string             `json:"marketId" bson:"marketId"`
	Market    *MarketSummary     `json:"market,omitempty" bson:"-"`
	CreatedAt time.Time          `json:"createdAt" bson:"createdAt"`
}

type MarketSummary struct {
	ID      string  `json:"_id"`
	MatchID string  `json:"matchId"`
	Title   string  `json:"title"`
	Type    string  `json:"type"`
	LTP     float64 `json:"ltp"`
}
