package orders

import (
	"net/http"

	"github.com/webdesinoprojects/Crikoptions/backend/internal/modules/auth"
)

func RegisterRoutes(mux *http.ServeMux, handler *Handler, authHandler *auth.Handler) {
	// Read endpoints: RequireAuth sets ctx[CtxUserID] = userID.
	mux.HandleFunc("GET /api/v1/orders", authHandler.RequireAuth(handler.GetOrders))
	mux.HandleFunc("POST /api/v1/orders", authHandler.RequireAuth(handler.CreateOrder))
	mux.HandleFunc("PATCH /api/v1/orders/{id}/cancel", authHandler.RequireAuth(handler.CancelOrder))
}
