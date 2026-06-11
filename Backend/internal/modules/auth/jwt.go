package auth

import (
	"crypto/hmac"
	"crypto/sha256"
	"encoding/base64"
	"encoding/json"
	"strings"
	"time"
)

type jwt struct {
	secret   []byte
	tokenTTL time.Duration
}

func newJWT(secret string, ttl time.Duration) (*jwt, error) {
	secret = strings.TrimSpace(secret)
	if secret == "" {
		return nil, errUnauthorized
	}
	return &jwt{secret: []byte(secret), tokenTTL: ttl}, nil
}

func (j *jwt) Issue(userID string) (string, error) {
	now := time.Now().UTC()
	payload := map[string]any{
		"sub": userID,
		"iat": now.Unix(),
		"exp": now.Add(j.tokenTTL).Unix(),
	}

	headerJSON, _ := json.Marshal(map[string]string{"alg": "HS256", "typ": "JWT"})
	payloadJSON, _ := json.Marshal(payload)

	enc := base64.RawURLEncoding
	headerPart := enc.EncodeToString(headerJSON)
	payloadPart := enc.EncodeToString(payloadJSON)
	signingInput := headerPart + "." + payloadPart

	sig := signHS256([]byte(signingInput), j.secret)
	return signingInput + "." + enc.EncodeToString(sig), nil
}

func (j *jwt) Parse(token string) (string, error) {
	parts := strings.Split(token, ".")
	if len(parts) != 3 {
		return "", errInvalidToken
	}

	enc := base64.RawURLEncoding
	signingInput := parts[0] + "." + parts[1]

	sig, err := enc.DecodeString(parts[2])
	if err != nil {
		return "", errInvalidToken
	}
	expected := signHS256([]byte(signingInput), j.secret)
	if !hmac.Equal(sig, expected) {
		return "", errInvalidToken
	}

	payloadBytes, err := enc.DecodeString(parts[1])
	if err != nil {
		return "", errInvalidToken
	}

	var payload struct {
		Sub string `json:"sub"`
		Exp int64  `json:"exp"`
	}
	if err := json.Unmarshal(payloadBytes, &payload); err != nil {
		return "", errInvalidToken
	}
	if payload.Sub == "" {
		return "", errInvalidToken
	}
	if payload.Exp > 0 && time.Now().UTC().Unix() > payload.Exp {
		return "", errTokenExpired
	}
	return payload.Sub, nil
}

func signHS256(data, secret []byte) []byte {
	mac := hmac.New(sha256.New, secret)
	_, _ = mac.Write(data)
	return mac.Sum(nil)
}
