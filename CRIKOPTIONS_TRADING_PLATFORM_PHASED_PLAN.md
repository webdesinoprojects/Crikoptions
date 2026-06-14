# CrikOptions Paper Trading Platform Plan

## 1. What We Are Building

CrikOptions should become a live cricket trading terminal where users can open a real match, watch the score change ball by ball, see option prices move in real time, place buy and sell orders, receive actual executions, and track positions, PnL, and wallet balance.

The first production target is not real-money trading. The first target is a real paper-money exchange experience:

- Admins can credit or debit paper money into user wallets.
- Users can trade only with paper balance.
- Orders are persisted in the backend.
- Executions are persisted in the backend.
- Positions are calculated from real fills.
- Wallet balances move through a proper ledger.
- Market prices move from match state changes.
- The frontend receives live updates instead of pretending locally.

The platform should feel real before it becomes financially real. That means the paper trading layer must be designed like a serious trading system, not a UI mock.

## 2. Product Direction

### Core User Story

1. A user logs in.
2. The user sees live and upcoming cricket matches.
3. The user opens a live match.
4. The terminal shows:
   - Live match stats.
   - Last 6 balls.
   - Option chain.
   - Order ticket.
   - Open orders.
   - Filled orders.
   - Positions.
   - Wallet balance and available margin.
5. The match state changes after every ball.
6. The pricing engine recalculates option prices.
7. The option chain and bid/ask values update in real time.
8. The user places a buy or sell order.
9. The backend accepts, rejects, executes, partially executes, or keeps the order open.
10. Filled orders update positions and wallet reservations.
11. PnL changes as prices move.
12. When the market settles, final PnL is booked into the wallet ledger.

### Current Short-Term Data Strategy

Use sample cricket match data that behaves like a real match:

- Pre-seeded fixtures.
- Simulated live match clock.
- Ball-by-ball event stream.
- Runs, wickets, overs, innings, target, current run rate, required run rate.
- Option prices recalculated after each ball.

Later, replace the sample match event source with Cricbuzz API ingestion while keeping the same internal match-event contract.

## 3. Non-Negotiable Product Principles

### 3.1 Paper Money Must Still Be Real Accounting

Paper money is not fake frontend state. It must be stored in backend collections with a wallet account and wallet ledger.

Every balance change must have:

- User ID.
- Amount.
- Direction.
- Reason.
- Reference ID.
- Admin ID or system actor.
- Before balance.
- After balance.
- Timestamp.

### 3.2 Orders Must Be Real Backend Objects

When the user clicks Buy or Sell, the order must be created on the backend and receive an order ID. The frontend can optimistically show loading state, but the backend is the source of truth.

### 3.3 Positions Must Come From Executions

Positions should not be manually edited by the frontend. They should be derived from fills or stored as a backend projection updated by fills.

### 3.4 Prices Must Come From Match State

The option chain must update when cricket state changes. A dot ball, boundary, wicket, or over completion should create different projected score and price movement.

### 3.5 Real-Time UX Must Be Event Driven

Polling is acceptable for initial MVP, but the product should move toward WebSocket or SSE streams:

- Match stream.
- Market price stream.
- Order stream.
- Position stream.
- Wallet stream.

### 3.6 No Real Money Until The System Is Ready

Real-money trading requires compliance, payment rails, KYC, dispute handling, audit logs, responsible gaming controls, and legal review. This plan keeps the current platform in paper-money mode while building the technical shape needed later.

## 4. Target System Flow

```text
Admin or Simulator
      |
      v
Match Event Engine
      |
      v
Match State Store
      |
      v
Pricing Engine
      |
      v
Market Snapshot + Option Chain
      |
      v
Order Matching Engine
      |
      v
Executions / Fills
      |
      +--> Positions / PnL
      |
      +--> Wallet Ledger / Margin Reservations
      |
      v
Realtime Streams
      |
      v
Trading Terminal UI
```

## 5. Domain Concepts

### Match

A cricket fixture. It can be upcoming, live, innings break, completed, abandoned, or suspended.

Important fields:

- Match ID.
- Tournament.
- Format: T20, ODI, Test later if required.
- Teams.
- Venue.
- Start time.
- Toss result.
- Batting team.
- Bowling team.
- Innings.
- Score.
- Wickets.
- Overs.
- Balls left.
- Target score.
- Status.

### Ball Event

The smallest live cricket event that moves the market.

Example event fields:

- Event ID.
- Match ID.
- Innings.
- Over.
- Ball in over.
- Runs off bat.
- Extras.
- Wicket type.
- Batter.
- Bowler.
- Legal delivery flag.
- Score after ball.
- Wickets after ball.
- Timestamp.

### Market

A tradable instrument attached to a match.

Initial MVP market:

- Match Depth Options: user trades strikes based on projected final score or chase outcome.

Future markets:

- Team total.
- Batter runs.
- Bowler wickets.
- Match winner probability.
- Over runs.
- Partnership runs.

### Option Chain

