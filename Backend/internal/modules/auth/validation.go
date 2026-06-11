package auth

import (
	"regexp"
	"strings"
)

var emailRegexp = regexp.MustCompile(`^[^\s@]+@[^\s@]+\.[^\s@]+$`)

func validateRegister(req registerRequest) (registerRequest, error) {
	req.Name = strings.TrimSpace(req.Name)
	req.Email = strings.ToLower(strings.TrimSpace(req.Email))
	req.Phone = strings.TrimSpace(req.Phone)

	if len(req.Name) < 2 || len(req.Name) > 80 {
		return registerRequest{}, errInvalidPayload
	}
	if req.Email == "" || !emailRegexp.MatchString(req.Email) {
		return registerRequest{}, errInvalidPayload
	}
	if req.Phone != "" && !isValidPhone(req.Phone) {
		return registerRequest{}, errInvalidPayload
	}
	if len(req.Password) < 8 || len(req.Password) > 128 {
		return registerRequest{}, errInvalidPayload
	}

	return req, nil
}

func validateLogin(req loginRequest) (loginRequest, error) {
	req.Email = strings.ToLower(strings.TrimSpace(req.Email))
	if req.Email == "" || req.Password == "" {
		return loginRequest{}, errInvalidCreds
	}
	return req, nil
}

func isValidPhone(phone string) bool {
	if len(phone) < 10 || len(phone) > 15 {
		return false
	}
	for _, ch := range phone {
		if ch < '0' || ch > '9' {
			return false
		}
	}
	return true
}
