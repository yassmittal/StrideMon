# Decision Log

Every significant choice, why it was made, and what it costs. When a decision
changes, add a new entry that supersedes the old one. Don't rewrite history.

Format: **Decision**, **Why**, **Trade-off**, **Revisit when**.

---

## D-001 — React Native through Expo, with development builds

- **Decision:** Expo SDK (latest stable when Phase 0 starts), Expo Router for
  navigation, EAS Build for binaries. We use development builds, not Expo Go.
- **Why:** One TypeScript codebase for iOS and Android. React Native's own docs
  recommend a framework, and Expo is that framework. Config plugins give us the
  native pieces we need (background location, wallet deep links, secure storage)
  without hand-maintaining `ios/` and `android/`.
- **Trade-off:** Wallet SDKs and background location need native modules, so
  Expo Go is out. Every native dependency change needs a fresh dev build.
- **Revisit when:** a native requirement no config plugin can meet (unlikely).

## D-002 — Fastify for the API

- **Decision:** Fastify 5, TypeScript. The layering (`routes → handlers → lib/services/repositories`)
  is the one already proven in `meAsAgent/api`.
- **Why:** Fast, schema-first (request *and* response schemas), first-class
  TypeScript, and a plugin system that keeps concerns separate. It is also
  familiar from existing projects.
- **Trade-off:** It is less batteries-included than NestJS, so we write down our
  own structure (see `architecture/backend-api.md`) and stick to it.

## D-003 — Bun workspaces monorepo

- **Decision:** One repository. `apps/mobile`, `apps/api`, `packages/shared`,
  `packages/chain`, `packages/contracts`. Bun is the package manager and the API
  runtime.
- **Why:** Mobile and API share types, zod schemas, game-rule mirrors and contract
  ABIs, and a monorepo makes that sharing a plain import. Bun matches the rest of
  the workspace.
- **Trade-off:** Metro (React Native's bundler) needs monorepo-aware config, which
  Expo mostly handles. Some Node libraries misbehave on Bun: `meAsAgent` had to
  pin `mongodb` to v6. We check that in Phase 0 before relying on it.
- **Revisit when:** a critical API dependency breaks on Bun. The API code stays
  Node-compatible so switching runtime is a script change, not a rewrite.

## D-004 — MongoDB with the official driver and zod, no ODM

- **Decision:** The `mongodb` driver with typed collections, and zod at the
  boundaries. All database access goes through `repositories/`. No Mongoose.
- **Why:** Mongoose duplicates the schemas we already define in zod and hides
  queries behind magic. With typed repositories, every query is explicit and
  easy to find.
- **Trade-off:** We write index creation and validation ourselves (a small
  `plugins/mongo-indexes.ts`).

## D-005 — Everything about the Sneaker lives on-chain

- **Decision:** Level, efficiency, durability and energy are stored in
  `SneakerNft`. Only `SneakerGame` can change them.
- **Why:** The product's promise is "the Sneaker is a real asset". Stats that
  live on-chain travel with the NFT on transfer, anyone can verify them, and the
  API can't quietly edit them.
- **Trade-off:** Every session ends in a transaction, paid by the game server.
  That is cheap on Monad and free on testnet. State changes also wait for a block.
  Monad blocks are fast, but the UI still shows a "settling" state.

## D-006 — ERC-20 reward token from day one (testnet)

- **Decision:** `SoleToken` is an ERC-20 on Monad testnet. `SneakerGame` mints
  it when a session settles and burns it on repair or upgrade.
- **Why:** Rewards that are real tokens are part of the demo story, and building
  it now avoids a later migration off an off-chain ledger.
- **Trade-off:** Repair and upgrade are wallet transactions, so the player needs
  a little testnet MON for gas. We solve that with a one-time gas drip at
  onboarding (see D-009).

## D-007 — The API is the activity oracle; the contract computes the reward

- **Decision:** The API validates GPS and reports only `activeMinutes` and
  `distanceMeters` to `SneakerGame.settleSession`. The contract applies energy,
  efficiency and durability rules and mints.
- **Why:** The game rules are enforced where the value is created, so they are
  on-chain and auditable. The trusted surface of the API shrinks to "was this
  movement real?". Even a compromised server key cannot mint more than the
  on-chain rules allow for the Sneaker's energy.
- **Trade-off:** The reward formula exists in Solidity (the authority) and in
  TypeScript (the estimate shown during a run). A shared fixture file tested by
  both sides keeps them identical (see `conventions/testing.md`).

## D-008 — Sign-In With Ethereum (EIP-4361) + JWT

- **Decision:** The wallet signs a SIWE message. The API verifies it and issues
  a short-lived access token and a rotating refresh token, stored hashed in
  `authSessions`.
- **Why:** The wallet *is* the identity (see `MVP.md` §3), so there are no
  passwords or emails.
- **Trade-off:** Losing the wallet means losing the account. That is acceptable
  and matches Web3 expectations.

## D-009 — Testnet onboarding: server mints the starter Sneaker and drips gas

- **Decision:** On first sign-in the API mints one starter Sneaker to the player
  (the contract allows one per address) and sends a small, rate-limited amount of
  testnet MON for gas.
- **Why:** A new player can't pay gas they don't have. This keeps the demo to
  "connect wallet → you own a Sneaker".
- **Trade-off:** It only works on testnet. Mainnet needs a paymaster or account
  abstraction (Phase 10).

## D-010 — Wallet connection via Reown AppKit (WalletConnect) + wagmi + viem

- **Decision:** Reown AppKit for React Native with the wagmi adapter. The mobile
  app uses viem/wagmi, and the API uses viem.
- **Why:** The MVP says "connect your Monad-compatible wallet", and AppKit is the
  standard way to connect external wallets on mobile. Running viem on both sides
  means one set of ABIs and one type system for addresses and bigints.
- **Trade-off:** You need a wallet app on the test device. Embedded wallets
  (email → wallet) are friendlier and are evaluated in Phase 10.
- **Verify in Phase 2:** current AppKit + Expo compatibility and Monad testnet support.

## D-011 — Foundry for contracts, OpenZeppelin v5, Soldeer for dependencies

- **Decision:** Foundry (forge, anvil, cast). OpenZeppelin Contracts v5.
  Dependencies go through Soldeer (`forge soldeer`).
- **Why:** Tests are written in Solidity, run fast, and include fuzzing. Soldeer
  avoids `forge install`'s git submodules, which matters because this workspace
  does not run git commands on your behalf.

## D-012 — Server-side transaction outbox

- **Decision:** Every game-server transaction is first written to
  `chainTransactions` and then sent by one background worker, which holds a lease,
  keeps nonces in order, and records the receipt.
- **Why:** Settlements must never be lost or sent twice. The `sessionId` is also
  checked on-chain, as a second guard.
- **Trade-off:** It adds a small amount of infrastructure in Phase 3. That's
  worth it, because it's the difference between a demo and a system.

## D-013 — Biome for lint and format across all TypeScript

- **Decision:** One `biome.json` at the root. `forge fmt` for Solidity.
- **Why:** It's the same tool as every other project in this workspace, and it's
  fast and zero-config.

## D-014 — Product name StrideMon, reward token SOLE

- **Decision:** The product is **StrideMon** (`stridemon.com`, bundle id
  `com.stridemon.app`, workspace scope `@stridemon/*`). The reward token is
  **SOLE**, and its contract is `SoleToken`.
- **Why:** "Stride" is the core action. "MON" is Monad's native token, so the
  name nods to the chain without using the Monad trademark, and the "-mon" ending
  suits collectible Sneakers. SOLE is the part of a sneaker that wears down as
  you move, so "+50 SOLE" reads naturally.
- **Trade-off:** "-mon" echoes Pokémon, so run a trademark check before any
  public launch. Several other token symbols were already taken and were ruled
  out: `STRIDE`/`STRD` (Stride chain), `STEP` (Step Finance), `TREAD` (tread.fi),
  `GRIT` (Gala Games) and `GST` (STEPN).
- **Note:** In code, amounts keep the generic word "reward" (`rewardAmountWei`,
  `calculateSessionReward`). If the token is ever renamed, only the contract
  name and UI copy change.
- **Superseded in part:** the token is renamed SOLE → STRIDE by D-038 (2026-10-06).

## D-015 — Toolchain pins found in Phase 0

- **Decision:**
  - Bun installs a **hoisted** `node_modules` (`bunfig.toml` → `linker = "hoisted"`)
    and does **not** auto-install peer dependencies (`peer = false`).
  - EAS builds pin the same Bun version as local development (`eas.json` → `"bun"`).
  - The API pins **`mongodb` to v6**.
  - Every workspace uses **TypeScript 6**, the version Expo SDK 57 pins, not TypeScript 7.
  - Solidity is pinned to **0.8.37** with `evm_version = "cancun"`.
- **Why:**
  - Bun's default isolated linker installed several copies of `react-native`,
    `expo-modules-core` and other native packages, one per peer-dependency
    combination. `expo-doctor` flags this, and duplicate native modules break
    autolinking. Hoisted is the layout React Native tooling assumes.
  - With auto-installed peers, `expo-router`'s drawer pulled in
    `react-native-reanimated` and `react-native-gesture-handler`, without
    `react-native-worklets`. Every installed native package is autolinked, so
    the app would have compiled modules it doesn't use, and one of them was
    missing a dependency. Needed peers are now declared explicitly.
  - The first EAS build failed because EAS ran a newer Bun, which couldn't
    parse the lockfile the local Bun wrote.
  - `mongodb` v7 pulls `bson@7`, which still crashes at import time on Bun 1.3.9
    (re-checked in Phase 0, same failure `meAsAgent` hit).
  - One TypeScript version across the monorepo avoids two compilers disagreeing.
  - An explicit EVM version means a compiler bump can't silently emit opcodes
    Monad doesn't support.
- **Revisit when:** an Expo SDK upgrade (TypeScript version), a Bun release fixes
  `bson@7`, or Monad documents support for a newer EVM version.

## D-016 — Monad testnet tooling, confirmed at Phase 1 start

- **Decision:**
  - **Foundry 1.8.3** (≥ 1.8 is what Monad requires), with `network = "monad"` in
    `foundry.toml`. Local tests, scripts and Anvil then use Monad's gas model,
    opcode pricing and 128 KB contract size limit.
  - `evm_version` **stays `cancun`** (D-015).
  - Contracts are verified on **MonadVision** (`testnet.monadvision.com`) through
    its **Sourcify** endpoint, `https://sourcify-api-monad.blockvision.org/`. It
    needs no API key. Monadscan (`testnet.monadscan.com`, Etherscan API with a
    key) is the fallback.
  - `packages/chain` overrides viem's block explorer for Monad testnet with
    MonadVision.
- **Why:**
  - Monad's docs (checked 2026-09-29) say releases before Foundry 1.8 don't
    model Monad execution. Monad charges the full **gas limit**, not the gas used,
    and it reprices storage (MIP-8, `MONAD_TEN`). A script simulated with
    Ethereum pricing would pick the wrong gas limits.
  - Monad documents Prague-era precompiles (EIP-2537, EIP-2935, EIP-7702) and
    Osaka's CLZ opcode (MIP-5). So a newer `evm_version` would work, but these
    contracts gain nothing from it, and `cancun` needs no retesting.
  - viem's `testnet.monadexplorer.com` now 308-redirects to MonadVision.
    Linking to it directly skips the redirect.
- **Trade-off:** everyone who builds the contracts needs Foundry ≥ 1.8
  (`foundryup -i v1.8.3`).
- **Revisit when:** Monad publishes a revision that changes gas or opcode
  behavior (bump Foundry), or a contract wants CLZ or other post-Cancun opcodes.

## D-017 — Visual design modeled on lusion.co

- **Decision:** StrideMon's visual language (color, type, spacing, radii, motion
  and components) follows **lusion.co**. The exact values were read from
  Lusion's production CSS, its WebGL bundle and computed styles on 2026-09-29.
  They are recorded in `architecture/design-system.md` and applied in Phase 8.
