package matches

import (
	"context"
	"errors"
	"strings"

	"go.mongodb.org/mongo-driver/bson/primitive"
)

var (
	errMatchNotFound = errors.New("match not found")
)

// Service is the matches domain service. The handler layer passes string IDs
// (hex or legacy short form) and the service is responsible for resolving
// them to primitive.ObjectID before hitting the repository.
type Service struct {
	repo Repository
}

func NewService(repo Repository) *Service {
	return &Service{repo: repo}
}

func (s *Service) GetHomeMatches(ctx context.Context) []Match {
	return s.repo.GetAll(ctx)
}

func (s *Service) GetMatchByID(ctx context.Context, id string) (*Match, error) {
	objID, err := resolveMatchID(ctx, s.repo, id)
	if err != nil {
		return nil, err
	}
	return s.repo.GetByID(ctx, objID)
}

func (s *Service) CreateMatch(ctx context.Context, req CreateMatchRequest) (*Match, error) {
	match := Match{
		TournamentID: req.TournamentID,
		Format:       "T20",
		TeamAID:      req.TeamAID,
		TeamBID:      req.TeamBID,
		TeamAName:    req.TeamAName,
		TeamBName:    req.TeamBName,
		TeamALogo:    req.TeamALogo,
		TeamBLogo:    req.TeamBLogo,
		StartTime:    req.StartTime,
		Status:       "upcoming",
		Innings:      1,
		CurrentScore: 0,
		WicketsLost:  0,
		BallsLeft:    120,
		OversText:    "0.0",
	}
	return s.repo.Create(ctx, match)
}

func (s *Service) UpdateMatchScore(ctx context.Context, id string, req UpdateScoreRequest) (*Match, error) {
	objID, err := resolveMatchID(ctx, s.repo, id)
	if err != nil {
		return nil, err
	}
	score := ScoreUpdate{
		Innings:      req.Innings,
		CurrentScore: req.CurrentScore,
		WicketsLost:  req.WicketsLost,
		BallsLeft:    req.BallsLeft,
		Status:       req.Status,
	}
	return s.repo.UpdateScore(ctx, objID, score)
}

// resolveMatchID turns the path-supplied ID into a primitive.ObjectID. It
// accepts hex ObjectIDs directly and falls back to matching against either
// the full hex or the last two characters of any seeded match's hex — so
// legacy short IDs like "aa" continue to work for the demo seed.
func resolveMatchID(ctx context.Context, repo Repository, id string) (primitive.ObjectID, error) {
	id = strings.TrimSpace(id)
	if objID, err := primitive.ObjectIDFromHex(id); err == nil {
		return objID, nil
	}

	matches := repo.GetAll(ctx)
	for i := range matches {
		h := matches[i].ID.Hex()
		if h == id || strings.HasSuffix(h, id) {
			return matches[i].ID, nil
		}
	}
	return primitive.ObjectID{}, errMatchNotFound
}
