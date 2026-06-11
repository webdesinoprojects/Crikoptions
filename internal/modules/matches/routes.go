package matches

import (
	"net/http"
)

func RegisterRoutes(mux *http.ServeMux, handler *Handler) {
	mux.HandleFunc("GET /api/v1/matches/home", func(w http.ResponseWriter, r *http.Request) {
		handler.GetHomeMatches(w, r)
	})

	mux.HandleFunc("GET /api/v1/matches/{id}", func(w http.ResponseWriter, r *http.Request) {
		handler.GetMatchDetail(w, r)
	})

	mux.HandleFunc("POST /api/v1/admin/matches", func(w http.ResponseWriter, r *http.Request) {
		handler.CreateMatch(w, r)
	})

	mux.HandleFunc("PATCH /api/v1/admin/matches/{id}/score", func(w http.ResponseWriter, r *http.Request) {
		handler.UpdateMatchScore(w, r)
	})
}
