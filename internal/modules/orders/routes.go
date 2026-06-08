package orders

import (
	"net/http"
)

func RegisterRoutes(mux *http.ServeMux, handler *Handler) {
	mux.HandleFunc("GET /api/v1/orders", func(w http.ResponseWriter, r *http.Request) {
		handler.GetOrders(w, r)
	})

	mux.HandleFunc("POST /api/v1/orders", func(w http.ResponseWriter, r *http.Request) {
		handler.CreateOrder(w, r)
	})

	mux.HandleFunc("PATCH /api/v1/orders/{id}/cancel", func(w http.ResponseWriter, r *http.Request) {
		handler.CancelOrder(w, r)
	})
}