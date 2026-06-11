package matches

import (
	"fmt"
	"sync"
	"time"
)

type Repository interface {
	GetAll() []Match
	GetByID(id string) (*Match, error)
	Create(match Match) (*Match, error)
	UpdateScore(id string, score ScoreUpdate) (*Match, error)
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

func (r *MemoryRepository) GetAll() []Match {
	r.mu.RLock()
	defer r.mu.RUnlock()
	return r.matches
}

func (r *MemoryRepository) GetByID(id string) (*Match, error) {
	r.mu.RLock()
	defer r.mu.RUnlock()

	for i := range r.matches {
		if r.matches[i].ID == id {
			return &r.matches[i], nil
		}
	}
	return nil, nil
}

func (r *MemoryRepository) Create(match Match) (*Match, error) {
	r.mu.Lock()
	defer r.mu.Unlock()

	match.ID = generateMatchID()
	match.CreatedAt = time.Now()
	match.UpdatedAt = time.Now()

	r.matches = append(r.matches, match)
	return &match, nil
}

func (r *MemoryRepository) UpdateScore(id string, score ScoreUpdate) (*Match, error) {
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
			r.matches[i].UpdatedAt = time.Now()
			return &r.matches[i], nil
		}
	}
	return nil, nil
}

func getSampleMatches() []Match {
	return []Match{
		{
			ID:           "1",
			TournamentID: "tournament-1",
			Format:       "T20",
			TeamAID:      "team-1",
			TeamBID:      "team-2",
			TeamAName:    "CSK",
			TeamBName:    "MI",
			TeamALogo:    "/assets/csk-logo.png",
			TeamBLogo:    "/assets/mi-logo.png",
			StartTime:    time.Now().Add(-30 * time.Minute),
			Status:       "live",
			Innings:      1,
			CurrentScore: 85,
			WicketsLost:  2,
			BallsLeft:    42,
			OversText:    "9.6",
			CreatedAt:    time.Now().Add(-2 * time.Hour),
			UpdatedAt:    time.Now(),
		},
		{
			ID:           "2",
			TournamentID: "tournament-1",
			Format:       "T20",
			TeamAID:      "team-3",
			TeamBID:      "team-4",
			TeamAName:    "RCB",
			TeamBName:    "KKR",
			TeamALogo:    "/assets/rcb-logo.png",
			TeamBLogo:    "/assets/kkr-logo.png",
			StartTime:    time.Now().Add(2 * time.Hour),
			Status:       "upcoming",
			Innings:      1,
			CurrentScore: 0,
			WicketsLost:  0,
			BallsLeft:    120,
			OversText:    "0.0",
			CreatedAt:    time.Now().Add(-3 * time.Hour),
			UpdatedAt:    time.Now(),
		},
		{
			ID:           "3",
			TournamentID: "tournament-1",
			Format:       "T20",
			TeamAID:      "team-5",
			TeamBID:      "team-6",
			TeamAName:    "DC",
			TeamBName:    "SRH",
			TeamALogo:    "/assets/dc-logo.png",
			TeamBLogo:    "/assets/srh-logo.png",
			StartTime:    time.Now().Add(-8 * 60 * time.Minute),
			Status:       "completed",
			Innings:      2,
			CurrentScore: 165,
			WicketsLost:  5,
			BallsLeft:    0,
			OversText:    "20.0",
			CreatedAt:    time.Now().Add(-9 * time.Hour),
			UpdatedAt:    time.Now(),
		},
	}
}

func calculateOvers(ballsLeft int) string {
	totalBalls := 120
	ballsPlayed := totalBalls - ballsLeft
	overs := ballsPlayed / 6
	balls := ballsPlayed % 6
	return fmt.Sprintf("%d.%d", overs, balls)
}

func generateMatchID() string {
	return fmt.Sprintf("match-%d", time.Now().UnixNano())
}
