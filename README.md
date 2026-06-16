# 🏏 PitchSide Pro Terminal (CrikOptions)

> Institutional-grade sports trading and analytics workstation. A "Bloomberg Terminal" experience for sports derivatives, featuring real-time market makers, live WebSocket order books, Match DNA engines, and AI-driven scenario simulation laboratories.

---

## 📖 Platform Overview

PitchSide Pro Terminal (CrikOptions) is a next-generation sports intelligence and derivatives trading platform. The platform merges professional financial market layouts with real-time sporting performance metrics to allow traders to capture pricing anomalies in match outcomes and player derivatives.

### Key Pillars
*   **Real-Time Execution Engine:** Ultra-low latency `gorilla/websocket` gateway broadcasting order book depth, market ticks, and position updates directly to the browser.
*   **Database Persistence:** Fully integrated with MongoDB Atlas for scalable, persistent storage of users, wallets, matches, markets, orders, and execution ledgers.
*   **Institutional dark layout:** Standardized density-first design system utilizing `#020617` backgrounds, `#0ea5e9` accent primaries, and monospace data grids (`JetBrains Mono`).
*   **Match DNA Engine:** Real-time correlation engine mapping active play state to historical games to evaluate outcome probability distributions.
*   **Pure Aggregation Layer:** Frontend-compute portfolio service aggregating filled orders and real-time bid/ask prices to recalculate net exposures, weighted entry costs, daily P&L, drawdown rates, and stress-test vulnerabilities.

---

## 🏗️ Technical Architecture

The platform operates under a micro-service architecture separated into two distinct repositories to decouple the robust Go backend from the sophisticated Next.js React frontend.

```
CrikOptions/
├── Crikoptions_backend/          # Go REST & WebSocket API Repository
│   ├── cmd/api/                  # Go entry point (runs on :8080)
│   ├── internal/                 # Go server modules (Auth, Markets, Orders, Executions, Wallet)
│   ├── internal/websocket/       # Native Gorilla WebSocket Hub for real-time broadcasting
│   └── TRADING_EXECUTION_PRODUCTION_SPEC.md
├── Frontend/                     # Next.js 16 Frontend Repository
│   ├── src/app/                  # Next.js Page router ([marketId] & [matchId] routes)
│   ├── src/components/           # Shared UI components and Terminal layouts
│   ├── src/features/             # Feature domains (Dashboard, Trading, Portfolio, Intelligence, Wallet)
│   ├── src/lib/                  # Adapters, WebSocket streams, and Axios clients
│   └── src/types/                # Strict TypeScript contracts mapped to Go structs
```

### Technical Stack
*   **Frontend Workspace:** Next.js 16 (Turbopack), React 19, TypeScript, Tailwind CSS, ShadCN UI, Zustand state managers, and Apache ECharts. 
*   **Backend API Server:** Golang 1.22+, Gorilla WebSockets, MongoDB Native Driver, REST standard handlers.
*   **Persistence:** MongoDB Atlas (Cloud).

---

## 🚀 Core Platform Modules

### 1. Market Overview Dashboard (`/dashboard`)
An institutional overview dashboard conveying market health, tickers, and anomalies in less than 5 seconds:
*   **Financial Strip:** Live tracking of Total Equity, Daily P&L, Margin utilization, and active AI signals.
*   **Real-time Charting:** High-density live Momentum Index line chart updating dynamically.
*   **Exposure Treemap:** ECharts treemap displaying asset allocation concentration across sports portfolios.
*   **Opportunity Scanner:** Real-time table tracking the most active contracts and highest yield spreads.

### 2. Trading Terminal (`/trading/[marketId]`)
A three-column workstation workspace optimized for low-latency trade decisioning:
*   **Left Column (Match Analytics):** Live match stats, analytics panels, option chains, and active schedules.
*   **Center Column (Trading Core):** Realtime ECharts candlestick charts, virtualized bid/ask Order Book, and a scrolling trading activity panel.
*   **Right Column (Execution Panel):** Direct order form (Limit/Market orders), live position drift summary, and one-click execution handling.

### 3. Portfolio & Wallet Hub (`/portfolio` & `/admin/wallets`)
A comprehensive portfolio management portal with deep wallet integrations:
*   **Wallet Funding:** Admin/User interfaces for crediting base capital, verifying wallet balances, and tracking margin holds.
*   **Equity Curve:** ECharts dual-axis panel rendering equity progression line charts and drawdown bars.
*   **Risk Metrics:** Asset concentration donuts, stress-test loss simulators (-20% crash modeling), and leverage gauges.
*   **Trade Operations Workspace:** A massive ledger of execution histories, open orders, and closed positions.

### 4. Match Intelligence HQ (`/insights/[matchId]`)
A sports analytics laboratory mapping player and match DNA signatures:
*   **DNA Engine:** ECharts similarity heatmap indexing the current game state against previous seasons.
*   **Outcome Distribution:** Probability distribution curves predicting scoring ranges.
*   **Scenario Lab:** Interactive playground allowing traders to simulate wickets or boundary spikes to forecast immediate price shifts.

---

## ⚙️ Development & Server Execution

The system requires both the Go Backend and the Next.js Frontend to be running concurrently.

### 1. Run the Go Backend API Server
The backend handles match listings, market depths, authentication, order matching, wallet management, and real-time WebSockets. It serves requests on port `8080`.

Ensure `Crikoptions_backend/.env` is configured with a valid `MONGO_DB` string and `PORT=8080`.

```bash
cd Crikoptions_backend
go run ./cmd/api
```

### 2. Run the Next.js Frontend Dev Server
The frontend runs on port `3000` and proxies API requests to the Go backend.
Ensure `Frontend/.env` is configured with `PORT=3000` and `NEXT_PUBLIC_API_URL=http://localhost:8080/api`.

```bash
cd Frontend
npm install
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) inside your web browser.

---

## 🔐 Type Safety & SSR Optimizations
To support production-grade builds and fast hydration times:
*   **Native WebSockets:** Pure browser WebSockets replace heavy libraries like `socket.io-client`, keeping the client bundle tiny and performance native.
*   **SSR Gradient configs:** We avoid client-only references to `window.echarts` or `LinearGradient` classes. Instead, we use Next-safe declarative ECharts JSON gradients.
*   **No Mock Data:** The platform is wired 100% directly to the Go backend APIs and MongoDB. Fallbacks default to empty states/zeros, preserving institutional data integrity.

---
*Built with professional trading layouts by the PitchSide Dev Team.*
