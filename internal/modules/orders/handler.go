package orders

import (
	"encoding/json"
	"net/http"

	"github.com/webdesinoprojects/Crikoptions/backend/internal/shared/httpjson"
)

type Handler struct {
	service *Service
}

func NewHandler(service *Service) *Handler {
	return &Handler{service: service}
}

func (h *Handler) GetOrders(w http.ResponseWriter, r *http.Request) {
	userID := "user-1"
	status := r.URL.Query().Get("status")
	matchID := r.URL.Query().Get("matchId")

	orders := h.service.GetUserOrders(userID, status, matchID)

	httpjson.Write(w, http.StatusOK, map[string]any{
		"success": true,
		"message": "Orders fetched successfully",
		"data":   orders,
	})
}

func (h *Handler) CreateOrder(w http.ResponseWriter, r *http.Request) {
	userID := "user-1"

	var req CreateOrderRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		httpjson.Write(w, http.StatusBadRequest, map[string]any{
			"success": false,
			"message": "Invalid request body",
		})
		return
	}

	if req.MatchID == "" || req.MarketID == "" {
		httpjson.Write(w, http.StatusBadRequest, map[string]any{
			"success": false,
			"message": "Match ID and Market ID are required",
		})
		return
	}

	if req.Side != "buy" && req.Side != "sell" {
		httpjson.Write(w, http.StatusBadRequest, map[string]any{
			"success": false,
			"message": "Side must be 'buy' or 'sell'",
		})
		return
	}

	if req.Quantity <= 0 {
		httpjson.Write(w, http.StatusBadRequest, map[string]any{
			"success": false,
			"message": "Quantity must be positive",
		})
		return
	}

	order, err := h.service.CreateOrder(userID, req)
	if err != nil {
		httpjson.Write(w, http.StatusNotFound, map[string]any{
			"success": false,
			"message": "Market not found",
		})
		return
	}

	httpjson.Write(w, http.StatusCreated, map[string]any{
		"success": true,
		"message": "Order created successfully",
		"data":    order,
	})
}

func (h *Handler) CancelOrder(w http.ResponseWriter, r *http.Request) {
	orderID := r.PathValue("id")

	if orderID == "" {
		httpjson.Write(w, http.StatusBadRequest, map[string]any{
			"success": false,
			"message": "Invalid order ID",
		})
		return
	}

	order, err := h.service.CancelOrder(orderID)
	if err != nil || order == nil {
		httpjson.Write(w, http.StatusNotFound, map[string]any{
			"success": false,
			"message": "Order not found or cannot be cancelled",
		})
		return
	}

	httpjson.Write(w, http.StatusOK, map[string]any{
		"success": true,
		"message": "Order cancelled successfully",
		"data":    order,
	})
}