# StrideMon

A move-to-earn game on Monad. Your Sneaker is an NFT. Walk or run with it to earn **STRIDE**, then
spend STRIDE to repair the Sneaker and level it up. Every run settles on Monad testnet as its own
transaction.

- **Live site:** <https://stridemon.xyz>
- **X:** [@stridemon](https://x.com/stridemon) (the product) and [@yash_mittal_dev](https://x.com/yash_mittal_dev) (the builder)
- **Demo video:** _link added once uploaded_ <!-- TODO(submission): the ≤ 3 min video's public URL -->
- **Android demo build:** <https://expo.dev/accounts/yashmittal/projects/stridemon/builds/f62511df-a727-40ca-aff1-d2aaa1096265> (Install on the phone, or scan its QR code. Google Play review is in progress.)
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
| `SneakerNft` | ERC-721 holding each Sneaker's stats and energy, with an on-chain `tokenURI` | [`0x6BE031Ff15F944c226832b6D0B99C03662b29337`](https://testnet.monadvision.com/address/0x6BE031Ff15F944c226832b6D0B99C03662b29337) |
| `StrideToken` | ERC-20 + Permit (`STRIDE`, 18 decimals) | [`0xaa665bB572A1375c624ae0affbCa28bF64D3B7c5`](https://testnet.monadvision.com/address/0xaa665bB572A1375c624ae0affbCa28bF64D3B7c5) |
| `SneakerGame` | The rules: starter mint, settlement, repair, upgrade | [`0x4DD989bc2844cEa9a5eb53b3c52bd86FD6bB8f8D`](https://testnet.monadvision.com/address/0x4DD989bc2844cEa9a5eb53b3c52bd86FD6bB8f8D) |
| `SneakerArtRenderer` | Draws the Sneaker's SVG; swappable by the admin | [`0xFd44910b780Df3e111EC79835D28CF4919329669`](https://testnet.monadvision.com/address/0xFd44910b780Df3e111EC79835D28CF4919329669) |

### Transactions from a real session

On the live contracts above. The first two rows are the deploy's own test mint (2026-10-08, to
the deployer); the rest were played on an Android phone with MetaMask (wallet A `0xdfAb…1465`) on
2026-10-12 and 2026-10-13 IST. The game server sends the mints and the settlements; the player
signs the repair in MetaMask.

| Step | Transaction |
|------|-------------|
| Founding Pass #0137 minted (the deploy's test pass) | [`0x2a315c55…1f13`](https://testnet.monadvision.com/tx/0x2a315c557a7e93090d006387ca187497944c1adf13c607b821b0f25332611f13) |
| Founder Sneaker #1 minted with it | [`0xfaf728ac…880c`](https://testnet.monadvision.com/tx/0xfaf728ac33eaf45308b9c2a69d28e90e83e334ccb5a9af2c0defff1f17f3880c) |
| Starter Sneaker #2 minted to wallet A | [`0x687d3181…247e`](https://testnet.monadvision.com/tx/0x687d318166c71e8839c062bb574eb95b29bee1335c7ec0302ee019959573247e) |
| A 2-minute walk settled: 95 m, +10 STRIDE, durability −1 | [`0xd7123519…a6c8`](https://testnet.monadvision.com/tx/0xd7123519bb9349e44bb443f157ff34382355bd4b6c121d5dbdf122beb8c8a6c8) |
| A 7-minute walk settled: 884 m, +35 STRIDE, durability −3 | [`0x00e66e63…4bd4`](https://testnet.monadvision.com/tx/0x00e66e639a98ee74703f96f6de9e360e234db5448ac090b5518c6fefe6104bd4) |
| Repair, signed in MetaMask: +4 durability for 2.8 STRIDE | [`0x48fb1630…55ac`](https://testnet.monadvision.com/tx/0x48fb1630f466fc84bc557e31248f7ba581bf0ff3464990ebbf54ba9dea1255ac) |
| A 1-minute walk settled: 31 m, +5 STRIDE, durability −1 | [`0x6547771d…2bad`](https://testnet.monadvision.com/tx/0x6547771dd09b5d05162144d734bbe5b7f46781c06389d592844447ed9c292bad) |
| Upgrade to level 2, signed in MetaMask | _added after the next run_ <!-- TODO(submission) --> |

## Try it

You need an Android phone (7 or later) with MetaMask.

1. **Add Monad Testnet to MetaMask first** (chain id `10143`, RPC `https://testnet-rpc.monad.xyz`),
   and make sure it's enabled. If MetaMask's connect sheet doesn't list Monad Testnet, it connects
   with no accounts and the app can't sign you in.
2. Open the [demo build's page](https://expo.dev/accounts/yashmittal/projects/stridemon/builds/f62511df-a727-40ca-aff1-d2aaa1096265) on your phone and tap **Install**
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