- **Why:** The owner picked it from a shortlist of Awwwards Site-of-the-Year-level
  references. Its "one 3D hero object on a calm off-white page" structure fits
  a single Sneaker NFT. Its dark sections with a lime progress fill map directly
  onto an active run and the energy bar.
- **Trade-off:** We copy the system (values, layout rules, interaction patterns),
  never Lusion's assets or code. **Aeonik is a paid font** (CoType Foundry), so an
  app licence is needed before a public build. LusionMono is proprietary and is
  replaced by IBM Plex Mono. A few states Lusion doesn't have (disabled,
  success) are derived and marked as such in the doc.
- **Revisit when:** the Aeonik licence isn't obtainable in time (fall back to
  Satoshi), or user testing shows the 10 pt uppercase labels are too small.

## D-018 — Reown AppKit v2 on Expo SDK 57, checked at Phase 2 start

- **Decision:** D-010 stands. The app uses **`@reown/appkit-react-native` 2.0.6** (the
  AppKit core, which owns the modal) plus **`@reown/appkit-wagmi-react-native` 2.0.6** (the
  wagmi adapter), with **wagmi 2.x** and viem. Pins that come with it:
  - `wagmi` stays on **2.19.x**. wagmi 3 exists, but the adapter's peer range is `wagmi <3`.
  - `@walletconnect/react-native-compat` and `@walletconnect/utils` are **2.21.10**, the
    WalletConnect version AppKit 2.0.6 pins through `@walletconnect/universal-provider`.
    Root `overrides` hold `universal-provider`, `ethereum-provider` (pulled in by
    `@wagmi/connectors`) and `valtio` (2.1.8) to one version each, so only one
    WalletConnect stack gets bundled.
  - AppKit's native peers (`@react-native-async-storage/async-storage`,
    `@react-native-community/netinfo`, `react-native-get-random-values`, `react-native-svg`,
    `expo-application`) are declared directly, at the versions `expo install` maps for SDK 57
    (D-015: Bun doesn't install peers here).
  - Monad testnet is passed to AppKit as our own viem chain from `@stridemon/chain`, with
    its RPC URL taken from `EXPO_PUBLIC_MONAD_RPC_URL`.
  - The API verifies SIWE signatures with viem's `verifySiweMessage`, which needs a public
    client. Its `eth_call` makes smart-contract wallets (ERC-1271/6492) work as well as EOAs.
    So the `publicClient` half of `plugins/chain-clients.ts` arrives in Phase 2, and the
    game-server wallet client stays in Phase 3. API tests run that call against a local
    **Anvil** started by the test helper, so they don't depend on the testnet RPC.
- **Why (checked 2026-09-29 against npm, docs.reown.com and Reown's GitHub):**
  - AppKit 2.0.6 (released 2026-07-14) declares `react-native >=0.72` and `react >=18`, so
    RN 0.86 and React 19.2 are inside its ranges. It is plain JS on top of standard native
    modules, and every one of those modules has an Expo SDK 57 mapping.
  - Reown's own Expo example (`reown-com/react-native-examples` → `appkit-expo-wagmi`,
    updated 2026-09-15) runs AppKit 2.0.5 on **Expo SDK 55 / RN 0.83 / React 19.2**. Nothing
    Reown publishes has been tested on SDK 57 yet, and there's no open issue against 56 or 57.
  - Reown's install guide asks for `babel-preset-expo` with `unstable_transformImportMeta`,
    because `valtio` reads `import.meta`. On SDK 57 that option is renamed
    `transformImportMeta` and **defaults to on**, so no `babel.config.js` is needed. This
    was issue #506, a build failure on RN 0.82.
  - `createAppKit` requires a `storage` implementation in v2. We back it with AsyncStorage,
    the store WalletConnect already uses. Refresh tokens still go in `expo-secure-store`.
  - Chain 10143 isn't in Reown's hosted-RPC list, so the wagmi adapter falls back to the
    chain's own `rpcUrls.default`. The adapter builds its own transports and ignores any we
    pass, so the RPC URL has to be set on the chain object.
- **Trade-off:** we run two Expo SDKs ahead of anything Reown has tested. If the modal or
  the relay breaks on the device, the fallback is `@walletconnect/universal-provider`
  directly with our own connect screen. Wallet deep linking and session storage would then
  be ours to maintain.
- **Revisit when:** Reown publishes an SDK 57 example or an AppKit release that supports
  wagmi 3, or the device test in Phase 2 fails.

## D-019 — The outbox signs before it broadcasts; outbox tests deploy from Foundry artifacts

Checked at Phase 3 start (2026-09-29). Refines D-012.

- **Decision:**
  1. **Sign, save, then broadcast.** For each queued transaction, the sender signs it locally,
     saves `submitted` with the hash, nonce and **signed transaction** in one Mongo write, and
     only then broadcasts. Recovery never builds a second transaction while the first could still
     land. If the chain has no receipt yet, the sender re-broadcasts the saved bytes. If the
     nonce was used by some other transaction (for example a manual `cast send` with the same
     key), the saved transaction can never be mined, so the record goes back to `queued` and
     is signed again.
  2. **The lease belongs to the job, not to each record.** `plugins/background-jobs.ts` takes a
     lease per job name in a `jobLeases` collection before each run, and renews it between
     transactions. Only the leaseholder sends, so two API processes can never race on one
     nonce. `chainTransactions.lease` is dropped, because a per-record lease can't stop two
     processes from each sending a different record with the same nonce.
     The holder is `<hostname>:<apiPort>`, not a random id. A process killed without a clean
     shutdown (a crash, or `bun --watch` reloading) never releases its lease. Measured on
     2026-09-29, a random id made the restarted API wait out the whole 60 s lease before it
     sent anything. The lease keeps nonces in order but isn't what prevents double-sends: the
     `queued → submitted` save is conditional, so only one signer of a record can ever
     broadcast it.
  3. **Outbox tests deploy the contracts to the test Anvil with viem, from Foundry's
     `packages/contracts/out/` artifacts** (`test-support/deploy-test-contracts.ts`). They
     don't use `forge script`. The test Anvil runs with chain id 10143, and a broadcast of
     `DeployGame.s.sol` there would overwrite `deployments/10143.json` and the live
     `broadcast/…/10143/` log. `buildServer` takes an optional `contractAddresses` override
     for these tests; normal runs take the addresses from `@stridemon/chain`.
- **Why:** with "broadcast, then save the hash", a crash between the two steps leaves a
  `queued` record whose transaction may already be mined. Sending it again could double-send
  a gas drip or a settlement. The contract guards the mint and the settlement, but not the gas
  drip. Saving the signed bytes first closes that gap.
- **Trade-off:** the test helper repeats `DeployGame.s.sol`'s role wiring (five `grantRole`
  calls). The game config comes from `game-rule-fixtures.json`, which `DeployGame.t.sol`
  already pins the real deploy to. If the wiring drifts, the outbox tests fail with a revert,
  not silently. API tests need `bun run contracts:build` to have produced `out/`.
