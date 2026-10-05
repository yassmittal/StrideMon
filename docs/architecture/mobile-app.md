# Mobile App

`apps/mobile`: Expo (development builds), React Native with the New
Architecture, TypeScript (strict), and Expo Router. It runs on iOS and Android
from one codebase.

## Key libraries (confirm versions at Phase 0)

| Need | Library | Why this one |
|------|---------|--------------|
| Navigation | `expo-router` | File-based routes, typed routes, deep links for free |
| Server state (API) | `@tanstack/react-query` | Caching, retries, polling (settlement), invalidation |
| Chain state + wallet | `@reown/appkit-react-native` + `@reown/appkit-wagmi-react-native` + `wagmi` 2 + `viem` | Connect wallet, typed contract reads and writes from `@stridemon/chain` ABIs. Versions and pins: D-018 |
| Small client state | `zustand` | Active-run UI state. Only where React Query and wagmi don't fit |
| Location | `expo-location` + `expo-task-manager` | GPS that keeps running with the screen locked (foreground service on Android, background mode on iOS). Versions and permissions: D-020 |
| Durable local buffer | `expo-sqlite` | GPS samples survive the app being killed mid-run. First-party, one table (D-020) |
| Secrets on device | `expo-secure-store` | Refresh token (Keychain / Keystore) |
| Wallet session storage | `@react-native-async-storage/async-storage` | AppKit and WalletConnect persist the wallet connection here. Never tokens |
| Validation | `zod` (via `@stridemon/shared`) | Same schemas as the API |
| Styling | React Native `StyleSheet` + typed theme tokens | Zero dependencies, predictable. See "Styling" |
| Tests | `jest-expo` + React Native Testing Library | See `conventions/testing.md` |

**Rule for choosing state tools:**
- Data from the API goes in **React Query**.
- Data from the chain goes through **wagmi hooks**, which are React Query underneath.
- UI state that several screens share goes in **zustand**.
- Everything else is `useState`.

Never copy server or chain data into zustand.

## Folder layout

```text
apps/mobile/
├── index.ts                     entry: defines the location task and registers the API token source, then loads expo-router (D-020)
├── app.config.ts                Expo config (typed), plugins, permissions strings
├── plugins/                     local config plugins (plain JS, loaded by path)
│   └── with-wallet-app-queries.js  lets AppKit see installed wallets (Android <queries>, iOS schemes)
├── app/                         ROUTES ONLY. Each file is a thin screen that composes features
│   ├── _layout.tsx                root: providers, auth gate
│   ├── (onboarding)/            initial route: welcome (a signed-out launch lands there)
│   │   ├── welcome.tsx              "Walk. Earn. Upgrade your Sneaker."
│   │   └── connect-wallet.tsx
│   ├── (tabs)/
│   │   ├── _layout.tsx
│   │   ├── index.tsx                Home: Sneaker card, energy, balance, START
│   │   ├── sneaker.tsx              Sneaker detail: stats, repair, upgrade, transfer
│   │   ├── history.tsx              past activity sessions
│   │   └── profile.tsx              wallet, sign out
│   ├── run/
│   │   ├── _layout.tsx
│   │   ├── location-permission.tsx  explainer before the one OS location prompt
│   │   ├── active.tsx               live run screen
│   │   └── summary/[activitySessionId].tsx
│   └── sneaker/
│       └── transfer.tsx
│
└── src/
    ├── features/                one folder per product feature, same names as the API resources
    │   ├── auth/
    │   │   ├── api/                 auth-api.ts (nonce, verify, refresh, sign-out), current-user-api.ts
    │   │   ├── hooks/               useSignIn, useSignOut, useCurrentUser, useAuthSession
    │   │   ├── components/          SignInPanel.tsx
    │   │   ├── auth-session.ts        restore / start / refresh (single-flight) / sign out
    │   │   ├── auth-session-store.ts  zustand: restoring | signedOut | signedIn(+ access token)
    │   │   ├── connect-api-client-to-auth-session.ts  registers the token source; imported by index.ts (D-020)
    │   │   ├── sign-in-state.ts       the sign-in steps and their error copy
    │   │   └── auth-token-storage.ts
    │   ├── wallet/                  useWalletConnection, useMonBalance, WalletAddress, MonBalance
    │   ├── onboarding/              useStarterSneakerOnboarding, StarterSneakerMinting ("Minting your Sneaker…")
    │   ├── sneaker/
    │   │   ├── hooks/               useOwnedSneakers, useSelectedSneaker (Phase 7), useSneakerAttributes,
    │   │   │                        useSneakerEnergy, useGameConfig (Phase 3); useSneakerImageSvg (8.3);
    │   │   │                        useSneakerGameTransaction, useRepairSneaker, useUpgradeSneaker (Phase 6);
    │   │   │                        useTransferSneaker (Phase 7)
    │   │   ├── sneaker-game-transaction-state.ts  the transaction state union and its error copy
    │   │   ├── sneaker-action-availability.ts     why Repair / Upgrade is disabled
    │   │   ├── selected-sneaker-store.ts          zustand: the Sneaker the player picked (D-027)
    │   │   ├── transfer-recipient.ts              checks the recipient address (valid, not yourself)
    │   │   └── components/          SneakerCard, SneakerArt (the on-chain SVG, D-030), SneakerPicker, NoSneakersCard; RepairPanel and UpgradePanel
    │   │                            (thin configs of SneakerActionPanel), TransferPanel,
    │   │                            SneakerTransactionSheet (confirm → wallet → chain → done), StatChangeRow
    │   ├── activity-session/
    │   │   ├── api/                 activity-sessions-api.ts (start, upload samples, finish, fetch one)
    │   │   ├── location-tracking/   location task, SQLite database + sample buffer + local active-session record,
    │   │   │                        uploader, location updates, permission request
    │   │   ├── hooks/               useStartActivitySession, useActiveActivitySession, useFinishActivitySession,
    │   │   │                        useActivitySession, useLocalActiveActivitySession
    │   │   ├── live-run-stats.ts      pure: elapsed time, distance, speed and estimated reward from buffered samples
    │   │   └── components/          LiveRunStats, ActivitySessionSummaryCard, ActiveRunBanner, StartRunPanel
    │   └── rewards/
    │       ├── hooks/               useRewardBalance.ts
    │       └── components/          RewardBalanceCard.tsx
    │
    ├── components/ui/           generic, feature-agnostic building blocks
    │   ├── Screen.tsx, Button.tsx, Card.tsx, StatValue.tsx, ProgressBar.tsx, ErrorState.tsx,
    │   │   ExternalLink.tsx, LoadingScreen.tsx
    │
    ├── lib/
    │   ├── api-client/              one typed fetch wrapper: base URL, auth header, refresh-on-401, ApiError parsing
    │   ├── chain/                   wagmi + AppKit config, contract addresses, explorer URLs
    │   └── format/                  formatDistance, formatDuration, formatTokenAmount
    │
    ├── providers/AppProviders.tsx   QueryClient, Wagmi, AppKit, SafeArea, theme — composed once
    ├── theme/                       colors, spacing, typography, radii tokens
    └── config/env.ts                parses EXPO_PUBLIC_* with zod at startup
```

