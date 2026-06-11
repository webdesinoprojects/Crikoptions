package matches

import (
	"context"
	"errors"
	"fmt"
	"sync"
	"time"

	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/bson/primitive"
	"go.mongodb.org/mongo-driver/mongo"
	"go.mongodb.org/mongo-driver/mongo/options"
)

type Repository interface {
	GetAll(ctx context.Context) []Match
	GetByID(ctx context.Context, id primitive.ObjectID) (*Match, error)
	Create(ctx context.Context, match Match) (*Match, error)
	UpdateScore(ctx context.Context, id primitive.ObjectID, score ScoreUpdate) (*Match, error)
	EnsureIndexes(ctx context.Context) error
}

type MemoryRepository struct {
	matches []Match
	mu      sync.RWMutex
}

func NewMemoryRepository() *MemoryRepository {
	return &MemoryRepository{
		matches: getSampleMatches(),
	}
}

func (r *MemoryRepository) GetAll(ctx context.Context) []Match {
	r.mu.RLock()
	defer r.mu.RUnlock()
	return r.matches
}

func (r *MemoryRepository) GetByID(ctx context.Context, id primitive.ObjectID) (*Match, error) {
	r.mu.RLock()
	defer r.mu.RUnlock()

	for i := range r.matches {
		if r.matches[i].ID == id {
			return &r.matches[i], nil
		}
	}
	return nil, nil
}

func (r *MemoryRepository) Create(ctx context.Context, match Match) (*Match, error) {
	r.mu.Lock()
	defer r.mu.Unlock()

	if match.ID.IsZero() {
		match.ID = primitive.NewObjectID()
	}
	if match.CreatedAt.IsZero() {
		match.CreatedAt = time.Now().UTC()
	}
	match.UpdatedAt = time.Now().UTC()

	r.matches = append(r.matches, match)
	return &match, nil
}

