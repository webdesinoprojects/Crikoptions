# 🏏 PitchSide Pro Terminal (CrikOptions)

> Institutional-grade sports trading and analytics workstation. A "Bloomberg Terminal" experience for sports derivatives, featuring real-time market makers, Player DNA fingerprinting, Match DNA engines, and AI-driven scenario simulation laboratories.

---

## 📖 Platform Overview

PitchSide Pro Terminal (CrikOptions) is a next-generation sports intelligence and derivatives trading platform. The platform merges professional financial market layouts with real-time sporting performance metrics to allow traders to capture pricing anomalies in match outcomes and player derivatives.

### Key Pillars
*   **Match DNA Engine:** Real-time correlation engine mapping active play state to 10k+ historical games to evaluate outcome probability distribution.
*   **Player DNA Fingerprinting:** Behavioral clustering algorithms modeling player consistency, pressure threshold, and tactical performance under specific pitch/venue constraints.
*   **Institutional dark layout:** Standardized density-first design system utilizing `#020617` backgrounds, `#0ea5e9` accent primaries, and monospace data grids (`JetBrains Mono`).
*   **Pure Aggregation Layer:** Frontend-compute portfolio service aggregating filled orders and real-time bid/ask prices to recalculate net exposures, weighted entry costs, daily P&L, drawdown rates, and stress-test vulnerabilities.

---

## 🏗️ Technical Architecture

The platform is built as a modular monorepo, decoupling data translation adapters, mock service seeding, API orchestration, and low-latency rendering layers.

```
CrikOptions/
├── cmd/api/                      # Go REST API entry point
├── internal/                     # Go server module routers, middleware, and handlers
├── Frontend/                     # Next.js 16 frontend workspace
│   ├── src/
│   │   ├── app/                  # Next.js Page router ([marketId] & [matchId] routes)
│   │   ├── components/           # Shared SideNavBar, TopNavBar, and theme providers
│   │   │   └── shared/           # TerminalPanel, TerminalKPI, and EChartsWrapper
│   │   ├── features/             # Feature modules (decoupled domain layouts)
│   │   │   ├── dashboard/        # Dashboard KPIs, movers heatmap, treemaps, tickers
│   │   │   ├── trading/          # OrderEntry forms, positions,virtualized order books
│   │   │   ├── portfolio/        # Services, hooks, calculators, PnL attribution
│   │   │   └── intelligence/     # DNA Engine, Momentum gauges, Scenario labs
│   │   ├── lib/                  # Adapters, WebSocket streams, and Axios clients
│   │   └── types/                # Strict TypeScript contracts & domain models
```

### Technical Stack
*   **Frontend Workspace:** Next.js 16 (Turbopack), React 19, TypeScript, Tailwind CSS, ShadCN UI, TanStack Query (v5), Zustand state managers, and Apache ECharts.
*   **Backend API Server:** Golang (REST API), CORS Middleware, and HTTPJSON standard handlers.

---

## 🚀 Core Platform Modules

### 1. Market Overview Dashboard (`/`)
An institutional overview dashboard conveying market health, tickers, and anomalies in less than 5 seconds:
*   **Financial Strip:** Live tracking of Total Equity, Daily P&L, Margin utilization, and active AI signals.
*   **Real-time Charting:** High-density live Momentum Index line chart updating dynamically.
*   **Exposure Treemap:** ECharts treemap displaying asset allocation concentration across sports portfolios.
*   **Movers Heatmap:** 5x3 coordinate grid representing price momentum fluctuations per squad category (Batting/Bowling/All-Rounder).

### 2. Trading Terminal (`/trading/[marketId]`)
A three-column workstation workspace optimized for low-latency trade decisioning:
*   **Left Column (Match Analytics):** Overs breakdown, live scores, H2H player performance statistics, and simulated broadcast frame. Includes interactive watchlist toggles.
*   **Center Column (Trading Core):** Realtime Lightweight Candle charts, virtualized bid/ask Order Book, and a scrolling trade tape ledger.
*   **Right Column (Execution Panel):** Direct order form (Limit/Market orders, percentage allocation selectors, margin calculators) and a live position drift summary.

### 3. Portfolio Hub (`/portfolio`)
A comprehensive portfolio management portal with a zero-UI-dependency compute layer:
*   **KPI Overview:** High-density metrics monitoring P&L, drawdown rates, and leverage.
*   **Equity Curve:** ECharts dual-axis panel rendering equity progression line charts and drawdown bars.
*   **Risk Metrics:** Asset concentration donuts, stress-test loss simulators (-20% crash modeling), and leverage gauges.
*   **Trade Journal:** Filterable database of closed trade logs with duration, win/loss stats, and execution logs.

### 4. Match Intelligence HQ (`/insights/[matchId]`)
A sports analytics laboratory mapping player and match DNA signatures:
*   **DNA Engine:** ECharts similarity heatmap indexing the current game state against previous seasons.
*   **Outcome Distribution:** Probability distribution curves predicting scoring ranges.
*   **Scenario Lab:** Interactive playground allowing traders to simulate wickets or boundary spikes to forecast immediate price shifts.
*   **Predictive Signals:** Direct BUY/SELL alpha recommendations generated by proprietary logic.

---

## ⚙️ Development & Server Execution

### 1. Run the Go Backend API Server
The backend handles match listings, market depths, watchlists, and order logs. It serves requests on port `8080`.

```bash
# Run from the root of the workspace
go run ./cmd/api
```
*   **Home matches:** `GET http://localhost:8080/api/v1/matches/home`
*   **Orders logs:** `GET http://localhost:8080/api/v1/orders`
*   **Watchlist:** `GET http://localhost:8080/api/v1/watchlist`

### 2. Run the Next.js Frontend Dev Server
The frontend is optimized for Turbopack compilation and runs on port `3000`.

```bash
# Navigate to Frontend directory
cd Frontend

# Install dependencies
npm install

# Run dev server
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) inside your web browser.

### 3. Production Compilation & Verification
Ensure all TypeScript contracts, ECharts type guards, and Next.js SSR configurations compile with zero errors:

```bash
# Compile and build Next.js application
npm run build
```

---

## 🔐 Type Safety & SSR Optimizations
To support production-grade builds and fast hydration times:
*   **SSR Gradient configs:** We avoid client-only references to `window.echarts` or `LinearGradient` classes. Instead, we use Next-safe declarative ECharts JSON gradients.
*   **Strict literal type-casting:** All chart types (`line`, `bar`, `heatmap`, `pie`, `gauge`), axis orientations (`category`, `value`), and axis alignments (`middle`) are cast as strict `const` parameters.

---
*Built with professional trading layouts by the PitchSide Dev Team.*
