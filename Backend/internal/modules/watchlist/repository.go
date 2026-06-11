package watchlist

import (
	"context"
	"errors"
	"sync"
	"time"

	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/bson/primitive"
	"go.mongodb.org/mongo-driver/mongo"
	"go.mongodb.org/mongo-driver/mongo/options"
)

type Repository interface {
	GetByUserID(ctx context.Context, userID primitive.ObjectID) []WatchlistItem
	Add(ctx context.Context, userID primitive.ObjectID, marketID string) (*WatchlistItem, error)
	Remove(ctx context.Context, userID primitive.ObjectID, marketID string) error
	GetByUserAndMarket(ctx context.Context, userID primitive.ObjectID, marketID string) (*WatchlistItem, error)
	EnsureIndexes(ctx context.Context) error
}

type MemoryRepository struct {
	items []WatchlistItem
	mu    sync.RWMutex
}

func NewMemoryRepository() *MemoryRepository {
	return &MemoryRepository{
		items: getSampleWatchlist(),
	}
}

func (r *MemoryRepository) GetByUserID(ctx context.Context, userID primitive.ObjectID) []WatchlistItem {
	r.mu.RLock()
	defer r.mu.RUnlock()

	uid := userID.Hex()
	var result []WatchlistItem
	for i := range r.items {
		if r.items[i].UserID.Hex() == uid {
			result = append(result, r.items[i])
		}
	}
	return result
}

func (r *MemoryRepository) Add(ctx context.Context, userID primitive.ObjectID, marketID string) (*WatchlistItem, error) {
	r.mu.Lock()
	defer r.mu.Unlock()

	uid := userID.Hex()
	// Check if already exists
	for i := range r.items {
		if r.items[i].UserID.Hex() == uid && r.items[i].MarketID == marketID {
			return &r.items[i], nil
		}
	}

	item := WatchlistItem{
		ID:        primitive.NewObjectID(),
		UserID:    userID,
		MarketID:  marketID,
		CreatedAt: time.Now().UTC(),
	}

	r.items = append(r.items, item)
	return &item, nil
}

func (r *MemoryRepository) Remove(ctx context.Context, userID primitive.ObjectID, marketID string) error {
	r.mu.Lock()
	defer r.mu.Unlock()

	uid := userID.Hex()
	for i := range r.items {
		if r.items[i].UserID.Hex() == uid && r.items[i].MarketID == marketID {
			r.items = append(r.items[:i], r.items[i+1:]...)
			return nil
		}
	}
	return nil
}

func (r *MemoryRepository) GetByUserAndMarket(ctx context.Context, userID primitive.ObjectID, marketID string) (*WatchlistItem, error) {
	r.mu.RLock()
	defer r.mu.RUnlock()

	uid := userID.Hex()
	for i := range r.items {
		if r.items[i].UserID.Hex() == uid && r.items[i].MarketID == marketID {
			return &r.items[i], nil
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
	return &MongoRepository{col: db.Collection("watchlist")}
}

func (r *MongoRepository) EnsureIndexes(ctx context.Context) error {
	// One entry per (user, market) — avoid duplicate watchlist items.
	indexes := []mongo.IndexModel{
		{
			Keys:    bson.D{{Key: "userId", Value: 1}, {Key: "marketId", Value: 1}},
			Options: options.Index().SetUnique(true).SetName("user_market_unique"),
		},
	}
	_, err := r.col.Indexes().CreateMany(ctx, indexes)
	return err
}

func (r *MongoRepository) GetByUserID(ctx context.Context, userID primitive.ObjectID) []WatchlistItem {
	ctx, cancel := timeoutCtx(ctx)
	defer cancel()

	cur, err := r.col.Find(ctx, bson.M{"userId": userID}, options.Find().SetSort(bson.D{{Key: "createdAt", Value: -1}}))
	if err != nil {
		return nil
	}
	defer cur.Close(ctx)

	var out []WatchlistItem
	if err := cur.All(ctx, &out); err != nil {
		return nil
	}
	return out
}

func (r *MongoRepository) Add(ctx context.Context, userID primitive.ObjectID, marketID string) (*WatchlistItem, error) {
	ctx, cancel := timeoutCtx(ctx)
	defer cancel()

	now := time.Now().UTC()
	doc := bson.M{
		"_id":       primitive.NewObjectID(),
		"userId":    userID,
		"marketId":  marketID,
		"createdAt": now,
	}
	if _, err := r.col.InsertOne(ctx, doc); err != nil {
		if isDuplicateKey(err) {
			// Already in watchlist: return the existing entry.
			existing, gerr := r.GetByUserAndMarket(ctx, userID, marketID)
			if gerr != nil {
				return nil, gerr
			}
			return existing, nil
		}
		return nil, err
	}

	return &WatchlistItem{
		ID:        doc["_id"].(primitive.ObjectID),
		UserID:    userID,
		MarketID:  marketID,
		CreatedAt: now,
	}, nil
}

func (r *MongoRepository) Remove(ctx context.Context, userID primitive.ObjectID, marketID string) error {
	ctx, cancel := timeoutCtx(ctx)
	defer cancel()

	_, err := r.col.DeleteOne(ctx, bson.M{"userId": userID, "marketId": marketID})
	return err
}

func (r *MongoRepository) GetByUserAndMarket(ctx context.Context, userID primitive.ObjectID, marketID string) (*WatchlistItem, error) {
	ctx, cancel := timeoutCtx(ctx)
	defer cancel()

	var item WatchlistItem
	err := r.col.FindOne(ctx, bson.M{"userId": userID, "marketId": marketID}).Decode(&item)
	if err != nil {
		if errors.Is(err, mongo.ErrNoDocuments) {
			return nil, nil
		}
		return nil, err
	}
	return &item, nil
}

func timeoutCtx(parent context.Context) (context.Context, context.CancelFunc) {
	return context.WithTimeout(parent, 5*time.Second)
}

func isDuplicateKey(err error) bool {
	var we mongo.WriteException
	if errors.As(err, &we) {
		for _, e := range we.WriteErrors {
			if e.Code == 11000 {
				return true
			}
		}
	}
	return false
}

func getSampleWatchlist() []WatchlistItem {
	return []WatchlistItem{
		{
			ID:        primitive.NewObjectID(),
			UserID:    sampleUserID,
			MarketID:  "market-1",
			CreatedAt: time.Now().UTC().Add(-2 * time.Hour),
		},
	}
}
