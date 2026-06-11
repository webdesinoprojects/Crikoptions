package watchlist

import (
	"net/http"

	"github.com/webdesinoprojects/Crikoptions/backend/internal/modules/auth"
)

func RegisterRoutes(mux *http.ServeMux, handler *Handler, authHandler *auth.Handler) {
	mux.HandleFunc("GET /api/v1/watchlist", authHandler.RequireAuth(handler.GetWatchlist))
	mux.HandleFunc("POST /api/v1/watchlist", authHandler.RequireAuth(handler.AddToWatchlist))
	mux.HandleFunc("DELETE /api/v1/watchlist/{marketId}", authHandler.RequireAuth(handler.RemoveFromWatchlist))
}
