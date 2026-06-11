package main

import (
	"context"
	"errors"
	"log"
	"net/http"
	"os"
	"os/signal"
	"strings"
	"syscall"
	"time"

	"github.com/webdesinoprojects/Crikoptions/backend/internal/config"
	"github.com/webdesinoprojects/Crikoptions/backend/internal/database"
	"github.com/webdesinoprojects/Crikoptions/backend/internal/middleware"
	"github.com/webdesinoprojects/Crikoptions/backend/internal/modules/auth"
	"github.com/webdesinoprojects/Crikoptions/backend/internal/modules/health"
	"github.com/webdesinoprojects/Crikoptions/backend/internal/modules/matches"
	"github.com/webdesinoprojects/Crikoptions/backend/internal/modules/markets"
	"github.com/webdesinoprojects/Crikoptions/backend/internal/modules/orders"
	"github.com/webdesinoprojects/Crikoptions/backend/internal/modules/watchlist"
	"github.com/webdesinoprojects/Crikoptions/backend/internal/routes"
)

func main() {
	cfg, err := config.Load()
	if err != nil {
		log.Fatalf("config load: %v", err)
	}

	// Try connecting to MongoDB. If it succeeds, all data-bearing modules use
	// Mongo-backed repositories. If it fails, they fall back to in-memory.
	mongo, err := database.ConnectMongo(context.Background(), cfg.MongoURI, cfg.MongoDB)
	useMongo := err == nil
	if err != nil {
		log.Printf("WARNING: MongoDB connect error: %v. Falling back to In-Memory repositories for all data modules.", err)
	} else {
		defer func() { _ = mongo.Close(context.Background()) }()
	}

	// Auth (always needed).
	var authRepo auth.UserRepository
	if useMongo {
		authRepo = auth.NewMongoUserRepository(mongo.DB)
	} else {
		authRepo = auth.NewInMemoryUserRepository()
	}

	adminEmails := parseAdminEmails(os.Getenv("ADMIN_EMAILS"))
	authService, err := auth.NewService(authRepo, cfg.JWTSecret, time.Duration(cfg.TokenHours)*time.Hour, adminEmails)
	if err != nil {
		log.Fatalf("auth service: %v", err)
	}
	if err := authService.EnsureIndexes(context.Background()); err != nil {
		log.Printf("WARNING: auth indexes: %v", err)
	}
	authHandler := auth.NewHandler(authService)

	// Matches.
	var matchesRepo matches.Repository
	if useMongo {
		matchesRepo = matches.NewMongoRepository(mongo.DB)
	} else {
		matchesRepo = matches.NewMemoryRepository()
	}
	matchesService := matches.NewService(matchesRepo)
	if useMongo {
		if err := matchesRepo.EnsureIndexes(context.Background()); err != nil {
			log.Printf("WARNING: matches indexes: %v", err)
		}
	}
	matchesHandler := matches.NewHandler(matchesService)

	// Markets.
	var marketsRepo markets.Repository
	if useMongo {
		marketsRepo = markets.NewMongoRepository(mongo.DB)
	} else {
		marketsRepo = markets.NewMemoryRepository()
	}
	marketsService := markets.NewService(marketsRepo)
	if useMongo {
		if err := marketsRepo.EnsureIndexes(context.Background()); err != nil {
			log.Printf("WARNING: markets indexes: %v", err)
		}
	}
	marketsHandler := markets.NewHandler(marketsService)

	// Orders.
	var ordersRepo orders.Repository
	if useMongo {
		ordersRepo = orders.NewMongoRepository(mongo.DB)
	} else {
		ordersRepo = orders.NewMemoryRepository()
	}
	ordersService := orders.NewService(ordersRepo, marketsService)
	if useMongo {
		if err := ordersRepo.EnsureIndexes(context.Background()); err != nil {
			log.Printf("WARNING: orders indexes: %v", err)
		}
	}
	ordersHandler := orders.NewHandler(ordersService)

	// Watchlist.
	var watchlistRepo watchlist.Repository
	if useMongo {
		watchlistRepo = watchlist.NewMongoRepository(mongo.DB)
	} else {
		watchlistRepo = watchlist.NewMemoryRepository()
	}
	watchlistService := watchlist.NewService(watchlistRepo, marketsService)
	if useMongo {
		if err := watchlistRepo.EnsureIndexes(context.Background()); err != nil {
			log.Printf("WARNING: watchlist indexes: %v", err)
		}
	}
	watchlistHandler := watchlist.NewHandler(watchlistService)

	healthHandler := health.NewHandler()
	router := routes.NewRouter(healthHandler, matchesHandler, authHandler, marketsHandler, watchlistHandler, ordersHandler)
	handler := middleware.Chain(router, middleware.Recover, middleware.Logger, middleware.CORS)

	srv := &http.Server{
		Addr:              ":" + cfg.Port,
		Handler:           handler,
		ReadHeaderTimeout: 5 * time.Second,
	}

	go func() {
		log.Printf("listening on http://localhost:%s", cfg.Port)
		if err := srv.ListenAndServe(); err != nil && !errors.Is(err, http.ErrServerClosed) {
			log.Fatalf("listen: %v", err)
		}
	}()

	stop := make(chan os.Signal, 1)
	signal.Notify(stop, syscall.SIGINT, syscall.SIGTERM)
	<-stop

	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	_ = srv.Shutdown(ctx)
}

func parseAdminEmails(s string) []string {
	var out []string
	for _, p := range strings.Split(s, ",") {
		p = strings.TrimSpace(p)
		if p != "" {
			out = append(out, p)
		}
	}
	return out
}