- **Revisit when:** there's more than one game-server key, or a fee spike leaves saved
  transactions under-priced for long (re-signing at the same nonce with a higher fee would then
  be needed).

## D-020 — Location tracking stack on Expo SDK 57: expo-sqlite, foreground permission only

Checked at Phase 4 start (2026-09-29), against npm, the SDK 57 docs and the installed native
sources. Supersedes the `react-native-mmkv` row in `architecture/mobile-app.md` and the
"foreground, then background" permission step in the Phase 4 spec.

- **Decision:**
  1. **`expo-location` `~57.0.20` and `expo-task-manager` `~57.0.21`**, both at the version
     `expo install` maps for SDK 57. Their peers are `expo`, `react` and `react-native`, which the
     app already declares. `expo-task-manager` brings **`unimodules-app-loader` 57.0.2**, a native
     package (Android `HeadlessAppLoader`), so it gets compiled in. That's expected, not a stray peer.
  2. **The sample buffer is `expo-sqlite` `~57.0.3`, not `react-native-mmkv`.** Its peers are
     already declared, and its one dependency is `await-lock` (plain JS). Its config plugin only
     writes build flags when it gets options, so it isn't listed in `app.config.ts`.
  3. **Foreground ("while using the app") location permission only.** There's one explainer
     screen before the one OS prompt. The app never asks for "Always" / "Allow all the time".
     `app.config.ts` sets `isIosBackgroundLocationEnabled: true` (`UIBackgroundModes: location`),
     `isAndroidForegroundServiceEnabled: true` (`FOREGROUND_SERVICE` +
     `FOREGROUND_SERVICE_LOCATION`), `isAndroidBackgroundLocationEnabled: false`, and removes the
     unused `NSLocationAlways…` strings.
  4. **The location task is defined from a custom entry file** (`apps/mobile/index.ts`, which then
     imports `expo-router/entry`), and the entry also registers the API client's access-token
     source. Routes are loaded lazily, so a task defined in a route file wouldn't exist when the
     task runs headless.
  5. **The location task uploads samples too** (throttled, single-flight), not only the run screen.
     So a walk with the phone locked keeps the server's session fresh for the 30-minute abandon job.