A set of strikes with calculated bid, ask, premium, probability, and state.

Important fields:

- Strike.
- Bid.
- Ask.
- Last traded price.
- Bid quantity.
- Ask quantity.
- Implied probability.
- Moneyness: ITM, ATM, OTM.
- Fair price.
- Timestamp.

### Order

A user instruction to buy or sell a contract.

Important fields:

- Order ID.
- User ID.
- Match ID.
- Market ID.
- Contract or strike.
- Side: BUY or SELL.
- Type: LIMIT first, MARKET later.
- Price.
- Quantity.
- Filled quantity.
- Remaining quantity.
- Status: PENDING, OPEN, PARTIALLY_FILLED, FILLED, CANCELLED, REJECTED, EXPIRED.
- Rejection reason.
- Created at.
- Updated at.

### Execution / Fill

An actual trade created by matching an order.

Important fields:

- Execution ID.
- Buy order ID.
- Sell order ID or system liquidity source.
- User ID.
- Match ID.
- Market ID.
- Strike.
- Side.
- Price.
- Quantity.
- Fees, if any later.
- Timestamp.

### Position

The user's net exposure for a market or strike.

Important fields:

- User ID.
- Match ID.
- Market ID.
- Strike.
- Net quantity.
- Average buy price.
- Average sell price.
- Realized PnL.
- Unrealized PnL.
- Mark price.
- Status: OPEN or CLOSED.

### Wallet

The paper-money account for a user.

Important fields:

- User ID.
- Currency: PAPER_INR or similar.
- Cash balance.
- Reserved margin.
- Available balance.
- Realized PnL.
- Updated at.

### Wallet Ledger

Append-only record of every wallet movement.

Ledger entry types:

- ADMIN_CREDIT.
- ADMIN_DEBIT.
- ORDER_RESERVE.
- ORDER_RELEASE.
- TRADE_DEBIT.
- TRADE_CREDIT.
- SETTLEMENT_CREDIT.
- SETTLEMENT_DEBIT.
- ADJUSTMENT.

## 6. Phase Overview

| Phase | Name | Main Outcome |
|---|---|---|
| 0 | Product Boundaries And Current State Audit | Lock scope and confirm what exists |
| 1 | Paper Wallet And Admin Funding | Users have real backend paper balances |
| 2 | Match Simulator And Ball Event Engine | Sample matches move ball by ball |
| 3 | Pricing Engine And Market Snapshots | Option chain moves from match state |
| 4 | Order Lifecycle And Matching | Orders are placed, filled, cancelled, rejected |
| 5 | Positions, PnL, And Margin | Fills create positions and wallet reservations |
| 6 | Realtime Terminal Integration | UI updates from backend streams |
| 7 | Admin Operations Console | Admin controls users, wallets, matches, simulator |
| 8 | Cricbuzz Integration Adapter | Replace sample feed with real match feed |
| 9 | Settlement And Market Lifecycle | Completed matches settle positions |
| 10 | Hardening, Audit, And Scale | Make it reliable enough for serious testing |
| 11 | Real-Money Readiness | Prepare architecture, not launch real money |

## 7. Phase 0: Product Boundaries And Current State Audit

### Goal

Turn the current app into a clearly scoped paper-trading exchange. Document what already exists, what is frontend-derived, and what must become backend-owned.

### Backend Work

- Review existing modules:
  - Auth.
  - Matches.
  - Markets.
  - Orders.
  - Positions.
  - Watchlist.
- Confirm current order statuses and normalize them.
- Confirm current market pricing endpoint.
- Confirm whether positions are derived from orders or stored independently.
- Identify missing modules:
  - Wallet.
  - Ledger.
  - Executions.
  - Simulator.
  - Admin.
  - Realtime streams.

### Frontend Work

- Keep current terminal layout:
  - Left: live match stats and last 6 balls.
  - Center: option chain.
  - Right: order ticket and orders/positions/fills tabs.
- Remove any remaining mock fallback from trading-critical surfaces.
- Keep empty states as zero or no data when backend has no data.
- Add explicit source labels:
  - API.
  - Derived.
  - Static.

### Deliverables

- Updated technical map.
- API contract list.
- Database collection list.
- Known gap list.
- Agreement that all trading-critical data must be backend-owned.

### Done Criteria

- Everyone can answer: "What happens after a user clicks Buy?"
- No one expects frontend-only state to count as a trade.

## 8. Phase 1: Paper Wallet And Admin Funding

### Goal

Give each user a backend paper wallet and allow admins to load or remove paper money.

### Why This Comes Early

Orders need balance checks. Positions need margin. Settlement needs a place to book profit and loss. If wallet is added later, the order system will need rework.

### Backend Data Model

Add `wallet_accounts`:

```json
{
  "_id": "ObjectId",
  "userId": "ObjectId",
  "currency": "PAPER_INR",
  "cashBalance": 100000,
  "reservedBalance": 0,
  "availableBalance": 100000,
  "status": "ACTIVE",
  "createdAt": "date",
  "updatedAt": "date"
}
```

