package auth

import (
	"context"
	"errors"
	"strings"
	"time"

	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/bson/primitive"
	"go.mongodb.org/mongo-driver/mongo"
	"go.mongodb.org/mongo-driver/mongo/options"
)

type UserRepository interface {
	Create(ctx context.Context, rec userRecord) (User, error)
	FindByEmail(ctx context.Context, email string) (userRecord, bool, error)
	FindByID(ctx context.Context, id primitive.ObjectID) (User, bool, error)
	UpdateMe(ctx context.Context, id primitive.ObjectID, name *string, phone *string, settings *UserSettings) (User, error)
	EnsureIndexes(ctx context.Context) error
}

type MongoUserRepository struct {
	col *mongo.Collection
}

func NewMongoUserRepository(db *mongo.Database) *MongoUserRepository {
	return &MongoUserRepository{col: db.Collection("users")}
}

func (r *MongoUserRepository) EnsureIndexes(ctx context.Context) error {
	indexes := []mongo.IndexModel{
		{
			Keys:    bson.D{{Key: "email", Value: 1}},
			Options: options.Index().SetUnique(true),
		},
		{
			Keys:    bson.D{{Key: "phone", Value: 1}},
			Options: options.Index().SetUnique(true).SetSparse(true),
		},
	}

	_, err := r.col.Indexes().CreateMany(ctx, indexes)
	return err
}

func (r *MongoUserRepository) Create(ctx context.Context, rec userRecord) (User, error) {
	ctx, cancel := context.WithTimeout(ctx, 5*time.Second)
	defer cancel()

	_, err := r.col.InsertOne(ctx, rec)
	if err != nil {
		if isDuplicateKey(err) {
			if strings.Contains(strings.ToLower(err.Error()), "email") {
				return User{}, errEmailExists
			}
			if strings.Contains(strings.ToLower(err.Error()), "phone") {
				return User{}, errPhoneExists
			}
			return User{}, errEmailExists
		}
		return User{}, err
	}
	return rec.User, nil
}

func (r *MongoUserRepository) FindByEmail(ctx context.Context, email string) (userRecord, bool, error) {
	ctx, cancel := context.WithTimeout(ctx, 5*time.Second)
	defer cancel()

	var rec userRecord
	err := r.col.FindOne(ctx, bson.M{"email": strings.ToLower(strings.TrimSpace(email))}).Decode(&rec)
	if err != nil {
		if errors.Is(err, mongo.ErrNoDocuments) {
			return userRecord{}, false, nil
		}
		return userRecord{}, false, err
	}
	return rec, true, nil
}

func (r *MongoUserRepository) FindByID(ctx context.Context, id primitive.ObjectID) (User, bool, error) {
	ctx, cancel := context.WithTimeout(ctx, 5*time.Second)
	defer cancel()

	var rec userRecord
	err := r.col.FindOne(ctx, bson.M{"_id": id}).Decode(&rec)
	if err != nil {
		if errors.Is(err, mongo.ErrNoDocuments) {
			return User{}, false, nil
		}
		return User{}, false, err
	}
	return rec.User, true, nil
}

func (r *MongoUserRepository) UpdateMe(ctx context.Context, id primitive.ObjectID, name *string, phone *string, settings *UserSettings) (User, error) {
	set := bson.M{}
	if name != nil {
		set["name"] = strings.TrimSpace(*name)
	}
	if phone != nil {
		set["phone"] = strings.TrimSpace(*phone)
	}
	if settings != nil {
		set["settings"] = *settings
	}
	if len(set) == 0 {
		return User{}, errNothingToUpdate
	}
	set["updatedAt"] = time.Now().UTC()

	ctx, cancel := context.WithTimeout(ctx, 5*time.Second)
	defer cancel()

	res := r.col.FindOneAndUpdate(ctx, bson.M{"_id": id}, bson.M{"$set": set}, options.FindOneAndUpdate().SetReturnDocument(options.After))
	if err := res.Err(); err != nil {
		if errors.Is(err, mongo.ErrNoDocuments) {
			return User{}, errUserNotFound
		}
		if isDuplicateKey(err) {
			return User{}, errPhoneExists
		}
		return User{}, err
	}

	var rec userRecord
	if err := res.Decode(&rec); err != nil {
		return User{}, err
	}
	return rec.User, nil
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

	var bwe mongo.BulkWriteException
	if errors.As(err, &bwe) {
		for _, e := range bwe.WriteErrors {
			if e.Code == 11000 {
				return true
			}
		}
	}
	return false
}

type InMemoryUserRepository struct {
	users     map[string]userRecord
	usersByID map[primitive.ObjectID]userRecord
}

func NewInMemoryUserRepository() *InMemoryUserRepository {
	return &InMemoryUserRepository{
		users:     make(map[string]userRecord),
		usersByID: make(map[primitive.ObjectID]userRecord),
	}
}

func (r *InMemoryUserRepository) EnsureIndexes(ctx context.Context) error {
	return nil
}

func (r *InMemoryUserRepository) Create(ctx context.Context, rec userRecord) (User, error) {
	emailKey := strings.ToLower(strings.TrimSpace(rec.Email))
	if _, exists := r.users[emailKey]; exists {
		return User{}, errEmailExists
	}
	if rec.ID.IsZero() {
		rec.ID = primitive.NewObjectID()
	}
	r.users[emailKey] = rec
	r.usersByID[rec.ID] = rec
	return rec.User, nil
}

func (r *InMemoryUserRepository) FindByEmail(ctx context.Context, email string) (userRecord, bool, error) {
	emailKey := strings.ToLower(strings.TrimSpace(email))
	rec, exists := r.users[emailKey]
	if !exists {
		return userRecord{}, false, nil
	}
	return rec, true, nil
}

func (r *InMemoryUserRepository) FindByID(ctx context.Context, id primitive.ObjectID) (User, bool, error) {
	rec, exists := r.usersByID[id]
	if !exists {
		return User{}, false, nil
	}
	return rec.User, true, nil
}

func (r *InMemoryUserRepository) UpdateMe(ctx context.Context, id primitive.ObjectID, name *string, phone *string, settings *UserSettings) (User, error) {
	rec, exists := r.usersByID[id]
	if !exists {
		return User{}, errUserNotFound
	}
	if name != nil {
		rec.Name = strings.TrimSpace(*name)
	}
	if phone != nil {
		rec.Phone = strings.TrimSpace(*phone)
	}
	if settings != nil {
		rec.Settings = *settings
	}
	rec.UpdatedAt = time.Now().UTC()

	r.users[strings.ToLower(rec.Email)] = rec
	r.usersByID[id] = rec
	return rec.User, nil
}

