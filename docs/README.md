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
| 0 — Foundations | Done, except the on-device check (needs an EAS or local dev build) |
| 1 — Smart contracts | Not started |
| 2 — Wallet & sign-in | Not started |
| 3 — Starter Sneaker & home | Not started |
| 4 — Activity tracking | Not started |
| 5 — Settlement & rewards | Not started |
| 6 — Repair & upgrade | Not started |
| 7 — Sneaker transfer (**MVP complete**) | Not started |
| 8 — Demo hardening | Not started |
| 9 — Marketplace (optional) | Not started |
| 10 — Beyond the hackathon | Not started |

Update this table as phases finish.
