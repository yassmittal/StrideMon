# Phase 5 — Settlement & Rewards

**Goal:** STOP → validated session → `SneakerGame.settleSession` on Monad →
SOLE lands in the player's wallet, energy is spent, and durability
drops. The summary screen shows the **real** on-chain numbers with a
transaction link.

**Read first:** `architecture/system-overview.md` → A run, end to end, `architecture/smart-contracts.md` → `settleSession`, `architecture/backend-api.md` → The transaction outbox.

## Deliverables

### `apps/api`
- The finish handler, after validation, calls `enqueueSessionSettlement`, which
  creates a `chainTransactions` record with kind `settleSession`, idempotency key
  `settleSession:<activitySessionId>`, and payload `{ onChainSessionId, tokenId, player, activeMinutes, distanceMeters }`.
- `jobs/process-chain-transactions.ts` handles `settleSession`:
  - Simulate first. If `NotSneakerOwner` reverts, mark the session `rejected` (`SNEAKER_TRANSFERRED_DURING_SESSION`) and don't send.
  - On receipt: decode `SessionSettled` and write `settlement` (`transactionHash`, `rewardAmountWei`, `durabilityLoss`, `rewardedMinutes`, `settledAt`), then set status `settled`.
  - If there are 0 active minutes, skip the chain entirely. The session is `settled` with reward 0 and no transaction.
- `GET /v1/activity-sessions` returns cursor-paginated history.
- Tests: settlement is enqueued exactly once even if finish is retried; parsing the event updates the session; a revert maps to rejection.

### `apps/mobile`
- The summary screen polls `GET …/:activitySessionId` (React Query `refetchInterval`) while the status is `settling`, and shows "Settling on Monad…".
- Settled: duration, distance, average speed, **reward**, durability −N, and an explorer link to the transaction.
- Afterwards, the Sneaker, energy and reward-balance queries are invalidated, so home shows the new values.
- `(tabs)/history.tsx`: a FlatList of past sessions with status badges and an empty state.
- `formatTokenAmount` in `lib/format` (bigint wei → "50" or "19.6").

## Out of scope
Spending rewards (Phase 6).

## Definition of done
- [ ] The `MVP.md` example reproduces on testnet: 10 active minutes at efficiency 10 → **+50 SOLE**, durability **100 → 97**, energy **10 → 0**.
- [ ] The token balance matches the explorer, and the Sneaker attributes match `tokenURI`.
- [ ] Killing the API between "submitted" and "confirmed" still ends with a settled session and exactly one on-chain settlement.
- [ ] A settlement with 0 energy left mints 0 and spends nothing (the contract caps it).
- [ ] History lists sessions newest first and paginates.

## Demo check
Walk, press STOP, watch "Settling…" become +50 with a transaction link, then see the new balance on home.
