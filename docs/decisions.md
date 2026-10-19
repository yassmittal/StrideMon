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
- **Changed in part (2026-10-18):** by D-056. Joining needs a Turnstile token, the per-IP limit
  is 30 a minute, sign-ups are unique by their folded `canonicalEmail` (not the typed email), the
  answer carries the invite link, and the promise becomes "a code only when you ask, and one email
  when the waitlist window opens". CORS covers every `/v1/waitlist/*` route.
- **Changed in part (2026-10-19):** by D-059, the form stops asking for the phone platform. The
  API still accepts it, and older sign-ups keep theirs.

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

## D-041 — The Founding Pass: 1,000 one-of-one passes as early access, each with a Founder Sneaker

Made 2026-10-08 with Yash, in Part 0 of the Founding Pass build. The idea, flow and research are
in [`founding-pass-brief.md`](founding-pass-brief.md), the art in
[`packages/contracts/art/founding-pass`](../packages/contracts/art/founding-pass/README.md), and
the build plan in [`founding-pass/`](founding-pass/README.md), one part per session. Overturns
D-037's "never a wallet" for the `/pass` page only.

- **Decision:**
  1. **1,000 Founding Passes, each a different design.** Each design can be minted once, and the
     token id is the design number. Minting is free (the game server pays the gas), on the website
     at `stridemon.xyz/pass`, after an email check (a 6-digit code) and a wallet sign-in (the
     app's SIWE flow). One pass per email and per wallet. The art is Part 1a's system, drawn
     on-chain by a swappable `FoundingPassArtRenderer`, as D-030 did for the Sneaker.
  2. **Two linked NFTs.** The **Founding Pass** is the membership card: soulbound (ERC-5192), in
     its own `FoundingPass` contract, so a game redeploy never touches it. The **Founder
     Sneaker** is the shoe its holder runs in: one per pass, in `SneakerNft`, drawn in the pass's
     design. Neither can be sent or sold. Normal Sneakers still can (Phase 7). The game contracts
     are redeployed for this: there are no users yet.
  3. **Names.** Designs are named "Family Template Colourway" ("Ember Runner Dusk"). The ten
     Legendaries (the Prism family, one per template) get hand-picked names instead, after ten
     rare lights in the sky. A name belongs to its template's Legendary, not to a number, so
     Part 1b's re-rolls can't separate them:

     | Template | Name | Why it fits |
     |---|---|---|
     | Runner | **Earthshine** | the glow our planet casts on the moon: the everyday shoe, for walks on Earth |
     | Racer | **Afterglow** | the glow after sunset, and the feeling after a race |
     | Trail | **Fogbow** | the white rainbow seen in morning fog on a trail |
     | Court | **Fire Rainbow** | a flat band of colour low in the sky, like the court's flat cupsole |
     | Hoop | **Glory** | rings of colour around a shadow on mist, like a rim, and the glory |
     | Chunky | **Nacreous** | nacreous (mother-of-pearl) clouds: a rare polar sky light that shimmers in many colours, and nacre builds up in layers like the Chunky's stacked midsole |
     | Sock | **Moonbow** | a rainbow by moonlight: soft and quiet, like the knit |
     | Skate | **Airglow** | the night sky's own faint light, and skaters catch air |
     | Spike | **Heat Lightning** | a silent flash on a summer night: the fastest shoe |
     | Hiker | **Sun Pillar** | a tall column of light in cold air, like the boot's shaft |

     The card shows the hand-picked name. The attributes still list Prism, the template and the
     colourway.

     **Changed 2026-10-08 (Yash, during Part 2):** the Chunky's Legendary (#0542) was first
     named **Steve**, after the purple-and-green ribbon aurora watchers named in 2016, as a dad
     name for the dad shoe. It read as a joke beside the other nine, so it's **Nacreous** now.
     "Nacreous" is no shoe model's name (checked like the others; "Nacre" only appears as a
     colourway nickname, never a model). The name is art data, not a row of the frozen design
     table, so the swap changed no design: only #0542's name and its comment in the table.
  4. **Gold frame** on about 1 in 10 passes, rolled at random on-chain at mint. It's cosmetic,
     and nobody says it's worth more.
  5. **The schedule.** A **preview week** (the gallery and a countdown, no minting), then a
     **48-hour waitlist window** (only emails that joined the waitlist before it opened can
     mint), then the **open mint** (anyone, until all 1,000 are minted). Rough dates: the
     preview week from Sat 2026-11-21, the waitlist window from Sat 2026-11-28 20:00 IST
     (14:30 UTC), the open mint from Mon 2026-11-30 20:00 IST. Part 10 sets the exact times,
     which live in the API's config.
  6. **Early access (the gate).** While `EARLY_ACCESS_REQUIRED` is on, the API gives a Sneaker
     only to a wallet that holds a pass (on-chain), and that Sneaker is its Founder Sneaker. The
     gate goes on when the preview week starts, never before Metropolis judging ends
     (2026-10-27). It goes off by itself when all 1,000 are minted, or on the **backup opening
     date: 14 days after the open mint starts** (about Mon 2026-12-14 20:00 IST). From then on,
     everyone without a pass gets a free normal Sneaker in today's look. No new passes, ever.
  7. **The website asks for a wallet on `/pass` only.** Reown AppKit for web and wagmi load on
     that page alone, after "Get ready" or "Mint". The landing page and the waitlist stay email
     only, and joining the waitlist is how someone gets into the waitlist window.
  8. **Bots.** The email step, a per-IP rate limit on every public pass route, and
     **Cloudflare Turnstile** (free) on both **Send code** and **Mint**. On Send code it also
     guards Brevo's free plan (300 emails a day) from being used up.
  9. **The match quiz** in the gallery: three questions, then six available passes that fit.
  10. **A lost wallet.** Support may move a pass to a new wallet, by hand, when its founder asks
      and a code sent to the pass's email checks out. An admin-only action (`RECOVERY_ROLE`, held
      by the deployer key, never the game-server key) moves the pass **and its Founder Sneaker**
      together. They keep the design, founder number, frame, laced state and the Sneaker's
      stats. The new wallet must not hold a pass.
  11. **Lacing.** The holder's first settled walk laces the pass and its Founder Sneaker (both
      pictures change), once.
  12. **Words.** Founding Pass, founder, waitlist, waitlist window, open mint, one of one. Never
      *whitelist*, *WL*, *allowlist*, *airdrop*, *alpha* or *sold out* (say "all minted"). Every
      surface with the pass says it's free and can't be sent or sold, in those plain words, not
      "soulbound".
