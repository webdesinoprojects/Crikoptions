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

	markets := h.service.GetMarketsByMatchID(matchID)
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

	market, err := h.service.GetMarketByID(marketID)
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
	}
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		httpjson.Write(w, http.StatusBadRequest, map[string]any{
			"success": false,
			"message": "Invalid request body",
		})
		return
	}

	// Placeholder - will be replaced with client's algorithm
	_, _ = h.service.CalculatePrice(PriceCalculationInput{
		MatchID:      marketID,
		Innings:      req.Innings,
		CurrentScore: req.CurrentScore,
		WicketsLost:  req.WicketsLost,
		BallsLeft:    req.BallsLeft,
	})

	response := map[string]any{
		"success": true,
		"message": "Price calculated successfully (placeholder)",
		"data": map[string]any{
			"buyerPrice":  155,
			"sellerPrice": 157,
			"ltp":         156,
			"open":        124,
			"high":        160,
			"low":         124,
		},
	}

	httpjson.Write(w, http.StatusOK, response)
}
