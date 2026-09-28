# Phase 7 — Sneaker Transfer (MVP complete)

**Goal:** the player sends the Sneaker to another wallet. The receiver sees it,
with all its on-chain stats intact. This completes the MVP defined in `MVP.md` §26.

**Read first:** `MVP.md` §16, `architecture/smart-contracts.md` → `settleSession` step 2.

## Deliverables

### `apps/mobile`
- `sneaker/transfer.tsx`: recipient address input (validated with viem
  `isAddress`, shown checksummed, and self-transfer refused), plus a
  confirmation screen that says clearly "You will no longer own this Sneaker".
- It reuses `useSneakerGameTransaction` for `safeTransferFrom` on `SneakerNft`.
  There's no new transaction code.
- Transfer is blocked while an activity session is active, with the message
  "Finish your run first".
- **Multiple Sneakers:** a wallet that receives a Sneaker may now own more than
  one. Home shows a simple picker (horizontal list) of owned Sneakers, and the
  selected one drives START, repair and upgrade. Owning **zero** Sneakers after
  a transfer out shows an empty state (the starter is one per address, so it is
  never minted again).

### `apps/api`
- Start-session pre-checks already verify ownership (Phase 4), and settlement
  already rejects a transferred Sneaker (Phase 5). Add a test for a transfer
  mid-session → the session is rejected with `SNEAKER_TRANSFERRED_DURING_SESSION`.

## Definition of done
- [ ] Wallet A transfers Sneaker #1 to wallet B. A no longer sees it, and B sees it with identical stats.
- [ ] The explorer shows the ownership change.
- [ ] Every step of `MVP.md` §26 works end to end on a real device.

## Demo check
`MVP.md` §21 Demo 7: Wallet A → Wallet B, before and after.

---

**🎯 MVP complete.** Update `docs/README.md` status and run the full §21 demo once, start to finish.
