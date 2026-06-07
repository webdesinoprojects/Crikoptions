package matches

import "time"

type Match struct {
	ID           string    `json:"_id"`
	TournamentID string    `json:"tournamentId"`
	Format       string    `json:"format"`
	TeamAID      string    `json:"teamAId"`
	TeamBID      string    `json:"teamBId"`
	TeamAName    string    `json:"teamAName"`
	TeamBName    string    `json:"teamBName"`
	TeamALogo    string    `json:"teamALogo"`
	TeamBLogo    string    `json:"teamBLogo"`
	StartTime    time.Time `json:"startTime"`
	Status       string    `json:"status"`
	Innings      int       `json:"innings"`
	CurrentScore int       `json:"currentScore"`
	WicketsLost  int       `json:"wicketsLost"`
	BallsLeft    int       `json:"ballsLeft"`
	OversText    string    `json:"oversText"`
	CreatedAt    time.Time `json:"createdAt"`
	UpdatedAt    time.Time `json:"updatedAt"`
}

type ScoreUpdate struct {
	Innings      int    `json:"innings"`
	CurrentScore int    `json:"currentScore"`
	WicketsLost  int    `json:"wicketsLost"`
	BallsLeft    int    `json:"ballsLeft"`
	Status       string `json:"status"`
}
