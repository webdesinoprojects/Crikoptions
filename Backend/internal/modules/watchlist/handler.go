package watchlist

import (
	"encoding/json"
	"net/http"

	"github.com/webdesinoprojects/Crikoptions/backend/internal/modules/auth"
	"github.com/webdesinoprojects/Crikoptions/backend/internal/shared/httpjson"
)

type Handler struct {
	service *Service
}

func NewHandler(service *Service) *Handler {
	return &Handler{service: service}
}

func (h *Handler) GetWatchlist(w http.ResponseWriter, r *http.Request) {
	userID, ok := auth.UserIDFromContext(r)
	if !ok {
		httpjson.Write(w, http.StatusUnauthorized, map[string]any{
			"success": false,
			"message": "Unauthorized",
		})
		return
	}

	items := h.service.GetUserWatchlist(r.Context(), userID)

	httpjson.Write(w, http.StatusOK, map[string]any{
		"success": true,
		"message": "Watchlist fetched successfully",
		"data":   items,
	})
}

func (h *Handler) AddToWatchlist(w http.ResponseWriter, r *http.Request) {
	userID, ok := auth.UserIDFromContext(r)
	if !ok {
		httpjson.Write(w, http.StatusUnauthorized, map[string]any{
			"success": false,
			"message": "Unauthorized",
		})
		return
	}

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

	item, err := h.service.AddToWatchlist(r.Context(), userID, req)
	if err != nil {
		httpjson.Write(w, http.StatusInternalServerError, map[string]any{
			"success": false,
			"message": "Failed to add to watchlist",
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
	userID, ok := auth.UserIDFromContext(r)
	if !ok {
		httpjson.Write(w, http.StatusUnauthorized, map[string]any{
			"success": false,
			"message": "Unauthorized",
		})
		return
	}

	marketID := r.PathValue("marketId")
	if marketID == "" {
		httpjson.Write(w, http.StatusBadRequest, map[string]any{
			"success": false,
			"message": "Invalid market ID",
		})
		return
	}

	if err := h.service.RemoveFromWatchlist(r.Context(), userID, marketID); err != nil {
		httpjson.Write(w, http.StatusInternalServerError, map[string]any{
			"success": false,
			"message": "Failed to remove from watchlist",
		})
		return
	}

	httpjson.Write(w, http.StatusOK, map[string]any{
		"success": true,
		"message": "Removed from watchlist",
	})
}
