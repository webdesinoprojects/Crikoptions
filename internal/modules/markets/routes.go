package markets

import (
	"net/http"
)

func RegisterRoutes(mux *http.ServeMux, handler *Handler) {
	mux.HandleFunc("GET /api/v1/matches/{id}/markets", func(w http.ResponseWriter, r *http.Request) {
		handler.GetMarketsByMatchID(w, r)
	})

	mux.HandleFunc("GET /api/v1/markets/{id}", func(w http.ResponseWriter, r *http.Request) {
		handler.GetMarketDetail(w, r)
	})

	mux.HandleFunc("POST /api/v1/markets/{id}/calculate-price", func(w http.ResponseWriter, r *http.Request) {
		handler.CalculatePrice(w, r)
	})
}