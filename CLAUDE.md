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

## Toolchain gotchas

- **`mongodb` is pinned to v6.** v7 pulls `bson@7`, which crashes at import time on Bun (D-015).
- **`node_modules` is hoisted and Bun doesn't auto-install peers** (`bunfig.toml`). In React Native every installed package is an autolinked native module, so an unused peer ends up compiled into the app. When a package needs a peer, declare it yourself (`jest-expo` → `@react-native/jest-preset`, Testing Library → `test-renderer`).
- **Add mobile dependencies with `bunx expo install <pkg>`** (from `apps/mobile`), so versions match the Expo SDK. When Expo has no mapping it takes the latest version, which may be wrong. Check it: `@babel/runtime` must stay on 7.x, and `@react-native/*` packages must equal the `react-native` version.
- **Bun is pinned on EAS** (`eas.json` → `"bun"`). Keep it equal to your local `bun --version`, and regenerate `bun.lock` with that version. A lockfile written by one Bun version can fail `--frozen-lockfile` on another.
- **`@babel/runtime` is a direct mobile dependency.** Babel-compiled app code imports its helpers.
- **Jest's `transformIgnorePatterns`** (in `apps/mobile/package.json`) also exempts `@stridemon`. Keep them if you edit the list.
- **Contracts** use Soldeer (no git submodules). Import `@openzeppelin/contracts/…` and `forge-std/…` (see `remappings.txt`).
- **Foundry ≥ 1.8 is required** (`foundryup -i v1.8.3`), with `network = "monad"` in `foundry.toml` (D-016). **After editing Solidity, if a result looks stale, run `forge clean`.** Foundry 1.8.3's build cache has skipped a changed file ("No files changed").
- **Deploy keys** live in `packages/contracts/.env` (gitignored). After a deploy, run `bun run chain:export-abis` so `@stridemon/chain` picks up the ABIs and addresses.
- API tests use real Mongo: run `bun run db:start` first.

## Current phase

Phases 0 and 1 are done (2026-09-29). The contracts are live and verified on Monad testnet;
addresses are in `packages/contracts/README.md` and `@stridemon/chain`. Next: **Phase 2: Wallet &
sign-in** (`docs/phases/phase-02-wallet-and-sign-in.md`).
