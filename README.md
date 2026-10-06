# StrideMon

A move-to-earn game on Monad. Your Sneaker is an NFT. Walk or run with it to earn **STRIDE**, then
spend STRIDE to repair the Sneaker and level it up. Every run settles on Monad testnet as its own
transaction.

- **Live site:** <https://stridemon.yashmittal.xyz>
- **X:** [@stridemon](https://x.com/stridemon) (the product) and [@yash_mittal_dev](https://x.com/yash_mittal_dev) (the builder)
- **Demo video:** _link added once uploaded_ <!-- TODO(submission): the ≤ 3 min video's public URL -->
- **Android demo build (APK):** <https://expo.dev/artifacts/eas/Aa0J7FXKPHyaKSGL-74nW66qSugLVcvhOMLyRrGL2iY.apk>
- **Network:** Monad testnet (chain id 10143)

> **Monad testnet. STRIDE has no monetary value.** It's a testnet game token, not issued or
> endorsed by the Monad Foundation or any sponsor. There's no token sale, no airdrop and nothing
> to buy.

## The problem, and who it's for

Step-counter apps give you a number and nothing to do with it. Move-to-earn games give your
movement a use, but they usually start by asking you to buy an NFT and a token. That shuts out
the people they're meant for.

StrideMon is for **someone who walks or runs**, not a trader. They may never have thought of
themselves as a crypto user. The first Sneaker is free, and new players get a small drip of
testnet MON for gas, so nobody has to buy anything to start. The loop is short and physical:

```text
get a free Sneaker → walk or run → STOP → STRIDE settles on Monad → repair or upgrade → walk again
```

- **Energy** gates earning: 1 energy = 1 rewarded minute. A starter Sneaker holds 10, and energy
  regenerates 1 point every 30 minutes.
- **Reward** = rewarded minutes × efficiency × 0.5 STRIDE. A level-1 Sneaker (efficiency 10)
  earns 5 STRIDE a minute.
- **Durability** drops 0.3 per rewarded minute. **Repair** costs STRIDE, and so does an
  **upgrade**: 50 STRIDE × level, and each level adds 2 efficiency.
- The Sneaker is a normal ERC-721, so it can be **sent to another wallet** with its stats intact.

Every number is in [`docs/architecture/game-rules.md`](docs/architecture/game-rules.md), and the
contract enforces it.

## How it uses Monad, and why Monad

The chain is the source of truth. A Sneaker's level, efficiency, durability and energy live in
`SneakerNft`, rewards are minted by `SneakerGame`, and the Sneaker's picture is an SVG that a
contract draws. MongoDB only holds what the chain should never see: raw GPS, auth sessions and
the outbox of transactions the server sends.

- **Fast settlement.** Every run settles as its own transaction (`settleSession`), so the real
  reward shows on the summary screen seconds after STOP. There's no batching or off-chain balance.
- **Cheap gas.** Gas is cheap enough to give each new player a one-time drip of 0.1 testnet MON.
  They then repair, upgrade and transfer from their own wallet without ever buying MON.
- **Plain EVM.** Standard ERC-721 and ERC-20 contracts (OpenZeppelin 5) work in standard wallets
  like MetaMask, and the tooling is the usual Foundry and viem.

### Contracts (verified on Sourcify)

| Contract | What it is | Address |
|----------|------------|---------|
| `SneakerNft` | ERC-721 holding each Sneaker's stats and energy, with an on-chain `tokenURI` | [`0x6A9B08943f60F0bb779Bd229f907f92CB8002062`](https://testnet.monadvision.com/address/0x6A9B08943f60F0bb779Bd229f907f92CB8002062) |
| `StrideToken` | ERC-20 + Permit (`STRIDE`, 18 decimals) | [`0xf835cd7F9cBf44D76c2d7CE0643B4858437485f3`](https://testnet.monadvision.com/address/0xf835cd7F9cBf44D76c2d7CE0643B4858437485f3) |
| `SneakerGame` | The rules: starter mint, settlement, repair, upgrade | [`0x846cd7B8D213Bf516020f22343A69168B81fDE52`](https://testnet.monadvision.com/address/0x846cd7B8D213Bf516020f22343A69168B81fDE52) |
| `SneakerArtRenderer` | Draws the Sneaker's SVG; swappable by the admin | [`0x080Dbf4DD14F0C54E8bA0192c2A315ADA3Bbf229`](https://testnet.monadvision.com/address/0x080Dbf4DD14F0C54E8bA0192c2A315ADA3Bbf229) |

### Transactions from a real session

Played on an Android phone with two MetaMask accounts (wallet A `0xdfAb…1465`, wallet B
`0xe4ae…356f`) on 2026-10-06 and 2026-10-07 IST.

| Step | Transaction |
|------|-------------|
| Starter Sneaker #1 minted to wallet A | [`0x4abdbba3…b7f9`](https://testnet.monadvision.com/tx/0x4abdbba364b85a857628885bbf00a81478e9a1ef2661ed2423bea2d2e62eb7f9) |
| A 3-minute walk settled: 217 m, +15 STRIDE, durability −1 | [`0xa76e8796…336d`](https://testnet.monadvision.com/tx/0xa76e8796a3fc41ed50ac25548d9996064b8d5fd273cc8d11d3ed77f94350336d) |
| Starter Sneaker #2 minted to wallet B | [`0x87543d46…66aa`](https://testnet.monadvision.com/tx/0x87543d46e57baf5eb9f022d777371fd9a9d4abc62ec8d7abc6c074bf52d666aa) |
| Sneaker #1 sent from A to B, stats intact | [`0x30ba33d4…b775`](https://testnet.monadvision.com/tx/0x30ba33d4435e042def886d9dcb750e7a3f1344f8c2fa49b91a8dcf5de7eeb775) |
| Sneaker #2 sent from B to A | [`0x22a5ad1d…d5fd`](https://testnet.monadvision.com/tx/0x22a5ad1da6843a72348dec1934cab0a0295e8b31d3e75bf6bf3f014d3229d5fd) |
| A walk on Sneaker #2 settled: 165 m, +15 STRIDE | [`0x7ea2f0b0…e829`](https://testnet.monadvision.com/tx/0x7ea2f0b081af234f4a62e468a32db5ba25fdfa37aebab280b19e388c5633e829) |
| Another walk on Sneaker #2 settled: 197 m, +15 STRIDE | [`0x79f5308b…c317`](https://testnet.monadvision.com/tx/0x79f5308b870efb3052c140adfb07530db595aa28b901fd24157b0b214331c317) |
| Repair, signed in MetaMask | _added after the next recorded run_ <!-- TODO(submission) --> |
| Upgrade to level 2, signed in MetaMask | _added after the next recorded run_ <!-- TODO(submission) --> |

## Try it

You need an Android phone (7 or later) with MetaMask.

1. **Add Monad Testnet to MetaMask first** (chain id `10143`, RPC `https://testnet-rpc.monad.xyz`),
   and make sure it's enabled. If MetaMask's connect sheet doesn't list Monad Testnet, it connects
   with no accounts and the app can't sign you in.
2. Install the [APK](https://expo.dev/artifacts/eas/Aa0J7FXKPHyaKSGL-74nW66qSugLVcvhOMLyRrGL2iY.apk)
   (allow installs from your browser when Android asks).
3. Open StrideMon, connect MetaMask and sign the sign-in message. You get a free starter Sneaker
   and 0.1 testnet MON for gas. You don't need any MON of your own.
4. Press **START**, walk outside for a few minutes, then press **STOP**. The summary shows the
   STRIDE that settled on Monad, with a link to the transaction.
5. On the **Sneaker** tab, repair or upgrade it and sign in MetaMask. You can also send it to
   another wallet from there.

A minute only counts at an average of 1–20 km/h, so walk outside rather than indoors or in a car.
If connecting fails with `Cannot read property 'setDefaultChain' of undefined`, enable Monad
Testnet in MetaMask, clear StrideMon's app data, and connect again.

## Architecture

```text
 Mobile app (Expo, React Native)                       Monad testnet
 ├─ GPS tracking during a run                          ├─ SneakerNft   (ERC-721: stats, energy)
 ├─ MetaMask through Reown AppKit ──── player signs ──→├─ StrideToken  (ERC-20: STRIDE)
 │    (repair, upgrade, transfer)                      ├─ SneakerGame  (the rules)
 └─ HTTPS + JWT                                        └─ SneakerArtRenderer (on-chain SVG)
        ↓                                                       ↑
 Game API (Fastify on Bun) ── outbox: starter mint, gas drip, settlement (GAME_SERVER_ROLE)
        ↓
 MongoDB (users, auth sessions, activity sessions, GPS samples with a 30-day TTL, outbox)
```

1. **Sign-in** is Sign-In With Ethereum. The API builds the message and issues a JWT.
2. **A run** streams GPS samples to the API. At STOP the API validates the run: average speed
   per minute must be 1–20 km/h, GPS jumps faster than 40 km/h are dropped, and mock locations
   are rejected on Android. It then reports rewarded minutes and distance.
3. **Settlement** goes through a transaction outbox, which retries safely and settles each
   session once. `SneakerGame` caps the minutes by energy, computes the reward, mints STRIDE and
   lowers durability. The app only ever shows an estimate until the chain answers.
4. **Repair, upgrade and transfer** are signed by the player in their own wallet. The server
   never holds player keys.
5. Only minutes and distance go on-chain, never the route.

More detail:

- [`docs/architecture/system-overview.md`](docs/architecture/system-overview.md): the whole system on one page.
- [`docs/decisions.md`](docs/decisions.md): every design decision and why.
- [`docs/architecture/security.md`](docs/architecture/security.md): auth, keys and anti-cheat.

## Tech stack

| Layer | Tech |
|-------|------|
| Contracts | Solidity 0.8.37, Foundry 1.8 (Soldeer), OpenZeppelin 5.7 |
| Mobile | Expo (development builds), React Native, Expo Router, TypeScript, Reown AppKit, wagmi 2, viem, TanStack Query |
| API | Fastify 5 on Bun, TypeScript, MongoDB (official driver), viem, zod |
| Shared | Bun workspaces: `packages/shared` (zod contracts, game-rule mirror), `packages/chain` (ABIs, addresses) |
| Hosting | API on AWS EC2 (nginx, PM2), MongoDB Atlas, the landing page on Vercel, Android builds on EAS |

```text
apps/mobile         Expo + React Native + Expo Router
apps/api            Fastify 5 on Bun, MongoDB, viem
packages/shared     zod API contracts, domain types, game-rule mirror
packages/chain      ABIs, deployed addresses, Monad chain definitions
packages/contracts  Foundry: SneakerNft, SneakerArtRenderer, StrideToken, SneakerGame
website             The landing page (Next.js, its own install, not a workspace)
docs                Architecture, decisions and the phased build plan (start at docs/README.md)
```

## Run your own stack

You can't settle runs on the contracts above: only our game server holds `GAME_SERVER_ROLE`. To
run StrideMon end to end, deploy your own copy of the contracts to Monad testnet and point your
API and app at them.

### Prerequisites

| Tool | Version | Used for |
|------|---------|----------|
| Bun | **1.4.2** (the same version `apps/mobile/eas.json` pins) | package manager, API runtime, tests |
| Node.js | **22.13+** (24 recommended) | Expo CLI, Metro, Jest |
| Foundry | **1.8+** (`foundryup -i v1.8.3`; `forge`, `cast`, `anvil`) | contracts, API tests (Anvil) |
| MongoDB | 8.x (`mongod` on your PATH) | local database |
| An Android phone | Android 7+ | the development build |
| An Expo account and a Reown project | free | building the app; WalletConnect |

> **Bun installed through Volta?** Volta runs the `bun` package with the Node
> version that was the default when you installed it, and every script Bun
> starts (including `expo` and `jest`) inherits that Node. If it's older than
> 22.13, reinstall Bun under a newer default:
> `volta install node@24 && volta install bun`.

### 1. Install

```sh
bun install                                   # every workspace, hoisted node_modules
cd packages/contracts && forge soldeer install && cd ../..
```

### 2. Deploy the contracts

```sh
cast wallet new        # run twice: one deployer key, one game-server key
cp packages/contracts/.env.example packages/contracts/.env
vim packages/contracts/.env                    # both addresses and private keys
```

Fund both addresses from <https://faucet.monad.xyz>. The deploy uses about 7.5M gas and Monad
charges the full gas limit, so give the deployer about 1.5 MON. The game server pays for every
starter mint and gas drip (about 0.13 MON per new player).

```sh
cd packages/contracts
set -a && source .env && set +a
forge script script/DeployGame.s.sol --rpc-url monad_testnet --broadcast
cd ../.. && bun run chain:export-abis          # your addresses + ABIs → packages/chain
```

The script grants every role and writes your addresses to
`packages/contracts/deployments/10143.json`, replacing ours. To verify the contracts too, see
[`packages/contracts/README.md`](packages/contracts/README.md).

### 3. Run the API

```sh
cp apps/api/.env.example apps/api/.env
vim apps/api/.env      # GAME_SERVER_PRIVATE_KEY = your game-server key; JWT secret from `openssl rand -hex 64`
bun run db:start       # project-local mongod on 127.0.0.1:27019 (data in .mongo/)
bun run dev:api        # API on :3000 (logs its LAN URL on boot). Docs at /docs
```

`GET /health` answers `{ "status": "ok", "mongo": "connected" }`.

### 4. Run the app

The app uses a **development build**, not Expo Go. Point it at your API and your Reown project:

```sh
cp apps/mobile/.env.example apps/mobile/.env
vim apps/mobile/.env   # EXPO_PUBLIC_API_BASE_URL = your laptop's LAN IP; your Reown project ID
```

`apps/mobile/app.config.ts` names our Expo account (`owner`, `extra.eas.projectId`). Delete those
two values, then link your own account and build:

```sh
cd apps/mobile
bunx eas-cli login
bunx eas-cli init                                        # creates your EAS project
bunx eas-cli build --profile development --platform android
bunx expo start --clear                                  # Metro; scan the QR code from the build
```

With the Android SDK installed, `bunx expo run:android` builds locally instead of on EAS.
**[`docs/device-testing.md`](docs/device-testing.md)** has the whole loop: when a new build is
needed, installing it, running it against your laptop, and fixing the errors you'll meet.

### Checks

```sh
bun run typecheck      # tsc in every workspace
bun run lint           # Biome (bun run format applies safe fixes)
bun run test           # every workspace's tests (API tests need db:start and anvil on PATH)
bun run contracts:test # forge test: unit, fuzz and invariant tests
```

API tests deploy the contracts to a throwaway Anvil, so run `bun run contracts:build` first.

## Built with AI

StrideMon was built with [Claude Code](https://claude.com/claude-code) (Anthropic). Its working
instructions are public in [`CLAUDE.md`](CLAUDE.md) and [`docs/`](docs/). Yash set the
direction, made the calls recorded in [`docs/decisions.md`](docs/decisions.md), and ran every
check on a real Android phone.

**Pre-existing code:** none. The project started on 2026-09-28, inside the Metropolis build window.

## Credits

- **Libraries and tools:** OpenZeppelin Contracts, Foundry and Soldeer, Expo and React Native,
  Reown AppKit, wagmi and viem, Fastify, MongoDB, TanStack Query, zod, Biome.
- **Fonts:** [Satoshi](https://www.fontshare.com/fonts/satoshi) by Indian Type Foundry (Fontshare
  Free Font License, `apps/mobile/assets/fonts/Satoshi-FFL.txt`) and IBM Plex Mono (SIL Open Font
  License).
- **Design language:** taken from [lusion.co](https://lusion.co)
  ([`docs/architecture/design-system.md`](docs/architecture/design-system.md)).
- **Launch film audio:** music from Pixabay and sound effects from Kenney (CC0), listed in
  [`launch-video/CREDITS.md`](launch-video/CREDITS.md).

## License

[MIT](LICENSE). The bundled fonts keep their own licences (above).
