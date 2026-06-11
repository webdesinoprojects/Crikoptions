package markets

import (
	"time"

	"go.mongodb.org/mongo-driver/bson/primitive"
)

type Market struct {
	ID             primitive.ObjectID `json:"_id" bson:"_id,omitempty"`
	MatchID        string             `json:"matchId" bson:"matchId"`
	Title          string             `json:"title" bson:"title"`
	Type           string             `json:"type" bson:"type"`
	Status         string             `json:"status" bson:"status"`
	BuyerPrice     float64            `json:"buyerPrice" bson:"buyerPrice"`
	SellerPrice    float64            `json:"sellerPrice" bson:"sellerPrice"`
	LTP            float64            `json:"ltp" bson:"ltp"`
	Open           float64            `json:"open" bson:"open"`
	High           float64            `json:"high" bson:"high"`
	Low            float64            `json:"low" bson:"low"`
	QuantityLadder []LadderEntry      `json:"quantityLadder" bson:"quantityLadder"`
	CreatedAt      time.Time          `json:"createdAt" bson:"createdAt"`
	UpdatedAt      time.Time          `json:"updatedAt" bson:"updatedAt"`
}

type LadderEntry struct {
	BuyerQty   int     `json:"buyerQty" bson:"buyerQty"`
	BuyerPrice float64 `json:"buyerPrice" bson:"buyerPrice"`
	SellerPrice float64 `json:"sellerPrice" bson:"sellerPrice"`
	SellerQty  int     `json:"sellerQty" bson:"sellerQty"`
}
