package markets

import (
	"context"
	"errors"
	"sync"
	"time"

	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/bson/primitive"
	"go.mongodb.org/mongo-driver/mongo"
)

type Repository interface {
	GetAll(ctx context.Context) []Market
	GetByMatchID(ctx context.Context, matchID string) []Market
	GetByID(ctx context.Context, id primitive.ObjectID) (*Market, error)
	EnsureIndexes(ctx context.Context) error
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

func (r *MemoryRepository) GetByMatchID(ctx context.Context, matchID string) []Market {
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

func (r *MemoryRepository) GetAll(ctx context.Context) []Market {
	r.mu.RLock()
	defer r.mu.RUnlock()
	out := make([]Market, len(r.markets))
	copy(out, r.markets)
	return out
}

func (r *MemoryRepository) GetByID(ctx context.Context, id primitive.ObjectID) (*Market, error) {
	r.mu.RLock()
	defer r.mu.RUnlock()

	for i := range r.markets {
		if r.markets[i].ID == id {
			return &r.markets[i], nil
		}
	}
	return nil, nil
}

func (r *MemoryRepository) EnsureIndexes(ctx context.Context) error {
	return nil
}

type MongoRepository struct {
	col *mongo.Collection
}

func NewMongoRepository(db *mongo.Database) *MongoRepository {
	return &MongoRepository{col: db.Collection("markets")}
}

func (r *MongoRepository) EnsureIndexes(ctx context.Context) error {
	indexes := []mongo.IndexModel{
		{Keys: bson.D{{Key: "matchId", Value: 1}}},
	}
	_, err := r.col.Indexes().CreateMany(ctx, indexes)
	return err
}

func (r *MongoRepository) GetAll(ctx context.Context) []Market {
	ctx, cancel := timeoutCtx(ctx)
	defer cancel()

	cur, err := r.col.Find(ctx, bson.M{})
	if err != nil {
		return nil
	}
	defer cur.Close(ctx)

	var out []Market
	if err := cur.All(ctx, &out); err != nil {
		return nil
	}
	return out
}

func (r *MongoRepository) GetByMatchID(ctx context.Context, matchID string) []Market {
	ctx, cancel := timeoutCtx(ctx)
	defer cancel()

	cur, err := r.col.Find(ctx, bson.M{"matchId": matchID})
	if err != nil {
		return nil
	}
	defer cur.Close(ctx)

	var out []Market
	if err := cur.All(ctx, &out); err != nil {
		return nil
	}
	return out
}

func (r *MongoRepository) GetByID(ctx context.Context, id primitive.ObjectID) (*Market, error) {
	ctx, cancel := timeoutCtx(ctx)
	defer cancel()

	var market Market
	err := r.col.FindOne(ctx, bson.M{"_id": id}).Decode(&market)
	if err != nil {
		if errors.Is(err, mongo.ErrNoDocuments) {
			return nil, nil
		}
		return nil, err
	}
	return &market, nil
}

func timeoutCtx(parent context.Context) (context.Context, context.CancelFunc) {
	return context.WithTimeout(parent, 5*time.Second)
}

func getSampleMarkets() []Market {
	now := time.Now().UTC()
	mk := func(hex, matchID, title, mtype string, ltp, open, high, low, buyer, seller float64, ladder []LadderEntry) Market {
		id, _ := primitive.ObjectIDFromHex(hex)
		return Market{
			ID:             id,
			MatchID:        matchID,
			Title:          title,
			Type:           mtype,
			Status:         "active",
			BuyerPrice:     buyer,
			SellerPrice:    seller,
			LTP:            ltp,
			Open:           open,
			High:           high,
			Low:            low,
			QuantityLadder: ladder,
			CreatedAt:      now.Add(-1 * time.Hour),
			UpdatedAt:      now,
		}
	}

	closedID, _ := primitive.ObjectIDFromHex("0000000000000000000000d5")

	return []Market{
		mk("0000000000000000000000d1", "1", "CSK vs MI Match Depth", "match_depth", 156, 124, 160, 124, 155, 157, []LadderEntry{
			{BuyerQty: 570, BuyerPrice: 155, SellerPrice: 155.5, SellerQty: 400},
			{BuyerQty: 320, BuyerPrice: 156, SellerPrice: 156.5, SellerQty: 250},
			{BuyerQty: 150, BuyerPrice: 157, SellerPrice: 157.5, SellerQty: 180},
		}),
		mk("0000000000000000000000d2", "1", "CSK vs MI - 1st Innings Score", "future", 161, 150, 170, 140, 160, 162, []LadderEntry{
			{BuyerQty: 200, BuyerPrice: 160, SellerPrice: 161, SellerQty: 150},
			{BuyerQty: 100, BuyerPrice: 161, SellerPrice: 162, SellerQty: 80},
		}),
		mk("0000000000000000000000d3", "1", "CSK vs MI - Wicket Fall", "technical", 46, 40, 55, 35, 45, 47, []LadderEntry{
			{BuyerQty: 300, BuyerPrice: 45, SellerPrice: 46, SellerQty: 200},
			{BuyerQty: 150, BuyerPrice: 46, SellerPrice: 47, SellerQty: 100},
		}),
		mk("0000000000000000000000d4", "2", "RCB vs KKR Match Depth", "match_depth", 101, 98, 105, 95, 100, 102, []LadderEntry{
			{BuyerQty: 400, BuyerPrice: 100, SellerPrice: 101, SellerQty: 300},
			{BuyerQty: 200, BuyerPrice: 101, SellerPrice: 102, SellerQty: 150},
		}),
		{
			ID:          closedID,
			MatchID:     "3",
			Title:       "DC vs SRH Match Depth",
			Type:        "match_depth",
			Status:      "closed",
			BuyerPrice:  180,
			SellerPrice: 182,
			LTP:         181,
			Open:        165,
			High:        190,
			Low:         160,
			QuantityLadder: []LadderEntry{
				{BuyerQty: 100, BuyerPrice: 180, SellerPrice: 181, SellerQty: 50},
			},
			CreatedAt: now.Add(-10 * time.Hour),
			UpdatedAt: now,
		},
	}
}
