# Frontend Reality Map

This file tracks which frontend surfaces are currently backed by real API data and which are still simulated. The goal is to make mock data visible and easy to replace as backend endpoints become real.

## Source Labels

- `API`: Data comes from the Go backend through `src/lib/api/client.ts`.
- `DERIVED`: Data is calculated in the frontend from API responses.
- `SIM`: Data is generated in the frontend because no backend endpoint exists yet.
- `STATIC`: Static product, navigation, or marketing content.

## Current Status

| Surface | Current source | Files | What must change to make it real |
|---|---|---|---|
| Auth login/register/profile | API | `src/features/auth/services/auth.service.ts` | Keep. Backend should remain source of truth. |
| Home matches and match detail | API | `src/features/dashboard/services/dashboard.service.ts` | Persist backend matches instead of in-memory data. |
| Market depth/order book | API | `src/features/trading/services/trading.service.ts` | Replace backend in-memory market repository with persistent market/order-book engine. |
| Order list/create/cancel | API | `src/features/trading/services/trading.service.ts` | Protect backend routes with JWT and persist order/trade ledger. |
| Watchlist | API | `src/features/watchlist/services/watchlist.service.ts` | Protect backend routes with JWT and persist per-user watchlists. |
| Portfolio summary | DERIVED | `src/features/portfolio/services/portfolio.service.ts` | Move critical P&L, margin, and risk calculations to backend. |
| Dashboard financial overview | SIM | `src/features/dashboard/services/dashboard.service.ts` | Add backend `/portfolio/summary` or `/dashboard/overview` endpoint. |
| Live ticker | SIM | `src/features/dashboard/services/dashboard.service.ts` | Add market ticker endpoint or websocket stream. |
| Market movers | SIM | `src/features/dashboard/services/dashboard.service.ts` | Add backend market scanner endpoint. |
| Opportunity radar | SIM | `src/features/dashboard/services/dashboard.service.ts` | Add backend signal/opportunity endpoint. |
| Dashboard intelligence feed | SIM | `src/features/dashboard/services/dashboard.service.ts` | Add backend alerts/signals endpoint. |
| Trading candles | SIM | `src/features/trading/services/trading.service.ts` | Add backend candle/history endpoint. |
| Recent trades / trade tape | SIM | `src/features/trading/services/trading.service.ts` | Add backend trade ledger endpoint or websocket stream. |
| Match Intelligence HQ | SIM | `src/features/intelligence/services/intelligence.service.ts` | Add backend intelligence endpoints for DNA, signals, scenarios, outcomes, and event impact. |

## Frontend Build Order

1. Keep source badges visible anywhere simulated data appears.
2. Add endpoint clients beside each simulated service method before replacing UI code.
3. When a backend endpoint exists, switch the hook query function from generator to API client.
4. Remove the `SIM` badge only after the screen no longer falls back to generated values.
5. Move portfolio/risk calculations to backend once real balances, fills, and mark prices exist.

