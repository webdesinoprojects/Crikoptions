package httpjson

import (
	"encoding/json"
	"net/http"
)

type APIResponse struct {
	Success bool         `json:"success"`
	Message string       `json:"message,omitempty"`
	Data    any          `json:"data,omitempty"`
	Error   *ErrorDetail `json:"error,omitempty"`
}

type ErrorDetail struct {
	Code    string `json:"code"`
	Details string `json:"details,omitempty"`
}

func Write(w http.ResponseWriter, status int, v any) {
	w.Header().Set("Content-Type", "application/json; charset=utf-8")
	w.WriteHeader(status)
	_ = json.NewEncoder(w).Encode(v)
}

func WriteSuccess(w http.ResponseWriter, status int, message string, data any) {
	Write(w, status, APIResponse{
		Success: true,
		Message: message,
		Data:    data,
	})
}

func WriteError(w http.ResponseWriter, status int, code string, message string, details string) {
	Write(w, status, APIResponse{
		Success: false,
		Message: message,
		Error: &ErrorDetail{
			Code:    code,
			Details: details,
		},
	})
}
