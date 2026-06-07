package routes

import (
	"net/http"

	"github.com/webdesinoprojects/Crikoptions/backend/internal/modules/health"
	"github.com/webdesinoprojects/Crikoptions/backend/internal/modules/matches"
	"github.com/webdesinoprojects/Crikoptions/backend/internal/modules/markets"
)

func NewRouter(healthHandler *health.Handler, matchesHandler *matches.Handler, marketsHandler *markets.Handler) http.Handler {
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

	return mux
}
