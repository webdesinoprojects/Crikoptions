package matches

type Service struct {
	repo Repository
}

func NewService(repo Repository) *Service {
	return &Service{repo: repo}
}

func (s *Service) GetHomeMatches() []Match {
	return s.repo.GetAll()
}

func (s *Service) GetMatchByID(id string) (*Match, error) {
	return s.repo.GetByID(id)
}

func (s *Service) CreateMatch(req CreateMatchRequest) (*Match, error) {
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
	return s.repo.Create(match)
}

func (s *Service) UpdateMatchScore(id string, req UpdateScoreRequest) (*Match, error) {
	score := ScoreUpdate{
		Innings:      req.Innings,
		CurrentScore: req.CurrentScore,
		WicketsLost:  req.WicketsLost,
		BallsLeft:    req.BallsLeft,
		Status:       req.Status,
	}
	return s.repo.UpdateScore(id, score)
}
