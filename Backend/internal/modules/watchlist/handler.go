package watchlist

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

func (h *Handler) GetWatchlist(w http.ResponseWriter, r *http.Request) {
	// For MVP, use hardcoded user ID
	userID := "user-1"

	items := h.service.GetUserWatchlist(userID)

	httpjson.Write(w, http.StatusOK, map[string]any{
		"success": true,
		"message": "Watchlist fetched successfully",
		"data":   items,
	})
}

func (h *Handler) AddToWatchlist(w http.ResponseWriter, r *http.Request) {
	userID := "user-1"

	var req AddWatchlistRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		httpjson.Write(w, http.StatusBadRequest, map[string]any{
			"success": false,
			"message": "Invalid request body",
		})
		return
	}

	if req.MarketID == "" {
		httpjson.Write(w, http.StatusBadRequest, map[string]any{
			"success": false,
			"message": "Market ID is required",
		})
		return
	}

	item, err := h.service.AddToWatchlist(userID, req)
	if err != nil {
		httpjson.Write(w, http.StatusNotFound, map[string]any{
			"success": false,
			"message": "Market not found",
		})
		return
	}

	httpjson.Write(w, http.StatusCreated, map[string]any{
		"success": true,
		"message": "Added to watchlist",
		"data":    item,
	})
}

func (h *Handler) RemoveFromWatchlist(w http.ResponseWriter, r *http.Request) {
	userID := "user-1"
	marketID := r.PathValue("marketId")

	if marketID == "" {
		httpjson.Write(w, http.StatusBadRequest, map[string]any{
			"success": false,
			"message": "Invalid market ID",
		})
		return
	}

	err := h.service.RemoveFromWatchlist(userID, marketID)
	if err != nil {
		httpjson.Write(w, http.StatusNotFound, map[string]any{
			"success": false,
			"message": "Watchlist item not found",
		})
		return
	}

	httpjson.Write(w, http.StatusOK, map[string]any{
		"success": true,
		"message": "Removed from watchlist",
	})
}