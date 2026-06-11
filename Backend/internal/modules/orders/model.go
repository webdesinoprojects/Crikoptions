package orders

import (
	"time"

	"go.mongodb.org/mongo-driver/bson/primitive"
)

type Order struct {
	ID        primitive.ObjectID `json:"_id" bson:"_id,omitempty"`
	UserID    primitive.ObjectID `json:"userId" bson:"userId"`
	MatchID   string             `json:"matchId" bson:"matchId"`
	MarketID  string             `json:"marketId" bson:"marketId"`
	Side      string             `json:"side" bson:"side"`     // "buy" or "sell"
	Quantity  int                `json:"quantity" bson:"quantity"`
	Price     float64            `json:"price" bson:"price"`
	Status    string             `json:"status" bson:"status"` // "open", "executed", "cancelled", "closed"
	CreatedAt time.Time          `json:"createdAt" bson:"createdAt"`
	UpdatedAt time.Time          `json:"updatedAt" bson:"updatedAt"`
}
