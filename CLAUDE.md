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
- API tests use real Mongo (`bun run db:start` first) and a throwaway **Anvil** that the test
  helper starts, so Foundry's `anvil` must be on the `PATH` (D-018).
- **Wallet stack pins (D-018):** AppKit RN 2.0.6 needs **wagmi 2.x** (not 3). WalletConnect packages
  are held at 2.21.10 by root `overrides`, with `valtio` at 2.1.8. Don't bump one on its own.
- **Running the app on the phone:** start Metro with `cd apps/mobile && bunx expo start --clear`.
  `bun run dev:mobile` goes through `bun --filter`, which has no TTY, so it prints no QR code.
  `EXPO_PUBLIC_API_BASE_URL` must be the laptop's current LAN IP. On this Mac the Wi-Fi
  is `en1`, so use `ipconfig getifaddr en1` (`en0` prints nothing).
- **The wallet must have Monad Testnet (10143) enabled** before connecting, and MetaMask's connect
  sheet must list it. Otherwise MetaMask approves a WalletConnect session with no `eip155`
  accounts, and AppKit throws `Cannot read property 'setDefaultChain' of undefined`. The cause is
  traced in the source: the universal provider's `createProviders()` skips a namespace with zero
  accounts, then `WalletConnectConnector.connect` calls `setDefaultChain` on it. After a failed
  connect, clear the app's data so the broken session isn't restored.
- Local Expo config plugins are **plain JS** in `apps/mobile/plugins/`, listed by path in
  `app.config.ts`. The config loader can't import a `.ts` file from `app.config.ts`.

## Current phase

Phases 0, 1 and 2 are done (2026-09-29). The contracts are live and verified on Monad testnet;
addresses are in `packages/contracts/README.md` and `@stridemon/chain`. Phase 2's sign-in,
restore, sign-out and revoke were verified on an Android phone with MetaMask. **Next: Phase 3:
Starter Sneaker & home** (`docs/phases/phase-03-starter-sneaker-and-home.md`).
