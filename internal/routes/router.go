package routes

import (
	"net/http"

	"github.com/webdesinoprojects/Crikoptions/backend/internal/modules/health"
	"github.com/webdesinoprojects/Crikoptions/backend/internal/modules/matches"
	"github.com/webdesinoprojects/Crikoptions/backend/internal/modules/markets"
	"github.com/webdesinoprojects/Crikoptions/backend/internal/modules/watchlist"
)

func NewRouter(healthHandler *health.Handler, matchesHandler *matches.Handler, marketsHandler *markets.Handler, watchlistHandler *watchlist.Handler) http.Handler {
	mux := http.NewServeMux()

	if healthHandler != nil {
		health.RegisterRoutes(mux, healthHandler)
	}

	if matchesHandler != nil {
		matches.RegisterRoutes(mux, matchesHandler)
	}

	if marketsHandler != nil {
		markets.RegisterRoutes(mux, marketsHandler)
	}

	if watchlistHandler != nil {
		watchlist.RegisterRoutes(mux, watchlistHandler)
	}

	return mux
}
