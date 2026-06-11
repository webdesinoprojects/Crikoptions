package routes

import (
	"net/http"

	"github.com/webdesinoprojects/Crikoptions/backend/internal/modules/auth"
	"github.com/webdesinoprojects/Crikoptions/backend/internal/modules/health"
	"github.com/webdesinoprojects/Crikoptions/backend/internal/modules/matches"
	"github.com/webdesinoprojects/Crikoptions/backend/internal/modules/markets"
	"github.com/webdesinoprojects/Crikoptions/backend/internal/modules/orders"
	"github.com/webdesinoprojects/Crikoptions/backend/internal/modules/watchlist"
)

func NewRouter(healthHandler *health.Handler, matchesHandler *matches.Handler, marketsHandler *markets.Handler, watchlistHandler *watchlist.Handler, ordersHandler *orders.Handler, authHandler *auth.Handler) http.Handler {
	mux := http.NewServeMux()

	if healthHandler != nil {
		health.RegisterRoutes(mux, healthHandler)
	}

	if matchesHandler != nil {
		matches.RegisterRoutes(mux, matchesHandler)
	}

	if authHandler != nil {
		auth.RegisterRoutes(mux, authHandler)
	}

	if marketsHandler != nil {
		markets.RegisterRoutes(mux, marketsHandler)
	}

	if watchlistHandler != nil {
		watchlist.RegisterRoutes(mux, watchlistHandler)
	}

	if ordersHandler != nil {
		orders.RegisterRoutes(mux, ordersHandler)
	}

	return mux
}
