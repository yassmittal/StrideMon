# CLAUDE.md

Working guide for **StrideMon** (stridemon.com), a STEPN-style move-to-earn game: the
player owns a Sneaker NFT on Monad, walks or runs to earn **SOLE** (the ERC-20 reward token),
and spends it to repair and upgrade the Sneaker.

- `MVP.md` is the product brief (**what**).
- `docs/` is the architecture, conventions and phased build plan (**how**). Start at `docs/README.md`.

## Stack

Bun workspaces monorepo:

```
apps/mobile         Expo (dev builds) + React Native + Expo Router + TypeScript
apps/api            Fastify 5 + TypeScript on Bun, MongoDB (official driver), viem
packages/shared     zod API contracts, domain types, game-rule mirror (estimates only)
packages/chain      generated ABIs, deployed addresses, Monad chain definitions
packages/contracts  Foundry: SneakerNft (ERC-721), SoleToken (ERC-20), SneakerGame (rules)
```

Everything targets **Monad testnet** until Phase 10.

## Non-negotiables

- **Never run git commands** (see the workspace `CLAUDE.md`). Leave changes in the working tree.
- **Build phase by phase** from `docs/phases/`. Only write what the current phase needs.
- **If code needs to differ from the docs, update the doc first.**
- **The chain is the source of truth** for Sneaker stats, energy and balances. Mongo never caches them as truth.
- **Follow `docs/conventions/coding-standards.md`**: full-word names with units (`distanceMeters`, `rewardAmountWei`), verb-first functions, no `any`, `bigint` for on-chain integers, and the vocabulary table (activity session, auth session, Sneaker, SOLE).
- **Search `packages/shared` and `packages/chain` before writing anything new.**
- API layer rules (`docs/architecture/backend-api.md`): routes are thin, `lib/` is pure, and all Mongo access goes through `repositories/`.
- Mobile rules (`docs/architecture/mobile-app.md`): `app/` screens are thin, features own their logic, and only `lib/api-client` calls `fetch`.
- A change is done when typecheck, lint and tests pass (plus `forge test` for contract changes).

## Current phase

No code yet. Next: **Phase 0: Foundations** (`docs/phases/phase-00-foundations.md`).
