package auth

import (
	"context"
	"errors"
	"strings"
	"time"

	"go.mongodb.org/mongo-driver/bson/primitive"
)

type Service struct {
	repo UserRepository
	jwt  *jwt
}

func NewService(repo UserRepository, jwtSecret string, tokenTTL time.Duration) (*Service, error) {
	if repo == nil {
		return nil, errors.New("repo is required")
	}
	j, err := newJWT(jwtSecret, tokenTTL)
	if err != nil {
		return nil, errors.New("JWT_SECRET is required")
	}
	return &Service{repo: repo, jwt: j}, nil
}

func (s *Service) EnsureIndexes(ctx context.Context) error {
	ctx, cancel := context.WithTimeout(ctx, 10*time.Second)
	defer cancel()
	return s.repo.EnsureIndexes(ctx)
}

func (s *Service) Register(ctx context.Context, req registerRequest) (User, error) {
	req, err := validateRegister(req)
	if err != nil {
		return User{}, err
	}

	hash, err := hashPassword(req.Password)
	if err != nil {
		return User{}, err
	}

	now := time.Now().UTC()
	rec := userRecord{
		User: User{
			ID:        primitive.NewObjectID(),
			Name:      req.Name,
			Email:     req.Email,
			Phone:     req.Phone,
			Tier:      "STANDARD",
			Settings: UserSettings{
				RiskLimits: RiskLimits{
					MaxExposure:    10000.0,
					DefaultLeverage: 1,
					AutoKillSwitch:  false,
				},
				Preferences: Preferences{
					Theme:                "TERMINAL_DARK",
					DataDensity:          "COMPACT",
					NotificationsEnabled: true,
				},
			},
			CreatedAt: now,
			UpdatedAt: now,
		},
		PasswordHash: hash,
	}

	return s.repo.Create(ctx, rec)
}

func (s *Service) Login(ctx context.Context, req loginRequest) (User, string, error) {
	req, err := validateLogin(req)
	if err != nil {
		return User{}, "", err
	}

	rec, ok, err := s.repo.FindByEmail(ctx, req.Email)
	if err != nil {
		return User{}, "", err
	}
	if !ok || !verifyPassword(req.Password, rec.PasswordHash) {
		return User{}, "", errInvalidCreds
	}

	token, err := s.jwt.Issue(rec.ID.Hex())
	if err != nil {
		return User{}, "", errUnauthorized
	}

	return rec.User, token, nil
}

func (s *Service) ParseToken(token string) (primitive.ObjectID, error) {
	sub, err := s.jwt.Parse(token)
	if err != nil {
		return primitive.ObjectID{}, err
	}
	id, err := primitive.ObjectIDFromHex(sub)
	if err != nil {
		return primitive.ObjectID{}, errInvalidToken
	}
	return id, nil
}

func (s *Service) Me(ctx context.Context, userID primitive.ObjectID) (User, error) {
	u, ok, err := s.repo.FindByID(ctx, userID)
	if err != nil {
		return User{}, err
	}
	if !ok {
		return User{}, errUserNotFound
	}
	return u, nil
}

func (s *Service) UpdateMe(ctx context.Context, userID primitive.ObjectID, req updateMeRequest) (User, error) {
	var name *string
	if req.Name != nil {
		v := *req.Name
		v = strings.TrimSpace(v)
		if len(v) < 2 || len(v) > 80 {
			return User{}, errInvalidPayload
		}
		name = &v
	}

	var phone *string
	if req.Phone != nil {
		v := strings.TrimSpace(*req.Phone)
		if v != "" && !isValidPhone(v) {
			return User{}, errInvalidPayload
		}
		phone = &v
	}

	if name == nil && phone == nil && req.Settings == nil {
		return User{}, errNothingToUpdate
	}

	return s.repo.UpdateMe(ctx, userID, name, phone, req.Settings)
}
