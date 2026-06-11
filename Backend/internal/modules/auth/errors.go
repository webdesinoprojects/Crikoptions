package auth

import (
	"errors"
	"net/http"
)

var (
	errEmailExists     = errors.New("email already registered")
	errPhoneExists     = errors.New("phone already registered")
	errInvalidCreds    = errors.New("invalid credentials")
	errUserNotFound    = errors.New("user not found")
	errUnauthorized    = errors.New("unauthorized")
	errInvalidToken    = errors.New("invalid token")
	errTokenExpired    = errors.New("token expired")
	errInvalidPayload  = errors.New("invalid payload")
	errNothingToUpdate = errors.New("nothing to update")
)

func mapAuthError(err error) (int, string) {
	switch {
	case errors.Is(err, errInvalidPayload):
		return http.StatusBadRequest, "Invalid input"
	case errors.Is(err, errEmailExists), errors.Is(err, errPhoneExists):
		return http.StatusConflict, err.Error()
	case errors.Is(err, errInvalidCreds):
		return http.StatusUnauthorized, "Invalid email or password"
	case errors.Is(err, errUserNotFound):
		return http.StatusNotFound, "User not found"
	case errors.Is(err, errNothingToUpdate):
		return http.StatusBadRequest, "Nothing to update"
	case errors.Is(err, errTokenExpired), errors.Is(err, errInvalidToken), errors.Is(err, errUnauthorized):
		return http.StatusUnauthorized, "Unauthorized"
	default:
		return http.StatusInternalServerError, "Something went wrong"
	}
}