### Rules

- **`app/` files are thin.** A screen file reads route params, calls feature
  hooks and lays out feature components. If a screen file has business logic,
  move it into `features/`.
- **Features don't reach into each other's internals.** If `activity-session`
  needs the Sneaker, it imports `useSneaker` from `features/sneaker/hooks`, not
  a private helper.
- **`components/ui` knows nothing about the game.** A `Button` doesn't know what
  a Sneaker is. `SneakerCard` lives in `features/sneaker`.
- **Only `lib/api-client` calls `fetch`.** Feature `api/` files call the client
  with a path and the zod schemas from `@stridemon/shared`, and get typed data back.
- **Only `lib/chain` configures wagmi.** Feature hooks call `useReadContract` /
  `useWriteContract` with ABIs from `@stridemon/chain`.

## Location tracking during a run

```text
START pressed
  │
  ├── foreground permission ("While using the app") only, after an explainer screen (D-020)
  ├── POST /v1/activity-sessions  → activitySessionId, saved as the local active session (SQLite)
  └── Location.startLocationUpdatesAsync(TASK_NAME, {
        accuracy: BestForNavigation,
        timeInterval: ~3 s, distanceInterval: ~5 m,
        foregroundService: { notificationTitle: "Run in progress" },   // Android: keeps GPS alive when locked
        showsBackgroundLocationIndicator: true, activityType: Fitness,  // iOS
        pausesUpdatesAutomatically: false,                              // iOS
      })

Location task (defined at module top level from index.ts, NOT inside a component or route)
  ├── drop a fix more than 60 s older than its delivery (Android's cached last location, D-024)
  ├── for each location → assign the next sequenceNumber → append to the SQLite buffer
  └── upload unsent samples if the last upload was ≥ 15 s ago (keeps a locked-phone run fresh)

Uploader (single-flight; from the task, every ~15 s on the run screen, and on finish)
  └── read up to 500 unsent samples → POST …/location-samples → mark sent → repeat

STOP pressed
  ├── stop location updates
  ├── flush buffer
  └── POST …/finish → navigate to summary, poll until status is settled | rejected
```

- The live screen's distance, speed and **estimated** reward come from the local
  buffer plus `@stridemon/shared/game-rules`. They're labelled "estimated" until
  settlement returns the real numbers.