func (r *MemoryRepository) UpdateScore(ctx context.Context, id primitive.ObjectID, score ScoreUpdate) (*Match, error) {
	r.mu.Lock()
	defer r.mu.Unlock()

	for i := range r.matches {
		if r.matches[i].ID == id {
			r.matches[i].Innings = score.Innings
			r.matches[i].CurrentScore = score.CurrentScore
			r.matches[i].WicketsLost = score.WicketsLost
			r.matches[i].BallsLeft = score.BallsLeft
			r.matches[i].Status = score.Status
			r.matches[i].OversText = calculateOvers(score.BallsLeft)
			r.matches[i].UpdatedAt = time.Now().UTC()
			return &r.matches[i], nil
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
	return &MongoRepository{col: db.Collection("matches")}
}

func (r *MongoRepository) EnsureIndexes(ctx context.Context) error {
	indexes := []mongo.IndexModel{
		{
			Keys: bson.D{{Key: "startTime", Value: -1}},
		},
		{
			Keys: bson.D{{Key: "status", Value: 1}},
		},
	}
	_, err := r.col.Indexes().CreateMany(ctx, indexes)
	return err
}

func (r *MongoRepository) GetAll(ctx context.Context) []Match {
	ctx, cancel := timeoutCtx(ctx)
	defer cancel()

	cur, err := r.col.Find(ctx, bson.M{}, options.Find().SetSort(bson.D{{Key: "startTime", Value: -1}}))
	if err != nil {
		return nil
	}
	defer cur.Close(ctx)

	var out []Match
	if err := cur.All(ctx, &out); err != nil {
		return nil
	}
	return out
}

func (r *MongoRepository) GetByID(ctx context.Context, id primitive.ObjectID) (*Match, error) {
	ctx, cancel := timeoutCtx(ctx)
	defer cancel()

	var match Match
	err := r.col.FindOne(ctx, bson.M{"_id": id}).Decode(&match)
	if err != nil {
		if errors.Is(err, mongo.ErrNoDocuments) {
			return nil, nil
		}
		return nil, err
	}
	return &match, nil
}

func (r *MongoRepository) Create(ctx context.Context, match Match) (*Match, error) {
	ctx, cancel := timeoutCtx(ctx)
	defer cancel()

	if match.ID.IsZero() {
		match.ID = primitive.NewObjectID()
	}
	now := time.Now().UTC()
	if match.CreatedAt.IsZero() {
		match.CreatedAt = now
	}
	match.UpdatedAt = now

	if _, err := r.col.InsertOne(ctx, match); err != nil {
		return nil, err
	}
	return &match, nil
}

func (r *MongoRepository) UpdateScore(ctx context.Context, id primitive.ObjectID, score ScoreUpdate) (*Match, error) {
	ctx, cancel := timeoutCtx(ctx)
	defer cancel()

	set := bson.M{
		"innings":      score.Innings,
		"currentScore": score.CurrentScore,
		"wicketsLost":  score.WicketsLost,
		"ballsLeft":    score.BallsLeft,
		"status":       score.Status,
		"oversText":    calculateOvers(score.BallsLeft),
		"updatedAt":    time.Now().UTC(),
	}

	res := r.col.FindOneAndUpdate(
		ctx,
		bson.M{"_id": id},
		bson.M{"$set": set},
		options.FindOneAndUpdate().SetReturnDocument(options.After),
	)
	if err := res.Err(); err != nil {
		if errors.Is(err, mongo.ErrNoDocuments) {
			return nil, nil
		}
		return nil, err
	}

	var match Match
	if err := res.Decode(&match); err != nil {
		return nil, err
	}
	return &match, nil
}

func timeoutCtx(parent context.Context) (context.Context, context.CancelFunc) {
	return context.WithTimeout(parent, 5*time.Second)
}

func getSampleMatches() []Match {
	now := time.Now().UTC()
	one, _ := primitive.ObjectIDFromHex("0000000000000000000000aa")
	two, _ := primitive.ObjectIDFromHex("0000000000000000000000bb")
	three, _ := primitive.ObjectIDFromHex("0000000000000000000000cc")
	return []Match{
		{
			ID:           one,
			TournamentID: "tournament-1",
			Format:       "T20",
			TeamAID:      "team-1",
			TeamBID:      "team-2",
			TeamAName:    "CSK",
			TeamBName:    "MI",
			TeamALogo:    "/assets/csk-logo.png",
			TeamBLogo:    "/assets/mi-logo.png",
			StartTime:    now.Add(-30 * time.Minute),
			Status:       "live",
			Innings:      1,
			CurrentScore: 85,
			WicketsLost:  2,
			BallsLeft:    42,
			OversText:    "9.6",
			CreatedAt:    now.Add(-2 * time.Hour),
			UpdatedAt:    now,
		},
		{
			ID:           two,
			TournamentID: "tournament-1",
			Format:       "T20",
			TeamAID:      "team-3",
			TeamBID:      "team-4",
			TeamAName:    "RCB",
			TeamBName:    "KKR",
			TeamALogo:    "/assets/rcb-logo.png",
			TeamBLogo:    "/assets/kkr-logo.png",
			StartTime:    now.Add(2 * time.Hour),
			Status:       "upcoming",
			Innings:      1,
			CurrentScore: 0,
			WicketsLost:  0,
			BallsLeft:    120,
			OversText:    "0.0",
			CreatedAt:    now.Add(-3 * time.Hour),
			UpdatedAt:    now,
		},
		{
			ID:           three,
			TournamentID: "tournament-1",
			Format:       "T20",
			TeamAID:      "team-5",
			TeamBID:      "team-6",
			TeamAName:    "DC",
			TeamBName:    "SRH",
			TeamALogo:    "/assets/dc-logo.png",
			TeamBLogo:    "/assets/srh-logo.png",
			StartTime:    now.Add(-8 * 60 * time.Minute),
			Status:       "completed",
			Innings:      2,
			CurrentScore: 165,
			WicketsLost:  5,
			BallsLeft:    0,
			OversText:    "20.0",
			CreatedAt:    now.Add(-9 * time.Hour),
			UpdatedAt:    now,
		},
	}
}

func calculateOvers(ballsLeft int) string {
	const totalBalls = 120
	ballsPlayed := totalBalls - ballsLeft
	if ballsPlayed < 0 {
		ballsPlayed = 0
	}
	overs := ballsPlayed / 6
	balls := ballsPlayed % 6
	return fmt.Sprintf("%d.%d", overs, balls)
}
