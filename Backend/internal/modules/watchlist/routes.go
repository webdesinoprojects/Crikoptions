package watchlist

import (
	"net/http"
)

func RegisterRoutes(mux *http.ServeMux, handler *Handler) {
	mux.HandleFunc("GET /api/v1/watchlist", func(w http.ResponseWriter, r *http.Request) {
		handler.GetWatchlist(w, r)
	})

	mux.HandleFunc("POST /api/v1/watchlist", func(w http.ResponseWriter, r *http.Request) {
		handler.AddToWatchlist(w, r)
	})

	mux.HandleFunc("DELETE /api/v1/watchlist/{marketId}", func(w http.ResponseWriter, r *http.Request) {
		handler.RemoveFromWatchlist(w, r)
	})
}