Add `wallet_ledger_entries`:

```json
{
  "_id": "ObjectId",
  "walletId": "ObjectId",
  "userId": "ObjectId",
  "type": "ADMIN_CREDIT",
  "amount": 50000,
  "balanceBefore": 100000,
  "balanceAfter": 150000,
  "reservedBefore": 0,
  "reservedAfter": 0,
  "referenceType": "ADMIN_ACTION",
  "referenceId": "ObjectId",
  "description": "Paper wallet top-up by admin",
  "createdBy": "ObjectId",
  "createdAt": "date"
}
```

### Backend APIs

User APIs:

- `GET /api/v1/wallet`
- `GET /api/v1/wallet/ledger`

Admin APIs:

- `POST /api/v1/admin/users/{userId}/wallet/credit`
- `POST /api/v1/admin/users/{userId}/wallet/debit`
- `GET /api/v1/admin/users/{userId}/wallet`
- `GET /api/v1/admin/wallet-ledger`

### Rules

- Wallet ledger is append-only.
- Admin credit increases cash balance.
- Admin debit cannot make available balance negative.
- Reserved balance cannot be manually edited except through system actions.
- Every admin funding action must store admin ID and reason.

### Frontend Work

- Add wallet balance to top nav or terminal header.
- Add Portfolio Hub wallet panel:
  - Cash balance.
  - Reserved margin.
  - Available balance.
  - Realized PnL.
- Add Admin Wallet screen later if admin panel exists.

### Tests

- Admin credit creates wallet if missing.
- Admin credit writes ledger entry.
- Admin debit fails if insufficient available balance.
- Wallet balance equals sum of ledger movements.
- User cannot call admin wallet APIs.

### Done Criteria

- Admin can load paper money into a user account.
- User can see balance.
- Balance is backend-owned and auditable.

## 9. Phase 2: Match Simulator And Ball Event Engine

### Goal

Create sample live matches that behave like real cricket matches, with ball events changing match state.

### Why This Is Needed

The user experience depends on prices moving because of cricket events. Before Cricbuzz integration, the simulator is the live-data source.

### Backend Data Model

Add `match_events`:

```json
{
  "_id": "ObjectId",
  "matchId": "string",
  "eventNumber": 42,
  "innings": 1,
  "over": 6,
  "ball": 3,
  "legalBall": true,
  "runs": 4,
  "extras": 0,
  "wicket": false,
  "wicketType": null,
  "batter": "Sample Batter",
  "bowler": "Sample Bowler",
  "scoreAfter": 52,
  "wicketsAfter": 1,
  "ballsBowledAfter": 39,
  "createdAt": "date"
}
```

Enhance `matches` with live state:

- Innings.
- Current score.
- Wickets lost.
- Balls left.
- Balls bowled.
- Current over text.
- Batting team.
- Bowling team.
- Last 6 balls.
- Target score.
- Status.

### Simulator Modes

Manual mode:

- Admin clicks buttons for:
  - 0, 1, 2, 3, 4, 6.
  - Wicket.
  - Wide.
  - No ball.
  - End innings.
  - Undo last ball.

Auto mode:

- System emits a new ball every N seconds.
- Event probabilities can be configured per match:
  - Dot ball probability.
  - Boundary probability.
  - Wicket probability.
  - Extras probability.

Scripted mode:

- Admin uploads or selects a predefined ball-by-ball script.
- Useful for demos and repeatable QA.

### Backend APIs

Admin APIs:

- `POST /api/v1/admin/matches/{matchId}/simulator/start`
- `POST /api/v1/admin/matches/{matchId}/simulator/pause`
- `POST /api/v1/admin/matches/{matchId}/simulator/reset`
- `POST /api/v1/admin/matches/{matchId}/events`
- `POST /api/v1/admin/matches/{matchId}/events/undo`

User APIs:

- `GET /api/v1/matches/live`
- `GET /api/v1/matches/{matchId}`
- `GET /api/v1/matches/{matchId}/events?limit=6`

### Event Processing

Each ball event should:

1. Validate match is live.
2. Validate innings and ball count.
3. Update score and wickets.
4. Update last 6 balls.
5. Recalculate market prices.
6. Publish match update event.
7. Publish market update event.
8. Trigger order matching if prices crossed.

### Frontend Work

- Live match stats panel must read from match state.
- Last 6 balls must read from backend event history.
- Upcoming match should not show as the active live match if a live match exists.
- Match schedule strip should prioritize live matches.

### Tests

- Dot ball decreases balls left.
- Wicket increases wickets and changes last 6 balls.
- Wide/no-ball does not decrease legal balls.
- Innings ends at 120 legal balls or 10 wickets for T20.
- Last 6 balls always contains most recent six legal or visible events based on product rule.
- Simulator reset restores original match state.

### Done Criteria

- A sample match can run live without Cricbuzz.
- Score, wickets, overs, and last 6 balls update from backend.
- Every event is persisted and replayable.