- **Why:** a pass someone picks and owns gives a reward on mint day, where a place in a line only
  gives a wait (the brief's v1). Two NFTs, because a soulbound record and a game item that's
  repaired and upgraded are different things, and a pass that could be traded would turn the
  1,000 early spots into things to flip. Hand-picked names: the Legendaries are the passes people
  share most. Names that stick describe the look or tell a story (sneaker nicknames like "Bred"
  and "Infrared"), and a set with one theme reads as a collection (Pokémon's Legendary birds and
  beasts). Every Prism design is many colours, and each sky light is a rare sight with colour in
  it. Each name was checked against shoe model names: Aurora (Brooks), Green Flash (Dunlop),
  Alpenglow (The North Face), Halo (Nike's Kobe line), Mirage (Puma), Meteor and Shooting Star
  (adidas) are taken, and Sundog is a sports sunglasses brand, so all were dropped. Turnstile is
  free, and one-of-ones give bots a reason to snipe the Legendaries. The backup date keeps the
  app from staying half-closed: 14 days is long enough for word to spread, short enough that
  nobody waits a month. A lost phone shouldn't mean a founder loses their place for good, and
  keeping the move manual and admin-only keeps it rare.
- **Trade-off:**
  - The website gains wallet code, an email provider (Brevo) and Turnstile. The API gains
    public routes, CORS for the site on more routes, and personal data (the mint record links an
    email to a wallet).
  - While the gate is on, nobody new can play without a pass.
  - The lost-wallet move means the pass isn't strictly soulbound: the admin can move it, and the
    help page says so.
  - The game-server key pays for every pass mint, Founder Sneaker and gas drip, so 1,000 founders
    need a large testnet MON budget (Part 3 measures it).
  - ~~"Steve" is the playful name in the set. If it reads as a joke on the card, swap it for
    another sky light before Part 1b's freeze (for example "Belt of Venus").~~ Swapped for
    "Nacreous" on 2026-10-08 (see item 3).
- **Revisit when:** the dates slip (Part 10 moves them), all 1,000 are minted, or mainnet
  (Phase 10: embedded wallets, a multisig for `RECOVERY_ROLE`).

## D-042 — How the Founding Pass and the Founder Sneaker link on-chain

Made 2026-10-08 in Part 2 of the Founding Pass build ([`founding-pass/part-2-contracts.md`](founding-pass/part-2-contracts.md)).
It fills in D-041's contracts. The full interface is in
[`architecture/smart-contracts.md`](architecture/smart-contracts.md).

- **Decision:**
  1. **Lacing lives on the pass only.** `FoundingPass.setLaced` is the one call. The Founder
     Sneaker's picture reads the pass's laced state (and its gold frame) live, so one
     transaction laces both pictures and the two can never disagree.
  2. **The link lives in `SneakerNft`**, the permanent contract: `foundingPassTokenIdOf(sneaker)`
     and `founderSneakerTokenIdOf(pass)`, and `SneakerNft` refuses a second Founder Sneaker for
     a pass. A later `SneakerGame` can't forget which passes already have one.
  3. **`SneakerGame.mintFounderSneaker(passTokenId)`** (game server) mints to whoever holds the
     pass, with starter stats, and marks that wallet's starter as claimed: a founder's Founder
     Sneaker is their free Sneaker. A founder who already got a normal starter (before the gate)
     still gets their Founder Sneaker.
  4. **Founder Sneakers refuse `transferFrom`, `safeTransferFrom` and `approve`** with
     `FounderSneakerNotTransferable(tokenId)`. Normal Sneakers work as in Phase 7.
  5. **The lost-wallet move** is two calls, run together by `RecoverFoundingPass.s.sol` from the
     deployer key: `FoundingPass.recoverFoundingPass(passTokenId, newOwner)`, then
     `SneakerGame.recoverFounderSneaker(passTokenId)`, which can only move the Founder Sneaker
     **to whoever holds the pass now**, never to an address of the caller's choice. Both work
     while the game is paused: it's support, not play. The script skips a step that's already
     done, so a half-finished run can be run again.
  6. **One renderer for every Sneaker.** `SneakerArtRenderer.renderImageSvg` also takes the
     Sneaker's pass token id (0 for a normal Sneaker). Normal Sneakers keep D-030's art byte for
     byte. A Founder Sneaker is drawn by the pass's own art renderer (read from `FoundingPass`,
     so a pass-art swap changes both) on the same dark square, with a light rim round the shoe
     so its ink outline shows on the dark panel.
  7. **The gold frame** rolls from `keccak256(prevrandao, the previous block hash, design,
     founder number, wallet)`, 1 in 10. Someone could predict it, but only the game server
     mints, it's cosmetic, and nobody can buy a re-roll.
  8. **`mintedBitmap()`** is four words, and bit *n* is design *n* (bit 0 is never set), so a
     client checks a design without an off-by-one.
  9. **The pass's attributes** name the template, family, colourway, each option ("Side: Wedge"),
     rarity, founder number, frame and stage, and the lace colour once laced (it's the lacing's
     small reveal). The option and lace labels are added to the generated art data, which
     changes no design.
  10. **Deploy order:** `DeployFoundingPass.s.sol` first (its own script: the pass art renderer
      and `FoundingPass`), then `DeployGame.s.sol` with `FOUNDING_PASS_ADDRESS`. Both write to
      `deployments/<chainId>.json` without dropping each other's keys.
  11. **The API's test Anvil** runs with Monad's 128 KB contract size limit
      (`--code-size-limit`), since the pass art renderer is about 56 KB and Anvil's default is
      Ethereum's 24 KB.
- **Why:** one source of truth for each fact (the laced state on the pass, the link in the
  permanent NFT), and the recovery can't be turned into a way to send someone's Sneaker
  anywhere. One renderer keeps a single `setArtRenderer` for every Sneaker picture.
- **Trade-off:** `SneakerArtRenderer` now depends on `FoundingPass`, and a Founder Sneaker's
  picture costs a few hundred thousand gas to draw (fine for `eth_call`). Lacing doesn't emit an
  ERC-4906 event on the Sneaker: wallets that cache metadata refresh it on the next stat change
  (every settled walk emits one). A fresh `FoundingPass` (Part 10 deploys one after the
  rehearsal) means a fresh game too, since the game is wired to one pass contract and
  `SneakerNft` keeps the links.
- **Revisit when:** mainnet (a multisig holds `RECOVERY_ROLE`, D-041), or a Sneaker needs art
  that isn't the pass's.

## D-043 — How the Founding Pass API works

Made 2026-10-08 in Part 3 of the Founding Pass build ([`founding-pass/part-3-api.md`](founding-pass/part-3-api.md)).
It fills in D-041's API. The routes, shapes and error codes are in
[`architecture/backend-api.md`](architecture/backend-api.md) → The Founding Pass.

- **Decision:**
  1. **The schedule is three settings:** `PASS_WAITLIST_WINDOW_STARTS_AT`,
     `PASS_WAITLIST_WINDOW_HOURS` (48) and `PASS_BACKUP_OPENING_AT`. The open mint starts when the
     window ends. One pure function (`lib/founding-pass/pass-schedule.ts`) turns them, the clock
     and the on-chain minted count into the phase: `preview`, `waitlistWindow`, `openMint`,
     `allMinted` or `openToAll`, with the time of the next change. Minting is open in the
     window and the open mint only: after the backup opening date, no new passes (D-041).
  2. **The gate** is on while `EARLY_ACCESS_REQUIRED=true` and the phase is `preview`,
     `waitlistWindow` or `openMint`. `POST /v1/onboarding/starter-sneaker` then refuses a wallet
     without a pass (`FOUNDING_PASS_REQUIRED`), and the onboarding status tells the app
     (`isFoundingPassRequired`). A pass holder always gets a Founder Sneaker, gate or not.
  3. **A mint's outbox key is its mint id** (`mintFoundingPass:<mintId>`), not the design
     number. A mint that fails (a simulated revert) frees its design, and a later mint of that
     design needs its own transaction. The database's partial unique indexes on
     `foundingPassMints` (design, email, wallet, over mints that haven't failed) are what stop
     two mints of one design.
  4. **A repeated mint request** from the same wallet for the same design answers that mint
     again (200), so a double tap or a retry after a dropped connection never shows an error.
  5. **Email codes** are stored as HMAC-SHA-256 of the email and code, keyed with
     `EMAIL_PROOF_SECRET`, so a copy of the database can't be brute-forced through the million
     possible codes. The **email proof** is a JWT signed with that secret (never the access-token
     secret), good for 6 hours.
  6. **Development never sends email:** it logs the code. Only production sends, through Brevo,
     and it refuses to boot without `BREVO_API_KEY`. The deliverability check uses
     `bun run pass:send-test-email <address>`, which sends one sample code email and touches
     neither Mongo nor the chain.
  7. **Turnstile** is checked first on Send code and Mint, before anything else, with
     Cloudflare's siteverify. Development and tests use Cloudflare's always-pass test secret, and
     production refuses Cloudflare's test secrets at boot.
  8. **CORS** also opens `/v1/auth/refresh` to the site: "Get ready" can happen long before the
     mint, the access token lasts 15 minutes, and a new wallet signature at the moment of the
     mint would cost the one-tap mint. So the browser routes are `/v1/waitlist`,
     `/v1/auth/nonce`, `/v1/auth/verify`, `/v1/auth/refresh` and every `/v1/pass/*` route, from
     `WAITLIST_ALLOWED_ORIGINS` (the same list, kept under its old name so the server's `.env`
     needs no rename).
  9. **The collection** lists minted designs as numbers (decoded from `mintedBitmap()`), not as
     the raw bitmap. The chain read is cached for 3 seconds. Mints confirmed since that read
     are listed as pending, so a design never looks free in between.
  10. **"3 similar passes"** come from the frozen design table, which `chain:export-abis` now
      copies into `@stridemon/chain/founding-pass-designs` (a subpath, so the app never bundles
      it by accident). Similar means the same template first, then the same family, colourway,
      options and rarity, then the nearest number.
  11. **The waitlist email** is a command run by hand on the server:
      `bun run pass:send-waitlist-emails --limit <n> --send` (without `--send` it only counts).
      It emails the oldest sign-ups that joined before the window opened and were never emailed,
      marks each address **before** it sends (at most once, never twice), and prints what it
      sent. Sign-ups from after the window opened get no email.
  12. **Lacing:** when a `settleSession` confirms, the outbox job reads the wallet's pass from the
      chain and, if it isn't laced, queues `laceFoundingPass:<passTokenId>`. Every later
      settlement finds it laced (or the key already queued) and adds nothing.
  13. **The testnet MON budget** (measured 2026-10-08 on Anvil, and checked with `eth_estimateGas`
      on testnet; Monad charges the gas limit, at about 102 gwei today):

      | Per founder, from the game-server key | Gas | MON |
      |---|---|---|
      | `mintFoundingPass` | ~246,000 | ~0.025 |
      | `mintFounderSneaker` | ~363,000 | ~0.037 |
      | `sendGasDrip` (the transfer) | 21,000 | ~0.002 |
      | `laceFoundingPass` | ~52,000 | ~0.005 |
      | the drip itself (`GAS_DRIP_AMOUNT_WEI`) | | 0.1 |
      | **Total** | ~682,000 | **~0.17** |

      So 1,000 founders need about **170 MON** (about 70 in fees and 100 in drips), and every
      settled walk after that costs about 0.02 MON (`settleSession`, ~190,000 gas). A player's
      own repair or upgrade is ~110,000–125,000 gas (~0.013 MON), so a 0.05 MON drip still pays
      for about 3 of them and brings the total to about 120 MON. **Yash keeps the drip at 0.1 MON
      (2026-10-08)**, so plan on about 170 MON in the game-server key before the launch.
- **Why:** one source of truth per fact (the schedule in config, ownership on the chain, the
  claim on a design in the unique index), and no user-facing step that can fail for a reason the
  user can't act on. Every refusal has its own code, so the website can say what happened and
  what to do next.
- **Trade-off:** the website keeps a refresh token in the browser (a stolen one is limited to
  this API, and rotating tokens detect reuse). The waitlist email is a manual step on launch day.
  Mints confirmed in the last 3 seconds are counted as pending, not minted, in the collection.
- **Revisit when:** Part 5 builds the website's mint (it may want more from the API), the
  waitlist outgrows Brevo's 300 a day (move to SES), or mainnet.
- **Changed in part (2026-10-18):** by D-057, an email proof can come from Google
  (`POST /v1/pass/email-google`), Send code takes a `purpose`, and every email counts toward a
  daily budget. By D-058, the schedule gains the `earlyHour` phase before the window, and the
  window email can go first to the people with the early hour (`--early-hour`), still once per
  address.

## D-044 — How the Founding Pass gallery works on the website

Made 2026-10-08 in Part 4 of the Founding Pass build ([`founding-pass/part-4-website-gallery.md`](founding-pass/part-4-website-gallery.md)).
It fills in D-041's gallery and the brief's §5.2 and §8.

- **Decision:**
  1. **The export.** `bun packages/contracts/art/founding-pass/export-website-art.ts` (from the
     repo root) has the Solidity renderer draw, in a simulation (`RenderPassArt.s.sol`'s
     `exportWebsiteArt()`), every design's gallery card (`renderDesignPreviewSvg`, exactly the
     on-chain image) and its laced Sneaker (`renderSneakerMarkup`, laced, alone in its
     1000 × 600 space). It copies them to `website/public/pass-art/cards/` and
     `website/public/pass-art/laced/`, and writes the design table with every label to
     `website/src/content/founding-pass-designs.ts` (generated, one compact row per design). It
     checks each row's name against `designs.json`. The site still never imports `@stridemon/*`
     (D-035).
  2. **The grid shows the card cropped to the shoe** (CSS, no second file), with the number,
     name and rarity as text below it: the card's own text is too small to read at two cards a
     row. The detail sheet shows the whole card, so it's already loaded when the sheet opens.
  3. **The laced look shows the real lace colour** (Yash, 2026-10-08). The art README said laces
     don't show in the gallery, and D-042 keeps them out of the token's attributes until it's
     laced. The gallery shows them anyway, so every rarity label has a reason you can see (80
     Uncommons are Uncommon only for their lime laces). Lacing still changes the pass on-chain.
  4. **The grid draws 48 cards at a time** and more as you scroll, so the page stays light on a
     phone. Filters, sort, search, "Surprise me" and the match quiz are views over the table that
     ships with the page.
  5. **The live state** comes from `GET /v1/pass/collection`, fetched once and again every 15
     seconds while minting is open and the tab is visible (every 2 minutes otherwise). If it
     can't be reached, the gallery still works, says the minted state is unavailable, and offers
     a retry.
  6. **The schedule's planned times** (D-041) ship with the page in `src/content/founding-pass.ts`,
     so the countdown works before the API answers or when it can't. The API's schedule replaces
     them as soon as it answers. Part 10 sets the exact times in both places.
  7. **"Minted by 0x3f…a1"** shows for the mints the collection lists (the last 10). Any other
     minted pass says "Minted" and links to its page on MonadVision, which shows the owner. The
     site makes no chain calls of its own.
  8. **Each pass page** (`/pass/137`, 1,000 static pages) gets an Open Graph image from
     `next/og` at build time: the card cropped to the shoe, with the name and number in Satoshi.
     Measured 2026-10-08: the whole build takes about 14 seconds (4.7 before), so the images
     needn't be rendered ahead.
  9. **The match quiz** maps its answers onto layers: when you walk picks colourways (morning:
     Dawn, Frost, Haze; daytime: Day, Flare, Drift; evening: Dusk, Storm; night: Night,
     Eclipse), the colour picks families, and the style picks templates (everyday: Runner,
     Court, Sock; fast: Racer, Spike; outdoors: Trail, Hiker; street: Hoop, Chunky, Skate). A
     design scores 3 for the colour, 2 for the style and 1 for the time, and the six best
     available come first, so the quiz always finds six.
  10. **Favourites** live in the browser's `localStorage`, every read and write in try/catch.
  11. **Help:** until Part 7 builds `/help`, "Read the full help" goes to the questions at the
      foot of `/pass` (`passHelpPath` in `src/content/site.ts`).
- **Why:** the shoe is the part people choose by, and the on-chain card stays the one picture
  of a pass. Drawing a few cards at a time keeps Lighthouse's DOM and hydration costs down
  without hiding anything. One collection route keeps the site free of chain code until Part 5
  brings the wallet.
- **Trade-off:** `public/pass-art/` holds 2,000 generated SVGs (about 5 MB), and the planned
  times live in two places until the API answers. The built site grows to about 8,000 files and
  260 MB (each pass page is about 10 KB gzipped, and its image 70 KB). Vercel sets no limit on a
  build's output, only on uploaded source, and these are built on Vercel. The owner of an older mint is one click away
  (MonadVision), not on the card.
- **Revisit when:** Part 5 adds the mint, Part 7 adds `/help`, or the art changes (a new
  renderer means a new export).

## D-045 — How the website mints a Founding Pass

Made 2026-10-08 in Part 5 of the Founding Pass build ([`founding-pass/part-5-website-mint.md`](founding-pass/part-5-website-mint.md)).
It fills in D-041's website mint and the brief's §5.3, §6 and §10.3. The API is unchanged (D-043).

- **Decision:**
  1. **The wallet stack** is Reown AppKit for web 1.8.24 with its wagmi adapter, `@wagmi/core`
     2.22.1 (wagmi 2.19.5, the app's major) and viem 2.57.4, in the website's own install (D-035),
     with the app's Reown project id. External wallets only, as in the app (D-010). It loads through
     `next/dynamic` with `ssr: false`, and only after someone taps "Connect wallet" (in "Get ready"
     or in the mint), so the gallery never downloads it. (`ssr: false` is also what lets it build:
     a wallet connector's optional modules don't resolve for the server.)
  2. **AppKit's modal opens in a `<dialog>` of our own** (`.wallet-layer`). The pass sheet and the
     mint are modal dialogs, which make the rest of the page inert, so AppKit's modal has to be in
     the top layer too. AppKit reuses a `<w3m-modal>` that's already in the page, so ours lives in
     that dialog.
  3. **"Get ready" is two things kept in the browser** (`localStorage`, every read and write in
     try/catch): the **email proof** (6 hours, D-043) and the **app's sign-in** (the access and
     refresh tokens, D-043's trade-off), plus the mint in progress. With both, minting needs no
     wallet at all: one tap runs Turnstile and posts the mint. The wallet is only for connecting
     and the one free signature. "Use another email" and "Use another wallet" forget them here.
  4. **The network step.** Connecting already asks the wallet to switch to Monad Testnet, adding it
     if needed. If the wallet is still on another network, the step says so with one tap to
     switch; if the wallet can't, it explains how in plain words, links the help, and lets the
     person sign in anyway: the mint itself never uses the wallet's network, but the app does.
     Wallets are always given the public RPC, even when a local run reads from its own Anvil.
  5. **Turnstile** loads on demand (explicit rendering) with the `interaction-only` look, so most
     people never see it. Each Send code and each Mint uses a fresh token. The site key is public
     and lives in `site.ts` (`0x4AAAAAAFRleBaVJ9eZuqBJ`, the `stridemon.xyz` widget); a local run
     uses Cloudflare's always-pass test key. The API now also checks what siteverify says the
     token is for, as Cloudflare's Turnstile Spin guide asks: the route's action (`send-code` or
     `mint`) and a hostname from `WAITLIST_ALLOWED_ORIGINS` (the site's own origins, so the
     server's `.env` gains nothing). Answers from Cloudflare's test keys carry neither, so they
     count on `success` alone; production refuses test keys at boot (D-043).
  6. **The reveal reads the minted card from the chain** (`FoundingPass.imageSvg`, through a viem
     client on Monad's public RPC), so it shows exactly what wallets and MonadVision show:
     `FOUNDER 042`, and the gold frame if it rolled. A dark card back turns over to it, and
     "Founder 42 of 1,000" counts up. If the read fails, the gallery card stands in and the frame
     is said in words. Reduced motion skips the turn.
  7. **Already a founder:** after signing in, the site reads the wallet's pass from the chain
     (`balanceOf`, `tokenOfOwnerByIndex`, `passOf`) and shows it with the next step. A mint
     refused with `PASS_EMAIL_ALREADY_USED` or `PASS_WALLET_ALREADY_USED` shows that pass too, and
     resumes its reveal when the API still has it in the queue (`details.mintId`).
  8. **The race:** `PASS_ALREADY_MINTED` shows the API's three similar passes, each minted with
     one tap. A mint in progress survives a reload: the page resumes polling it.
  9. **Outside the waitlist in the window** (`PASS_WAITLIST_WINDOW_ONLY`): the open mint's time in
     the visitor's own time zone, with **"Add to calendar"** (a Google Calendar link and an `.ics`
     file) as the reminder, since joining the waitlist after the window opens sends nothing
     (D-043). The pass can be hearted meanwhile.
  10. **Every error has a plain message, a next step and a help link** (`passHelpPath` until Part 7
      builds `/help`), from one table in `src/content/founding-pass-mint.ts`: every Part 3 code,
      plus a refused signature, a wallet that won't connect or switch, a Turnstile that won't
      load, the API out of reach, and a slow mint.
  11. **The site's chain reads** use four read functions copied by hand into
      `src/content/founding-pass-abi.ts`, not generated: they're standard ERC-721 reads plus
      `passOf` and `imageSvg`. A local run points them elsewhere with `NEXT_PUBLIC_MONAD_RPC_URL`
      and `NEXT_PUBLIC_FOUNDING_PASS_ADDRESS`.
  12. **A local stack for testing** (`cd apps/api && bun run pass:local-stack`): its own Anvil
      (chain 10143 with Monad's contract size limit, port 8546), the contracts deployed by the API
      tests' helper (never `forge script`, so `deployments/10143.json` is never touched, D-019), a
      throwaway database (`stridemon-pass-local`, dropped at start), and the API on port 3001 with
      an environment the script builds itself: Anvil's keys, Cloudflare's test Turnstile secret,
      codes in the log. It never reads `apps/api/.env`. Flags pick the phase, add waitlist
      emails, mint passes ahead (up to all 1,000) and slow the blocks down.
  13. **"Get the app"** links to the current APK (`appDownloadUrl` in `site.ts`). Part 6's build
      replaces it. *Changed (D-052):* it opens the build's expo.dev page (`appInstallPageUrl`).
- **Why:** the brief's one-tap mint on mint day, without a wallet prompt at that moment, and no
  wallet code for anyone who only browses. The chain stays the source of truth for the picture
  and for who already holds a pass. A local stack keeps every test off testnet (`CLAUDE.md`).
- **Trade-off:** the browser holds a refresh token and an email proof (both limited to this API).
  The page makes chain reads of its own now (D-044 had none). The wallet libraries are large, but
  only someone minting downloads them. Four read functions are copied by hand.
- **Revisit when:** Part 7 builds `/help` (deep links per error), Part 6 ships the founder app
  build (the APK link), or mainnet (embedded wallets, D-041).
- **Changed in part (2026-10-18):** by D-056 and D-057, Turnstile has two more actions,
  `join-waitlist` and `send-waitlist-code`. By D-058, the email step gets Continue with Google
  beside Send code.

## D-046 — How the app shows the Founding Pass

Made 2026-10-09 in Part 6 of the Founding Pass build ([`founding-pass/part-6-app.md`](founding-pass/part-6-app.md)).
It fills in D-041's app and the brief's §7 and §10.4. The API is unchanged (D-043).

- **Decision:**
  1. **The app reads the pass from the chain** with wagmi, like the Sneaker: `balanceOf`,
     `tokenOfOwnerByIndex`, `passOf`, `SneakerNft.founderSneakerTokenIdOf` and `imageSvg`
     (`features/founding-pass/hooks/useFoundingPass`). It never bundles the design table
     (D-043's subpath): the card's own picture carries the name and number.
  2. **Home asks the pass first.** A wallet that holds a pass without a Founder Sneaker gets the
     minting screen as "Minting your Founder Sneaker…", even when it already owns a normal
     Sneaker (a founder who joined before the gate). The screen calls the same
     `POST /v1/onboarding/starter-sneaker`, which queues the Founder Sneaker, and Home switches
     by itself once the chain shows it. Otherwise Home works as before.
  3. **The gate screen shows when the API refuses the starter with `FOUNDING_PASS_REQUIRED`.**
     The app doesn't work out the gate itself: the API's answer is the one source of truth. The
     screen reads the phase and times from `GET /v1/pass/collection` (public, no sign-in). While
     it's open it looks for a pass every 5 seconds and asks the collection every minute, and it
     asks for the starter again by itself once the collection says the gate is off (opening day).
     "I've minted my pass" checks at once and says "Checking for your pass…". The signed-in
     address is shown in full with "Minted with another wallet? Sign out and sign in with that
     one." and a Sign out button.
  4. **Help links** go to `stridemon.xyz/pass#questions` (`foundingPassHelpUrl` in
     `src/config/website-urls.ts`), the website's own help until Part 7 builds `/help`.
  5. **Profile shows the pass:** the on-chain card (`FoundingPass.imageSvg`, so it has the gold
     frame and `FOUNDER 042`), the founder number, laced or not, "Free. It can't be sent or sold.",
     and a link to `stridemon.xyz/pass/<number>`. A wallet without a pass shows nothing extra.
  6. **The laced moment lives on the run summary.** Once the run settles, the screen reads the
     pass every 3 seconds while it's unlaced. When it turns laced (a change it saw itself, so an
     old run in History never replays it), the screen shows "Your shoe is laced" with the new
     card, plays one soft haptic, and re-reads every chain value so Home's Sneaker picture
     changes too.
  7. **Transfer:** the Sneaker tab reads `SneakerNft.foundingPassTokenIdOf` for the picked
     Sneaker. A Founder Sneaker's Send panel is disabled with "Founder Sneakers stay with their
     founder. They can't be sent or sold." Normal Sneakers transfer as in Phase 7.
  8. **Testing on the phone uses the local stack**, never testnet: `pass:local-stack` gains
     `--early-access` (the gate on) and prints the app's `.env` lines. The app gains four optional
     `EXPO_PUBLIC_*_ADDRESS` settings that replace `@stridemon/chain`'s addresses (all four or
     none), so it can read the stack's Anvil. Builds never set them. The stack also puts
     Multicall3 at its usual address on its Anvil (its runtime code, with `anvil_setCode`),
     because the app's reads batch through the address in the chain definition, and a bare Anvil
     has nothing there ("Cannot decode zero data").
- **Why:** the chain stays the truth for the pass and its Founder Sneaker, and the API stays the
  truth for the gate, so the app can't disagree with either. Showing the gate only on the API's
  refusal keeps opening day automatic. A laced moment that only plays when the app saw the change
  can't play twice.
- **Trade-off:** Home makes a few more chain reads before it shows anything. Someone who leaves
  the summary before the lacing lands misses the moment (the pictures still change, on the next
  read). The gate polls the chain while it's open.
- **Revisit when:** Part 7 builds `/help` (deep links), or mainnet.

## D-047 — How the help page works

Made 2026-10-09 in Part 7 of the Founding Pass build ([`founding-pass/part-7-help.md`](founding-pass/part-7-help.md)).
It replaces D-044's and D-046's stand-in help link (`/pass#questions`).

- **Decision:**
  1. **One page, `stridemon.xyz/help`,** static like the rest of the site, in this order: how it
     works (five steps), before you start, the guides, plain answers, "When something goes
     wrong", lost wallet, contact. Every answer is open on the page (no folded `<details>`), so
     a deep link always lands on readable text, and the linked answer is marked with `:target`.
  2. **One source:** `website/src/content/help.ts` holds every word as plain strings (paragraphs
     and step lists, no JSX), so Part 8's chatbot can read the same text. Each guide and answer
     has a stable `id`, which is its anchor (`/help#wrong-code`).
  3. **Every error links to its own answer.** On the website, `mintProblemHelpTopicIds` maps each
     `MintProblemKey` to a help id, and `MintProblemNote` links there. In the app,
     `src/config/website-urls.ts` has `buildHelpUrl(helpTopicId)` and the ids it uses, which
     must exist in `help.ts` (`website-urls.test.ts` lists them, and the help page's own check
     is to grep for each). The app opens the web help from Profile → Help, the gate screen, the
     minting screen, sign-in errors, a Home read error and a Founder Sneaker's disabled Send.
  4. **"Add Monad Testnet" is one tap** where the browser has a wallet (`window.ethereum`, the
     MetaMask extension or MetaMask's own browser): `wallet_addEthereumChain` with the same
     details as the mint's network step. Without one, the page says so and shows the details
     to add by hand. It loads no wallet library.
  5. **Screenshots** for the website guides come from Part 5's phone shots
     (`media-source/pass-mint-screenshots/`, cropped, as WebP in `public/help/`); the app guides
     reuse `public/screenshots/`. MetaMask's own screens aren't shown: the guide links MetaMask's
     download page and says what to tap, in words.
  6. **The lost-wallet answer** says what to send (from the minting email: the pass number and
     the new wallet's address), that we reply with a code to check, that the new wallet can't
     already hold a pass, and that a move usually takes up to two days. It says plainly that
     support can move a pass, which is the one way a pass ever moves (D-041).
- **Why:** one page with stable anchors is the simplest thing every error, on both clients, can
  point at. Plain strings keep the chatbot honest to the same words.
- **Trade-off:** the page is long. The app can't check the website's ids at build time (the site
  isn't a workspace), so a renamed id lands on the page's top instead of its answer.
- **Revisit when:** the help outgrows one page, or iOS ships (the guides say Android).

## D-048 — How the help chatbot works

Made 2026-10-09 in Part 8 of the Founding Pass build ([`founding-pass/part-8-help-chatbot.md`](founding-pass/part-8-help-chatbot.md)).
Yash chose the AI option, on Amazon Bedrock (his API key, `us-east-1`), with a **$5 monthly cap**.

- **Decision:**
  1. **`POST /v1/help/chat` on the API** answers from Part 7's help text only. The website sends
     the conversation so far (at most 8 messages of 500 characters, ending with the visitor's
     question) and gets `{ status: 'answered', answerText, helpTopicIds }` or
     `{ status: 'monthlyCapReached' }`. The API keeps no conversation: Mongo holds only each
     month's token counts.
  2. **The model is DeepSeek V3.2 (`deepseek.v3.2`)** through Bedrock's OpenAI-compatible endpoint
     (`bedrock-mantle.us-east-1.api.aws/v1/chat/completions`, the Bedrock API key as a bearer
     token, plain `fetch`, no AWS SDK). All five of Yash's models ran Part 8's 20-question test list
     (`bun run help:check-answers --model <id>`). Nemotron Nano 3 30B is ten times cheaper but got
     facts wrong (it told someone who joined the waitlist today they could mint in the window) and
     sometimes sent no answer. Nemotron Super 3 120B often sent no answer. Qwen3 Coder and GLM-5
     passed most of it. DeepSeek V3.2 passed 19 or 20 of 20 on every run, with the shortest, most
     faithful answers, so it's the smallest model that answers the list well.
  3. **The help text is generated, not hand-copied.** `bun run help:export-knowledge` renders
     `website/src/content/help.ts` into `apps/api/src/lib/help-chat/help-knowledge.ts` (the text,
     one `[topic <id>]` block per guide and answer, and the list of ids). `--check` fails when
     it's stale. The website still never imports `@stridemon/*`, and the API never imports the
     website (D-035).
  4. **Links:** the model ends each reply with a `TOPICS:` line naming one or two topic ids. The
     API keeps only ids that are anchors on `/help`, and the widget turns each into a link with
     that answer's title. The model never writes URLs.
  5. **Safety:**
     - A question holding a wallet secret (12 or more recovery phrase words in a row, or 32 bytes
       of hex without `0x`, which is how MetaMask shows a private key) gets a fixed answer
       ("keep that secret…") and **never reaches the model**.
     - Before anything reaches the model, every 32-byte hex string (a key, or a transaction hash
       with `0x`) and any message with a recovery phrase is replaced with `[removed]`. Someone
       who pastes a transaction hash still gets a real answer.
     - The rules tell the model to use only the help text, say "I don't know" and point to
       contact otherwise, never talk about prices, value or investing, never write the words
       the Founding Pass avoids (README → Words), and redirect off-topic questions.
  6. **Limits:**
     - **The monthly cap** (`HELP_CHAT_MONTHLY_CAP_USD`, `5`): before each model call, the API
       prices this UTC month's tokens (`helpChatUsage`) at the model's list price
       (`HELP_CHAT_MODEL` in `lib/help-chat/help-chat-cost.ts`, $0.62 in and $1.85 out per
       million tokens). At or past the cap it answers `monthlyCapReached`, and the widget points
       at `/help` until the 1st. Replies in flight when the cap is reached can pass it by a
       fraction of a cent each.
     - **Per IP:** 30 questions an hour.
     - **CORS:** `/v1/help/chat` joins the browser routes, for `WAITLIST_ALLOWED_ORIGINS` only.
     - At most 400 output tokens a reply.
  7. **No key, no model:** `BEDROCK_API_KEY` is optional. Without it, or when Bedrock fails, the
     route answers `HELP_CHAT_UNAVAILABLE` (503), and the widget says so with a link to `/help`.
  8. **The widget** is an "Ask a question" pill fixed at the bottom right of `/pass` and `/help`.
     Its dialog is loaded with `next/dynamic` (`ssr: false`) only when someone taps it, so the
     pages ship only the pill. The dialog is a modal `<dialog>` in the pass sheet's look: a
     bottom sheet on a phone, a narrow centred panel on a desktop. It says that it answers from
     the help page and can be wrong, never to share a recovery phrase, and that we don't keep
     what you type. It offers four starter questions, and every state ends in a next step: the
     answer's help links, "Too many questions" (wait), the cap (read the help page), and
     unavailable or offline (try again, or read the help page). The conversation lives in page
     memory only, so it's gone on reload.
- **Why:** answers from the help page's own words can't drift from it, and a link under every
  answer means the chatbot never leaves someone worse off than the page. Checking for secrets in
  code, not only in the prompt, means a pasted recovery phrase never leaves the server. A cap
  counted from Bedrock's own usage numbers needs no billing API.
- **Trade-off:** DeepSeek V3.2 costs about $0.003 an answer (the whole help text goes with every
  question, about 4,400 tokens), so $5 buys about 1,800 answers a month, against about 18,000 on
  Nano. The cap uses list prices, so AWS's bill can differ slightly. A small model can still be
  wrong, so the widget says so. The help text must be exported again, and the API redeployed,
  after every change to `help.ts`.
- **Revisit when:** the cap is reached in a normal month (raise it, or send only the matching
  topics instead of the whole text), Bedrock's prices change, or a cheaper model passes the test
  list.

## D-049 — Founder access, said plainly

Made 2026-10-09, after a first-time read of the whole flow found six places a new player could
misread it. It refines D-041's schedule words and D-044, D-045, D-046 and D-047's copy. Nothing
about the contracts, the API or the dates changes.

- **Decision:**
  1. **"Preview" is everything before the waitlist window.** The gallery at `/pass` is already
     live (since Part 4), with minting closed. The words **"preview week"** are retired: they
     stood for two things (the gallery going up, and the gate going on).
  2. **"Early access starts"** names the day the game starts over for the Founding Pass (planned
     Sat 2026-11-21, a week before the waitlist window; Part 10 sets it). That day, as Part 10
     already planned: a fresh `FoundingPass` and game are deployed, the hosted database's pass
     and Sneaker records are reset (the waitlist stays), and `EARLY_ACCESS_REQUIRED` goes on.
  3. **The test period ends at early access, and nothing carries over.** Until then, anyone can
     try the app with a free normal Sneaker on the current contracts. Sneakers and STRIDE from
     the test period stay on the old contracts. So during early access only founders play: the
     gate stops new Sneakers, and the restart means no older Sneaker is on the new contracts.
     Between early access starting and the waitlist window, no passes exist, so nobody outside
     the team can play that week.
  4. **Say where the app stands, live.** `/pass`'s schedule panel has an "The app" line from
     `GET /v1/pass/collection`'s `isEarlyAccessGateOn`: open to anyone (with the planned early
     access date, `plannedEarlyAccessStartDateText` in `website/src/content/founding-pass.ts`),
     founders only (with the opening day), or nothing once it's open to all. The help page's
     "How it works" gains an **Early access** step, and the app's gate screen says that
     test-period Sneakers don't carry over.
  5. **The pass and the Founder Sneaker are two things**, and the copy says so where people ask:
     a question on `/pass` and an answer on `/help` (`pass-or-sneaker`).
  6. **Two numbers, explained.** `#0137` is the design (which of the 1,000), and "Founder 42" is
     the mint order. The reveal says it in one line, and `/pass` and `/help` (`two-numbers`)
     answer it. The on-chain card is unchanged (the designs are frozen).
  7. **The email must match the waitlist.** The email step says to use the email you joined the
     waitlist with, because in the window the API checks that email.
- **Why:** the early-access flow has three dates and two NFTs, and someone who tried the app in
  the test period would otherwise find their Sneaker gone with no reason given. Reading the
  app's state from the API, not from a planned date, keeps the panel right if the switch moves.
- **Trade-off:** one more planned date to keep in sync (Part 10). The help page now says the
  test period's Sneakers don't carry over, which only holds if Part 10's restart happens.
- **Revisit when:** Part 10 sets the dates, or early access starts without a restart.

## D-050 — The website, read as a first-time visitor

Made 2026-10-09, after Yash read `/pass` and the landing page as a newcomer would. It reorders
and trims D-044's `/pass`, D-045's "Get ready" and the landing page (`landing-page-prompt.md`
§5). Nothing about the contracts, the API, the schedule or the designs changes.

- **Decision:**
  1. **`/pass` shows the collection early.** The order is: a short hero (headline, one sentence,
     and a small status panel: the phase, a countdown or the minted count, the next date, and one
     main button for the phase), then "Get ready" when it's useful (point 2), then the
     collection, then How it works with the dates, the waitlist, and Questions. The "Find the
     one" section is gone: search by number, "Surprise me" and the quiz sit in the collection's
     toolbar, and every "Browse" button lands on the grid.
  2. **"Get ready" shows from 24 hours before the waitlist window**, through the open mint, and
     always for a founder (their pass). Before that it had an email form whose check expires in
     6 hours, beside the waitlist's own email form. So in preview the page has one email field
     (the waitlist), and Turnstile doesn't load for people who only browse. The mint dialog keeps
     both steps for anyone who mints without getting ready.
  3. **The grid only grows when asked.** "Show more" adds 48 cards and says how many show. It no
     longer loads cards on its own as the page scrolls, which pushed everything below it (the
     waitlist, Questions, the footer) out of reach and broke in-page links.
  4. **Dates read in the visitor's time, without an offset:** "Sat 28 Nov, 8:00 pm", with the
     zone named once ("Times are in your time zone") and in the element's tooltip. The static
     HTML still says UTC until the browser takes over.
  5. **The schedule's four steps move to How it works**, beside the four user steps, together
     with D-049's "The app" line. The hero keeps only the next date.
  6. **Say "one of one" where it matters, not everywhere.** The page's own copy stops repeating
     it; the detail sheet, the pass page, the mint, the reveal and the founder panel keep it.
     The promise line (brief §9) stays on every surface for one pass, the mint and Questions,
     and leaves the two section intros, which say "Free".
  7. **`/pass` Questions show the six a newcomer asks first**; the other eleven stay on the page
     behind "More questions", so `/help` and the chatbot's knowledge don't change.
  8. **A short header:** Founding Pass, The game (the landing page's How it works) and Help, on
     every page. Seven links wrapped to two rows on a phone, and on `/pass` they pointed at the
     landing page's sections.
  9. **The landing page leads with what a visitor can do:** the hero's buttons are **Get your
     Founding Pass** and **Get the app** (Android). "See the contracts" leaves the hero. How it
     works is a compact grid of the six steps with smaller phones. The rules, fair play and
     privacy, the contracts and Why Monad become one tabbed **Under the hood** section after the
     waitlist; the old anchors (`#rules`, `#fair-play`, `#on-chain`, `#why-monad`) open their
     tab.
  10. **Small things everywhere:** every button gets a pointer cursor and a hover state (Tailwind
      v4's base styles set `cursor: default`); an open sheet keeps the scrollbar's space
      (`scrollbar-gutter: stable`), so the page doesn't shift; the sort control is our own menu;
      "Ask a question" is an icon on a phone; `FoundingPass` joins the contract list and the
      footer.
- **Why:** on a phone the first Sneaker was about four screens down, below a schedule, an app
  note and two email forms. Someone who came to see 1,000 designs should see them first, and
  each fact should be said once, in the place a newcomer looks for it.
- **Trade-off:** the dates sit lower on `/pass` (the next one stays in the hero). Tabs hide three
  of the four "under the hood" parts until pressed. A help screenshot of Get ready shows the old
  page, though the steps are the same.
- **Revisit when:** minting opens (check the hero and Get ready in the live phases), or a
  visitor says they couldn't find the schedule or the contracts.
- **Changed in part (2026-10-18):** by D-058, "Get ready" shows from 24 hours before the early
  hour (19:00 IST on 11-28), not the waitlist window.

## D-051 — Search engine fixes from a Screaming Frog crawl

Made 2026-10-11, from a Screaming Frog SEO Spider crawl of `https://stridemon.xyz` (the free
version, which stops at 500 URLs) and a link-graph check of the whole static build.

- **Decision:**
  1. **Every pass page is linked from the site.** 571 of the 1,000 `/pass/[number]` pages had no
     link at all (only the sitemap knew them: the gallery draws 48 cards until "Show more", and
     each pass page links three similar ones), and the rest sat up to 10 clicks deep. A plain
     index, **`/pass/all`** ("All 1,000 passes", each number and name as a link, in groups of 100),
     is linked from the gallery under "Show more", from every pass page and from the sitemap, so
     any pass is three clicks from the home page. Each pass page also links the **previous and
     next** pass (#0001 and #1000 wrap round).
  2. **Every page sets its whole share card** through `buildPageMetadata`
     (`website/src/lib/build-page-metadata.ts`). Next merges metadata shallowly, so `/help` had no
     share image, `/privacy` and `/delete-account` shared the home page's title and URL, and the
     pass pages lost `og:site_name`, `og:type` and `og:locale`.
  3. **A pass page's title leads with the collection:** "Founding Pass #0137: Rose Hiker Night"
     (at most 54 characters with " | StrideMon"). "#0137 Rose Hiker Night" alone was under 30.
  4. **Our own 404 page** (`app/not-found.tsx`), with one title, no canonical (Next's pointed at
     the home page) and links to the home page, the gallery and help.
  5. **Headlines read as words:** the hero `<h1>`s keep a space between their block lines, so
     crawlers and screen readers get "Walk. Earn. Upgrade.", not "Walk.Earn.Upgrade.".
  6. **Security headers** on every response (`vercel.json`): `X-Content-Type-Options: nosniff`,
     `Referrer-Policy: strict-origin-when-cross-origin` and `X-Frame-Options: SAMEORIGIN`. Added
     2026-10-12: a **Content-Security-Policy** that limits only what nothing on the site needs:
     `frame-ancestors 'self'; object-src 'none'; base-uri 'self'; form-action 'self';
     upgrade-insecure-requests`. Every form submits through JavaScript, so `form-action` blocks
     none of them.
- **Why:** search engines find and rank pages by their links. An orphan page is crawled late
  and counts for little, and the pass pages are the ones people share.
- **Trade-off:** one more page to keep. The CSP doesn't restrict scripts, connections or
  images yet: the wallet (AppKit, with WalletConnect's relay and its iframe), Turnstile, Vercel
  Analytics, Fontshare and Next's inline scripts (a static export can't use nonces) need an
  allowlist tested on a working mint, and a wrong one breaks the mint. The long screenshot `alt` texts and the repeated section `<h2>`s
  on pass pages (How it works, the waitlist) stay: Screaming Frog flags them, but they're right.
  The "403" links to MonadVision are its bot protection, not broken links.
- **Revisit when:** minting opens (crawl again with the live state), or when the mint can be
  tested end to end (`pass:local-stack --phase waitlistWindow`): then add `script-src`,
  `connect-src`, `img-src` and `frame-src` as `Content-Security-Policy-Report-Only` first.

## D-052 — The demo video gets music, and "Get the app" opens the Expo build page

Made 2026-10-13, from Yash's feedback on the live site.

- **Decision:**
  1. **The landing page's demo video has music:** "Fresh" by Bransboynd
     (<https://pixabay.com/music/soft-house-fresh-457883/>), soft house at about 114 BPM, under the
     Pixabay Content License (free for commercial use, no attribution). `cut-demo-video.sh` starts it
     6.4 s in, so its beat comes in just before the Walk chapter and its drop lands on Earn, fades it
     in and out, levels it to -16 LUFS and muxes it as 128 kbps AAC. The video frames are unchanged
     (2.5 MB, was 1.6 MB). The player is no longer muted: sound starts only from the visitor's press
     on play, never on its own, and a sound button (or M) sits in the bottom corner beside the
     chapter bars. A browser that refuses sound still plays the picture, muted. The walk loop in How
     it works stays silent.
  2. **Every "Get the app" button opens the `demo` build's page on expo.dev**
     (`appInstallPageUrl` in `website/src/content/site.ts`, build `f62511df`, 2026-10-12), not the
     bare `.apk`: a visitor sees what they're installing, with an Install button on a phone and a
     QR code on a laptop. The hero says "App review is in progress" under its buttons until the
     Google Play listing is live, and the help's Get the app answer says the same.
- **Why:** a silent demo felt unfinished, and nobody trusts a link that starts downloading a file.
- **Trade-off:** EAS build pages expire with the free plan's artifacts (about 30 days), and a new
  `demo` build gets a new page, so the link is updated by hand with each build until Google Play
  replaces it. The music adds 0.9 MB, loaded only after a press on play.

## D-053 — StrideMon on Instagram, from `social/instagram/`

Made 2026-10-16, when Yash asked for Instagram launch assets.

- **Decision:**
  1. **Same setup as X (D-036):** Markdown post files with `approved:` as the only gate, the same
     `voice.md`, facts and disclaimers, and posting by hand. Claude drafts and never posts,
     schedules, logs in or connects a tool. Site links carry `?source=ig-stridemon` (D-037).
  2. **`social/instagram/`** holds the profile copy, the first nine feed posts (in posting order,
     so the grid alternates dark and light), seven Stories for five Highlights, and `design/`: one
     HTML page per image, a shared `instagram.css`, and `render.sh`, which screenshots each page at
     the size in its `<meta name="canvas">` with headless Chrome into the gitignored
     `social/media/instagram/`. The art is read from `website/public/`, `launch-video/public/` and
     `packages/contracts/art/`, never copied, and inlined so IBM Plex Mono reaches the contract's
     own SVGs.
  3. **Sizes:** feed images are 1080 × 1350 (4:5) with nothing that matters within 84 px of a side,
     because the profile grid shows a 3:4 crop. Stories, Reel covers and Highlight covers are
     1080 × 1920. Reels reuse the films' 9:16 cuts in `launch-video/out/`.
  4. **Hashtags:** up to three plain topical ones a post (Instagram's cap is five), never
     crypto-farming ones. **No Boost or ads.**
- **Why:** Instagram reaches people who walk and run, not only crypto readers, and the films and
  art already exist. HTML pages share the X posters' look and rebuild in one command.
- **Trade-off:** captions can't hold links, so everything goes through the bio link and Story link
  stickers. The films' Pixabay music is Content ID registered, so Instagram may flag a Reel; the
  answer is the licence, and both films read muted. The planned mint dates are baked into four
  images, so a date change means a re-render.
- **Revisit when:** the mint dates are final (Part 10), or the Android app is on Google Play.

## D-054 — The Product Hunt launch, from `social/product-hunt/`

Made 2026-10-16, when Yash asked for help launching StrideMon on Product Hunt.

- **Decision:**
  1. **Same rules as X and Instagram (D-036, D-053):** `social/product-hunt/README.md` holds every
     form field ready to paste, the first comment, answers for the comments and the launch-day
     checks, under `voice.md`. `approved:` is the only gate. Claude drafts and never submits,
     schedules, logs in or comments.
  2. **The gallery** is six 1270 × 760 HTML pages in `social/product-hunt/design/`. They reuse
     `instagram.css` and `inline-svg.js`, and `render.sh` screenshots them with headless Chrome
     into the gitignored `social/media/product-hunt/`, with a 240 × 240 thumbnail from the app
     icon. Phone screens and art are read from `website/public/` and `launch-video/public/`, never
     copied.
  3. **Links stay plain** (`https://stridemon.xyz`): Product Hunt rejects tracking links, so no
     `?source=`.
  4. **Proposed date: Tue 2026-12-01, 12:01 AM PST**, the day after the open mint opens (Yash
     decides). The description holds on any date; the first comment has a variant for launching
     before early access starts.
- **Why:** a product gets one real launch, so it should land when a visitor can mint a pass and
  play the same day, with nothing reset afterwards (D-049). Before then, the only actions are a
  waitlist and a demo build whose progress resets on 21 November.
- **Trade-off:** six more weeks without the launch's reach. On launch day every mint needs an email
  code, and Brevo's free plan sends 300 a day.
- **Revisit when:** Part 10 sets the final dates, or the Android app is on Google Play.

## D-055 — The waitlist's joined card and its X share page

Made 2026-10-16, when Yash asked for a proper card after joining the waitlist, with a way to share
it on X.

- **Decision:**
  1. **Joining shows a card, not a line.** The form gives way to a light ticket in the Founding
     Pass card's look (hairlines, "+" marks, mono labels): three passes' shoes, "You're on the
     list.", the email that was entered (so a typo shows) and when the waitlist window opens, in
     the visitor's time. Under it: the one-email promise, **Post on X**, **Heart your favourites**
     (`/pass#gallery`) and **Use a different email**, which brings the form back with the email
     filled in. A new and a repeat email still see the same thing (D-037).
  2. **Post on X opens X's composer in a new tab** (`x.com/intent/post`) with the post written
     out under `social/voice.md`: what StrideMon is in one line, the waitlist's 48 hours, one
     `@stridemon` tag, no hashtags, no emoji and no STRIDE amount. Nothing is posted for anyone:
     they edit and send it themselves.
  3. **The shared link is a page of its own, `/waitlist`**, so X shows a card made for it: its
     own 1200 × 630 Open Graph image ("Join the waitlist", four shoes, the 48 hours). The page is
     the waitlist section as its `<h1>`, then the Founding Pass section and How it works, so a
     friend who taps the card can join without scrolling a whole landing page. It's in the
     sitemap. The link carries `?source=x-waitlist`, which the form stores (D-037), so we can count
     sign-ups that came from a shared post.
  4. **No image to download.** X's composer can't take an attachment from a link, so a picture
     would have to be saved and attached by hand; the link's card does the same job in one press.
- **Why:** the moment after someone joins is when they're most likely to tell a friend, and a bare
  line gave them nothing to do. The site is a static export (D-035), so a card per person (their
  name, a place in the queue) would need a server, and the API never says whether an email is new.
- **Trade-off:** one more page and share image to keep in step with the waitlist copy. Every
  shared card is the same picture. After the waitlist window opens, old posts still say "Join the
  waitlist", and the page shows the closed state (`WaitlistPhaseGate`).
- **Revisit when:** the waitlist window opens (retire or repoint the page), or `x-waitlist`
  sign-ups show the share isn't used.
- **Changed in part (2026-10-18):** by D-056, the card grows: the visitor's own invite link with
  Copy, WhatsApp, Telegram, X and the phone's share sheet (each link with its own `source`), the
  early hour's line, and the confirmed-friends count once the email is checked. The one-email
  promise becomes D-056's. Still the same card for a new and a repeat email.
- **Changed in part (2026-10-19):** by D-059, the card loses the shoes, Head start, the promise and
  the Heart your favourites and See your invites buttons, and Use a different email becomes
  **Change** beside the email. The share image keeps its shoes. The browser now remembers a
  sign-up, so coming back shows the card instead of the form.

## D-056 — The waitlist's invite loop: a link per sign-up, confirmed friends, one sign-up per inbox

Made 2026-10-18 in Part 0 of the referral build ([`waitlist-referral-prompt.md`](waitlist-referral-prompt.md)),
after Yash said yes to the waitlist growth plan's referral (`waitlist-growth-plan.md` §4.1, §8.1).
The reward itself, the early hour, is D-058. Checking an email with Google, and the email budget,
are D-057.

- **Decision:**
  1. **Every sign-up has an invite link that never changes:**
     `https://stridemon.xyz/waitlist?ref=<inviteCode>`.
     - The invite code is 8 characters of Crockford base32, cut from
       HMAC-SHA256(`canonicalEmail`, `WAITLIST_INVITE_CODE_SECRET`). The same email always gets
       the same code, so joining still answers a new and a repeat email alike (D-037), now with
       `{ status: 'joined', inviteUrl }`.
     - A `?ref=` value is read case-insensitively, with Crockford's look-alikes (I and L → 1,
       O → 0). Anything else is ignored, never refused.
     - The secret must not change during the campaign: a new one changes every link.
     - Codes aren't forced unique. At 10,000 sign-ups the chance that any two share one is about
       1 in 20,000, and a shared code would only merge two people's counts.
  2. **Who counts.** A friend counts for you when their sign-up:
     - came through your link (the first link they joined through wins, joining again never
       changes it, and your own code is ignored);
     - checked its email, with Google or a code, before the early hour starts (D-058);
     - is a different inbox from yours.

     One inbox counts once. **3 confirmed friends** give you the early hour (Yash, 2026-10-18).
  3. **One sign-up per inbox.** Emails are compared folded:
     - trimmed and lowercased, as now;
     - a `+tag` dropped, on every domain (only when something comes before the `+`);
     - dots dropped for `gmail.com` and `googlemail.com`, and `googlemail.com` becomes `gmail.com`.

     `waitlistSignups` stores this `canonicalEmail` under a unique index, so `j.ohn@gmail.com`
     after `john@gmail.com` is a repeat. The stored `email` stays as typed (lowercased), and every
     email goes to it. The index is partial (`canonicalEmail` exists), because old sign-ups have
     no such field until a one-off backfill fills them; the backfill stops on two old sign-ups
     that fold to one inbox, so Yash decides. The mint's one-pass-per-email rule and the
     window's waitlist check compare folded emails too (Part 4, D-058), or one Gmail inbox could
     mint once per dot.
  4. **Temporary inboxes are refused** at joining, with a plain message. The list is
     [`disposable-email-domains`](https://github.com/disposable-email-domains/disposable-email-domains)
     (CC0), vendored into the API with a script that refreshes it.
  5. **Confirming is optional and never blocks anything.** It's what makes a friend count. A
     sign-up is confirmed when it joins with an email proof for the same inbox, or when its owner
     opens their invites with one. `emailConfirmedAt` and `emailConfirmedBy` (`google` or `code`)
     are set once: the first confirmation stays.
  6. **Progress only to its owner.** `stridemon.xyz/waitlist/invites` shows the link, the count of
     confirmed friends and whether you have the early hour, only after the email is checked. The
     check gives a 30-day **invites token** (HS256, signed with `EMAIL_PROOF_SECRET` under its own
     audience), so a return visit costs no email. An invite code alone shows nothing. No
     leaderboard, no place in a line, no per-person numbers in public. The one public number is
     the sign-up count (`GET /v1/waitlist/count`), which the site shows only from 1,000.
  7. **Turnstile on joining** (action `join-waitlist`), D-037's "free next step": a count and a
     reward draw scripts. Turnstile now does the bot work, and many Indian mobile users share one
     IP (carrier NAT), so the per-IP limit on joining rises from 5 to 30 a minute. The honeypot
     stays.
  8. **The promise** "One email, when the waitlist window opens, and nothing else" becomes "We
     email you a code only when you ask for one, and once when the waitlist window opens. Nothing
     else." There's no welcome email: the card and the invites page carry the link. People already
     on the list get nothing new unless they ask on the site.
  9. **Words.** Invite, confirmed friends and **the early hour** (Yash kept the plain words,
     2026-10-18). Never whitelist, WL, allowlist, points, rank, or anything about value
     (`social/voice.md`). The copy says plainly that the waitlist doesn't promise a pass: 1,000
     passes, first come, first served, and at most 250 in the early hour.
  10. **Not in this build:** partner early-hour spots (plan §8.6, open), prizes, ads, another
      email provider (everything stays behind `EmailSender`, so it's a swap), a leaderboard, new
      analytics.
- **Why:** the waitlist needs about 244 sign-ups a day to reach 10,000 by the window
  (`waitlist-growth-plan.md` §1), and posting alone won't do it. The reward is the scarce thing
  itself (first pick of the 1,000), it costs nothing, it's true, and nobody is pushed back. A
  link computed from the email keeps D-037's promise that the form never reveals who's on the
  list, and counting only confirmed, folded, non-temporary inboxes keeps one person from
  inviting themselves.
- **Trade-off:** some people use Gmail dots or `+tags` on purpose and can't join twice with them.
  A friend who never confirms never counts, so some real invites are lost. Joining now needs
  Turnstile, so a page opened before the deploy fails its first join until it's reloaded. The
  invite secret is one more thing that must never change mid-campaign.
- **Revisit when:** partner spots are decided (plan §8.6), junk sign-ups get past Turnstile, the
  email provider changes after 11-03, or the waitlist window opens (the links stop mattering).
- **Changed in part (2026-10-19):** by D-059, the waitlist form reads the stored invites token
  too, so someone coming back to it sees their card and count without checking their email again.
- **Changed in part (2026-10-19):** by D-060, the website no longer joins anyone without a checked
  email, so confirming isn't optional there any more (point 5); the API still accepts it. The
  no-promise line (point 9) moves to the help answer the card links.

## D-057 — Checking an email with Google, and a daily budget for code emails

Made 2026-10-18 in Part 0 of the referral build, with D-056.

- **Decision:**
  1. **Google is a second way to check an email.** `POST /v1/pass/email-google` takes the ID
     token from the website's Sign in with Google button and checks it on the server, with
     `jose` against Google's published keys (cached): the signature, the issuer
     (`accounts.google.com` or `https://accounts.google.com`), our `GOOGLE_CLIENT_ID` as the
     audience, not expired, and `email_verified: true`. It answers the same **email proof** as
     `/v1/pass/email-verify` (6 hours, D-043), so everything that takes a proof takes one from
     Google too: joining, the invites page and the mint (D-058).
  2. **Only the email is kept,** with `emailConfirmedBy: 'google'`. Never the name, photo or
     Google account id (`sub`).
  3. **The Google client** is a free Web application client in a Google Cloud project of Yash's,
     "StrideMon": External, published, default scopes only (openid, email, profile), and no logo,
     so Google doesn't review it. Its origins are `https://stridemon.xyz`, `http://localhost` and
     `http://localhost:3000`. The client ID is public. `GOOGLE_CLIENT_ID` is optional: without it
     the route answers `GOOGLE_SIGN_IN_UNAVAILABLE` and the website hides the button.
  4. **Codes always work too.** Google refuses its sign-in inside apps' built-in browsers
     (Instagram, Facebook, LinkedIn, Android WebViews), all channels in the plan. There the site
     shows one line instead of the button, and the email-and-code path. A local stack reached
     through a tunnel has codes only too: a tunnel's random hostname can't be a Google origin.
  5. **Sending a code takes a purpose,** `mint` (the default, so today's site keeps working) or
     `waitlist`. The purpose picks the email's words, the Turnstile action (`send-code` or
     `send-waitlist-code`) and whether the daily limit applies. The proof is the same either way.
     The waitlist code's words: "Your code is 123456. Type it on stridemon.xyz to confirm your
     email for the StrideMon waitlist. It works for 10 minutes. Didn't ask for it? Ignore this
     email."
  6. **The email budget.** Yash stays on Brevo's free plan (300 emails a day) at least until the
     Metropolis results on 11-03.
     - The API counts every email it sends, per UTC day, in `emailDailyCounts`: mint codes,
       waitlist codes and window emails. Each send takes its place in the count atomically before
       it goes, and a send Brevo refuses gives it back.
     - A waitlist code goes only while the day's count is under
       `WAITLIST_CODE_DAILY_EMAIL_LIMIT` (**250**, Yash, 2026-10-18). Past it the route answers
       `EMAIL_DAILY_LIMIT_REACHED` 429 with `retryAfterSeconds` until 00:00 UTC (05:30 IST), and
       the page offers Google, or tomorrow.
     - Mint codes and window emails are never refused by our count. Brevo's own refusal is
       already handled (`EMAIL_SEND_FAILED`).
- **Why:** email is the tight resource. A code for every sign-up or every minter would hit 300 a
  day at a few hundred people, and most of the audience is on Android with a Google account,
  where Google checks an email without sending one. Google can't be the only way, so the code
  path stays. Counting our own sends lets the API stop waitlist codes before Brevo stops
  everything, mint codes included.
- **Trade-off:** the site loads Google's script (only when an email form is on screen), and the
  privacy page has to say that Google sees a sign-in to StrideMon. Two ways to check an email to
  keep working. With 250 of 300 for waitlist codes, a busy day leaves only 50 for mint codes and
  tests until 00:00 UTC.
- **Revisit when:** the email provider changes after 11-03 (raise or drop the limit), or Google
  refuses or changes its sign-in for the site.
- **Changed in part (2026-10-19):** by D-060, every email join on the website takes a waitlist code,
  so the 250-a-day budget also caps email sign-ups. Google sign-ups cost none.

## D-058 — The early hour on mint night

Made 2026-10-18 in Part 0 of the referral build. It's built in Part 4, before early access starts
(Sat 11-21), so Founding Pass Part 9's rehearsal includes it.

- **Decision:**
  1. **The early hour is a schedule phase,** `earlyHour`, between `preview` and
     `waitlistWindow`. It starts `PASS_EARLY_HOUR_MINUTES` (60) before the window: **Sat
     2026-11-28, 13:30 to 14:30 UTC (19:00 to 20:00 IST)**.
  2. **Who mints in it:** an email proof whose inbox joined the waitlist before the early hour
     started and has 3 confirmed friends (D-056), counted as of the early hour's start. The
     refusals each carry `waitlistWindowStartsAt`: `PASS_EARLY_HOUR_ONLY` 403 (not enough
     friends, or joined too late) and `PASS_EARLY_HOUR_FULL` 409 (the limit is reached).
  3. **At most `PASS_EARLY_HOUR_MINT_LIMIT` (250) passes** mint in it (Yash, 2026-10-18), so the
     other 750 or more wait for the window. The limit is exact, decided by the database (never a
     read-then-check), and a mint that fails gives its place back. Part 4 picks how (an atomic
     counter, or a slot number under a unique partial index the way designs are held) and writes
     it here.
  4. **Nobody's 48 hours change.** At 20:00 IST the waitlist window opens for everyone on the
     list exactly as D-043 has it, including people with the early hour who didn't mint in it.
  5. **The app and the website go by the same phase,** and the early-access gate stays on in it.
     An app build without `earlyHour` might fail to read the schedule for that hour: Part 4 checks
     how the app parses it and writes here which fix it takes (a new build before 11-21, or the
     app reading an unknown phase as `preview`).
  6. **The window email stays one email** (D-043). `pass:send-waitlist-emails --early-hour`, run
     before 19:00 IST on 11-28, emails only the sign-ups with the early hour, worded with both
     times: "Your early hour starts Sat 28 Nov, 19:00 IST. If you don't mint then, your waitlist
     window is 20:00 IST to Mon 30 Nov, 20:00 IST." Everyone else gets today's email from the
     normal run. Still at most one per address (`windowEmailSentAt`).
  7. **Google wherever an email is checked** (D-057): "Get ready" and the mint dialog's email
     step get Continue with Google beside Send code (codes only in apps' own browsers). "Get
     ready" shows from 24 hours before the early hour.
- **Why:** without a limit, the people with the early hour could mint all 1,000 before the window
  opens, and "nobody's window changes" would be true but empty. A stated limit keeps most of the
  collection for the window, and the copy says the number. Google on the mint's email step means
  most people need no code email on the busiest night.
- **Trade-off:** one more phase that the API, the website and the app must agree on, and a code
  path that runs for one hour a year, so the rehearsal must cover it. It reverses part of brief
  §15 (one group goes first, though nobody goes later than before).
- **Revisit when:** Part 4 builds it, partner spots are decided (plan §8.6), or Part 10 moves the
  window.

## D-059 — The waitlist, simplified and remembered

Made 2026-10-19. Yash asked for a waitlist simple enough that a visitor doesn't have to think,
approved the before-and-after review the same day, and asked that a Google join be remembered in
the same browser, that the share buttons show each app's own icon, and that the YouTube channel be
linked.

- **Decision:**
  1. **One job per screen.** The form gets an email on the list: Continue with Google first, the
     email box second. The joined card asks you to share your link. `/waitlist/invites` shows
     where you stand: the count first, then the rule and the link. In the early hour the news,
     the reminder and the night's steps come first, and sharing moves to the bottom.
  2. **The form.**
     - No phone question (D-037's optional platform). The API still accepts it.
     - A plain "or" between Google and the email box, which keeps a label for screen readers.
     - The promise keeps D-056's sentence and "nothing is for sale", with a Privacy link in place
       of "Ask and we'll delete your email". The STRIDE line goes: the form shows no amount, and
       the footer says it.
     - The section's intro says what and when. The early hour waits until after joining, where
       someone can act on it, and "Follow along on X" goes (the header has X).
  3. **The joined card.**
     - The ticket keeps the Founding Pass card's look, without the shoes or Head start: Joined,
       "You're on the list.", the email with **Change** (it replaces Use a different email), and
       when the window opens.
     - Under it, one invite block: "Open your window an hour early", one paragraph (the rule, the
       250 cap and "the waitlist doesn't promise a pass", D-056 point 9), the link in a field with
       Copy, then the share icons. The count shows once the email is checked.
     - The card scrolls into view after joining, so the link is on screen.
  4. **Confirm only when it counts.** After an email join, "Confirm your email" shows only to
     someone who joined through a friend's link: the code is what makes them count for that
     friend (D-056 point 5). Everyone else gets a quiet link to their invites page. The rules'
     details sit behind "How invites count" (`/help#invites`).
  5. **Gone from the card:** the promise (the form said it a moment before), Heart your favourites
     (wherever the form is, the passes are on the same page), the See your invites pill, "No
     confirmed friends yet", "Friends who confirm before … count" (that's the early hour's start,
     said in help) and the separate no-promise line (now in the rule).
  6. **Share icons in each app's own colours.** WhatsApp (green), Telegram (blue), X (black) and
     More (the phone's share sheet, muted): a 44 px circle each, with the name under it, wherever
     the site shares (the waitlist, a pass's details and after a mint). Each link keeps its own
     `source` (D-056). The two app greens and blues are the only colours outside the site's
     palette, because people find these apps by colour. The glyphs are Simple Icons' (CC0).
  7. **The browser remembers a sign-up.** Joining saves the email, the invite link and whether it
     came through a friend's link in `localStorage` (`stridemon:waitlist-joined`), beside the
     30-day invites token that a Google join or a code already saved (D-056 point 6). Coming back
     to any page with the form shows the joined card, with the live count while the token lasts
     and without it otherwise: no Google tap and no code. A token for another email wins, since
     it was checked. **Change** and Use a different email forget both. Nothing new reaches the
     API.
  8. **YouTube.** The channel, `youtube.com/@stridemon`, joins X in the header (from tablet width:
     a phone's header has room for one icon), in the footer and in the structured data's
     `sameAs`.
- **Why:** on a phone the joined card was 1,400 px tall, with nine actions and three dark
  buttons, and the invite link sat a screen and a half below "You're on the list." Pre-launch
  pages that grew fast asked for one thing, then showed the invite (Harry's, Robinhood). What
  shows first reads as important, and people read about a fifth of a page's words (NN/g). A
  Google join was already kept for 30 days, but only `/waitlist/invites` read it, so someone
  coming back saw the form again and had to tap Google.
- **Trade-off:** new sign-ups no longer say which phone they use. Two app colours on a quiet
  site. On a shared computer, the next person on that browser sees the last sign-up's email and
  link, as the invites page already showed; Change forgets it. The early hour's fine print now
  takes a tap.
- **Revisit when:** the share links' sources show a channel nobody uses, iOS planning needs the
  phone count, or the waitlist window opens (the form gives way, D-043).
- **Changed in part (2026-10-19):** by D-060, joining checks the email, so the card's Confirm block
  goes; the ticket loses its "+" marks and says when the window opens in one sentence; and the
  invite rule is one line.

## D-060 — Joining the waitlist checks the email

Made 2026-10-19, when Yash looked at D-059's build: no joining without a checked email, "either by
email with OTP, or by Google, that's it". Asked whether to let people join anyway once the day's
codes run out, he chose strictly no. He also asked for simpler words on the card.

- **Decision:**
  1. **The website joins only with a checked email.** Continue with Google, or an email and its
     6-digit `waitlist` code (D-057): Join the waitlist sends the code, the next step checks it,
     and the join goes with the email proof. Every new sign-up is confirmed, and counts for
     whoever invited it, the moment it joins, and the card shows the count at once, as after
     Google.
  2. **Strictly.** When today's waitlist codes are used up (`EMAIL_DAILY_LIMIT_REACHED`) or a code
     can't be sent, nobody joins by email: the page offers Continue with Google, or 05:30 IST. In
     apps' own browsers, where Google doesn't work, that means opening the page in Chrome or
     Safari, or waiting.
  3. **The API doesn't change.** `POST /v1/waitlist` still takes a join without a proof, so the
     live site's old form keeps working until the website is redeployed, and nothing needs an API
     deploy. A join without a proof still never counts as a friend (D-056 point 2). Making the
     API refuse one is a follow-up, deployed together with the website.
  4. **Every email join costs one code** from the 250-a-day waitlist budget (D-057), so email
     sign-ups top out near 250 a day. Google sign-ups cost none. The growth plan's 244 a day works
     only while most people use Google: watch `emailDailyCounts`.
  5. **The card's words** (changes D-059 points 3 and 4):
     - no "+" marks on the ticket;
     - one sentence for the window, "Your window to mint opens **Sat 28 Nov, 8:00 pm**.", with the
       time in the medium weight (the site has no bold);
     - one line for the invite: "Invite friends. When 3 join with your link, your window opens an
       hour early: Sat 28 Nov, 7:00 pm. Only 250 passes go in that hour." It needs no "confirm
       their email" (joining does it) and shows no count of spots left: the 250 caps passes
       minted in that hour, not people, and nothing mints before 28 Nov, so a falling number
       would be invented;
     - "the waitlist doesn't promise a pass" (D-056 point 9) lives in the help answer the card
       links ("How invites count"), with the 1,000 and first come, first served;
     - "Confirm your email to count for your friend" goes. A sign-up from before this change, or
       one whose 30-day token ran out, sees a link to its invites page.
  6. **The promise:** "We email you a code to check it's you, and once when the waitlist window
     opens. Nothing else, and nothing is for sale."
- **Why:** one rule anyone can say in a line ("3 friends join"), no second step after joining, no
  unconfirmed sign-ups whose invites never count, and the window's email goes only to inboxes
  that were checked.
- **Trade-off:** one more step for email users, and a code that lands in spam stops them. Email
  joins are capped by the day's codes, so on a busy day someone in Instagram's or LinkedIn's
  browser can't join until 05:30 IST unless they open the page in Chrome. A direct API call could
  still join without a proof until the API refuses one.
- **Revisit when:** `EMAIL_DAILY_LIMIT_REACHED` shows up on joining (a bigger email plan, D-057),
  or the API is next deployed (make it refuse a join without a proof).

## D-061 — Answer engines: llms.txt, Markdown pages, AI crawlers and IndexNow

Made 2026-10-19, when Yash asked for the SEO the site was missing beyond D-051: answer engine
optimisation (AEO, getting quoted by ChatGPT, Perplexity, Claude, Gemini and Google's AI
Overviews) and `llms.txt`.

What the sources say, in short. Google: AI Overviews and AI Mode need nothing special, no
`llms.txt` and no special schema, only pages that are crawlable, indexed, in text and well linked
(developers.google.com/search/docs/appearance/ai-features). OpenAI, Anthropic and Perplexity each
run a **search** crawler (`OAI-SearchBot`, `Claude-SearchBot`, `PerplexityBot`), a **user**
fetcher (`ChatGPT-User`, `Claude-User`, `Perplexity-User`) and, except Perplexity, a **training**
crawler (`GPTBot`, `ClaudeBot`); robots.txt controls each one separately. AI crawlers don't run
JavaScript, and the static export already puts every word in the HTML (checked in `out/`).
`llms.txt` (llmstxt.org) is a proposal: cheap, harmless, read by some agents and tools, and not
shown to change citations.

- **Decision:**
  1. **`/llms.txt`** in the llmstxt.org shape: an H1, a one-line summary, the key facts (testnet,
     STRIDE has no value, Android only, the Founding Pass dates, who builds it, last updated), then
     link lists to the Markdown pages, with the rest under `## Optional`. **`/llms-full.txt`** is
     the home page, the Founding Pass page and the whole help in one file.
  2. **Markdown twins of the pages that answer questions:** `/index.md` (home), `/pass.md`,
     `/pass/all.md` (all 1,000 passes with their layers, as a table) and `/help.md`. Each page links
     its twin with `<link rel="alternate" type="text/markdown">`, and each twin sends
     `Link: <page>; rel="canonical"` (`vercel.json`), so search engines index the HTML page, not
     the copy. No twin for each of the 1,000 pass pages: `/pass/all.md` has them all.
  3. **One source.** Every word in those files comes from `src/content/` (the same data the pages
     render), built at `next build` by route handlers. Only the few lines that exist nowhere else
     (the summary, the page notes) live in `src/content/llms.ts`.
  4. **robots.txt names the AI crawlers and allows them all**, training ones included: the site is
     public marketing and help, and a model that already knows StrideMon is the point. A named
     group replaces `*` for that bot, so each group says `Allow: /`. `/waitlist/invites` stays
     `noindex` (not `Disallow`, which would hide the `noindex`).
  5. **Structured data says more, and only what the page shows:** one `@id` graph (the
     Organization with its founder, the WebSite, the VideoGame, with `dateModified`), `FAQPage` on
     `/pass` and `/help` built from their own questions, and `BreadcrumbList` on `/pass/all` and the
     1,000 pass pages.
  6. **Freshness:** `contentUpdatedOn` in `src/content/site.ts` is the date the main pages last
     changed in substance. It feeds the sitemap's `lastmod` (main pages only), `dateModified` and
     `llms.txt`. Change it by hand with real copy changes, never on every deploy.
  7. **IndexNow** (Bing, Yandex, Seznam, Naver; Bing's index also feeds Copilot and parts of
     ChatGPT search): a key file in `public/` and `bun run indexnow` (from `website/`), which sends
     the built sitemap's URLs. **Yash runs it after a deploy** (`--dry-run` only lists them).
- **Why:** answer engines quote pages they can fetch, parse and trust. Most of that the site already
  did (static HTML, D-051's links and share cards). What was missing: an explicit welcome for the AI
  crawlers, a clean text version of each answer page, facts stated once in plain words, and a fast
  way to tell Bing about a change.
- **Trade-off:** a few more generated files that must stay in step, which `next build` handles.
  Allowing training crawlers means the copy may be used to train models (reverse it with one
  `Disallow` per bot). FAQ rich results only show for a few authority sites since 2023: the
  `FAQPage` markup is for parsers, not for a Google snippet. Nothing here is proven to move
  citations: the measure is asking ChatGPT, Perplexity, Claude and Google the questions people ask
  ("what is StrideMon", "is the StrideMon Founding Pass free") and seeing who is quoted.
- **Off the site (Yash):** Google Search Console and Bing Webmaster Tools with the sitemap; check
  that Vercel's Firewall doesn't block AI bots (its "AI Bots" rule is off unless turned on).
- **Revisit when:** `llms.txt` becomes a standard someone enforces or drops, minting opens (the
  schedule lines become history), or the Google Play listing replaces the Expo link.
