# StrideMon — Documentation

This folder is the source of truth for **how** we build the product described in
[`../MVP.md`](../MVP.md). `MVP.md` says *what* the game is; these docs say how the
system is shaped, how the code is written, and in which order it is built.

Every phase in [`roadmap.md`](roadmap.md) is built against
these documents, and when a decision changes, the doc changes first.

## Reading order

| # | Document | Read it when |
|---|----------|--------------|
| 1 | [`architecture/system-overview.md`](architecture/system-overview.md) | First. The whole system on one page: pieces, responsibilities, data flow. |
| 2 | [`decisions.md`](decisions.md) | You want to know *why* a technology or design was chosen. |
| 3 | [`roadmap.md`](roadmap.md) | You want the list of phases and what "done" means for each. |
| 4 | [`conventions/coding-standards.md`](conventions/coding-standards.md) | Before writing any code. Naming, readability, reuse. **Not optional.** |
| 5 | [`architecture/repository-structure.md`](architecture/repository-structure.md) | Deciding where a file goes. |
| 6 | [`architecture/smart-contracts.md`](architecture/smart-contracts.md) | Working in `packages/contracts`. |
| 7 | [`architecture/backend-api.md`](architecture/backend-api.md) | Working in `apps/api`. |
| 8 | [`architecture/mobile-app.md`](architecture/mobile-app.md) | Working in `apps/mobile`. |
| 9 | [`architecture/data-model.md`](architecture/data-model.md) | Touching MongoDB collections or on-chain state. |
| 10 | [`architecture/game-rules.md`](architecture/game-rules.md) | Touching energy, rewards, durability, repair or upgrade numbers. |
| 11 | [`architecture/security.md`](architecture/security.md) | Touching auth, keys, validation or contracts. |
| 12 | [`conventions/testing.md`](conventions/testing.md) | Writing tests (i.e. always). |
| 13 | [`architecture/design-system.md`](architecture/design-system.md) | Styling anything in `apps/mobile` (colors, type, spacing, motion, components). Applied in Phase 8. |
| 14 | [`device-testing.md`](device-testing.md) | Building, installing and debugging the app on a phone. |
| — | [`phases/`](phases/) | One detailed spec per phase. Build from these. |

## Three rules that override everything else

1. **The chain is the source of truth for game state.** Sneaker stats, energy and
   reward balances live on Monad. MongoDB stores what the chain should never see
   (raw GPS, auth) and bookkeeping about what we sent to the chain.
2. **Readable over clever.** Every name says what the thing is, in full words,
   with units. If a reviewer has to ask "what is this?", the name is wrong.
3. **Write only what the current phase needs.** No speculative abstractions, no
   "we might need this later" code. Scalability comes from clean boundaries,
   not from extra code.

## Status

| Phase | State |
|-------|-------|
| 0 — Foundations | Done (verified on an Android phone via an EAS development build, 2026-09-29) |
| 1 — Smart contracts | Done (deployed and verified on Monad testnet, `cast` loop run on-chain, 2026-09-29) |
| 2 — Wallet & sign-in | Done (connect, sign-in, restore, sign-out and revoke verified on an Android phone with MetaMask, 2026-09-29) |
| 3 — Starter Sneaker & home | Done (starter mint + gas drip verified on an Android phone and live on Monad testnet in ~5 s; outbox crash recovery tested against Anvil, 2026-09-29) |
| 4 — Activity tracking | Done (runs verified on an Android phone, 2026-09-30). The outdoor walk, car and kill-and-reopen checks move to Phase 8 (D-025); iOS too (D-022) |
| 5 — Settlement & rewards | Done (a 5-minute walk settled +25 SOLE, durability −2 on an Android phone, matching the chain and `tokenURI`, 2026-10-02) |
| 6 — Repair & upgrade | Done (repair 96 → 100 for 2.8 SOLE, upgrade 1 → 2 for 50 SOLE, wallet cancel, and the next run paying 6 SOLE/min verified on an Android phone, 2026-10-03). The durability-below-50 penalty was skipped |
| 7 — Sneaker transfer (**MVP complete**) | Done (#4 sent A → B and back with level 2, efficiency 12 intact; picker, empty state and run block verified on an Android phone with two MetaMask accounts, 2026-10-03). **MVP complete** |
| 8 — Demo hardening | In progress (seven parts, deployment last, D-028). 8.1 design foundation: done (Home checked on the Android phone, 2026-10-03). 8.2 design across the app: done (every screen, sheets, transfer and tab icons checked on the Android phone, 2026-10-03). 8.3 Sneaker NFT image: done (on-chain SVG via `SneakerArtRenderer`, contracts redeployed and verified, flow checked end to end on the Android phone, 2026-10-03; quiet button presses, D-031). 8.4 states and data hygiene: built (offline strip, maintenance state while paused, 30-day GPS TTL, explorer links checked; D-032), phone check pending |
| 9 — Marketplace (optional) | Not started |
| 10 — Beyond the hackathon | Not started |

Update this table as phases finish.
