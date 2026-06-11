package markets

import (
	"encoding/json"
	"net/http"

	"github.com/webdesinoprojects/Crikoptions/backend/internal/shared/httpjson"
)

type Handler struct {
	service *Service
}

func NewHandler(service *Service) *Handler {
	return &Handler{service: service}
}

func (h *Handler) GetMarketsByMatchID(w http.ResponseWriter, r *http.Request) {
	matchID := r.PathValue("id")
	if matchID == "" {
		httpjson.Write(w, http.StatusBadRequest, map[string]any{
			"success": false,
			"message": "Invalid match ID",
		})
		return
	}

	markets := h.service.GetMarketsByMatchID(r.Context(), matchID)
	if markets == nil {
		markets = []Market{}
	}

	httpjson.Write(w, http.StatusOK, map[string]any{
		"success": true,
		"message": "Markets fetched successfully",
		"data":   markets,
	})
}

func (h *Handler) GetMarketDetail(w http.ResponseWriter, r *http.Request) {
	marketID := r.PathValue("id")
	if marketID == "" {
		httpjson.Write(w, http.StatusBadRequest, map[string]any{
			"success": false,
			"message": "Invalid market ID",
		})
		return
	}

	market, err := h.service.GetMarketByID(r.Context(), marketID)
	if err != nil || market == nil {
		httpjson.Write(w, http.StatusNotFound, map[string]any{
			"success": false,
			"message": "Market not found",
		})
		return
	}

	httpjson.Write(w, http.StatusOK, map[string]any{
		"success": true,
		"message": "Market detail fetched successfully",
		"data":   market,
	})
}

func (h *Handler) CalculatePrice(w http.ResponseWriter, r *http.Request) {
	marketID := r.PathValue("id")
	if marketID == "" {
		httpjson.Write(w, http.StatusBadRequest, map[string]any{
			"success": false,
			"message": "Invalid market ID",
		})
		return
	}

	var req struct {
		Innings      int `json:"innings"`
		CurrentScore int `json:"currentScore"`
		WicketsLost  int `json:"wicketsLost"`
		BallsLeft    int `json:"ballsLeft"`
		BallsBowled  int `json:"ballsBowled"`
		TargetScore  int `json:"targetScore"`
	}
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		httpjson.Write(w, http.StatusBadRequest, map[string]any{
			"success": false,
			"message": "Invalid request body",
		})
		return
	}

	if req.Innings != 1 && req.Innings != 2 {
		httpjson.Write(w, http.StatusBadRequest, map[string]any{
			"success": false,
			"message": "innings must be 1 or 2",
		})
		return
	}
	if req.WicketsLost < 0 || req.WicketsLost > 10 {
		httpjson.Write(w, http.StatusBadRequest, map[string]any{
			"success": false,
			"message": "wicketsLost must be between 0 and 10",
		})
		return
	}
	if req.Innings == 1 && (req.BallsLeft < 0 || req.BallsLeft > 120) {
		httpjson.Write(w, http.StatusBadRequest, map[string]any{
			"success": false,
			"message": "ballsLeft must be between 0 and 120 for 1st innings",
		})
		return
	}
	if req.Innings == 2 {
		if req.TargetScore <= 0 {
			httpjson.Write(w, http.StatusBadRequest, map[string]any{
				"success": false,
				"message": "targetScore must be positive for 2nd innings",
			})
			return
		}
		if req.BallsBowled < 0 || req.BallsBowled > 120 {
			httpjson.Write(w, http.StatusBadRequest, map[string]any{
				"success": false,
				"message": "ballsBowled must be between 0 and 120 for 2nd innings",
			})
			return
		}
	}

	result, err := h.service.CalculatePrice(PriceCalculationInput{
		MatchID:      marketID,
		Innings:      req.Innings,
		CurrentScore: req.CurrentScore,
		WicketsLost:  req.WicketsLost,
		BallsLeft:    req.BallsLeft,
		BallsBowled:  req.BallsBowled,
		TargetScore:  req.TargetScore,
	})
	if err != nil {
		httpjson.Write(w, http.StatusInternalServerError, map[string]any{
			"success": false,
			"message": "Failed to calculate price",
		})
		return
	}

	httpjson.Write(w, http.StatusOK, map[string]any{
		"success": true,
		"message": "Price calculated successfully",
		"data":    result,
	})
}
