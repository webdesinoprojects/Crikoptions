package orders

import "go.mongodb.org/mongo-driver/bson/primitive"

// sampleUserID is a fixed ObjectID used only by the in-memory sample data
// so demo orders are associated with a stable "demo" user. Real production
// traffic always uses the ObjectID extracted from the JWT.
var sampleUserID = mustObjectIDFromHex("000000000000000000000001")

func mustObjectIDFromHex(s string) primitive.ObjectID {
	id, err := primitive.ObjectIDFromHex(s)
	if err != nil {
		panic(err)
	}
	return id
}
