package main

import (
	"context"
	"errors"
	"log"
	"net/http"
	"os"
	"os/signal"
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

	healthHandler := health.NewHandler()
	matchesRepo := matches.NewMemoryRepository()
	matchesService := matches.NewService(matchesRepo)
	matchesHandler := matches.NewHandler(matchesService)
	var authRepo auth.UserRepository
	mongo, err := database.ConnectMongo(context.Background(), cfg.MongoURI, cfg.MongoDB)
	if err != nil {
		log.Printf("WARNING: MongoDB connect error: %v. Falling back to In-Memory User Repository.", err)
		authRepo = auth.NewInMemoryUserRepository()
	} else {
		defer func() { _ = mongo.Close(context.Background()) }()
		authRepo = auth.NewMongoUserRepository(mongo.DB)
	}

	authService, err := auth.NewService(authRepo, cfg.JWTSecret, time.Duration(cfg.TokenHours)*time.Hour)
	if err != nil {
		log.Fatalf("auth service: %v", err)
	}
	if err := authService.EnsureIndexes(context.Background()); err != nil {
		log.Printf("WARNING: auth indexes: %v", err)
	}
	authHandler := auth.NewHandler(authService)

	marketsRepo := markets.NewMemoryRepository()
	marketsService := markets.NewService(marketsRepo)
	marketsHandler := markets.NewHandler(marketsService)
	watchlistRepo := watchlist.NewMemoryRepository()
	watchlistService := watchlist.NewService(watchlistRepo, marketsRepo)
	watchlistHandler := watchlist.NewHandler(watchlistService)
	ordersRepo := orders.NewMemoryRepository()
	ordersService := orders.NewService(ordersRepo, marketsRepo)
	ordersHandler := orders.NewHandler(ordersService)
	router := routes.NewRouter(healthHandler, matchesHandler, marketsHandler, watchlistHandler, ordersHandler, authHandler)
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