## 10. Phase 3: Pricing Engine And Market Snapshots

### Goal

Convert match state into moving option-chain prices and persist market snapshots.

### Current Direction

The backend already has a pricing engine shape for innings-based option pricing. This phase makes that engine the real source of market prices and stores every recalculation as a snapshot.

### Backend Data Model

Add `market_snapshots`:

```json
{
  "_id": "ObjectId",
  "matchId": "string",
  "marketId": "string",
  "eventId": "ObjectId",
  "innings": 1,
  "score": 85,
  "wickets": 2,
  "ballsLeft": 62,
  "projectedScore": 156,
  "fairLtp": 37.76,
  "chain": [
    {
      "strike": 130,
      "premium": 51.25,
      "bid": 50.75,
      "ask": 51.75,
      "bidQty": 300,
      "askQty": 300,
      "impliedProbability": 77,
      "state": "ATM"
    }
  ],
  "createdAt": "date"
}
```

### Pricing Rules

The first version can be simple but consistent:

- First innings:
  - Use score, wickets, balls left.
  - Project final score.
  - Price strikes around projected final score.
- Second innings:
  - Use target, chase score, wickets, balls bowled.
  - Price probability of chase or projected achievable score.
- Volatility should increase after:
  - Wickets.
  - Boundaries.
  - Death overs.
  - Low balls remaining.
- Volatility should decrease when:
  - Required outcome becomes almost certain.
  - Innings is nearly settled.

### Market Maker Spread

For MVP, the backend can create synthetic bid/ask around fair price:

- Tight spread for liquid ATM rows.
- Wider spread for far OTM rows.
- Zero size when market is suspended.
- Ask must be greater than or equal to bid.

### Backend APIs

- `POST /api/v1/markets/{marketId}/calculate-price`
- `GET /api/v1/markets/{marketId}/option-chain`
- `GET /api/v1/markets/{marketId}/snapshots/latest`
- `GET /api/v1/markets/{marketId}/snapshots`

### Event Integration

After each ball event:

1. Build pricing input from match state.
2. Run pricing engine.
3. Create market snapshot.
4. Update market latest price.
5. Publish market snapshot to realtime stream.
6. Run matching engine for affected market.

### Frontend Work

- Option chain must display backend chain only.
- If chain is unavailable, display 0 values and empty/disabled trading state.
- ATM row should anchor visually.
- Order ticket should use selected strike and latest bid/ask.
- Price input should refresh when selected strike price changes, without overwriting a user's active manual edit unless product chooses that behavior.

### Tests

- Same match state produces deterministic pricing output.
- Wicket event changes projected score and option prices.
- Boundary event changes projected score and option prices.
- Completed innings produces intrinsic values.
- No option-chain response means UI displays zeros, not fallback data.

### Done Criteria

- Option prices move every time match state moves.
- Option chain is backend-owned.
- Snapshots can be replayed for debugging.

## 11. Phase 4: Order Lifecycle And Matching

### Goal

Build the first real paper-trading order system: create, validate, reserve balance, match, fill, cancel, and reject orders.

### Order Types

MVP:

- Limit Buy.
- Limit Sell.
- Cancel open order.

Next:

- Market order.
- Stop order.
- Time in force.
- Reduce-only.

### Backend Data Model

Enhance `orders`:

```json
{
  "_id": "ObjectId",
  "clientOrderId": "string",
  "userId": "ObjectId",
  "matchId": "string",
  "marketId": "string",
  "strike": 130,
  "side": "BUY",
  "type": "LIMIT",
  "price": 51.25,
  "quantity": 10,
  "filledQuantity": 0,
  "remainingQuantity": 10,
  "averageFillPrice": 0,
  "status": "OPEN",
  "rejectionReason": null,
  "createdAt": "date",
  "updatedAt": "date"
}
```

Add `executions`:

```json
{
  "_id": "ObjectId",
  "matchId": "string",
  "marketId": "string",
  "strike": 130,
  "price": 51.25,
  "quantity": 10,
  "buyerUserId": "ObjectId",
  "sellerUserId": "ObjectId",
  "buyOrderId": "ObjectId",
  "sellOrderId": "ObjectId",
  "liquiditySource": "USER_OR_MARKET_MAKER",
  "createdAt": "date"
}
```

### Matching Model Options

#### MVP: Trade Against System Market Maker

The simplest paper trading model:

- Buy orders execute against current ask if limit price is greater than or equal to ask.
- Sell orders execute against current bid if limit price is less than or equal to bid.
- Otherwise orders remain open.
- Market maker is internal/system liquidity.

This makes execution reliable during demos and avoids needing many users at the same time.

#### Later: User-To-User Order Book

After the MVP:

- Maintain price-time priority.
- Match buy orders against sell orders.
- Show true order book depth.
- Use system market maker only as optional liquidity provider.

### Validation Rules

Reject order when:

