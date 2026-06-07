package markets

import (
	"net/http"
)

func RegisterRoutes(mux *http.ServeMux, handler *Handler) {
	mux.HandleFunc("GET /api/v1/matches/{matchId}/markets", func(w http.ResponseWriter, r *http.Request) {
		handler.GetMarketsByMatchID(w, r)
	})

	mux.HandleFunc("GET /api/v1/markets/{marketId}", func(w http.ResponseWriter, r *http.Request) {
		handler.GetMarketDetail(w, r)
	})

	mux.HandleFunc("POST /api/v1/markets/{marketId}/calculate-price", func(w http.ResponseWriter, r *http.Request) {
		handler.CalculatePrice(w, r)
	})
}