- **Why:**
  - `react-native-mmkv` has no SDK 57 mapping. Version 4 is a Nitro module with the peer
    `react-native-nitro-modules: "*"`, which would be a second native C++ package. 4.3.2 was generated
    and tested against nitro **0.35.9**, while npm's latest nitro is **0.37.1** (with core
    template changes in 0.37.0). Nitro 0.35.9 predates RN 0.86, so neither pairing has been shown
    to work on RN 0.86. An unpinned nitro version is what crashed Android at startup in mmkv issue #980.
    MMKV's advantage is synchronous speed, and the buffer writes one sample every few seconds.
    `expo-sqlite` is first-party, and append / read-unsent / mark-sent maps onto one indexed table.
  - Both platforms start location updates with foreground permission alone (read in the SDK 57
    source). Android's `startLocationUpdatesAsync` skips its background-permission check when
    `foregroundService` is set. iOS only calls `ensureForegroundLocationPermissions`, and with
    `UIBackgroundModes: location` it keeps delivering in the background, showing the blue
    indicator. Asking for background access would add a second prompt, extra copy and a Google
    Play background-location declaration, and tracking works without it.
  - On Android, the location service outlives a swipe-away (`killServiceOnDestroy` defaults to
    false), and `TaskService` then starts the app's `reactHost` headless. Under the New
    Architecture that's the same single React host the UI uses, so there's only ever one JS
    runtime. Refresh-token rotation stays single-flight. `TaskService` also registers a
    `HeadlessJsTaskContext`, so JS timers and promises keep running in the background.
  - `expo-location`'s `mocked` flag is **Android-only** (`Location.isFromMockProvider`). On iOS it's
    absent, and the app sends `isMockedLocation: false`.
  - `expo-task-manager`'s config plugin is applied automatically and **always** adds `fetch` to
    iOS `UIBackgroundModes` (read in `plugin/build/withTaskManager.js`). We don't use background
    fetch. It's harmless, but App Review may ask about it, so it's noted here. Checked with
    `bunx expo config --type introspect`: Android gets `FOREGROUND_SERVICE` and
    `FOREGROUND_SERVICE_LOCATION`, with no `ACCESS_BACKGROUND_LOCATION`, and iOS gets only the
    when-in-use string.
- **Trade-off:** there's no mock-location signal on iOS until Phase 10's device attestation.
  Without "Always", tracking can't be *started* from the background, only continued, which is
  all a run needs. On iOS the refresh token uses secure-store's default `WHEN_UNLOCKED` keychain
  class, so a locked phone can't refresh an expired access token. Its uploads wait until the phone
  is unlocked, and the samples stay safe in SQLite in the meantime.
- **Revisit when:** the iOS device pass (D-022) shows uploads stalling long enough to hit the
  abandon job (then move the refresh token to `AFTER_FIRST_UNLOCK`), or a feature needs to start
  tracking from the background (geofenced auto-start).

## D-021 — Activity validation rules, made precise for Phase 4

`architecture/security.md` sets the rules. This entry records the choices Phase 4 had to make
where the rules were loose, and the test case that contradicted them.

- **Decision:**
  1. **A minute is a whole 60 s window from the first valid sample.** Segments that cross a
     minute boundary are split across the minutes in proportion to time. A trailing partial
     minute never counts.
  2. **Average-speed rule, as written.** A minute counts when its average speed (distance ÷ time
     over its non-teleport segments) is 1–20 km/h and no sampling gap longer than 60 s touches
     it. So 30 s of standing inside a walking minute (average about 2.5 km/h) **still counts**, and
     `testing.md`'s case becomes "a full minute standing still doesn't count". A player who stops
     at a crossing doesn't lose the minute.
  3. **Clock tolerance of 60 s on the session window.** A sample counts if it's within
     `[startedAt − 60 s, finishedAt + 60 s]` and at most `startedAt + 4 h + 60 s`: the same 60 s
     the "future of `receivedAt`" rule already allows. `startedAt` and `finishedAt` are server
     time, and `recordedAt` is the phone's.
  4. **A sample without an accuracy is dropped**, the same as one worse than 50 m.
  5. **A rejected run is a result, not an error.** `POST …/finish` answers 200 with
     `status: 'rejected'` and a `rejectionReason` (`MOCK_LOCATION_DETECTED` or
     `INSUFFICIENT_ACTIVITY_DATA`, both `ApiErrorCode`s). Finish is idempotent: calling it again on
     a finished session returns the session as it is. A crash mid-validation leaves `validating`,
     and the next finish call validates again. Only `abandoned` answers `ACTIVITY_SESSION_NOT_ACTIVE`.
  6. `calculateHaversineDistanceMeters` lives in `packages/shared/src/geo/`, because the live run
     screen needs it too. `estimateLiveReward` takes `gameConfig`, like the other reward functions.
- **Why:** each point is either unspecified in `security.md` or would otherwise punish honest
  players for a phone clock a few seconds off, or for a finish response lost on a bad connection.
- **Trade-off:** GPS jitter while standing still can look like slow movement. The device-side
  `distanceInterval` (5 m) is the first defence. If a real walk shows inflated distance, a
  server-side anchor filter comes next, with the doc updated first.
- **Revisit when:** a device walk measures more than 10% off a known route.

## D-022 — iOS device testing is deferred to one day at the end of the MVP

- **Decision:** Phases 4–7 are verified on the Android phone only. iOS gets a single device day
  (an iPhone borrowed from a mentor) at the end of the MVP, in Phase 8. That day re-runs each
  phase's device checks, including Phase 4's locked-phone walk.
- **Why:** there's no iPhone or paid Apple Developer account available now. An EAS iOS
  development build needs both (internal distribution registers the device's UDID).
- **Trade-off:** iOS-only problems (the location indicator, background delivery, keychain
  access while locked, D-020) surface late, all at once. The code keeps iOS options set
  (`UIBackgroundModes`, `showsBackgroundLocationIndicator`, `activityType`) so that day is a
  test, not a port.
- **Revisit when:** an iPhone is available earlier.

## D-023 — The app declares `RECEIVE_BOOT_COMPLETED` for expo-task-manager (Android)

Found on the Android phone at the first Phase 4 run (2026-09-30). Adds to D-020.

- **Decision:** `app.config.ts` lists `android.permission.RECEIVE_BOOT_COMPLETED` in
  `android.permissions`. It's a normal permission: granted at install, with no prompt.
- **Why:** the app crashed at the first GPS fix after START with
  `IllegalArgumentException: requested job be persisted without holding RECEIVE_BOOT_COMPLETED
  permission`. Read in the installed source (`expo-task-manager` 57.0.21,
  `TaskManagerUtils.createJobInfo`), every task event is scheduled as a JobScheduler job with
  `.setPersisted(true)`, and Android refuses persisted jobs without that permission. Neither
  `expo-task-manager` nor `expo-location` declares it. The surrounding `try` catches
  `IllegalStateException`, but Android throws `IllegalArgumentException`, so the process dies.
  `startLocationUpdatesAsync` itself succeeds, so the crash looks unrelated to START. This is the
  open upstream bug expo/expo#48935, reported against SDK 56. It also affects 57.
- **Trade-off:** one more line in the manifest that the app doesn't otherwise need. The app never
  starts tracking at boot: the permission only lets expo-task-manager's persisted jobs be scheduled.
- **Revisit when:** expo/expo#48935 is fixed in an SDK 57 patch (the library then declares the
  permission itself), and the line can go.

## D-024 — The location task drops stale fixes (Android's cached last location)

Found on the Android phone in Phase 4 (2026-09-30), by replaying two real runs through the
validator.

- **Decision:** the location task drops a fix whose timestamp is more than **60 s** older than the
  moment it's delivered (both from the phone's clock), before it reaches the buffer. The server's
  validation rules don't change.
