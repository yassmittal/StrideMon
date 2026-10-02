# Phase 6 — Repair & Upgrade

**Goal:** the player spends SOLE to restore durability and to level up
the Sneaker. The player's own wallet signs both transactions. The API is not
involved.

**Read first:** `architecture/mobile-app.md` → Wallet and chain (the player-transaction pattern), `architecture/game-rules.md` → Repair, Upgrade.

## Deliverables

### `apps/mobile`
- `features/sneaker/hooks/useSneakerGameTransaction.ts`: the **single** reusable
  hook for player transactions. It takes a contract call description and
  exposes the `idle | awaitingSignature | confirming | succeeded | failed` state
  union and a `submit()` function. On success it invalidates the Sneaker and
  balance queries. Repair and upgrade are thin wrappers:
  - `useRepairSneaker(sneakerTokenId)`: reads `quoteRepairCost`, then calls `repair`.
  - `useUpgradeSneaker(sneakerTokenId)`: reads `quoteUpgradeCost`, then calls `upgrade`.
- `(tabs)/sneaker.tsx`: stats, with `RepairPanel` and `UpgradePanel`:
  - Show the cost, the current balance and the resulting stats ("Level 1 → 2, Efficiency 10 → 12").
  - Disable the button with a reason: "Not enough rewards", "Already at full durability", "Max level".
  - A confirmation sheet comes before the wallet opens, and a success state
    comes after, with an explorer link.
- Wallet-rejection handling: "You cancelled in your wallet". It isn't an error screen.
- Low-gas handling: if the MON balance is too low to pay gas, say so plainly.

### `packages/contracts` (only if time allows)
- The optional durability-below-50 reward penalty from `game-rules.md`, with a
  fixture and tests on both sides.

## Out of scope
Partial repairs, and attribute points or stat allocation.

## Definition of done
- [x] Repair at durability 72 costs what `quoteRepairCost` returns, and the balance and durability update on-chain.
  (Verified on the phone at durability 96: 2.8 SOLE, 96 → 100.)
- [x] Upgrade 1 → 2 costs 50, and efficiency goes 10 → 12, visible in `tokenURI`.
- [x] The next settled session uses efficiency 12 (reward goes up): 6 SOLE per minute, up from 5.
- [x] Every disabled state and wallet-rejection path is handled.
- [x] Repair and upgrade share one hook with no duplicated transaction logic.

The optional durability-below-50 penalty was not built.

## Demo check
`MVP.md` §21 Demo 5: use the earned rewards to go from level 1 to 2.
