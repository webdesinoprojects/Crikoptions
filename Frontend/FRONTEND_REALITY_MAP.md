# Frontend Reality Map

The frontend now uses backend HTTP APIs as the source of truth for app data.
Unavailable backend datasets render as `0`, empty arrays, or empty states.
No frontend service falls back to mock/generated market, portfolio, trading, or intelligence data.

## Source Labels

- `API`: Data comes directly from the Go backend through `src/lib/api/client.ts`.
- `DERIVED`: Data is calculated from backend API responses in the frontend because the backend does not expose a dedicated aggregate endpoint.
- `STATIC`: Static product, navigation, or marketing content.

## Current Status

| Surface | Current source | Files |
|---|---|---|
| Auth login/register/profile | API | `src/features/auth/services/auth.service.ts` |
| Home matches and match detail | API | `src/features/dashboard/services/dashboard.service.ts` |
| Markets, market depth, and order book | API | `src/features/trading/services/trading.service.ts` |
| Order list/create/cancel | API | `src/features/trading/services/trading.service.ts` |
| Wallet balance and ledger | API | `src/features/wallet/services/wallet.service.ts` |
| Watchlist | API | `src/features/watchlist/services/watchlist.service.ts` |
| Dashboard overview | DERIVED | `src/features/dashboard/services/dashboard.service.ts` |
| Live ticker and market movers | DERIVED | `src/features/dashboard/services/dashboard.service.ts` |
| Portfolio summary | DERIVED | `src/features/portfolio/services/portfolio.service.ts` |
| Trading candles | DERIVED | `src/features/trading/services/trading.service.ts` |
| Recent trades / trade tape | DERIVED | `src/features/trading/services/trading.service.ts` |
| Match Intelligence HQ | DERIVED | `src/features/intelligence/services/intelligence.service.ts` |

## Backend Gaps Rendered As Empty/Zero

- Backend opportunity scanner feed.
- Backend AI/intelligence signal feed.
- Backend DNA archive, scenario projections, event impact, and outcome distribution datasets.
