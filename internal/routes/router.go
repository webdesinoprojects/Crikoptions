package routes

import (
	"net/http"

	"github.com/webdesinoprojects/Crikoptions/backend/internal/middleware"
	"github.com/webdesinoprojects/Crikoptions/backend/internal/modules/auth"
	"github.com/webdesinoprojects/Crikoptions/backend/internal/modules/health"
	"github.com/webdesinoprojects/Crikoptions/backend/internal/modules/matches"
)

func NewRouter(healthHandler *health.Handler, matchesHandler *matches.Handler, authHandler *auth.Handler) http.Handler {
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

	return middleware.Chain(mux,
		middleware.Recover,
		middleware.Logger,
	)
}
