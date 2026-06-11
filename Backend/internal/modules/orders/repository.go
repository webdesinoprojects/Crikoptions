package orders

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
	GetByUserID(ctx context.Context, userID primitive.ObjectID, status, matchID string) []Order
	GetByID(ctx context.Context, id primitive.ObjectID) (*Order, error)
	Create(ctx context.Context, order Order) (*Order, error)
	Cancel(ctx context.Context, id primitive.ObjectID, userID primitive.ObjectID) (*Order, error)
	GetAll(ctx context.Context) []Order
	EnsureIndexes(ctx context.Context) error
}

type MemoryRepository struct {
	orders []Order
	mu     sync.RWMutex
}

func NewMemoryRepository() *MemoryRepository {
	return &MemoryRepository{
		orders: getSampleOrders(),
	}
}

func (r *MemoryRepository) GetByUserID(ctx context.Context, userID primitive.ObjectID, status, matchID string) []Order {
	r.mu.RLock()
	defer r.mu.RUnlock()

	uid := userID.Hex()
	var result []Order
	for i := range r.orders {
		order := r.orders[i]
		if order.UserID.Hex() != uid {
			continue
		}
		if status != "" && order.Status != status {
			continue
		}
		if matchID != "" && order.MatchID != matchID {
			continue
		}
		result = append(result, order)
	}
	return result
}

func (r *MemoryRepository) GetByID(ctx context.Context, id primitive.ObjectID) (*Order, error) {
	r.mu.RLock()
	defer r.mu.RUnlock()

	for i := range r.orders {
		if r.orders[i].ID == id {
			return &r.orders[i], nil
		}
	}
	return nil, nil
}

func (r *MemoryRepository) Create(ctx context.Context, order Order) (*Order, error) {
	r.mu.Lock()
	defer r.mu.Unlock()

	if order.ID.IsZero() {
		order.ID = primitive.NewObjectID()
	}
	order.Status = "open"
	order.CreatedAt = time.Now().UTC()
	order.UpdatedAt = order.CreatedAt

	r.orders = append(r.orders, order)
	return &order, nil
}

func (r *MemoryRepository) Cancel(ctx context.Context, id primitive.ObjectID, userID primitive.ObjectID) (*Order, error) {
	r.mu.Lock()
	defer r.mu.Unlock()

	uid := userID.Hex()
	for i := range r.orders {
		if r.orders[i].ID == id {
			if r.orders[i].UserID.Hex() != uid {
				return nil, nil
			}
			if r.orders[i].Status != "open" {
				return nil, nil
			}
			r.orders[i].Status = "cancelled"
			r.orders[i].UpdatedAt = time.Now().UTC()
			return &r.orders[i], nil
		}
	}
	return nil, nil
}

func (r *MemoryRepository) GetAll(ctx context.Context) []Order {
	r.mu.RLock()
	defer r.mu.RUnlock()
	return r.orders
}

func (r *MemoryRepository) EnsureIndexes(ctx context.Context) error {
	return nil
}

type MongoRepository struct {
	col *mongo.Collection
}

func NewMongoRepository(db *mongo.Database) *MongoRepository {
	return &MongoRepository{col: db.Collection("orders")}
}

func (r *MongoRepository) EnsureIndexes(ctx context.Context) error {
	indexes := []mongo.IndexModel{
		{
			Keys: bson.D{{Key: "userId", Value: 1}, {Key: "status", Value: 1}, {Key: "matchId", Value: 1}},
		},
	}
	_, err := r.col.Indexes().CreateMany(ctx, indexes)
	return err
}

func (r *MongoRepository) GetByUserID(ctx context.Context, userID primitive.ObjectID, status, matchID string) []Order {
	ctx, cancel := timeoutCtx(ctx)
	defer cancel()

	filter := bson.M{"userId": userID}
	if status != "" {
		filter["status"] = status
	}
	if matchID != "" {
		filter["matchId"] = matchID
	}

	cur, err := r.col.Find(ctx, filter, options.Find().SetSort(bson.D{{Key: "createdAt", Value: -1}}))
	if err != nil {
		return nil
	}
	defer cur.Close(ctx)

	var out []Order
	if err := cur.All(ctx, &out); err != nil {
		return nil
	}
	return out
}

func (r *MongoRepository) GetByID(ctx context.Context, id primitive.ObjectID) (*Order, error) {
	ctx, cancel := timeoutCtx(ctx)
	defer cancel()

	var order Order
	err := r.col.FindOne(ctx, bson.M{"_id": id}).Decode(&order)
	if err != nil {
		if errors.Is(err, mongo.ErrNoDocuments) {
			return nil, nil
		}
		return nil, err
	}
	return &order, nil
}

func (r *MongoRepository) Create(ctx context.Context, order Order) (*Order, error) {
	ctx, cancel := timeoutCtx(ctx)
	defer cancel()

	if order.ID.IsZero() {
		order.ID = primitive.NewObjectID()
	}
	order.Status = "open"
	now := time.Now().UTC()
	order.CreatedAt = now
	order.UpdatedAt = now

	if _, err := r.col.InsertOne(ctx, order); err != nil {
		return nil, err
	}
	return &order, nil
}

func (r *MongoRepository) Cancel(ctx context.Context, id primitive.ObjectID, userID primitive.ObjectID) (*Order, error) {
	ctx, cancel := timeoutCtx(ctx)
	defer cancel()

	res := r.col.FindOneAndUpdate(
		ctx,
		bson.M{"_id": id, "userId": userID, "status": "open"},
		bson.M{"$set": bson.M{"status": "cancelled", "updatedAt": time.Now().UTC()}},
		options.FindOneAndUpdate().SetReturnDocument(options.After),
	)
	if err := res.Err(); err != nil {
		if errors.Is(err, mongo.ErrNoDocuments) {
			return nil, nil
		}
		return nil, err
	}

	var order Order
	if err := res.Decode(&order); err != nil {
		return nil, err
	}
	return &order, nil
}

func (r *MongoRepository) GetAll(ctx context.Context) []Order {
	ctx, cancel := timeoutCtx(ctx)
	defer cancel()

	cur, err := r.col.Find(ctx, bson.M{})
	if err != nil {
		return nil
	}
	defer cur.Close(ctx)

	var out []Order
	if err := cur.All(ctx, &out); err != nil {
		return nil
	}
	return out
}

func timeoutCtx(parent context.Context) (context.Context, context.CancelFunc) {
	return context.WithTimeout(parent, 5*time.Second)
}

func getSampleOrders() []Order {
	now := time.Now().UTC()
	return []Order{
		{
			ID:        primitive.NewObjectID(),
			UserID:    sampleUserID,
			MatchID:   "1",
			MarketID:  "market-1",
			Side:      "buy",
			Quantity:  50,
			Price:     155,
			Status:    "executed",
			CreatedAt: now.Add(-1 * time.Hour),
			UpdatedAt: now.Add(-30 * time.Minute),
		},
		{
			ID:        primitive.NewObjectID(),
			UserID:    sampleUserID,
			MatchID:   "1",
			MarketID:  "market-2",
			Side:      "sell",
			Quantity:  30,
			Price:     160,
			Status:    "open",
			CreatedAt: now.Add(-15 * time.Minute),
			UpdatedAt: now.Add(-15 * time.Minute),
		},
	}
}
