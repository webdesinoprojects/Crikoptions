package auth

import "net/http"

func RegisterRoutes(mux *http.ServeMux, handler *Handler) {
	mux.HandleFunc("POST /api/v1/auth/register", handler.Register)
	mux.HandleFunc("POST /api/v1/auth/login", handler.Login)
	mux.HandleFunc("GET /api/v1/auth/me", handler.RequireAuth(handler.Me))
	mux.HandleFunc("PATCH /api/v1/users/me", handler.RequireAuth(handler.UpdateMe))
}