- User is unauthenticated.
- Match is not tradable.
- Market is suspended or settled.
- Strike does not exist.
- Quantity is less than minimum.
- Price is invalid.
- Wallet has insufficient available balance.
- User exceeds max exposure limit.

### Wallet Reservation

For buy orders:

- Reserve `price * quantity`.
- On fill, convert reserved amount into trade debit.
- On cancel, release unused reserve.

For sell orders:

- If naked selling is not allowed, user must own enough quantity.
- If naked paper selling is allowed later, reserve margin based on risk formula.

Recommended MVP rule:

- Allow selling only to reduce or close existing long quantity.
- This keeps early risk accounting simple.

### Backend APIs

- `POST /api/v1/orders`
- `GET /api/v1/orders`
- `GET /api/v1/orders?matchId=&marketId=&status=`
- `POST /api/v1/orders/{orderId}/cancel`
- `GET /api/v1/executions`
- `GET /api/v1/executions?matchId=&marketId=`

### Order State Machine

```text
NEW
 |
 v
VALIDATING
 |
 +--> REJECTED
 |
 v
OPEN
 |
 +--> PARTIALLY_FILLED
 |          |
 |          v
 |        FILLED
 |
 +--> CANCELLED
 |
 +--> EXPIRED
```

### Frontend Work

- Order ticket must show:
  - Selected strike.
  - Side.
  - Limit price.
  - Quantity.
  - Estimated cost.
  - Available balance.
  - Required margin.
  - Submit loading state.
  - Rejection message.
- Terminal right panel must show:
  - Working orders.
  - Positions.
  - Fills.
- User must be able to cancel open orders directly from the terminal.

### Tests

- Limit buy below ask remains open.
- Limit buy at ask fills.
- Limit sell above bid remains open.
- Limit sell at bid fills.
- Insufficient wallet rejects order.
- Cancel releases reserved balance.
- Partial fills update remaining quantity.
- Duplicate client order ID is idempotent.

### Done Criteria

- User can place orders that are truly accepted or rejected by backend.
- Fills are persisted.
- Orders update live in terminal.

## 12. Phase 5: Positions, PnL, And Margin

### Goal

Show user positions and PnL in real time based on fills and latest market prices.

### Position Calculation

For each user, market, and strike:

- Net quantity = buy quantity - sell quantity.
- Average entry = weighted average of open quantity.
- Realized PnL = booked when reducing or closing position.
- Unrealized PnL = open quantity multiplied by mark price movement.
- Mark price = latest fair LTP, bid/ask mid, or exit-side price depending on product rule.

### Backend Model Options

Option A: Derived positions on request.

- Simpler consistency.
- Slower with many fills.

Option B: Stored position projection updated by fills.

- Faster for realtime.
- Requires careful transactional updates.

Recommended:

- MVP can derive positions from executions.
- Move to stored projections when realtime scale becomes important.

### Margin Rules For MVP

Start simple:

- Long buy cost is fully paid or reserved.
- No leverage.
- No naked shorting.
- Sell can only reduce existing long position.
- Available balance cannot go negative.

Later:

- Margin by volatility.
- Max loss calculation.
- Portfolio-level exposure limits.
- Per-match exposure caps.
- Admin risk overrides.

### Backend APIs

- `GET /api/v1/positions`
- `GET /api/v1/positions?matchId=&marketId=`
- `GET /api/v1/pnl`
- `GET /api/v1/risk/margin-preview?marketId=&strike=&side=&price=&qty=`

### Frontend Work

- Show position card in terminal:
  - Strike.
  - Net lots.
  - Avg price.
  - Mark price.
  - Unrealized PnL.
  - Realized PnL.
  - Close action.
- Show Portfolio Hub:
  - All positions.
  - All fills.
  - Wallet.
  - PnL over time.
  - Exposure by match.

### Tests

- First buy opens long position.
- Second buy updates weighted average.
- Sell less than quantity realizes partial PnL.
- Sell full quantity closes position.
- Mark price movement changes unrealized PnL.
- Wallet available balance updates after fills and cancellations.

### Done Criteria

- Positions are accurate from fills.
- PnL changes when market prices move.
- User can understand current exposure without leaving the terminal.

## 13. Phase 6: Realtime Terminal Integration

### Goal

Make the terminal feel alive: match events, prices, orders, fills, positions, and wallet balances update without manual refresh.

### Transport

Recommended first choice:

- WebSocket for interactive trading streams.

Acceptable MVP alternative:

- Server-Sent Events for one-way updates.
- Polling fallback for poor network.

### Stream Channels

Match channel:

```json
{
  "type": "MATCH_UPDATED",
  "matchId": "match_123",
  "score": "85/2",
  "over": "9.6",
  "lastSix": ["2", "W", "1", "2", "4", "6"]
}
```

Market channel:

```json
{
  "type": "OPTION_CHAIN_UPDATED",
  "marketId": "market_123",
  "snapshotId": "snap_123",
  "projectedScore": 156,
  "chain": []
}
```

Order channel:

