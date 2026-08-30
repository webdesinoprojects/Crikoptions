# CricOptions

**CricOptions** is a paper-trading platform for live cricket. Users trade option-style contracts with **CricCoins (₵)** — not real money — against live and simulated match moments. The product combines a matchday dashboard, a full trading terminal, portfolio tracking, academies/challenges, and a live leaderboard.

This repository contains the **Next.js frontend** (`Frontend/`). It talks to a Go backend over REST and WebSocket.

---

## Product highlights

| Area | What users get |
|------|----------------|
| **Matchday dashboard** | Live match arena, upcoming fixtures, open positions, daily challenges, leaderboard |
| **Trading terminal** | Live option chains, order book depth, order ticket, P&L, on-field matrix |
| **Portfolio** | Open/closed positions, equity curve, performance metrics |
| **CricCoins wallet** | Paper balance (starter ₵5,000), ledger, add-funds (simulation) |
| **Challenges & academy** | Daily quests + academy credentials; progress and claims from the API |
| **Leaderboard** | Rankings by paper trading performance |
| **Auth** | Email/password register & login, optional Google OAuth |
| **Admin** | Match control, wallets, chat moderation (role-gated) |
| **Simulator** | CSV / replay tools for development and demos |

All balances, orders, challenge progress, and payouts are **server-authoritative**. The frontend does not invent market or challenge progress.

---

## Tech stack