- **Why:** in both runs, the first fix arrived timestamped 550–660 s *before* START: Android hands
  out its cached last-known location first, and the next fix came ~10 minutes of timestamps later.
  The server dropped the oldest one (outside the session window) and reported a misleading
  `deviceClockMismatch`. When a cached fix falls within the 60 s clock tolerance (one did, at −57 s),
  it's kept and sets where the minute windows start, so a stretch of standing still before START
  fills up the first minute. Comparing a fix with the phone's own clock at delivery is immune to
  the phone's clock differing from the server's.
- **Trade-off:** a fix delivered more than a minute late would be lost. The foreground service
  delivers fixes within seconds (no deferred updates are configured), so this never happens in a run.
- **Revisit when:** deferred or batched updates are turned on to save battery. A batch can
  legitimately be older than 60 s.

## D-025 — Phase 4 closes with its outdoor device checks moved to Phase 8

- **Decision:** Phase 4 is done. Three of its Definition-of-done checks move to Phase 8, where
  the hosted API and a bundled-JS build exist:
  - the 10-minute locked-phone walk on a 400 m track (distance within ~10%)
  - the car ride that validates to 0 active minutes
  - kill-and-reopen losing no samples
- **Why:** in development the app gets its JS from Metro on the laptop and talks to the API on the
  laptop, both over the home Wi-Fi. A 400 m track or a car ride is out of Wi-Fi range. What *was*
  verified on the Android phone (2026-09-30): START, the location permission, live stats, samples
  uploaded, STOP, and server validation of real runs (1 active minute, 103 m, 6.2 km/h on one; a
  correctly-0 slow run on another). Replaying those runs found D-023 and D-024, both fixed. The
  validation rules themselves are covered by the synthetic-trace suite, including a 1 km route
  within 1% and a 50 km/h drive giving 0 minutes.
- **Trade-off:** real-world distance accuracy and the car case are unproven until Phase 8. If they
  fail there, the rules in `security.md` get tuned then, with a decision entry. That's later
  than planned, but Phase 5's settlement only consumes `activeMinutes` and `distanceMeters`.
- **Revisit when:** the API is hosted (Phase 8), or a walk can be done in Wi-Fi range. The app
  buffers samples offline and uploads them later, but START and STOP need the API.

## D-026 — Settlement details, kept small for the hackathon

Made at Phase 5 start (2026-09-30).

- **Decision:**
  1. The `settleSession` outbox payload uses the TypeScript vocabulary:
     `{ activitySessionId, onChainSessionId, sneakerTokenId, walletAddress, activeMinutes, distanceMeters }`.
     `activitySessionId` lets the job find the session by `_id` when the receipt arrives.
  2. Finish marks the session `settling`, then enqueues the settlement. A finish call that finds
     the session already `settling` enqueues again, which the idempotency key makes a no-op, so
     a crash between the two writes is recovered the same way D-021 recovers `validating`.
  3. `activitySessions.settlement` is written once, when the session becomes `settled`. Its
     `chainTransactionId` and `transactionHash` are `null` only for a 0-minute run, which is
     settled at finish without a transaction.
  4. Only `NotSneakerOwner` maps to a session rejection. Any other revert leaves the outbox record
     `failed` (with the reason) and the session `settling`, for a human to look at.
     (A paused game is the exception: D-032 keeps the record queued until `unpause`.)
- **Why:** it's a hackathon build. The happy path and the cases the phase names are covered, and
  nothing more.
- **Trade-off:** a settlement that fails for another reason (the contract paused, a config change)
  leaves the app on "Settling on Monad…" until someone fixes it by hand.
- **Revisit when:** Phase 8 hardening, or a settlement actually fails that way.

## D-027 — Sneaker transfer reuses the Phase 6 flow; Home follows a selected Sneaker

Made at Phase 7 start (2026-10-03).

- **Decision:**
  1. `useSneakerGameTransaction` also sends `SneakerNft.safeTransferFrom(player, recipient, tokenId)`.
     Its call type gains a `transfer` variant. The gas check, wallet step, receipt wait, chain
     re-read and error copy are shared with repair and upgrade. `SneakerTransactionSheet` gets a
     transfer confirmation (no SOLE cost, "You will no longer own this Sneaker") next to the
     existing spend confirmation.
  2. The Sneaker the player picked is kept in a small zustand store, so Home (START) and the
     Sneaker tab (repair, upgrade, transfer) act on the same one. When the picked Sneaker is no
     longer in the wallet, the first owned one is used.
  3. A wallet with zero Sneakers shows the starter onboarding only while
     `SneakerGame.hasClaimedStarterSneaker` is false. Once it's true, Home shows an empty state
     ("No Sneakers in this wallet"), since the starter is never minted twice.
- **Why:** one transaction flow for every player action, as `mobile-app.md` asks. The selection is
  UI state that two screens share, which is what zustand is for here. Reading the claim flag from
  the chain keeps the chain the source of truth, with no new API field.
- **Trade-off:** the selection isn't persisted, so a relaunch starts on the first Sneaker. The
  hook's name still says `SneakerGame` although transfer goes to `SneakerNft`.
- **Revisit when:** a wallet commonly holds many Sneakers (Phase 9 marketplace), where the picker
  and the selection may need persisting.

## D-028 — Phase 8 runs in seven parts with deployment last; the API is hosted like meAsAgent

Made at Phase 8 start (2026-10-03).

- **Decision:**
  1. Phase 8 is split into parts 8.1 to 8.7 (`phases/phase-08-demo-hardening.md`). All product
     work (design, the Sneaker NFT image, states, demo tooling) is finished on the development
     build first. Deployment and the outdoor checks (D-025) come after it, then the iOS day.
  2. The API is hosted the way `meAsAgent` hosts its API: Bun under PM2 on an EC2 instance Yash
     already runs, one process, secrets in `apps/api/.env` on the instance.
  3. The database is the MongoDB Atlas cluster `meAsAgent` already uses, with StrideMon in its own
     `stridemon` database and its own database user.
- **Why:** both are already paid for and working, so hosting costs nothing new. Deploying once,
  on the finished app, means the demo build and the outdoor checks run against what will
  actually be demoed.
- **Trade-off:** the two projects share the free cluster's storage (512 MB) and the instance's
  resources. The `locationSamples` TTL (8.4) keeps StrideMon's share small. Nothing is tested on
  the hosted stack until 8.6, so hosting surprises surface late.
- **Revisit when:** either project outgrows the shared cluster or instance.

## D-029 — Pill buttons show an arrow, not Lusion's dot

Made during Phase 8.2 (2026-10-03), after the phone check.

- **Decision:** the three `Button` variants show an always-visible line arrow where Lusion has a
  dot: trailing on `primary` and `secondary`, leading on `callToAction`. The press animations stay
  (label roll, colour change, the call-to-action flood), with the arrow nudging right instead of
  the dot shrinking. The tab bar gets line icons from the same `Icon` set.
- **Why:** on the phone, the dots read as "the icons didn't load", and Yash chose a visible arrow.
  An arrow also says "this goes somewhere" on a small screen, where there is no hover to reveal it.
- **Trade-off:** a step away from the Lusion look (design-system §1 point 5). Secondary actions
  such as "Not now" also get an arrow.
- **Revisit when:** a design review wants the exact Lusion pills back. Only `Button.tsx` changes.