- If the app is killed mid-run, reopening it finds the local active session and
  the buffered samples (both in SQLite), checks the session with the API, and
  offers **Resume** or **Finish** on Home. On Android a swipe-away doesn't stop
  tracking: the foreground service keeps running and starts the JS headless (D-020).
- Permission copy (`NSLocationWhenInUseUsageDescription`, etc.) is set in
  `app.config.ts` and says plainly why we need location. Both stores reject
  vague permission strings.

## Wallet and chain

- `lib/chain` configures AppKit with the Monad testnet chain from `@stridemon/chain`.
- After connecting, sign-in (SIWE) is a separate explicit step: "Sign to verify
  it's you". That's clearer UX, and a wallet connection alone proves nothing to
  the API.
- Player transactions (repair, upgrade, transfer) follow one pattern, wrapped
  in a single reusable hook `useSneakerGameTransaction`:
  1. Read the quote (`quoteRepairCost`). A transfer has no quote, only the network fee.
  2. Show a confirmation with the cost and current balance.
  3. `writeContract` opens the wallet app and the player signs.
  4. `waitForTransactionReceipt`.
  5. Invalidate the Sneaker and balance queries, then show success with an explorer link.

  Each step has a distinct UI state (`idle | awaitingSignature | confirming | succeeded | failed`).
  Players must always know whether they're waiting on their wallet or on the chain.

## The starter Sneaker (Phase 3)

Home decides what to show from the chain, not from the API:

- **The wallet owns a Sneaker** (`balanceOf` > 0) → the Sneaker card, the SOLE
  balance and START.
- **It owns more than one** (it received a Sneaker, Phase 7) → a picker above the
  Sneaker card. The picked Sneaker drives START, repair, upgrade and transfer (D-027).
- **It owns none and has already claimed its starter** (`hasClaimedStarterSneaker`,
  for example after sending its only Sneaker away) → an empty state. The starter is
  one per address and is never minted again (D-027).
- **It owns none and hasn't claimed** → the "Minting your Sneaker…" screen. It calls
  `POST /v1/onboarding/starter-sneaker` once (idempotent), then polls
  `GET /v1/onboarding/status` every 2 s. Each step (Sneaker, gas) shows pending,
  confirmed with an explorer link, or failed with a way forward. Once the mint is
  confirmed, it re-reads the chain until the Sneaker appears, since an RPC node
  can lag a block behind.

Sneaker stats, energy and the SOLE balance are wagmi reads. Energy's value comes
from `SneakerGame.currentEnergy`; the countdown to the next point is computed on
the device from the on-chain `energyUpdatedAt`, and the value is read again when
it reaches zero.

## Auth on the device

- The access token lives **in memory only**.
- The refresh token lives in `expo-secure-store`.
- `lib/api-client` attaches the access token. On `401` it refreshes once,
  retries once, and signs the user out if the refresh also fails. It gets tokens
  through an `AccessTokenSource` the auth feature registers at launch, so `lib/`
  never imports `features/`.
- Refreshes are **single-flight**: concurrent 401s share one refresh request.
  Refresh tokens are single-use, and a second parallel refresh would look like a
  stolen token and revoke every auth session.
- The root layout gates with `Stack.Protected`: signed in → `(tabs)`, otherwise
  `(onboarding)`. Signing in or out flips the guard, which drops the other side's history.
- On launch: if a refresh token exists, refresh silently. Otherwise go to onboarding.

## Styling

- Tokens are in `src/theme/` (`colors`, `spacing`, `fontSizes`, `radii`), so
  there are no raw hex values or pixel numbers in components.
- There is one `StyleSheet.create` per component file, at the bottom, named `styles`.
- Visual design is set in Phase 8. Phases 0–7 use the tokens with a plain
  palette, so a restyle later only touches `theme/` and `components/ui`.
- The Phase 8 values, fonts, motion and component specs are in
  [`design-system.md`](design-system.md). It also adds the `fontFamilies`,
  `letterSpacings`, `lineHeights`, `shadows`, `motion` and `layout` tokens.

## Environment

`src/config/env.ts` validates at startup:

| Variable | Notes |
|----------|-------|
| `EXPO_PUBLIC_API_BASE_URL` | LAN IP in development |
| `EXPO_PUBLIC_MONAD_CHAIN_ID` | selects addresses from `@stridemon/chain` |
| `EXPO_PUBLIC_MONAD_RPC_URL` | public RPC for reads |
| `EXPO_PUBLIC_REOWN_PROJECT_ID` | from the Reown dashboard (free) |

Everything prefixed `EXPO_PUBLIC_` is compiled into the app and **public**.
Secrets never go here.
