package auth

import (
	"time"

	"go.mongodb.org/mongo-driver/bson/primitive"
)

type User struct {
	ID        primitive.ObjectID `json:"id" bson:"_id,omitempty"`
	Name      string             `json:"name" bson:"name"`
	Email     string             `json:"email" bson:"email"`
	Phone     string             `json:"phone" bson:"phone"`
	Tier      string             `json:"tier" bson:"tier"` // e.g. "STANDARD", "PRO", "INSTITUTIONAL"
	Settings  UserSettings       `json:"settings" bson:"settings"`
	CreatedAt time.Time          `json:"createdAt" bson:"createdAt"`
	UpdatedAt time.Time          `json:"updatedAt" bson:"updatedAt"`
}

type UserSettings struct {
	RiskLimits  RiskLimits  `json:"riskLimits" bson:"riskLimits"`
	Preferences Preferences `json:"preferences" bson:"preferences"`
}

type RiskLimits struct {
	MaxExposure    float64 `json:"maxExposure" bson:"maxExposure"`
	DefaultLeverage int    `json:"defaultLeverage" bson:"defaultLeverage"`
	AutoKillSwitch  bool   `json:"autoKillSwitch" bson:"autoKillSwitch"`
}

type Preferences struct {
	Theme                string `json:"theme" bson:"theme"`
	DataDensity          string `json:"dataDensity" bson:"dataDensity"`
	NotificationsEnabled bool   `json:"notificationsEnabled" bson:"notificationsEnabled"`
}

type userRecord struct {
	User         `bson:",inline"`
	PasswordHash string `bson:"passwordHash"`
}

type registerRequest struct {
	Name     string `json:"name"`
	Email    string `json:"email"`
	Phone    string `json:"phone"`
	Password string `json:"password"`
}

type loginRequest struct {
	Email    string `json:"email"`
	Password string `json:"password"`
}

type updateMeRequest struct {
	Name     *string       `json:"name"`
	Phone    *string       `json:"phone"`
	Settings *UserSettings `json:"settings"`
}

type ctxKey string

const ctxUserID ctxKey = "userID"
