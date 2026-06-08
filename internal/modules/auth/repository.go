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
	UpdateMe(ctx context.Context, id primitive.ObjectID, name *string, phone *string) (User, error)
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

func (r *MongoUserRepository) UpdateMe(ctx context.Context, id primitive.ObjectID, name *string, phone *string) (User, error) {
	set := bson.M{}
	if name != nil {
		set["name"] = strings.TrimSpace(*name)
	}
	if phone != nil {
		set["phone"] = strings.TrimSpace(*phone)
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