## D-030 — The Sneaker's picture is an on-chain SVG drawn by a swappable `SneakerArtRenderer`

Made at Phase 8.3 start (2026-10-03).

- **Decision:**
  1. A new contract, `SneakerArtRenderer`, draws the Sneaker as an SVG from its id, level and
     durability (`renderImageSvg`). `SneakerNft` holds the renderer's address and calls it. The
     admin can point it at a new renderer (`setArtRenderer`) without touching any Sneaker.
  2. `tokenURI` gains `image` (`data:image/svg+xml;base64,…`). `SneakerNft.imageSvg(tokenId)`
     returns the raw SVG, which the app reads with one wagmi call and draws with `SvgXml` from
     `react-native-svg`. The art exists only in the renderer, and the app, MonadVision and
     MetaMask all show the same picture.
  3. `SneakerNft` emits ERC-4906 `MetadataUpdate(tokenId)` when stats change and
     `BatchMetadataUpdate` when the renderer changes, so explorers and wallets know to refresh
     the picture.
  4. The art draws level on a 30-tick scale and durability on a 100-point bar: the launch
     `maxLevel` and `maxDurability` from `game-rules.md`, as named constants in the renderer.
     `SneakerNft` holds no game logic, so it can't read `GameConfig`.
  5. Text in the SVG uses a generic monospace stack, since wallets can't load app fonts. The app
     passes IBM Plex Mono into `SvgXml` instead.
- **Why:** `SneakerNft` holds players' property and should never need redeploying
  (`smart-contracts.md`). This part does redeploy it, once, because the deployed `tokenURI` has
  no `image`. Splitting the art out means any later change to the picture is one small deploy
  and one `setArtRenderer` call, with no database reset and no new starter Sneakers.
- **Trade-off:** one more contract to deploy and verify. A `maxLevel` or `maxDurability` change
  needs a new renderer too, or the ticks and bar stop at full.
- **Revisit when:** the game config's caps change, or the art moves to a richer format.

## D-031 — Pressed buttons step one shade; no blue flood

Made after the Phase 8.3 phone check (2026-10-03).

- **Decision:** a pressed pill no longer turns electric blue. `primary` steps from `#2B2E3A` to
  black, `callToAction` from white to `surfaceMuted`, and `secondary` keeps its step to white. The
  label roll and the arrow nudge stay. Every press animation runs on the native driver (an
  opacity fill over the pill, transforms for the label and arrow). The unused dark
  `IconCircleButton` variant, the last thing that pressed to blue, is removed with the
  `primaryPressed` token.
- **Why:** on the phone a blue background sometimes stayed for seconds after a tap. The colour
  animations ran on the JS thread, so they froze while it was busy opening the wallet or
  changing screens. A one-shade step is calmer and can't stall.
- **Trade-off:** another step away from Lusion (§7 interactions 2 and 3, after D-029).
- **Revisit when:** a design review wants the flood back. It would need the native driver too.

## D-032 — A paused game is maintenance, not a failure

Made at Phase 8.4 start (2026-10-04).

- **Decision:**
  1. The outbox treats a simulated `EnforcedPause()` revert as a transient failure: the record
     stays `queued` with `lastError`, and the next run tries again. A run that ends while
     `SneakerGame` is paused (or a starter mint) therefore settles by itself after `unpause`.
     Every other revert still follows D-026.
  2. The app reads `SneakerGame.paused()` and shows one quiet maintenance notice on Home and the
     Sneaker tab. START, repair and upgrade are disabled while it shows. The summary's
     "Settling…" and the minting screen say the run or mint is saved and goes through once the
     game is back.
  3. Offline is detected with `@react-native-community/netinfo` (already installed as an AppKit
     peer, D-018) wired to React Query's `onlineManager`, on `isConnected` only: a LAN API has no
     internet, so `isInternetReachable` would read as offline. Requests wait while offline and
     run on reconnect, and a thin strip says so.
- **Why:** pausing is the emergency switch, so it must not leave the app on "Settling…" for good
  (D-026's trade-off) or show raw revert text during a demo.
- **Trade-off:** while paused, the outbox holds its whole queue, gas drips included, because it
  sends one nonce at a time. The API doesn't refuse a new run while paused; the app does.
- **Revisit when:** the outbox needs to send around a stuck record.

## D-033 — Demo tooling runs as Foundry scripts from the deployer key

Made at Phase 8.5 start (2026-10-04).

- **Decision:**
  1. `scripts/prepare-demo-wallets` and `scripts/demo-energy-config` are thin shell wrappers
     around two Foundry scripts (`PrepareDemoWallets.s.sol`, `DemoEnergyConfig.s.sol`). They
     sign with the **deployer** key from `packages/contracts/.env`, never the game-server key,
     so they can't take a nonce the API's outbox expects (D-019). They always target
     `monad_testnet`, and `--dry-run` simulates without sending.
  2. Wallet A's SOLE comes from real runs. If A is still short of its upgrade (plus 10 SOLE for a
     repair) on demo day, the deployer grants itself `MINTER_ROLE` on `SoleToken`, mints the
     difference to A and revokes the role, all in one run. The script also tops either wallet up
     to 1 MON if it drops below 0.5 MON. It only reports wallet B: emptying B needs B's key.
  3. The demo energy config sets `energyRegenerationSeconds` to 60 s (empty to full in 10
     minutes) and leaves every other field alone. Reverting restores the launch value from
     `DeployGame.buildInitialGameConfig()`. The app already reads the config from the chain.
- **Why:** the deployer already holds every admin role, so this needs no contract change and no
  redeploy. Foundry keeps the `uint256` maths and the `GameConfig` struct in Solidity, and
  `forge test` covers the scripts with the rest of the contracts.
- **Trade-off:** a top-up mint is SOLE no run earned, so testnet's supply no longer equals the
  settled rewards minus burns. Because energy is computed lazily, a Sneaker that looks full under
  the demo config can show less after the revert, until it regenerates again.
- **Revisit when:** mainnet (Phase 10): the admin key moves to a multisig and demo tooling stays
  on testnet.

## D-034 — The hosted API is `stridemon-api.yashmittal.xyz`, behind the instance's nginx

Made at Phase 8.6 start (2026-10-05). Adds the details D-028 left open.

- **Decision:**
  1. The API lives at `https://stridemon-api.yashmittal.xyz`, a subdomain of the domain that already
     serves `meAsAgent`, pointed at the same EC2 instance.
  2. The instance's existing nginx terminates HTTPS with a free Let's Encrypt certificate
     (certbot) and proxies to the API on `127.0.0.1:3020`. In production the API listens on
     loopback only, like `meAsAgent`'s API on 3010; in development it keeps `0.0.0.0` for the
     phone on the LAN.
  3. Fastify trusts `X-Forwarded-For` from loopback only (`trustProxy: 'loopback'`), so the rate
     limit sees each player's IP instead of nginx's.
  4. PM2 runs it as `stridemon-api` from `apps/api/ecosystem.config.cjs`. The demo build is the
     `demo` profile in `eas.json`, with its `EXPO_PUBLIC_*` values on the profile.
  5. StrideMon runs on its own Bun binary, `~/.bun-1.4.2/bin/bun` (the version `bun.lock` and
     EAS are pinned to), unpacked from the release zip. The instance's shared `~/.bun` stays on
     the version the other projects use (1.3.14 on 2026-10-05), so upgrading StrideMon's Bun never
     changes theirs.
  6. DNS for `yashmittal.xyz` is on Vercel, which has a wildcard record. An explicit `A` record for
     `stridemon-api` points that one name at the instance (`100.55.119.114`).
  7. The step-by-step setup is [`deployment.md`](deployment.md).
