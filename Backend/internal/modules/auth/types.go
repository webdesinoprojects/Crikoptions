package auth

import (
	"net/http"
	"time"

	"go.mongodb.org/mongo-driver/bson/primitive"
)

type User struct {
	ID        primitive.ObjectID `json:"id" bson:"_id,omitempty"`
	Name      string             `json:"name" bson:"name"`
	Email     string             `json:"email" bson:"email"`
	Phone     string             `json:"phone" bson:"phone"`
	Tier      string             `json:"tier" bson:"tier"` // e.g. "STANDARD", "PRO", "INSTITUTIONAL"
	Role      string             `json:"role" bson:"role"` // "user" (default) or "admin"
	Settings  UserSettings       `json:"settings" bson:"settings"`
	CreatedAt time.Time          `json:"createdAt" bson:"createdAt"`
	UpdatedAt time.Time          `json:"updatedAt" bson:"updatedAt"`
}

// IsAdmin reports whether the user has the admin role.
func (u *User) IsAdmin() bool {
	return u != nil && u.Role == "admin"
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

// CtxUserID is the request-context key under which RequireAuth stores the
// authenticated user's primitive.ObjectID. Exported so that other modules
// (orders, watchlist, admin match routes) can extract the same value.
const CtxUserID ctxKey = "userID"

// CtxRole is the request-context key under which RequireAuth stores the
// authenticated user's role string ("user" or "admin").
const CtxRole ctxKey = "role"

// UserIDFromContext returns the authenticated user's ObjectID from r's
// request context. ok is false when the context does not carry a valid ID.
func UserIDFromContext(r *http.Request) (primitive.ObjectID, bool) {
	id, ok := r.Context().Value(CtxUserID).(primitive.ObjectID)
	if !ok || id.IsZero() {
		return primitive.ObjectID{}, false
	}
	return id, true
}

// RoleFromContext returns the authenticated user's role string. ok is false
// when the context does not carry a value.
func RoleFromContext(r *http.Request) (string, bool) {
	role, ok := r.Context().Value(CtxRole).(string)
	return role, ok && role != ""
}
