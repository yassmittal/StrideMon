# Phase 3 — Starter Sneaker & Home Screen

**Goal:** a new player automatically receives a Sneaker NFT and a little gas.
The home screen shows the Sneaker's stats, energy and reward balance, read live
from Monad.

This phase also builds the **transaction outbox** (D-012). Phase 5's settlements
depend on it, so it has to be solid here.

**Read first:** `architecture/backend-api.md` → The transaction outbox, `architecture/data-model.md` → `chainTransactions`, `decisions.md` D-009, D-012 and D-019.

## Deliverables

### `packages/shared`
- `api-contracts/onboarding.ts`: `onboardingStatusResponseSchema` (per step: `notStarted | pending | confirmed | failed`).

### `apps/api`
- `plugins/chain-clients.ts`: add the game-server `walletClient` next to the `publicClient` from Phase 2.
- `plugins/background-jobs.ts`: interval runner that holds a per-job lease (`repositories/job-leases-repository.ts`, D-019).
- `repositories/chain-transactions-repository.ts`: enqueue (idempotent via the unique key), find the next record to work on, and status transitions.
- `services/chain-transaction-sender.ts`: simulate → sign → (the job saves it) → broadcast → wait for receipt, one nonce at a time (D-019).
- `jobs/process-chain-transactions.ts`, which handles kinds `mintStarterSneaker` and `sendGasDrip`.
- `services/sneaker-chain-reader.ts`: `listSneakerTokenIdsOwnedBy(walletAddress)` (via `balanceOf` + `tokenOfOwnerByIndex`, since `SneakerNft` is `ERC721Enumerable`) and `readSneakerState(tokenId)` (attributes + `currentEnergy`).
- Routes: `POST /v1/onboarding/starter-sneaker` and `GET /v1/onboarding/status`.
- `test-support/deploy-test-contracts.ts`: deploys the three contracts to the test Anvil from Foundry's `out/` (D-019).
- Tests: calling enqueue twice creates one transaction; job crash recovery (a submitted transaction with a hash gets re-checked, not re-sent; a saved but never-broadcast one is broadcast with the same hash); a simulated revert is recorded as `failed` with its reason.

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
- [x] A brand-new wallet signs in and, within seconds, owns Sneaker #N and holds a little MON. Both are visible on the explorer. (Device: Sneaker #4. Live API runs: #2 and #3, mint confirmed in 3.4 s.)
- [x] Signing in again never mints a second Sneaker (enforced by both the outbox and the contract). (Device, plus API tests.)
- [x] Home shows level 1, efficiency 10, durability 100/100, energy 10/10 and 0 rewards, all read from chain. (Device.)
- [x] Restarting the API mid-mint neither loses nor duplicates the transaction. (Covered by the outbox crash-recovery tests and a measured restart handover, not by hand on the device.)
- [x] Loading, error and "minting" states are designed, not blank. (Minting and loading were seen on the device. The error states are covered by component tests; the Wi-Fi-off check wasn't done on the device.)

## Demo check
Sign in with a fresh wallet, watch the Sneaker arrive, then open it on the explorer.
