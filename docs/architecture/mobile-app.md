# Mobile App

`apps/mobile`: Expo (development builds), React Native with the New
Architecture, TypeScript (strict), and Expo Router. It runs on iOS and Android
from one codebase.

## Key libraries (confirm versions at Phase 0)

| Need | Library | Why this one |
|------|---------|--------------|
| Navigation | `expo-router` | File-based routes, typed routes, deep links for free |
| Server state (API) | `@tanstack/react-query` | Caching, retries, polling (settlement), invalidation |
| Chain state + wallet | `@reown/appkit-wagmi-react-native` + `wagmi` + `viem` | Connect wallet, typed contract reads and writes from `@stridemon/chain` ABIs |
| Small client state | `zustand` | Active-run UI state. Only where React Query and wagmi don't fit |
| Location | `expo-location` + `expo-task-manager` | Foreground + background GPS |
| Durable local buffer | `react-native-mmkv` | GPS samples survive the app being killed mid-run |
| Secrets on device | `expo-secure-store` | Refresh token (Keychain / Keystore) |
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
├── app.config.ts                Expo config (typed), plugins, permissions strings
├── app/                         ROUTES ONLY. Each file is a thin screen that composes features
│   ├── _layout.tsx                root: providers, auth gate
│   ├── (onboarding)/
│   │   ├── welcome.tsx              "Walk. Earn. Upgrade your Sneaker."
│   │   └── connect-wallet.tsx
│   ├── (tabs)/
│   │   ├── _layout.tsx
│   │   ├── index.tsx                Home: Sneaker card, energy, balance, START
│   │   ├── sneaker.tsx              Sneaker detail: stats, repair, upgrade, transfer
│   │   ├── history.tsx              past activity sessions
│   │   └── profile.tsx              wallet, sign out
│   ├── run/
│   │   ├── active.tsx               live run screen
│   │   └── summary/[activitySessionId].tsx
│   └── sneaker/
│       └── transfer.tsx
│
└── src/
    ├── features/                one folder per product feature, same names as the API resources
    │   ├── auth/
    │   │   ├── api/                 auth-api.ts: requestNonce, verifySignature, refresh
    │   │   ├── hooks/               useSignIn.ts, useAuthenticatedUser.ts
    │   │   ├── components/          SignInButton.tsx
    │   │   └── auth-token-storage.ts
    │   ├── wallet/
    │   ├── onboarding/
    │   ├── sneaker/
    │   │   ├── hooks/               useSneaker.ts, useSneakerEnergy.ts, useRepairSneaker.ts
    │   │   └── components/          SneakerCard.tsx, SneakerStatRow.tsx, RepairPanel.tsx
    │   ├── activity-session/
    │   │   ├── location-tracking/   background task, sample buffer, uploader
    │   │   ├── hooks/               useActiveActivitySession.ts, useFinishActivitySession.ts
    │   │   └── components/          LiveRunStats.tsx, SessionSummaryCard.tsx
    │   └── rewards/
    │       └── hooks/               useRewardBalance.ts
    │
    ├── components/ui/           generic, feature-agnostic building blocks
    │   ├── Screen.tsx, Button.tsx, Card.tsx, StatValue.tsx, ProgressBar.tsx, ErrorState.tsx
    │
    ├── lib/
    │   ├── api-client/              one typed fetch wrapper: base URL, auth header, refresh-on-401, ApiError parsing
    │   ├── chain/                   wagmi + AppKit config
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
  ├── request foreground permission ("While Using")
  ├── request background permission (Android: separate prompt; iOS: "Always" upgrade)
  ├── POST /v1/activity-sessions  → activitySessionId
  └── Location.startLocationUpdatesAsync(TASK_NAME, {
        accuracy: BestForNavigation,
        timeInterval: ~3 s, distanceInterval: ~5 m,
        foregroundService: { notificationTitle: "Run in progress" },   // Android
        showsBackgroundLocationIndicator: true,                        // iOS
      })

Background task (defined at module top level, NOT inside a component)
  └── for each location → assign sequenceNumber → append to MMKV buffer

Uploader (runs while the app is alive, every ~15 s and on finish)
  └── read unsent samples from buffer → POST …/location-samples → mark sent

STOP pressed
  ├── stop location updates
  ├── flush buffer
  └── POST …/finish → navigate to summary, poll until status is settled | rejected
```

- The live screen's distance, speed and **estimated** reward come from the local
  buffer plus `@stridemon/shared/game-rules`. They're labelled "estimated" until
  settlement returns the real numbers.
- If the app is killed mid-run, reopening it finds the active session (via the
  API) and the buffered samples (via MMKV), and offers **Resume** or **Finish**.
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
  1. Read the quote (`quoteRepairCost`).
  2. Show a confirmation with the cost and current balance.
  3. `writeContract` opens the wallet app and the player signs.
  4. `waitForTransactionReceipt`.
  5. Invalidate the Sneaker and balance queries, then show success with an explorer link.

  Each step has a distinct UI state (`idle | awaitingSignature | confirming | succeeded | failed`).
  Players must always know whether they're waiting on their wallet or on the chain.

## Auth on the device

- The access token lives **in memory only**.
- The refresh token lives in `expo-secure-store`.
- `lib/api-client` attaches the access token. On `401` it refreshes once,
  retries once, and signs the user out if the refresh also fails.
- On launch: if a refresh token exists, refresh silently. Otherwise go to onboarding.

## Styling

- Tokens are in `src/theme/` (`colors`, `spacing`, `fontSizes`, `radii`), so
  there are no raw hex values or pixel numbers in components.
- There is one `StyleSheet.create` per component file, at the bottom, named `styles`.
- Visual design is set in Phase 8. Phases 0–7 use the tokens with a plain
  palette, so a restyle later only touches `theme/` and `components/ui`.

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