```json
{
  "type": "ORDER_UPDATED",
  "orderId": "order_123",
  "status": "FILLED",
  "filledQuantity": 10
}
```

Execution channel:

```json
{
  "type": "EXECUTION_CREATED",
  "executionId": "exec_123",
  "price": 51.25,
  "quantity": 10
}
```

Wallet channel:

```json
{
  "type": "WALLET_UPDATED",
  "availableBalance": 98487.5,
  "reservedBalance": 512.5
}
```

### Frontend Behavior

- Initial page load uses REST.
- Live updates patch TanStack Query cache or Zustand store.
- If socket disconnects, UI shows reconnecting state.
- On reconnect, frontend refetches latest REST state to avoid missed events.

### Terminal Layout

Keep the target trading layout:

- Left column:
  - Live score.
  - Last 6 balls.
  - Batters/bowler summary.
  - Projection/rate metrics.
- Center column:
  - Option chain.
  - ATM row highlight.
  - Probability.
  - Bid/ask.
  - Clickable row selection.
- Right column:
  - Order ticket fixed in view.
  - Orders/positions/fills tab below.
  - No nested scrolling that hides the submit button.

### Tests

- New ball updates live score without reload.
- New snapshot updates option chain without reload.
- Filled order appears in fills tab.
- Position updates after fill.
- Wallet balance updates after fill.
- Reconnect triggers REST resync.

### Done Criteria

- Demo can run with simulator and terminal open.
- User sees real-time chain movement and real-time execution updates.

## 14. Phase 7: Admin Operations Console

### Goal

Give admin enough control to run the paper platform, manage wallets, seed matches, and operate demos.

### Admin Features

User management:

- Search users.
- View user wallet.
- Credit paper money.
- Debit paper money.
- View user orders.
- View user positions.

Match management:

- Create sample match.
- Set teams and format.
- Start match.
- Pause match.
- Reset match.
- End innings.
- Set target.
- Complete match.

Simulator controls:

- Manual ball event input.
- Auto simulator start/pause.
- Speed control.
- Script selection.
- Undo last event.

Market controls:

- Create market.
- Suspend market.
- Resume market.
- Set strike range.
- Set spread configuration.
- Force recalculation.

Audit:

- View wallet ledger.
- View order log.
- View fill log.
- View simulator event log.

### Backend APIs

- `GET /api/v1/admin/users`
- `GET /api/v1/admin/users/{userId}`
- `GET /api/v1/admin/users/{userId}/orders`
- `GET /api/v1/admin/users/{userId}/positions`
- `POST /api/v1/admin/matches`
- `PATCH /api/v1/admin/matches/{matchId}`
- `POST /api/v1/admin/markets`
- `PATCH /api/v1/admin/markets/{marketId}/suspend`
- `PATCH /api/v1/admin/markets/{marketId}/resume`

### Tests

- Non-admin cannot call admin APIs.
- Admin wallet credit/debit is audited.
- Admin can start and pause simulator.
- Suspended market rejects new orders.

### Done Criteria

- Admin can run a full paper-trading demo without developer intervention.

## 15. Phase 8: Cricbuzz Integration Adapter

### Goal

Replace sample match events with real cricket data from Cricbuzz APIs while preserving the internal event model.

### Design Rule

Do not let the frontend depend directly on Cricbuzz response shapes.

Create an ingestion adapter:

```text
Cricbuzz API Response
      |
      v
Cricbuzz Adapter
      |
      v
Internal Match Event Contract
      |
      v
Match State + Pricing + Streams
```

### Backend Components

- Cricbuzz client.
- Fixture sync job.
- Live score sync job.
- Scorecard parser.
- Ball event normalizer.
- Deduplication logic.
- Rate-limit handling.
- Retry policy.
- Provider health status.

### Key Challenges

- Cricbuzz response shapes may differ by match format.
- Ball-by-ball data may arrive late or corrected.
- Extras and wickets need correct legal-ball handling.
- Provider outages must not break the terminal.
- Duplicate events must not double-update score.

### APIs

Admin:

- `POST /api/v1/admin/providers/cricbuzz/sync-fixtures`
- `POST /api/v1/admin/matches/{matchId}/attach-provider`
- `GET /api/v1/admin/providers/cricbuzz/status`

Internal:

- `NormalizeCricbuzzMatch`.
- `NormalizeCricbuzzBallEvent`.
- `UpsertMatchEvent`.

### Fallback Strategy

For demos:

- If Cricbuzz feed is unavailable, admin can switch match to simulator mode.

For production later:

- Show provider degraded state.
- Suspend market if data freshness exceeds threshold.
- Prevent new orders when match state is stale.

### Tests

- Same Cricbuzz event is idempotent.
- Correct score after extras.
- Correct score after wicket.
- Late correction is handled.
- Stale feed suspends market.

### Done Criteria

- Real match data can drive the same terminal and pricing flow as simulator data.

## 16. Phase 9: Settlement And Market Lifecycle

### Goal

When a match or innings completes, markets settle correctly and wallet PnL is booked.

