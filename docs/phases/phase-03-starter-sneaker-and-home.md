# Phase 3 — Starter Sneaker & Home Screen

**Goal:** a new player automatically receives a Sneaker NFT and a little gas.
The home screen shows the Sneaker's stats, energy and reward balance, read live
from Monad.

This phase also builds the **transaction outbox** (D-012). Phase 5's settlements
depend on it, so it has to be solid here.

**Read first:** `architecture/backend-api.md` → The transaction outbox, `architecture/data-model.md` → `chainTransactions`, `decisions.md` D-009 and D-012.

## Deliverables

### `packages/shared`
- `api-contracts/onboarding.ts`: `onboardingStatusResponseSchema` (per step: `notStarted | pending | confirmed | failed`).

### `apps/api`
- `plugins/chain-clients.ts`: add the game-server `walletClient` next to the `publicClient` from Phase 2.
- `plugins/background-jobs.ts`: interval runner with Mongo leases.
- `repositories/chain-transactions-repository.ts`: enqueue (idempotent via the unique key), claim with lease, and status transitions.
- `services/chain-transaction-sender.ts`: simulate → send → wait for receipt, one nonce at a time.
- `jobs/process-chain-transactions.ts`, which handles kinds `mintStarterSneaker` and `sendGasDrip`.
- `services/sneaker-chain-reader.ts`: `listSneakerTokenIdsOwnedBy(walletAddress)` (via `balanceOf` + `tokenOfOwnerByIndex`, since `SneakerNft` is `ERC721Enumerable`) and `readSneakerState(tokenId)` (attributes + `currentEnergy`).
- Routes: `POST /v1/onboarding/starter-sneaker` and `GET /v1/onboarding/status`.
- Tests: calling enqueue twice creates one transaction; job crash recovery (a submitted transaction with a hash gets re-checked, not re-sent); a simulated revert is recorded as `failed` with its reason.

### `apps/mobile`
- `features/onboarding/`: after the first sign-in, call starter-sneaker and show a "Minting your Sneaker…" screen that polls status.
- `features/sneaker/`: `useOwnedSneaker`, `useSneakerAttributes`, `useSneakerEnergy` (wagmi reads plus a local countdown to the next energy point).
- `features/rewards/`: `useRewardBalance`.
- `components/ui/`: `Card`, `StatValue`, `ProgressBar`.
- `features/sneaker/components/SneakerCard.tsx`: id, level, efficiency, durability bar, energy `n / 10`, and a "View on explorer" link.
- `(tabs)/index.tsx` (home): SneakerCard, reward balance, and a START button (disabled until Phase 4).
  It takes over `/`, so delete Phase 2's `app/index.tsx` redirect, and give `(onboarding)/_layout.tsx` `welcome` as its initial route so a signed-out launch lands there.

## Out of scope
Activity sessions; buying Sneakers; multiple Sneakers per player.

## Definition of done
- [ ] A brand-new wallet signs in and, within seconds, owns Sneaker #N and holds a little MON. Both are visible on the explorer.
- [ ] Signing in again never mints a second Sneaker (enforced by both the outbox and the contract).
- [ ] Home shows level 1, efficiency 10, durability 100/100, energy 10/10 and 0 rewards, all read from chain.
- [ ] Restarting the API mid-mint neither loses nor duplicates the transaction.
- [ ] Loading, error and "minting" states are designed, not blank.

## Demo check
Sign in with a fresh wallet, watch the Sneaker arrive, then open it on the explorer.
