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
  helper starts, so Foundry's `anvil` must be on the `PATH` (D-018). Outbox tests deploy the
  contracts to that Anvil from `packages/contracts/out/`, so run `bun run contracts:build` first.
  **Never broadcast `DeployGame.s.sol` to a local Anvil:** it shares chain id 10143 with the
  testnet and would overwrite `deployments/10143.json` (D-019).
- **The API's game-server key** (`GAME_SERVER_PRIVATE_KEY` in `apps/api/.env`) is the same key as
  in `packages/contracts/.env`. The outbox sends every mint and gas drip with it (about 0.13 MON
  per new player), so keep it funded from the faucet.
- **Wallet stack pins (D-018):** AppKit RN 2.0.6 needs **wagmi 2.x** (not 3). WalletConnect packages
  are held at 2.21.10 by root `overrides`, with `valtio` at 2.1.8. Don't bump one on its own.
- **Running the app on the phone:** the whole loop (build, find the APK link, install, run, debug) is in
  `docs/device-testing.md`. Start Metro with `cd apps/mobile && bunx expo start --clear`.
  `bun run dev:mobile` goes through `bun --filter`, which has no TTY, so it prints no QR code.
  `EXPO_PUBLIC_API_BASE_URL` must be the laptop's current LAN IP. On this Mac the Wi-Fi
  is `en1`, so use `ipconfig getifaddr en1` (`en0` prints nothing).
- **The wallet must have Monad Testnet (10143) enabled** before connecting, and MetaMask's connect
  sheet must list it. Otherwise MetaMask approves a WalletConnect session with no `eip155`
  accounts, and AppKit throws `Cannot read property 'setDefaultChain' of undefined`. The cause is
  traced in the source: the universal provider's `createProviders()` skips a namespace with zero
  accounts, then `WalletConnectConnector.connect` calls `setDefaultChain` on it. After a failed
  connect, clear the app's data so the broken session isn't restored.
- **The app entry is `apps/mobile/index.ts`, not `expo-router/entry`** (D-020). It defines the
  location task and registers the API token source before the router loads, because Android
  starts the JS headless for location fixes. Keep `expo-router/entry` as its last import.
- **Typed routes live in `.expo/types/router.d.ts`** (gitignored) and only regenerate when
  `expo start` runs. After adding a route, start Metro once (any port), or the typecheck rejects
  the new path.
- **A `bun test` timeout kills the test's spawned processes, including the shared Anvil**, and
  every later test in that file then fails with "HTTP request failed". Give a slow chain test
  (for example one that deploys its own contracts) an explicit timeout.
- **Killing the app while a wallet request is open breaks the WalletConnect session.** After
  reopening, every request fails with `Invalid Id` from MetaMask (plus "emitting session_request…
  without any listeners"). Nothing reaches the chain. Fix: Profile → sign out (it disconnects the
  wallet), then sign in again. Seen in Phase 7.
- **Match viem errors by `name`/`code`, never `instanceof`.** Metro can load viem's ESM and CJS
  builds side by side, so a wallet cancel from wagmi isn't an instance of the app's
  `UserRejectedRequestError`. Use `lib/chain/error-chain.ts` and `isWalletRejection`.
- **Text sets a font family, never `fontWeight`** (Phase 8.1). Android picks a custom font by file,
  so a weight is a family (`fontFamilies.medium`, `monoRegular`). Spread `...textStyles.<size>`
  and override `fontFamily` after it. Import IBM Plex Mono per weight
  (`@expo-google-fonts/ibm-plex-mono/400Regular`): the package root bundles all 14 weights.
- Local Expo config plugins are **plain JS** in `apps/mobile/plugins/`, listed by path in
  `app.config.ts`. The config loader can't import a `.ts` file from `app.config.ts`.

## Current phase

Phases 0 to 3 are done (2026-09-29). The contracts are live and verified on Monad testnet;
addresses are in `packages/contracts/README.md` and `@stridemon/chain`. Sign-in (Phase 2) and the
starter Sneaker, gas drip and Home (Phase 3) were verified on an Android phone with MetaMask.
The transaction outbox (D-012, D-019) is live and sends the game server's transactions.
Phase 4 (activity tracking) is done (2026-09-30): runs start, track, upload and validate on the
Android phone (D-020 to D-024). Its outdoor walk, car and kill-and-reopen checks moved to Phase 8,
which brings the hosted API and a bundled-JS build (D-025).
Phase 5 (settlement & rewards) is done (2026-10-02): STOP settles on Monad through the outbox, the
summary shows the real reward, and History lists past runs (D-026). Verified on the Android phone
(+25 SOLE for a 5-minute walk, matching the chain).
Phase 6 (repair & upgrade) is done (2026-10-03): the Sneaker tab repairs and upgrades through the
player's own wallet with one shared hook (`useSneakerGameTransaction`), verified on the Android phone
(repair 96 → 100, level 1 → 2, next run 6 SOLE/min).
Phase 7 (Sneaker transfer) is done (2026-10-03): transfer reuses `useSneakerGameTransaction`, Home
has a Sneaker picker and an empty state (D-027). Verified on the Android phone with two MetaMask
accounts (#4 sent A → B and back, stats intact). **The MVP is complete.**
**Now: Phase 8: Demo hardening** (`docs/phases/phase-08-demo-hardening.md`), built in seven parts
with deployment last (D-028). 8.1 (design foundation) is done (2026-10-03): Lusion tokens in
`src/theme/` (`textStyles`, `fontFamilies`, `layout`, `motion`), Satoshi + IBM Plex Mono via
`expo-font`, the `components/ui` set (`Button` variants, `Panel`, `DarkPanel`, `HeroPanel`,
`MetaLabel`, `CounterText`, dark `ProgressBar`), haptics in `lib/haptics`, and the new
welcome, sign-in, minting and Home screens. Checked on the Android phone.
8.2 (design across the app) is built (2026-10-03), waiting for the phone check: dark active run
with `CrossMarks`, the light summary, Sneaker tab, sheets, transfer, History and Profile, plus
`TextField`, `CrossMarks`, `IconCircleButton` (`react-native-svg` icons), `ScreenTitle` and
`readOpticalPullLeft`. No raw hex, pixel or font values remain outside `src/theme/`.
**Next: 8.3** (Sneaker NFT image). The next decision number is D-029, reserved for 8.3's approach.