### Market Lifecycle

```text
UPCOMING
 |
 v
OPEN
 |
 +--> SUSPENDED
 |       |
 |       v
 |     OPEN
 |
 v
CLOSED_FOR_TRADING
 |
 v
SETTLING
 |
 v
SETTLED
```

### Settlement Rules

For match depth options:

- Final score determines intrinsic value.
- Each strike gets settlement price.
- Positions are closed at settlement price.
- Realized PnL is calculated.
- Wallet ledger is updated.
- Market becomes settled.

### Backend Data Model

Add `settlements`:

```json
{
  "_id": "ObjectId",
  "matchId": "string",
  "marketId": "string",
  "finalScore": 172,
  "settlementPrices": [
    {
      "strike": 130,
      "settlementPrice": 42
    }
  ],
  "status": "COMPLETED",
  "createdAt": "date"
}
```

### Backend APIs

- `POST /api/v1/admin/markets/{marketId}/close`
- `POST /api/v1/admin/markets/{marketId}/settle`
- `GET /api/v1/markets/{marketId}/settlement`

### Tests

- Open orders are cancelled at market close.
- Reserved balances are released.
- Open positions are settled.
- Wallet ledger records settlement credit/debit.
- Settlement is idempotent.

### Done Criteria

- Full lifecycle works from upcoming match to settled wallet balance.

## 17. Phase 10: Hardening, Audit, And Scale

### Goal

Make the paper trading platform robust enough for serious internal and beta testing.

### Backend Hardening

- Transactional writes for order, execution, position, and wallet updates.
- Idempotency keys for order placement.
- Request validation.
- Rate limiting.
- Structured logs.
- Audit logs for admin actions.
- Health checks for pricing, simulator, and provider feeds.
- Database indexes:
  - Orders by user, match, market, status.
  - Executions by user, market, timestamp.
  - Wallet ledger by user, timestamp.
  - Match events by match, event number.
  - Market snapshots by market, timestamp.

### Frontend Hardening

- Graceful empty states.
- Reconnect handling.
- Disabled submit states.
- Clear rejection messages.
- Avoid layout scroll traps in terminal.
- Keep order ticket visible.
- Make order activity visible on the same page.

### Observability

Dashboards for:

- Orders per minute.
- Fill rate.
- Rejection rate.
- WebSocket connection count.
- Stale feed count.
- Wallet ledger mismatches.
- Pricing calculation errors.

### Tests

- Unit tests for pricing and wallet.
- Integration tests for order placement.
- End-to-end tests for simulator to filled order.
- Load tests for market snapshot streaming.
- Replay tests from ball event history.

### Done Criteria

- Internal beta can run without manual database fixes.
- Bugs can be debugged from logs and audit trails.

## 18. Phase 11: Real-Money Readiness

### Goal

Prepare for a future real-money product without launching real money prematurely.

### Required Before Real Money

- Legal review.
- Regulatory classification.
- KYC/AML strategy.
- Payment gateway.
- Withdrawal flow.
- Fraud monitoring.
- Responsible gaming controls, if applicable.
- User limits.
- Dispute handling.
- Tax/reporting strategy.
- Production-grade custody and reconciliation.

### Technical Changes Needed Later

- Separate paper wallet and real wallet.
- Payment provider ledger reconciliation.
- Immutable financial ledger guarantees.
- Stronger admin permissions.
- Withdrawal approval workflow.
- Financial reporting exports.
- Stronger identity verification.
- Account lock and risk holds.

### Recommendation

Keep the first major release as paper trading. Make it feel real, make execution real, make accounting real, and make the UI fast. Only after that should real-money planning begin.

## 19. Suggested MVP Cut

The fastest meaningful version should include:

1. Admin paper wallet funding.
2. Sample live match simulator.
3. Backend option-chain snapshots.
4. Limit buy and limit sell.
5. System market-maker execution.
6. Fills.
7. Positions.
8. Wallet reservations and ledger.
9. Real-time terminal updates.
10. Admin controls for match events.

This MVP is enough to prove the core product: a user can trade a live cricket match with paper money and see real execution and positions.

## 20. Implementation Order

Recommended technical order:

1. Normalize backend order status and add execution model.
2. Add wallet account and ledger.
3. Add admin wallet credit/debit.
4. Add match event model and simulator.
5. Connect ball event processing to pricing snapshots.
6. Add option-chain latest snapshot endpoint.
7. Add order validation and wallet reservation.
8. Add system market-maker matching.
9. Add execution persistence.
10. Add position calculation from executions.
11. Add wallet updates on fills and cancellations.
12. Add realtime streams.
13. Connect terminal to streams.
14. Add admin simulator UI.
15. Add settlement.
16. Add Cricbuzz adapter.

## 21. API Surface Summary

### User

