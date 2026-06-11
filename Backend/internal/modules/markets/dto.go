package markets

import "time"

type MarketResponse struct {
	ID             string       `json:"_id"`
	MatchID        string       `json:"matchId"`
	Title          string       `json:"title"`
	Type           string       `json:"type"`
	Status         string       `json:"status"`
	BuyerPrice     float64      `json:"buyerPrice"`
	SellerPrice    float64      `json:"sellerPrice"`
	LTP            float64      `json:"ltp"`
	Open           float64      `json:"open"`
	High           float64      `json:"high"`
	Low            float64      `json:"low"`
	QuantityLadder []LadderEntry `json:"quantityLadder"`
	CreatedAt      time.Time    `json:"createdAt"`
	UpdatedAt      time.Time    `json:"updatedAt"`
}

type PriceResponse struct {
	BuyerPrice  float64 `json:"buyerPrice"`
	SellerPrice float64 `json:"sellerPrice"`
	LTP         float64 `json:"ltp"`
	Open        float64 `json:"open"`
	High        float64 `json:"high"`
	Low         float64 `json:"low"`
}

type CreateMarketRequest struct {
	MatchID        string       `json:"matchId"`
	Title          string       `json:"title"`
	Type           string       `json:"type"`
	BuyerPrice     float64      `json:"buyerPrice"`
	SellerPrice    float64      `json:"sellerPrice"`
	LTP            float64      `json:"ltp"`
	Open           float64      `json:"open"`
	High           float64      `json:"high"`
	Low            float64      `json:"low"`
	QuantityLadder []LadderEntry `json:"quantityLadder"`
}
