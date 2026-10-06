# StrideMon

A move-to-earn game on Monad: own a Sneaker NFT, walk or run to earn **STRIDE**,
and spend it to repair and upgrade the Sneaker. `MVP.md` is the product brief;
`docs/` is the architecture and the phased build plan (start at `docs/README.md`).

## Prerequisites

| Tool | Version | Used for |
|------|---------|----------|
| Bun | **1.4.2** (the same version `apps/mobile/eas.json` pins) | package manager, API runtime, tests |
| Node.js | **22.13+** (24 recommended) | Expo CLI, Metro, Jest |
| Foundry | **1.8+** (`foundryup -i v1.8.3`; `forge`, `cast`, `anvil`) | contracts, API tests (Anvil) |
| MongoDB | 8.x (`mongod` on your PATH) | local database |
| A phone | iOS 16.4+ or Android 7+ | the development build |
| Xcode | 26.4+ | only for local iOS builds (EAS builds don't need it) |

> **Bun installed through Volta?** Volta runs the `bun` package with the Node
> version that was the default when you installed it, and every script Bun
> starts (including `expo` and `jest`) inherits that Node. If it's older than
> 22.13, reinstall Bun under a newer default:
> `volta install node@24 && volta install bun`.

## Setup

```sh
bun install                              # every workspace, hoisted node_modules
cp apps/api/.env.example apps/api/.env
cp apps/mobile/.env.example apps/mobile/.env   # then set your laptop's LAN IP
```

## Running

```sh
bun run db:start       # project-local mongod on 127.0.0.1:27019 (data in .mongo/)
bun run dev:api        # API on :3000 (logs its LAN URL on boot). Docs at /docs
cd apps/mobile && bunx expo start --clear   # Metro for the development build (prints the QR code)
```

`GET /health` answers `{ "status": "ok", "mongo": "connected" }`.

### The app on a phone

The app uses a **development build**, not Expo Go. Build it once, and again
whenever a native dependency changes. Run every EAS command from `apps/mobile`:

```sh
cd apps/mobile
bunx eas-cli login
bunx eas-cli build --profile development --platform android
```

**[`docs/device-testing.md`](docs/device-testing.md)** has the whole loop: when a
new build is needed, finding its download link, installing it, running it against
your laptop, and fixing the errors you'll meet (including crash logs with `adb`).

## Checks

```sh
bun run typecheck      # tsc in every workspace
bun run lint           # Biome (bun run format applies safe fixes)
bun run test           # every workspace's tests (API tests need db:start)
bun run contracts:test # forge test
```

## Layout

```text
apps/mobile         Expo + React Native + Expo Router
apps/api            Fastify 5 on Bun, MongoDB, viem
packages/shared     zod API contracts, domain types, game-rule mirror
packages/chain      ABIs, deployed addresses, Monad chain definitions
packages/contracts  Foundry: SneakerNft, StrideToken, SneakerGame
```
