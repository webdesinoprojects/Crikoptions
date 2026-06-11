package matches

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

func (h *Handler) GetHomeMatches(w http.ResponseWriter, r *http.Request) {
	matches := h.service.GetHomeMatches(r.Context())

	httpjson.Write(w, http.StatusOK, map[string]any{
		"success": true,
		"message": "Matches fetched successfully",
		"data":    matches,
	})
}

func (h *Handler) GetMatchDetail(w http.ResponseWriter, r *http.Request) {
	match, err := h.service.GetMatchByID(r.Context(), r.PathValue("id"))
	if err != nil || match == nil {
		httpjson.Write(w, http.StatusNotFound, map[string]any{
			"success": false,
			"message": "Match not found",
		})
		return
	}

	httpjson.Write(w, http.StatusOK, map[string]any{
		"success": true,
		"message": "Match detail fetched successfully",
		"data":    match,
	})
}

func (h *Handler) CreateMatch(w http.ResponseWriter, r *http.Request) {
	var req CreateMatchRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		httpjson.Write(w, http.StatusBadRequest, map[string]any{
			"success": false,
			"message": "Invalid request body",
		})
		return
	}

	if req.TeamAName == "" || req.TeamBName == "" {
		httpjson.Write(w, http.StatusBadRequest, map[string]any{
			"success": false,
			"message": "Team names are required",
		})
		return
	}

	match, err := h.service.CreateMatch(r.Context(), req)
	if err != nil {
		httpjson.Write(w, http.StatusInternalServerError, map[string]any{
			"success": false,
			"message": "Failed to create match",
		})
		return
	}

	httpjson.Write(w, http.StatusCreated, map[string]any{
		"success": true,
		"message": "Match created successfully",
		"data":    match,
	})
}

func (h *Handler) UpdateMatchScore(w http.ResponseWriter, r *http.Request) {
	var req UpdateScoreRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		httpjson.Write(w, http.StatusBadRequest, map[string]any{
			"success": false,
			"message": "Invalid request body",
		})
		return
	}

	if req.CurrentScore < 0 || req.WicketsLost < 0 || req.BallsLeft < 0 {
		httpjson.Write(w, http.StatusBadRequest, map[string]any{
			"success": false,
			"message": "Invalid score values",
		})
		return
	}

	if req.BallsLeft > 120 {
		httpjson.Write(w, http.StatusBadRequest, map[string]any{
			"success": false,
			"message": "Balls left cannot exceed 120 for T20",
		})
		return
	}

	match, err := h.service.UpdateMatchScore(r.Context(), r.PathValue("id"), req)
	if err != nil || match == nil {
		httpjson.Write(w, http.StatusNotFound, map[string]any{
			"success": false,
			"message": "Match not found",
		})
		return
	}

	httpjson.Write(w, http.StatusOK, map[string]any{
		"success": true,
		"message": "Match score updated successfully",
		"data":    match,
	})
}
