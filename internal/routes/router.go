package routes

import (
	"net/http"

	"github.com/webdesinoprojects/Crikoptions/backend/internal/modules/health"
	"github.com/webdesinoprojects/Crikoptions/backend/internal/modules/matches"
)

func NewRouter(healthHandler *health.Handler, matchesHandler *matches.Handler) http.Handler {
	mux := http.NewServeMux()

	if healthHandler != nil {
		health.RegisterRoutes(mux, healthHandler)
	}

	if matchesHandler != nil {
		matches.RegisterRoutes(mux, matchesHandler)
	}

	return mux
}
