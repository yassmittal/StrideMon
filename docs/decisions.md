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