- **Why:** a subdomain keeps the API's routes unprefixed and gives it its own nginx server block
  and certificate, so nothing about `meAsAgent`'s setup changes. Port 3020 is free on the instance.
- **Trade-off:** StrideMon's uptime now depends on an instance shared with five other projects.
  The `demo` build uses the same Android package as the development build, so installing it
  replaces the development build on the phone until that is reinstalled from its EAS link.
- **Revisit when:** StrideMon gets its own domain (`stridemon.com`) or its own instance.

## D-035 — A landing page in `website/` (Phase 8.8); the iOS day moves after it

Made 2026-10-05, after Phase 8.6.

- **Decision:**
  1. Phase 8 gains part **8.8, a landing page**, built now. **8.7 (the iOS day, D-022) is deferred**
     until a borrowed iPhone and a paid Apple Developer account are available, so Phase 8's iOS
     items in its definition of done wait with it.
  2. The page lives in **`website/`** at the repo root: Next.js 16 + React 19 + Tailwind v4 +
     Biome on Bun, statically generated. It is **not a Bun workspace**: it has its own
     `package.json` and `bun.lock`, so Next's packages never enter the hoisted `node_modules` the
     mobile app (React 19.2.3 pinned by Expo SDK 57) resolves from. Root `bun run lint` still
     checks it.
  3. It's hosted on **Vercel's free plan** at **`https://stridemon.yashmittal.xyz`**. The existing
     `*.yashmittal.xyz` wildcard already points at Vercel, so no DNS change is needed.
     `stridemon.com` is unregistered (2026-10-05); buying it later changes one constant.
  4. It follows `architecture/design-system.md` (the app's Lusion look): the same color tokens,
     Satoshi through Fontshare's hosted CSS (its licence allows that, not self-hosting the files;
     the page inlines that CSS at build time and the files stay on Fontshare's CDN),
     IBM Plex Mono from Google Fonts, and the same easing curves. The hero is the real on-chain
     Sneaker art (`website/public/sneaker-art/`, exported from `SneakerNft.imageSvg`).
  5. The brief for building it is [`landing-page-prompt.md`](landing-page-prompt.md). Yash's
     screenshots go in `website/public/screenshots/` under the names listed there.
- **Why:** judges and the Monad community need a link that explains StrideMon without installing
  anything. A separate install keeps the app's dependency tree, which took several pins to
  stabilise (D-015, D-018), untouched.
- **Trade-off:** two lockfiles and two installs. The page copies its few facts (contract addresses,
  game numbers) instead of importing `@stridemon/chain` and `@stridemon/shared`, so a redeploy or
  a rule change must update `website/src/content/` too.
- **Revisit when:** StrideMon gets `stridemon.com`, or the page needs live chain data.

## D-036 — StrideMon's X presence is run from `social/`, by hand

Planned 2026-10-05, set up 2026-10-06. The research and the full plan are in
[`social-plan.md`](social-plan.md).

- **Decision:**
  1. Two accounts. **@stridemon** posts the product (proof, deep dives), and Yash's
     **@yash_mittal_dev** posts the build stories and the weekly changelog, and quote-posts the
     launch. They never post the same text.
  2. `social/` at the repo root holds both accounts' posts and rules: Markdown only, no tooling,
     **not a Bun workspace**. One file per post (`posts/<slot date>-<slug>.md`), with its account
     and state in the front-matter (`idea → draft → approved → scheduled → posted`).
     `voice.md` holds the voice, banned phrases and disclaimers, and `profile.md` the bio and
     images.
  3. **Posting is manual.** Yash pastes each approved post into x.com, and may use X's own
     scheduler for single posts on his Premium account. Claude drafts and never posts, schedules,
     logs in or connects a tool. A post goes live only with Yash's name in its `approved:` field.
  4. **No X API.** It has had no free tier since February 2026 ($0.015 a post, $0.20 with a URL).
  5. Media reuses `website/public/`, `website/media-source/` and `launch-video/out/`. X-only
     outputs (cards, stills, cuts) go in the gitignored `social/media/`, each rebuilt from the
     command in its post file.
  6. Every number in a post cites `launch-video/FACTS.md` or a doc. Every post showing STRIDE
     says "Monad testnet. STRIDE has no monetary value." No hashtags, and at most one tag a post.
     Site links carry `?source=x-stridemon` or `?source=x-yash`, which the waitlist stores (D-037).
- **Why:** the facts, footage and voice already live in this repo, so posts written next to them
  stay true. Manual posting is free, follows X's automation rules with nothing to label, and puts
  Yash there to answer the first replies, which the ranking rewards.
- **Trade-off:** someone has to be online at posting time, and threads can't be scheduled.
  @stridemon's numbers are copied by hand from the X app, because only Premium has the dashboard.
  Footage and transactions from before D-038's redeploy say SOLE, so posts prefer new material.
- **Revisit when:** posting needs to happen while Yash is away, or @stridemon gets Premium.

## D-037 — A waitlist on the landing page, stored by the StrideMon API

Made 2026-10-06, after Phase 8.8's first build.

- **Decision:**
  1. The landing page gets **one form: a waitlist** (section `#waitlist`, before the FAQ). It
     replaces the "no newsletter form" rule in `landing-page-prompt.md` §9 for this form only:
     there's still no newsletter, cookie or analytics.
  2. It asks for an **email only**, plus an optional phone platform (Android or iPhone). Never a
     wallet address: a list of wallets reads as an airdrop list and invites testnet farmers. The
     app gets the wallet when someone actually plays. It's called a *waitlist*, never a
     *whitelist*, because a whitelist promises a spot in a sale and StrideMon sells nothing.
  3. The site posts to the hosted API, **`POST /v1/waitlist`**, which stores the email in the
     `waitlistSignups` collection of our own Atlas `stridemon` database (unique by email, no IP
     address or user agent). A repeat email answers the same as a new one, so the form never
     reveals who signed up.
  4. The API now accepts **browser requests**, through `@fastify/cors`, but only on
     `/v1/waitlist` and only from the origins in `WAITLIST_ALLOWED_ORIGINS`
     (`https://stridemon.yashmittal.xyz`, plus `http://localhost:3000` in development).
  5. Abuse: 5 requests a minute per IP on that route, and a hidden honeypot field that answers
     `200` and stores nothing. No CAPTCHA.
  6. The page's `?source=` (for example `x-stridemon`, `x-yash`) is stored with the email, so we
     can see which X account brings sign-ups without adding analytics.
- **Why:** the static site has no server. The API is free, already hosted, and keeps the data in
  our database; a Google Form would leave the page's look, hand the emails to Google and lose
  `source`.
- **Trade-off:** the site now depends on the API being up for one feature, and the API gains a
  public, unauthenticated write route. A sign-up is one small upsert, rate-limited, so the cost
  of abuse is a few junk rows.
- **Revisit when:** StrideMon opens to the public and the one promised email goes out, or junk
  sign-ups appear (Cloudflare Turnstile is a free next step).

## D-038 — The reward token is renamed SOLE → STRIDE

Made 2026-10-06, during Phase 8.8. Supersedes the token half of D-014.

- **Decision:**
  1. The ERC-20 is **STRIDE**: name `Stride`, symbol `STRIDE`, 18 decimals, contract
     `StrideToken`. It's written in capitals in UI copy and docs, like SOLE was.
  2. The rename covers everything we write from now on: the contract, scripts and tests,
     `@stridemon/chain` (`strideTokenAbi`, `STRIDE_TOKEN_SYMBOL`, the `strideToken` address key),
     the app's copy and `formatStrideAmount`, the API's test deploy, the docs and the landing
     page. Amounts in code keep the generic word "reward" (`rewardAmountWei`), as D-014 planned.
  3. Earlier decisions keep the word SOLE: the log doesn't rewrite history. Raw recordings and
     notes that describe them (`launch-video/FOOTAGE.md`) also keep it, because that's what the
     footage shows.
  4. ERC-20 names are fixed at deploy time, so the live testnet token says SOLE until the
     contracts are redeployed with `DeployGame.s.sol`. That's a full redeploy (as in 8.3), not
     a new token alone: `SneakerGame` holds the token as `immutable`, plus the settled-session
     and starter-claim records, so a new game next to the old `SneakerNft` would let every
     player claim a second starter. The redeploy resets testnet balances and Sneakers, and the
     database is reset with it. Done 2026-10-06: the new contracts are in
     `packages/contracts/README.md`. The reset keeps `waitlistSignups`.
- **Why:** STRIDE says the core action and matches the product name, so "+10 STRIDE" needs no
  explanation. Testnet data is disposable, so now is the cheap time to rename.
- **Trade-off:** D-014 ruled `STRIDE` out because the Stride chain (STRD) uses the name, so a
  search for the ticker finds them first. Until the redeploy, MetaMask and the explorer show SOLE
  while the app says STRIDE. The screenshots and the demo video on the landing page show SOLE
  until they're recaptured.
- **Revisit when:** before any mainnet launch, when the trademark check D-014 asks for covers
  the token name too.

## D-039 — Store readiness: the code half of the Play Store guide

Made 2026-10-07, after the Metropolis submission work, from `play-store-release.md` Part B.

- **Decision:** the code and config Play needs are built now; the account, listing and closed
  test (Parts A, C, D of the guide) wait until Yash decides to ship.
  1. **Privacy policy** at `/privacy` and **account deletion** at `/delete-account` on the
     landing page, both linked from the footer and from the app's Profile tab. The public
     contact is `supportEmail` in `website/src/content/site.ts`.
  2. **`DELETE /v1/me`** (🔒, 204) deletes the player's off-chain data: the `users` record, their
     `authSessions`, `activitySessions` and those sessions' `locationSamples`. It keeps
     `chainTransactions`: they record public on-chain transactions, and their per-wallet keys are
     what stop a deleted-and-returning wallet from getting a second starter Sneaker or gas drip.
     Nothing on-chain changes: Sneakers and STRIDE stay in the wallet.
  3. The app's Profile tab gets **Delete account** behind a confirmation sheet, then signs out.
  4. `eas.json` gets a **`production`** build profile (an `.aab`, `autoIncrement`) and a submit
     profile for the internal track. `google-play-service-account.json` is gitignored.
  5. The **testnet line** ("Monad testnet. STRIDE has no monetary value.") sits under the STRIDE
     balance on Home and under the reward on the run summary.
  6. The app has its **own icon and splash**: the website's line-Sneaker mark, drawn by
     `apps/mobile/scripts/build-app-icons.sh`.
  7. The welcome screen no longer shows `API: OK • MongoDB: connected`. The health check stays,
     but only speaks when the API can't be reached.
- **Why:** Play rejects an app without a privacy policy URL or in-app and web account deletion.
  Players don't need to see the API's status, and the default Expo icon looked unfinished.
- **Trade-off:** account deletion is off-chain only, and an access token keeps working until it
  expires (every route that reads the user then answers `UNAUTHENTICATED`). The hosted API needs
  a redeploy before the app's Delete account works against it.
- **Revisit when:** a crash SDK or analytics is added (the privacy policy and Data safety form
  change), or on mainnet (Phase 10).

## D-040 — `stridemon.xyz` is StrideMon's domain

Made 2026-10-07, the day Yash registered `stridemon.xyz` (Namecheap). `stridemon.com` was never
ours. Supersedes the domain parts of D-014, D-034 and D-035.

- **Decision:**
  1. The landing page's canonical address is **`https://stridemon.xyz`** (the bare domain).
     `siteUrl` in `website/src/content/site.ts` drives the canonical tags, Open Graph URLs, the
     sitemap, `robots.txt` and the JSON-LD.
  2. **`www.stridemon.xyz`** and the old **`stridemon.yashmittal.xyz`** answer with a permanent
     (308) redirect to the same path on `https://stridemon.xyz`, query string kept, so posted
     `?source=x-…` links still credit their account and search engines move the old page's
     signals to the new one. They are Vercel **domain redirects** (Project → Domains), set with
     `vercel api /v9/projects/stridemon/domains/<name> -X PATCH -F redirect=stridemon.xyz -F
     redirectStatusCode=308`. A host-matched `/:path*` rule in `vercel.json` was tried first and
     missed the home page (Vercel served the cached static `index.html` without matching it).
     All three names are domains of the one Vercel project.
  3. The hosted API moves to **`https://api.stridemon.xyz`** (an `A` record to the same
     instance, its own nginx server block and certificate, `deployment.md` §11). New builds
     (`eas.json`) and the website's waitlist use it. The old `stridemon-api.yashmittal.xyz` is
     **removed completely** (nginx block, certificate, DNS record) as soon as the new `demo`
     build is installed and linked from `README.md`, not kept for older builds (Yash,
     2026-10-07).
  4. **`SIWE_DOMAIN`** and the AppKit metadata `url` become **`stridemon.xyz`**, a domain we can
     prove we own (wallets compare the two, and Reown can verify the domain).
  5. **DNS stays on Namecheap** (BasicDNS), unlike `yashmittal.xyz` on Vercel: Namecheap's free
     email forwarding needs its own DNS, and gives `support@stridemon.xyz` for Google Play and
     the privacy policy. Until that address forwards, `supportEmail` stays the Gmail address.
  6. `WAITLIST_ALLOWED_ORIGINS` on the hosted API is `https://stridemon.xyz` only, once the old
     API name is removed. The old site name keeps its redirect: that's what keeps posted links
     and search results working.
  7. Posts already published, past decisions, `launch-video/FOOTAGE.md` and the briefs
     (`landing-page-prompt.md`, `waitlist-prompt.md`) keep the old names on purpose.
- **Why:** a product domain is shorter to say and type than a subdomain of a personal one, and
  lets StrideMon own its SIWE domain, email and search presence. Redirecting instead of keeping
  both names live avoids duplicate pages in search.
- **Trade-off:** one more DNS zone to manage, at a different provider from `yashmittal.xyz`.
  Every build made before the switch (the old README APK, anything already downloaded) stops
  working when the old API name goes: it can't reach the API at all. Few copies exist, so a
  clean cut beats running two names.
- **Revisit when:** the instance moves.
