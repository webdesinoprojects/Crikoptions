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

func (j *jwt) Issue(userID, role string) (string, error) {
	now := time.Now().UTC()
	payload := map[string]any{
		"sub":  userID,
		"role": role,
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

// Claims is the parsed JWT payload.
type Claims struct {
	Sub  string `json:"sub"`
	Role string `json:"role"`
	Exp  int64  `json:"exp"`
	Iat  int64  `json:"iat"`
}

func (j *jwt) Parse(token string) (Claims, error) {
	parts := strings.Split(token, ".")
	if len(parts) != 3 {
		return Claims{}, errInvalidToken
	}

	enc := base64.RawURLEncoding
	signingInput := parts[0] + "." + parts[1]

	sig, err := enc.DecodeString(parts[2])
	if err != nil {
		return Claims{}, errInvalidToken
	}
	expected := signHS256([]byte(signingInput), j.secret)
	if !hmac.Equal(sig, expected) {
		return Claims{}, errInvalidToken
	}

	payloadBytes, err := enc.DecodeString(parts[1])
	if err != nil {
		return Claims{}, errInvalidToken
	}

	var payload Claims
	if err := json.Unmarshal(payloadBytes, &payload); err != nil {
		return Claims{}, errInvalidToken
	}
	if payload.Sub == "" {
		return Claims{}, errInvalidToken
	}
	if payload.Exp > 0 && time.Now().UTC().Unix() > payload.Exp {
		return Claims{}, errTokenExpired
	}
	return payload, nil
}

func signHS256(data, secret []byte) []byte {
	mac := hmac.New(sha256.New, secret)
	_, _ = mac.Write(data)
	return mac.Sum(nil)
}
