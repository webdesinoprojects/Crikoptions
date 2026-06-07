package orders

import (
	"sync"
	"time"
)

type Repository interface {
	GetByUserID(userID, status, matchID string) []Order
	GetByID(id string) (*Order, error)
	Create(order Order) (*Order, error)
	Cancel(id string) (*Order, error)
	GetAll() []Order
}

type MemoryRepository struct {
	orders []Order
	mu     sync.RWMutex
}

func NewMemoryRepository() *MemoryRepository {
	return &MemoryRepository{
		orders: getSampleOrders(),
	}
}

func (r *MemoryRepository) GetByUserID(userID, status, matchID string) []Order {
	r.mu.RLock()
	defer r.mu.RUnlock()

	var result []Order
	for i := range r.orders {
		order := r.orders[i]
		if order.UserID != userID {
			continue
		}
		if status != "" && order.Status != status {
			continue
		}
		if matchID != "" && order.MatchID != matchID {
			continue
		}
		result = append(result, order)
	}
	return result
}

func (r *MemoryRepository) GetByID(id string) (*Order, error) {
	r.mu.RLock()
	defer r.mu.RUnlock()

	for i := range r.orders {
		if r.orders[i].ID == id {
			return &r.orders[i], nil
		}
	}
	return nil, nil
}

func (r *MemoryRepository) Create(order Order) (*Order, error) {
	r.mu.Lock()
	defer r.mu.Unlock()

	order.ID = generateOrderID()
	order.Status = "open"
	order.CreatedAt = time.Now()
	order.UpdatedAt = time.Now()

	r.orders = append(r.orders, order)
	return &order, nil
}

func (r *MemoryRepository) Cancel(id string) (*Order, error) {
	r.mu.Lock()
	defer r.mu.Unlock()

	for i := range r.orders {
		if r.orders[i].ID == id {
			if r.orders[i].Status != "open" {
				return nil, nil
			}
			r.orders[i].Status = "cancelled"
			r.orders[i].UpdatedAt = time.Now()
			return &r.orders[i], nil
		}
	}
	return nil, nil
}

func (r *MemoryRepository) GetAll() []Order {
	r.mu.RLock()
	defer r.mu.RUnlock()
	return r.orders
}

func getSampleOrders() []Order {
	return []Order{
		{
			ID:        "order-1",
			UserID:    "user-1",
			MatchID:   "1",
			MarketID: "market-1",
			Side:     "buy",
			Quantity:  50,
			Price:    155,
			Status:   "executed",
			CreatedAt: time.Now().Add(-1 * time.Hour),
			UpdatedAt: time.Now().Add(-30 * time.Minute),
		},
		{
			ID:        "order-2",
			UserID:    "user-1",
			MatchID:   "1",
			MarketID: "market-2",
			Side:     "sell",
			Quantity:  30,
			Price:    160,
			Status:   "open",
			CreatedAt: time.Now().Add(-15 * time.Minute),
			UpdatedAt: time.Now().Add(-15 * time.Minute),
		},
	}
}

func generateOrderID() string {
	return "order-" + time.Now().Format("20060102150405")
}