| Layer | Technology |
|-------|------------|
| Framework | [Next.js 16](https://nextjs.org/) (App Router) + React 19 |
| Language | TypeScript |
| Styling | Tailwind CSS 4, Radix / shadcn-style UI |
| Server state | TanStack React Query v5 |
| Client state | Zustand |
| HTTP | Axios (`src/lib/api/client.ts`) |
| Realtime | Native WebSocket (`src/lib/websocket/`) |
| Charts | Lightweight Charts, ECharts |
| Motion | Framer Motion, GSAP |
| Tests | Vitest |
| Package manager | npm |

---

## Repository layout

```text
tradin-frontend/
├── Frontend/                 # Next.js application (run the app from here)
│   ├── public/               # Static assets, logos, banners
│   ├── src/
│   │   ├── app/              # App Router pages & layouts
│   │   ├── components/       # Shared UI + landing
│   │   ├── features/         # Domain modules (auth, trading, challenges, …)
│   │   ├── lib/              # API client, adapters, websocket
│   │   ├── stores/           # Zustand stores
│   │   └── types/            # Shared TypeScript types
│   ├── .env.example          # Public env template
│   ├── package.json
│   └── vitest.config.ts
├── docker-compose.dev.yml    # Local Mongo + API (when backend is present)
├── CRIKOPTIONS_TRADING_PLATFORM_PHASED_PLAN.md
└── TRADING_EXECUTION_PRODUCTION_SPEC.md
```

### Feature modules (`Frontend/src/features/`)

| Module | Responsibility |
|--------|----------------|
| `auth` | Login, register, profile, Google auth |
| `dashboard` | Home matchday, overview widgets |
| `trading` | Terminal, orders, positions, live score streams |
| `portfolio` | Portfolio views and trade history |
| `wallet` | CricCoins balance and funding UI |
| `challenges` | Daily quests, academy badges, claim flow |
| `intelligence` | Match intelligence / scenario UI |
| `leaderboard` | Global rankings |
| `chat` | Matchday chat (feature-flagged) |
| `watchlist` | User watchlist |
| `simulator` | Replay / CSV simulator |
| `admin` | Admin surfaces (via app routes) |

---

## Prerequisites

- **Node.js** 20+ (LTS recommended)
- **npm** 10+
- Running **CricOptions backend** (REST + WebSocket) — typically at `http://localhost:3000` or your team’s API host
- Optional: MongoDB via `docker-compose.dev.yml` when developing full stack locally

---

## Getting started

### 1. Install dependencies

```bash
cd Frontend
npm install
```

### 2. Configure environment

```bash
cp .env.example .env.local
```

Edit `.env.local` with your API and WebSocket URLs (see [Environment variables](#environment-variables)).

### 3. Run the development server

```bash
npm run dev
```

App defaults to [http://localhost:3000](http://localhost:3000) (or the next free port if that one is taken).

Turbopack is enabled by default (`next dev --turbopack`). For webpack:

```bash
npm run dev:webpack
```

### 4. Production build

```bash
npm run build
npm start
```

---

## Environment variables

Defined in `Frontend/.env.example`:

| Variable | Purpose |
|----------|---------|
| `PORT` | Next.js port (default `3000`) |
| `NEXT_PUBLIC_API_URL` | Backend REST base, e.g. `http://localhost:3000/api` |
| `NEXT_PUBLIC_WS_URL` | WebSocket URL, e.g. `ws://localhost:3000/api/v1/ws` |
| `NEXT_PUBLIC_WS_ENABLED` | `true` / `false` — live score & private user streams |
| `NEXT_PUBLIC_CHAT_ENABLED` | Enable matchday chat UI |
| `NEXT_PUBLIC_GOOGLE_CLIENT_ID` | Google OAuth web client ID (must match backend) |
| `NEXT_PUBLIC_SIMULATOR_AUTO_START` | Auto-start CSV replay for live simulator matches |

> Only `NEXT_PUBLIC_*` values are exposed to the browser. Never put secrets in those variables.

---

## Scripts

Run from `Frontend/`:

| Command | Description |
|---------|-------------|
| `npm run dev` | Dev server (Turbopack) |
| `npm run dev:webpack` | Dev server (Webpack) |
| `npm run build` | Production build |
| `npm start` | Serve production build |
| `npm run lint` | ESLint |
| `npm test` | Vitest unit tests |

---

## Main routes

| Path | Description |
|------|-------------|
| `/` | Marketing landing |
| `/login` | Sign in |
| `/register` | Create account (starter CricCoins) |
| `/dashboard` | Authenticated matchday home |
| `/trading` | Trading entry |
| `/trading/[marketId]` | Live trading terminal |
| `/trading/match/[matchId]` | Match-scoped trading entry |
| `/portfolio` | Positions & performance |
| `/challenges` | Daily challenges & academies |
| `/profile` | Trader profile & academy badges |
| `/simulator` | Replay / simulator tools |
| `/admin/*` | Admin (matches, wallets, chat) |

---

## Architecture notes

### API as source of truth

- HTTP calls go through `src/lib/api/client.ts` (Bearer token from `localStorage`).
- Domain services live under `src/features/*/services/`.
- Unavailable backend data renders as empty/zero — **no mock market or challenge progress** in production UI.

### Realtime

- WebSocket manager: `src/lib/websocket/socket-manager.ts`
- Match score topic: `match:score:{matchId}` (trading terminal)
- User orders / positions / portfolio streams when authenticated
- If WS is disabled or down, the UI falls back to HTTP polling (e.g. live-state ~1s on terminal, home matches ~5s)

### Challenges

- List: `GET /api/v1/challenges`
- Claim: `POST /api/v1/challenges/{id}/claim`
- Daily IDs include `powerplay-pro`, `middle-over-genius`, `death-over-assassin`, `last-over-hero`
- Progress, status, and CricCoin rewards come from the server only

### Auth

- Register / login via REST; Google button when `NEXT_PUBLIC_GOOGLE_CLIENT_ID` is set
- Token stored client-side; 401 responses clear session and redirect to login

---

## Testing

```bash
cd Frontend
npm test
```

Unit tests cover adapters, challenge selection, match score merge/reducer, chat helpers, and related utilities (Vitest).

---

## Design & product docs

| Document | Contents |
|----------|----------|
| `DESIGN.md` | Visual / UX direction |
| `CRIKOPTIONS_TRADING_PLATFORM_PHASED_PLAN.md` | Product roadmap |
| `TRADING_EXECUTION_PRODUCTION_SPEC.md` | Execution / trading production rules |
| `Frontend/FRONTEND_REALITY_MAP.md` | API vs derived vs static data map |

---

## Development guidelines

1. Prefer feature modules under `src/features/` over dumping logic in pages.
2. Keep challenge and trading **math on the backend**; UI displays server state.
3. Use React Query for server data; invalidate after trades, claims, and position updates.
4. Match existing dark navy + cyan + gold theme (`#020617`, `#22d3ee`, `#d4af37`).
5. Do not commit `.env.local` or secrets.

---

## Troubleshooting

| Issue | What to check |
|-------|----------------|
| Blank data / 401 loops | Backend up? Valid token? `NEXT_PUBLIC_API_URL` correct? |
| Scores jump in batches | Expected with snapshot polling; enable WS on terminal; backend Sportmonks poll interval |
| Google button missing | Set `NEXT_PUBLIC_GOOGLE_CLIENT_ID` and matching backend client ID |
| WS never connects | `NEXT_PUBLIC_WS_ENABLED=true`, valid `NEXT_PUBLIC_WS_URL`, DevTools → Network → WS |

---

## License

Private / proprietary — all rights reserved unless otherwise stated by the project owners.

---

## Summary

CricOptions frontend is a **Next.js paper-trading client** for cricket options: live matches, terminal execution, CricCoins wallet, academies, and daily challenges — driven by a real backend API and optional WebSocket feeds.
