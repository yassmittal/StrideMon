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
  testnet and would overwrite `deployments/10143.json` (D-019). The same goes for
  `DeployFoundingPass.s.sol`. The test Anvil runs with Monad's 128 KB contract size limit
  (`--code-size-limit`), because the pass art renderer is about 66 KB, and its contract deploy
  takes about 7 s, so `beforeAll` passes `TEST_CONTRACTS_DEPLOY_TIMEOUT_MILLISECONDS` (D-042).
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
wallet; call it a waitlist, never a whitelist. Joining shows a card with **Post on X**, which links
`/waitlist?source=x-waitlist`, a page with its own share image (D-055).
**Domain (D-040, 2026-10-07):** **`stridemon.xyz`** (Namecheap DNS) is the main domain. The site is
`https://stridemon.xyz`; `www` and the old `stridemon.yashmittal.xyz` 308-redirect to it (Vercel
domain redirects, not `vercel.json`, which missed the home page). The API is at `https://api.stridemon.xyz` (new builds and the
waitlist use it); the old `stridemon-api.yashmittal.xyz` is removed once the new build ships (§11.6). `SIWE_DOMAIN` and the AppKit
metadata are `stridemon.xyz`. The rollout steps are `docs/deployment.md` §11, run by Yash.
The token is **STRIDE** (D-038, 2026-10-06), renamed from SOLE in all code, copy and docs. The contracts
were redeployed for it the same day (new addresses in `packages/contracts/README.md`), and the local
database was reset (the waitlist kept). Older decisions and `launch-video/FOOTAGE.md` keep SOLE on purpose.
To change the art, deploy a new renderer and call `setArtRenderer`: never redeploy `SneakerNft`
for it. The next free decision number is D-072.
**X (D-036):** `social/` holds the posts for [@stridemon](https://x.com/stridemon) and Yash's
[@yash_mittal_dev](https://x.com/yash_mittal_dev), one Markdown file each (`account:` in the
front-matter), with the rules in `social/voice.md` (plan: `docs/social-plan.md`). Claude drafts
there and **never posts, schedules, logs in to X or calls its API**. Only Yash publishes, and only
posts with his name in `approved:`. Every STRIDE amount carries "Monad testnet. STRIDE has no
monetary value." StrideMon is entered in Monad's **Metropolis** hackathon (submission deadline
2026-10-14 09:29 IST).
**Instagram (D-053, 2026-10-16):** `social/instagram/` holds the launch kit: profile copy, nine
feed posts, seven Stories and five Highlight covers, rendered from `social/instagram/design/*.html`
by `render.sh` into the gitignored `social/media/instagram/`. Same voice and rules as X: Claude
drafts and never posts. Feed images are 4:5 with nothing that matters within 84 px of a side
(the grid crops to 3:4).
**Product Hunt (D-054, 2026-10-16):** `social/product-hunt/README.md` is the launch kit: every form
field ready to paste, the first comment, answers and launch-day checks. Its six 1270 × 760 gallery
images are rendered from `design/*.html` by `render.sh` into the gitignored
`social/media/product-hunt/`. Claude drafts and never submits. The proposed launch is Tue 2026-12-01,
the day after the open mint (Yash decides).
**App tour film (2026-10-17):** `AppTour9x16` in `launch-video/` (`src/app-tour/`, brief
`docs/app-tour-video-prompt.md`), a 30 s 9:16 tour of the loop rebuilt from a third-party ad's
structure, with a realistic phone. **Its music is that ad's own track, unlicensed** (Yash's choice,
`launch-video/CREDITS.md`): never for Instagram; YouTube may claim it. Its X post draft is
`social/posts/2026-10-21-app-tour-film.md`.
**Showroom film (2026-10-21):** `Showroom9x16` in `launch-video/` (`src/showroom/`, brief
`docs/showroom-video-prompt.md`), the "hyperspeed cameraman" trend: the reference's own hook
(`hyperSpeedCameraman.mp4` at the repo root), then a StrideMon Sneaker store in 3D
(`@remotion/three`). **Its hook footage and music are the reference's own, unlicensed** (Yash's
choice): never for Instagram; YouTube may claim it.
**Crush film (2026-10-23):** `Crush9x16` in `launch-video/` (`src/crush/`, brief
`docs/crush-video-prompt.md`), a Naisnow ad on the "He will look at the person he likes first" trend
(`inspiration.mp4` at the repo root) remade shot for shot with #0137 in place of its cup: the
reference's hook, its cup-free plates (LaMa, `scripts/build-crush-plates.py`) and its tracked camera.
**Its footage (four real people) and music are the reference's own, unlicensed** (Yash's choice):
never for Instagram; YouTube may claim it.
**3D showroom (D-063, 2026-10-22):** the Showroom film's store, live and interactive, at
`https://showroom.stridemon.xyz`, in `showroom/` at the repo root (its own Next.js app like
`website/`, created in Part 1). Ported from the film's code, not rebuilt; **the Sneakers stay
flat** (the laced SVGs as cut-outs and prints, never recoloured), and tone mapping lives in the
architecture's materials, never in the composer (brief §5.2). Any of the 1,000 goes on the
counter's stand through Find. Built from `docs/showroom/`, **one part per session**: paste the
prompt in its `README.md`. It only shows: it links to `stridemon.xyz` to mint or join, and never
connects a wallet or takes an email. Parts 0 and 1 are done (2026-10-22): the store runs in
`showroom/` (`bun run dev`, port 3002). **Part 2 (the
arrival and the walk) is done** (2026-10-22, D-065: framed stops, the street as stop 0, the LEDs come
on with the store; every walk number in `showroom/src/visit/walk-plan.ts`). **Part 3 (look closer and find) is done** (2026-10-22, D-066: tap any
Sneaker for a square-on look with its card, Find and "Surprise me" on the stand, `?pass=137`, the
minted state through the API's own `SHOWROOM_ALLOWED_ORIGINS`, both removed by D-068). **Part 4 (finish and fallbacks) is built** (2026-10-23, D-067),
checked by Yash: the loader in the HTML drawn from real progress, tiers that only step down,
smaller wall pictures on phones, the no-WebGL / lost-context / failed-files fallbacks with stills
from `bun run render-stills`, the share card, and a look-closer texture leak fixed
(`useDisposeWhenReplaced`). **After his check, the interface moved into the store (D-068):** no
header or panels over the canvas (only dots, ⌃ ⌄, ‹ ✕ ›), lit tappable buttons in the store
(`showroom/src/store/store-buttons.ts`: door and window decals, the blade sign, the counter's
pill, the waitlist kiosk, the Find plate), a shop tag beside the Sneaker for look closer, Help
only on the fallbacks, and **no minted state and no API** (`SHOWROOM_ALLOWED_ORIGINS` removed from
the API). Yash checked it on his phone and the laptop: **Part 4 is done** (2026-10-23).
Measurements are in `showroom/README.md`. **Part 5 (launch, D-069) is built** (2026-10-23): `showroom/vercel.json`
(a strict CSP), Vercel Analytics, robots and sitemap, the website's links (`showroomUrl` in
`site.ts`: `/pass`, every pass page, the landing page, `/help#showroom`, `llms.txt`), the website
keeping a visit's first `?source=` for the waitlist, `deployment.md` §16, and the X drafts
(`social/posts/2026-11-xx-showroom-live*.md`). Waiting for Yash to deploy it and walk it live. Its rendering findings
are D-064: no screen-space AO (it shaded the Sneakers), glows draw under the Sneakers. Live by
2026-11-09.
**Waitlist growth (2026-10-18):** `docs/waitlist-growth-plan.md` is the plan to grow the waitlist
from 18 to 10,000 before the window (2026-11-28 14:30 UTC). Its parts are the referral early hour,
WhatsApp and Telegram sharing, Monad's channels, YouTube, LinkedIn, one Show HN, partners and
daily content. Yash decided (2026-10-18): yes to the early hour, no event travel, and Brevo's free
plan until the Metropolis results (11-03). The rest of its §8 is open. **The early hour is built
from `docs/waitlist-referral-prompt.md`**, one part per session: invite 3 friends who confirm
their email (Google sign-in or a code), and the window opens at 19:00 IST, for at most 250 passes.
Its decisions are D-056 (the invite loop), D-057 (Google and a 250-a-day cap on waitlist codes) and
D-058 (the early hour), approved 2026-10-18 (Part 0 done). Part 1 (API) is done (2026-10-18):
the new routes are in `backend-api.md` → The waitlist. Part 2 (website) is done (2026-10-18, checked by Yash on the local stack):
Google or email joining, the invite card and share row, `/waitlist/invites`, help and privacy
(`website/README.md` → Waitlist). **The invite email (D-062, 2026-10-22):** a join that checks a new inbox emails it the invite link
and the early hour (under the waitlist codes' daily limit, never failing the join); the list from
before gets it once from `bun run waitlist:send-invite-emails --joined-before <deploy time>`
(`deployment.md` §15, Yash runs it). The form's promise now names it. Deploy the API and the website together (`deployment.md` §14):
the live site's old form sends no Turnstile token, which the new API refuses.
**Never send cold email through Brevo** (its policy bans it, and that account sends the mint's
codes). At 300 a day it can't send the window email to 10,000 people, or check every minter's email
on the night. The kits are in `social/youtube/`, `social/linkedin/` and `social/hacker-news/`.
**8.8 is done** (2026-10-06). **Now: the Metropolis submission**, tracked in
`docs/hackathon-submission.md`. Done 2026-10-07: `LICENSE` (MIT), the README rewrite (Monad, "Try it",
"Run your own stack", the session's transaction hashes), the dashboard copy and the submission post
draft. The repair and upgrade on the live contracts are recorded in `README.md` (2026-10-13). Left:
the ≤ 3-minute demo video, the dashboard itself, and the demo video's `TODO(submission)` in `README.md`.
**UI polish and store readiness (D-039, 2026-10-07):** the app's own icon and splash (the website's
line-Sneaker mark, drawn by `apps/mobile/scripts/build-app-icons.sh`), the website header's logo,
X and waitlist pills, `/privacy` and `/delete-account`, `DELETE /v1/me` with Profile → Delete
account, the `production` EAS profiles, and the testnet line under STRIDE amounts. Needs the API
and website redeployed and a new app build, then a phone check.
**Founding Pass (D-041, 2026-10-08):** 1,000 one-of-one passes minted free on `stridemon.xyz/pass`
as early access, each with a Founder Sneaker (neither can be sent or sold). It's built from
`docs/founding-pass/`, **one part per session**: paste the prompt in its `README.md`, do the
first part that isn't done, and stop at its "Done when". Parts 0 (decide, D-041), 1a (art) and
1b (the art on-chain) are done (2026-10-08). `FoundingPassArtRenderer` is the only implementation
of the art, and **the 1,000 designs are frozen**
(`DESIGNS_FROZEN_ON`, approved by Yash): the build refuses new review rounds, and no design changes
without his say. The Chunky Legendary (#0542) is **Nacreous**, not Steve (Yash, 2026-10-08).
**Part 2 (contracts) is done** (2026-10-08, D-042): `FoundingPass`, Founder Sneakers in
`SneakerNft`/`SneakerGame`, and Founder Sneaker art in `SneakerArtRenderer`, deployed and verified
on testnet (`packages/contracts/README.md`), with test pass #0137 and Founder Sneaker #1 minted to the
deployer. Deploy order: `DeployFoundingPass.s.sol`, then `DeployGame.s.sol` with
`FOUNDING_PASS_ADDRESS` (a fresh pass means a fresh game too). **The hosted API is redeployed
on these contracts** (Yash, by 2026-10-09), and so is the `demo` build `f62511df` (2026-10-12):
the README's transactions were played on it. A wallet whose hosted record still points at a D-038
starter mint waits on "Loading your Sneaker from Monad…" until its record is cleared (wallet A's
was: it got Sneaker #2 on 2026-10-12). The lost-wallet move is `scripts/recover-founding-pass` (ask Yash first: it sends
testnet transactions). **Part 3 (API) is done** (2026-10-08, D-043): email codes, mints, the
schedule, the gate (`EARLY_ACCESS_REQUIRED`, off until 2026-10-27), Founder Sneakers, lacing, and
`bun run pass:send-waitlist-emails` / `pass:send-test-email` (from `apps/api`). Development never
sends email; it logs the code. The design table is in `@stridemon/chain/founding-pass-designs`
(generated by `chain:export-abis`). Brevo only takes API calls from authorised IPs: the server's
(`100.55.119.114`) must be on the list before the API redeploy, together with the new `.env` lines
(`deployment.md` §12). The gas drip stays 0.1 MON, so 1,000 founders need about 170 MON in the
game-server key. **Part 4 (website gallery) is done** (2026-10-08, D-044), checked on Yash's
phone: `/pass` (the schedule panel, the match quiz, "Surprise me", search, filters, the grid
and the detail sheet), the 1,000 `/pass/[number]` pages with their own Open Graph images, and the
landing page's Founding Pass section. The site's art and design table are generated by
`bun run website:export-pass-art` (`website/public/pass-art/`, `website/src/content/founding-pass-designs.ts`):
never edit them by hand. The live state comes from `GET /v1/pass/collection`; if it can't be reached, `/pass` says
the minted state is unavailable. The planned
times in `website/src/content/founding-pass.ts` must match the API's `PASS_*` settings.
**Part 5 (website mint) is done** (2026-10-09, D-045): "Get ready", the mint dialog, the reveal
from the chain's own card, and a plain next step for every error, on Reown AppKit web + wagmi 2,
loaded only after "Connect wallet" (`next/dynamic`, `ssr: false`: keep it so). Test it on the
local stack, never testnet: `cd apps/api && bun run pass:local-stack` (`website/README.md`). The
Turnstile site key is in `website/src/content/site.ts`; the API checks each token's action and
hostname too. Yash minted with his real MetaMask on the laptop and the phone (local stack through
Cloudflare quick tunnels, 2026-10-09). **Part 6 (app) is done** (2026-10-09, D-046), checked on
Yash's phone (`docs/device-testing.md` §11): `features/founding-pass/` (the pass from the chain,
the gate on the API's `FOUNDING_PASS_REQUIRED`, "Minting your Founder Sneaker…", the pass on Profile,
the laced moment on the run summary, a Founder Sneaker's Send disabled). It's checked on the phone
against `pass:local-stack --early-access`, with the app's four optional `EXPO_PUBLIC_*_ADDRESS`
overrides (the stack prints them). Builds never set them. **Part 7 (help) is done** (2026-10-09,
D-047), read by Yash on the website (some guide screenshots still to update): `stridemon.xyz/help` from `website/src/content/help.ts` (plain
strings, one `id` per answer, which is its anchor). Every website mint problem
(`mintProblemHelpTopicIds`) and app error (`buildHelpUrl` in `apps/mobile/src/config/website-urls.ts`)
links to its own answer; `website-urls.test.ts` checks the app's ids still exist on the site. The idea is in `docs/founding-pass-brief.md`, the art in
`packages/contracts/art/founding-pass/`, rebuilt with
`bun packages/contracts/art/founding-pass/build-founding-pass-art.ts`. Its `src/founding-pass-art/`
data is generated: never edit it by hand.
**Part 8 (help chatbot) is done** (2026-10-09, D-048), tried by Yash: "Ask a
question" on `/pass` and `/help` posts to `POST /v1/help/chat`, which answers from the help text
with DeepSeek V3.2 on Amazon Bedrock (`BEDROCK_API_KEY`, `us-east-1`) under a $5 monthly cap
(`HELP_CHAT_MONTHLY_CAP_USD`). **After any change to `website/src/content/help.ts`, run
`bun run help:export-knowledge`** and redeploy the API. `cd apps/api && bun run help:check-answers`
runs the 20-question test list against the live model.
**Founder access, said plainly (D-049, 2026-10-09):** "preview" is everything before the waitlist
window (the gallery is already live); "preview week" is retired. **Early access starts** (planned
Sat 2026-11-21) is the day Part 10 restarts the game on fresh contracts and turns the gate on, so
test-period Sneakers and STRIDE don't carry over. `/pass` shows where the app stands from the API's
`isEarlyAccessGateOn`; the copy explains the pass vs the Founder Sneaker, the two numbers (design
`#0137` vs "Founder 42"), and that the email must be the waitlist one.
**The website, read as a first-time visitor (D-050, 2026-10-09):** `/pass` is a short hero, Get
ready (only from a day before the waitlist window), the collection with the finder in its toolbar
("Show more" only, never load-on-scroll), How it works with the dates, the waitlist and Questions.
The landing page's hero buttons are Get your Founding Pass and Get the Android app; the rules, fair
play, contracts and Why Monad are one tabbed **Under the hood** section (old anchors open their
tab). The header has three links. Dates show in the visitor's time with no offset.
**SEO (D-051, 2026-10-11):** fixes from a Screaming Frog crawl: `/pass/all` and previous/next links
make every pass page linked (571 had no link), `buildPageMetadata` sets each page's whole share
card, a custom 404, and security headers in `website/vercel.json`. Deployed and re-crawled
(2026-10-11): all 1,006 pages 200 and indexable, nothing deeper than 3 clicks. The CSP (2026-10-12)
needs one more website redeploy.
**Answer engines (D-061, 2026-10-19):** `/llms.txt`, `/llms-full.txt` and Markdown copies of the
home, `/pass`, `/pass/all` and `/help`, all built from `website/src/content/` by routes in
`website/src/app/` (never edit them by hand); robots.txt names and allows the AI crawlers; FAQ and
breadcrumb JSON-LD; `contentUpdatedOn` in `site.ts` dates them (change it only with real copy
changes). After a website deploy, Yash runs `bun run indexnow` from `website/` (it sends the
sitemap to Bing): never run it without `--dry-run` yourself.
**Demo music and the app link (D-052, 2026-10-13):** the hero's demo video plays with music
("Fresh" by Bransboynd, Pixabay license, added by `cut-demo-video.sh`) and a sound button. Every
"Get the app" opens the `demo` build's expo.dev page (`appInstallPageUrl`), never the bare APK,
with "App review is in progress" in the hero until Google Play is live: update the link with each
new `demo` build. **EAS deletes a build 14 days after it's made**, so the link dies with it: the live
one is `175c7ab4` (2026-10-30, expires 2026-11-12).