- `GET /api/v1/matches/live`
- `GET /api/v1/matches/upcoming`
- `GET /api/v1/matches/{matchId}`
- `GET /api/v1/matches/{matchId}/events`
- `GET /api/v1/markets?matchId=`
- `GET /api/v1/markets/{marketId}`
- `GET /api/v1/markets/{marketId}/option-chain`
- `POST /api/v1/orders`
- `GET /api/v1/orders`
- `POST /api/v1/orders/{orderId}/cancel`
- `GET /api/v1/executions`
- `GET /api/v1/positions`
- `GET /api/v1/wallet`
- `GET /api/v1/wallet/ledger`

### Admin

- `GET /api/v1/admin/users`
- `POST /api/v1/admin/users/{userId}/wallet/credit`
- `POST /api/v1/admin/users/{userId}/wallet/debit`
- `POST /api/v1/admin/matches`
- `PATCH /api/v1/admin/matches/{matchId}`
- `POST /api/v1/admin/matches/{matchId}/simulator/start`
- `POST /api/v1/admin/matches/{matchId}/simulator/pause`
- `POST /api/v1/admin/matches/{matchId}/events`
- `POST /api/v1/admin/matches/{matchId}/events/undo`
- `POST /api/v1/admin/markets`
- `PATCH /api/v1/admin/markets/{marketId}/suspend`
- `PATCH /api/v1/admin/markets/{marketId}/resume`
- `POST /api/v1/admin/markets/{marketId}/settle`

### Streams

- `WS /api/v1/stream/matches`
- `WS /api/v1/stream/markets/{marketId}`
- `WS /api/v1/stream/orders`
- `WS /api/v1/stream/positions`
- `WS /api/v1/stream/wallet`

## 22. Frontend Screen Plan

### Trading Terminal

Required sections:

- Match selector strip.
- Live match stats panel.
- Last 6 balls.
- Player/innings mini stats.
- Option chain.
- Order ticket.
- Orders tab.
- Positions tab.
- Fills tab.
- Wallet summary.

Important UX rules:

- User should not leave terminal to understand order state.
- Order ticket should not scroll away on desktop.
- Orders and positions should be visible near the ticket.
- Selected strike should stay visually obvious.
- Submit button should always be easy to reach.
- Disabled trading state must be clear when market is suspended or no price exists.

### Portfolio Hub

Required sections:

- Wallet overview.
- Open positions.
- Working orders.
- Fills.
- Realized PnL.
- Unrealized PnL.
- Exposure by match.
- Ledger history.

### Admin Console

Required sections:

- Users and wallet funding.
- Match manager.
- Simulator controls.
- Market controls.
- Audit logs.

## 23. Critical Edge Cases

### Match Data

- Wides and no-balls.
- Wicket on no-ball.
- Run out with runs completed.
- Retired hurt.
- Rain delay.
- Match abandoned.
- Super over later if needed.
- Innings target revised later if needed.

### Trading

- User places order while price changes.
- User cancels order while fill is happening.
- User submits duplicate order due to network retry.
- Market is suspended while order is open.
- Wallet balance changes between preview and submit.
- Socket disconnects during execution.

### Wallet

- Admin tries to debit reserved money.
- Fill partially consumes reserved balance.
- Cancel releases only remaining reserve.
- Settlement runs twice.
- Wallet ledger and account balance mismatch.

## 24. Technical Risks

### Pricing Accuracy Risk

The first pricing model may not feel realistic. Mitigation:

- Keep parameters configurable.
- Save snapshots for replay.
- Build scenario tests for wickets, boundaries, and death overs.

### Realtime Complexity Risk

Streams can become difficult if every module publishes differently. Mitigation:

- Define event contracts early.
- Use one event bus abstraction internally.
- Refetch REST state after reconnect.

### Wallet Consistency Risk

Wallet mistakes destroy trust even in paper trading. Mitigation:

- Use append-only ledger.
- Use transactional updates.
- Add reconciliation tests.

### Provider Dependency Risk

Cricbuzz feed may be delayed or change shape. Mitigation:

- Keep adapter isolated.
- Store normalized internal events.
- Allow simulator fallback.
- Suspend stale markets.

## 25. Success Metrics

### Product Metrics

- Time from login to first order.
- Percentage of users placing first paper trade.
- Orders per live match.
- Repeat trading sessions.
- Average active session duration.

### Trading Metrics

- Order acceptance rate.
- Fill rate.
- Cancellation rate.
- Rejection reasons.
- Average price update latency after ball event.

### System Metrics

- Match event processing latency.
- Price calculation latency.
- Stream delivery latency.
- Wallet reconciliation mismatch count.
- Failed order mutation count.

## 26. Final Product Vision

The first lovable version is a paper-money cricket trading terminal where the user feels the match moving the market:

- Dot ball: prices adjust.
- Boundary: option chain jumps.
- Wicket: volatility changes.
- User places an order: backend accepts it.
- Price crosses: order fills.
- Position updates instantly.
- Wallet updates correctly.
- Settlement closes the loop.

Once this works with sample data, Cricbuzz data becomes just another event source. Once paper trading feels trustworthy, then real-money planning can begin from a much stronger foundation.
