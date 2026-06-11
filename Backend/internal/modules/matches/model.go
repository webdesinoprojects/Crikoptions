package matches

import (
	"time"

	"go.mongodb.org/mongo-driver/bson/primitive"
)

type Match struct {
	ID           primitive.ObjectID `json:"_id" bson:"_id,omitempty"`
	TournamentID string             `json:"tournamentId" bson:"tournamentId"`
	Format       string             `json:"format" bson:"format"`
	TeamAID      string             `json:"teamAId" bson:"teamAId"`
	TeamBID      string             `json:"teamBId" bson:"teamBId"`
	TeamAName    string             `json:"teamAName" bson:"teamAName"`
	TeamBName    string             `json:"teamBName" bson:"teamBName"`
	TeamALogo    string             `json:"teamALogo" bson:"teamALogo"`
	TeamBLogo    string             `json:"teamBLogo" bson:"teamBLogo"`
	StartTime    time.Time          `json:"startTime" bson:"startTime"`
	Status       string             `json:"status" bson:"status"`
	Innings      int                `json:"innings" bson:"innings"`
	CurrentScore int                `json:"currentScore" bson:"currentScore"`
	WicketsLost  int                `json:"wicketsLost" bson:"wicketsLost"`
	BallsLeft    int                `json:"ballsLeft" bson:"ballsLeft"`
	OversText    string             `json:"oversText" bson:"oversText"`
	CreatedAt    time.Time          `json:"createdAt" bson:"createdAt"`
	UpdatedAt    time.Time          `json:"updatedAt" bson:"updatedAt"`
}

type ScoreUpdate struct {
	Innings      int    `json:"innings"`
	CurrentScore int    `json:"currentScore"`
	WicketsLost  int    `json:"wicketsLost"`
	BallsLeft    int    `json:"ballsLeft"`
	Status       string `json:"status"`
}
