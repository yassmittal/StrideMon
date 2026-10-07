# CLAUDE.md

Working guide for **StrideMon** (stridemon.xyz), a STEPN-style move-to-earn game: the
player owns a Sneaker NFT on Monad, walks or runs to earn **STRIDE** (the ERC-20 reward token),
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
packages/contracts  Foundry: SneakerNft (ERC-721), StrideToken (ERC-20), SneakerGame (rules)
```

Everything targets **Monad testnet** until Phase 10.

## Non-negotiables

- **Never run git commands** (see the workspace `CLAUDE.md`). Leave changes in the working tree.
- **Build phase by phase** from `docs/phases/`. Only write what the current phase needs.
- **If code needs to differ from the docs, update the doc first.**
- **The chain is the source of truth** for Sneaker stats, energy and balances. Mongo never caches them as truth.
- **Follow `docs/conventions/coding-standards.md`**: full-word names with units (`distanceMeters`, `rewardAmountWei`), verb-first functions, no `any`, `bigint` for on-chain integers, and the vocabulary table (activity session, auth session, Sneaker, STRIDE).
- **Search `packages/shared` and `packages/chain` before writing anything new.**
- API layer rules (`docs/architecture/backend-api.md`): routes are thin, `lib/` is pure, and all Mongo access goes through `repositories/`.
- Mobile rules (`docs/architecture/mobile-app.md`): `app/` screens are thin, features own their logic, and only `lib/api-client` calls `fetch`.
- A change is done when typecheck, lint and tests pass (plus `forge test` for contract changes).

## DeltaV updates

StrideMon has a DeltaV profile (`https://deltav.monad.xyz/startup/stridemon`). After meaningful
progress (a feature, a milestone, real traction, a launch), remind Yash to post a short weekly
update, at most about once a week. Post it only with his ok: `POST
https://deltav.monad.xyz/api/v1/weekly-updates` with `Authorization: Bearer $DELTAV_API_KEY` and
`{"content": "...", "xLink": "<optional X post>"}`. Keep it short and factual, in his voice. The key
lives only in the `DELTAV_API_KEY` env var: never write it into the repo.

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
(+25 STRIDE for a 5-minute walk, matching the chain).
Phase 6 (repair & upgrade) is done (2026-10-03): the Sneaker tab repairs and upgrades through the
player's own wallet with one shared hook (`useSneakerGameTransaction`), verified on the Android phone
(repair 96 → 100, level 1 → 2, next run 6 STRIDE/min).
Phase 7 (Sneaker transfer) is done (2026-10-03): transfer reuses `useSneakerGameTransaction`, Home
has a Sneaker picker and an empty state (D-027). Verified on the Android phone with two MetaMask
accounts (#4 sent A → B and back, stats intact). **The MVP is complete.**
**Now: Phase 8: Demo hardening** (`docs/phases/phase-08-demo-hardening.md`), built in seven parts
with deployment last (D-028). 8.1 (design foundation) is done (2026-10-03): Lusion tokens in
`src/theme/` (`textStyles`, `fontFamilies`, `layout`, `motion`), Satoshi + IBM Plex Mono via
`expo-font`, the `components/ui` set (`Button` variants, `Panel`, `DarkPanel`, `HeroPanel`,
`MetaLabel`, `CounterText`, dark `ProgressBar`), haptics in `lib/haptics`, and the new
welcome, sign-in, minting and Home screens. Checked on the Android phone.
8.2 (design across the app) is done (2026-10-03), checked on the Android phone: dark active run
with `CrossMarks`, the light summary, Sneaker tab, sheets, transfer, History and Profile, plus
`TextField`, `CrossMarks`, `IconCircleButton` (`react-native-svg` icons), `ScreenTitle` and
`readOpticalPullLeft`. No raw hex, pixel or font values remain outside `src/theme/`.
Pills show an arrow, not Lusion's dot, and the tabs have line icons (D-029).
**8.3 (Sneaker NFT image)** is done (2026-10-03): `SneakerArtRenderer` draws an on-chain SVG that
`SneakerNft` serves as `imageSvg` and in `tokenURI` (D-030); the app draws it with `SvgXml` in
`SneakerCard`. The contracts were redeployed and verified on testnet (new addresses in
`packages/contracts/README.md`) and the local database was reset. Checked end to end on the
Android phone. After that check, pressed buttons step one shade instead of flooding blue, on the
native driver (D-031), and unused code was removed.
**8.4 (states and data hygiene)** is done (2026-10-04), checked on the Android phone: NetInfo drives
React Query's `onlineManager` with an `OfflineNotice` pill, `useIsGamePaused` reads
`SneakerGame.paused()` for a `MaintenanceNotice` (START, repair and upgrade off), the outbox holds
`EnforcedPause` reverts queued (D-032), and `locationSamples` has a 30-day TTL on `receivedAt`.
Pause or unpause with `cast send <SneakerGame> "pause()"` / `"unpause()"` and the deployer key
from `packages/contracts/.env` (it holds `PAUSER_ROLE`); ask Yash before sending either.
**8.5 (demo tooling)** is done (2026-10-05, D-033), rehearsed by hand on the Android phone:
`bun run demo:prepare-wallets` and `bun run demo:energy apply|revert` (Foundry scripts that
sign with the deployer key; `--dry-run` simulates), `docs/demo-script.md`, and the Maestro flow in
`apps/mobile/.maestro/` (`device-testing.md` §10). Ask Yash before running either script without
`--dry-run`: both send testnet transactions. The Maestro flow's MetaMask taps are still unrun
(the phone ran out of storage). **8.6 (deployment)** is done (2026-10-05, D-034): the API runs at
`https://stridemon-api.yashmittal.xyz` (nginx + certbot → `127.0.0.1:3020`, PM2 `stridemon-api`, its own
Bun at `~/.bun-1.4.2`), on the Atlas `stridemon` database, and the `demo` EAS build points at it. Every
`docs/deployment.md` step passed on the Android phone. **Never run the local API against testnet
now**: it shares the game-server key with the hosted one. `apps/mobile/.env` points at the hosted API.
8.7 (iOS device day, D-022) is **deferred** (D-035): it needs a borrowed iPhone and a paid Apple
Developer account. **8.8 (landing page, D-035):** `website/` at the repo root, Next.js 16 on Bun with
its own install (**not** a Bun workspace: never add it to the root `package.json` or import
`@stridemon/*` there), for `https://stridemon.yashmittal.xyz` on Vercel. The brief is
`docs/landing-page-prompt.md`; screenshots go in `website/public/screenshots/`. Built 2026-10-05
(static export, `website/README.md`); screenshots are in, and the demo video (`public/videos/`, cut by
`website/scripts/cut-demo-video.sh` from the gitignored `website/media-source/`) is on the page.
The site is live and `github.com/yassmittal/StrideMon` is public; both are final (Yash, 2026-10-06).
The page has a **waitlist** (D-037): `#waitlist` posts an email to the API's `POST /v1/waitlist`
(`waitlistSignups`), the only route with CORS (`WAITLIST_ALLOWED_ORIGINS`). Email only, never a
wallet; call it a waitlist, never a whitelist.
**Domain (D-040, 2026-10-07):** **`stridemon.xyz`** (Namecheap DNS) is the main domain. The site is
`https://stridemon.xyz`; `www` and the old `stridemon.yashmittal.xyz` 308-redirect to it (Vercel
domain redirects, not `vercel.json`, which missed the home page). The API is at `https://api.stridemon.xyz` (new builds and the
waitlist use it); the old `stridemon-api.yashmittal.xyz` is removed once the new build ships (§11.6). `SIWE_DOMAIN` and the AppKit
metadata are `stridemon.xyz`. The rollout steps are `docs/deployment.md` §11, run by Yash.
The token is **STRIDE** (D-038, 2026-10-06), renamed from SOLE in all code, copy and docs. The contracts
were redeployed for it the same day (new addresses in `packages/contracts/README.md`), and the local
database was reset (the waitlist kept). Older decisions and `launch-video/FOOTAGE.md` keep SOLE on purpose.
To change the art, deploy a new renderer and call `setArtRenderer`: never redeploy `SneakerNft`
for it. The next free decision number is D-042.
**X (D-036):** `social/` holds the posts for [@stridemon](https://x.com/stridemon) and Yash's
[@yash_mittal_dev](https://x.com/yash_mittal_dev), one Markdown file each (`account:` in the
front-matter), with the rules in `social/voice.md` (plan: `docs/social-plan.md`). Claude drafts
there and **never posts, schedules, logs in to X or calls its API**. Only Yash publishes, and only
posts with his name in `approved:`. Every STRIDE amount carries "Monad testnet. STRIDE has no
monetary value." StrideMon is entered in Monad's **Metropolis** hackathon (submission deadline
2026-10-14 09:29 IST).
**8.8 is done** (2026-10-06). **Now: the Metropolis submission**, tracked in
`docs/hackathon-submission.md`. Done 2026-10-07: `LICENSE` (MIT), the README rewrite (Monad, "Try it",
"Run your own stack", the session's transaction hashes), the dashboard copy and the submission post
draft. Left: a recorded run with a repair and an upgrade on the new contracts (none exist yet), the
≤ 3-minute demo video, the dashboard itself, and the two `TODO(submission)` gaps in `README.md`.
**UI polish and store readiness (D-039, 2026-10-07):** the app's own icon and splash (the website's
line-Sneaker mark, drawn by `apps/mobile/scripts/build-app-icons.sh`), the website header's logo,
X and waitlist pills, `/privacy` and `/delete-account`, `DELETE /v1/me` with Profile → Delete
account, the `production` EAS profiles, and the testnet line under STRIDE amounts. Needs the API
and website redeployed and a new app build, then a phone check.
**Founding Pass (D-041, 2026-10-07)**, alongside the submission: `docs/founding-pass-plan.md` is the
research and the spec. The first 1,000 players get a free soulbound pass (testnet) that gates the
starter Sneaker, claimed in the app with a code from a wave email or a founder's invite. Built in
three parts. **Part 1 (the verified line)** is built and checked locally (2026-10-07): the waitlist
emails a 6-digit code through Brevo, a verified email gets a place in line and a referral link
(`/v1/waitlist/verify`, `/v1/waitlist/place`), and the site's form has the email, code and place
steps. It needs Brevo set up (`deployment.md` §12), then the API and site redeployed. Parts 2
(contract, claim, gate) and 3 (lacing, invites, waves) are next. Words: Founding Pass, waitlist,
wave, invite code; never whitelist or airdrop.
