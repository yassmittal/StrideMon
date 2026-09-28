# System Overview

## The system in one picture

```text
┌──────────────────────────────────────┐
│        Mobile app (iOS + Android)     │
│   Expo · React Native · TypeScript    │
│                                       │
│  • GPS tracking during a run          │
│  • Wallet connection (Reown AppKit)   │
│  • Reads Sneaker / token state  ──────┼─────────────┐
│  • Signs repair / upgrade / transfer ─┼───────────┐ │
└──────────────┬───────────────────────┘           │ │
               │ HTTPS + JSON                       │ │  JSON-RPC
               │ (JWT after sign-in)                │ │  (reads + user-signed txs)
               ↓                                    ↓ ↓
┌──────────────────────────────────────┐   ┌───────────────────────────────┐
│          Game API (Fastify)           │   │      Monad testnet (EVM)       │
│   Node-compatible · Bun · TypeScript  │   │                                │
│                                       │   │  SneakerNft   (ERC-721)        │
│  • Sign-In With Ethereum → JWT        │   │    stats, energy, durability   │
│  • Receives GPS samples               │   │  SoleToken  (ERC-20, SOLE)     │
│  • Validates activity (anti-cheat)    │   │  SneakerGame  (rules)          │
│  • Relays game-server transactions ───┼──→│    settleSession, repair,      │
│    (mint starter, settle session)     │   │    upgrade, starter mint       │
└──────────────┬───────────────────────┘   └───────────────────────────────┘
               │
               ↓
┌──────────────────────────────────────┐
│               MongoDB                 │
│  users · authSessions · authNonces    │
│  activitySessions · locationSamples   │
│  chainTransactions (outbox)           │
└──────────────────────────────────────┘
```

## How a mobile app talks to a backend

A mobile app has no server of its own. It is a client, the same as a browser:

1. The app sends an HTTPS request, for example `POST https://api.example.com/v1/activity-sessions`.
2. The Fastify API validates it, does the work, reads or writes MongoDB, and returns JSON.
3. The app renders that JSON.

Two practical consequences:

- **`localhost` on the phone is the phone.** In development the app reaches the API
  on your laptop through its LAN IP (`http://192.168.x.x:3000`) or a tunnel. That
  URL is configured through `EXPO_PUBLIC_API_BASE_URL`, never hardcoded.
- **The app ships to users' phones, so anything in it is public.** Secrets
  (private keys, database URLs) live only in the API.

## Who owns what

| Concern | Owner | Why |
|---------|-------|-----|
| Sneaker ownership | **Monad** (`SneakerNft`) | It is the point of the product. |
| Sneaker level, efficiency, durability | **Monad** (`SneakerNft`, written only by `SneakerGame`) | Decision: everything about the Sneaker lives on-chain. |
| Energy | **Monad** (`SneakerNft`, computed lazily) | Energy gates rewards, so it has to be enforced where the rewards are minted. |
| Reward balance | **Monad** (`SoleToken`) | ERC-20 from day one. |
| Repair / upgrade costs | **Monad** (`SneakerGame` view functions) | The contract burns the SOLE, so it also quotes the price. |
| Reward formula | **Monad** (`SneakerGame.settleSession`) | The contract mints, so it computes. The TypeScript mirror in `packages/shared` only produces *estimates* for the UI. |
| Raw GPS samples | **MongoDB** | Private data. It must never go on-chain. |
| "Was this run real?" | **API** | A contract cannot see GPS. The API is the trusted *activity oracle*. |
| Identity / login | **API** + **MongoDB** | The wallet address is the identity. The API proves possession of it with SIWE. |
| Transactions the game server sent | **MongoDB** (`chainTransactions`) | So a crash never loses or double-sends a settlement. |

## The three kinds of chain interaction

| Kind | Who signs | Who pays gas | Examples |
|------|-----------|--------------|----------|
| **Read** | nobody | nobody | Sneaker stats, energy, token balance, repair quote |
| **Game-server write** | API's game-server key (`GAME_SERVER_ROLE`) | Game server | Mint starter Sneaker, settle a session, testnet gas drip |
| **Player write** | Player's wallet | Player (testnet MON) | Repair, upgrade, transfer, (later) marketplace |

The rule behind this split: **the player signs anything that spends the player's
assets.** The server signs only what the player could not be trusted to report
honestly (activity results) or what onboarding needs (the first Sneaker).

## Core flows

### Sign in

```text
App                          API                         MongoDB
 │ connect wallet (AppKit)     │                             │
 │── POST /v1/auth/nonce ─────→│── store nonce (TTL) ───────→│
 │←── SIWE message ────────────│                             │
 │ wallet signs message        │                             │
 │── POST /v1/auth/verify ────→│ verify signature + nonce    │
 │                             │── upsert user, authSession →│
 │←── access + refresh token ──│                             │
```

### A run, end to end

```text
App                              API                                   Monad
 │── POST /activity-sessions ───→│ check: owns Sneaker, energy > 0,      │
 │                                │ durability > 0, no other active run ←─ reads
 │←── session (status: active) ──│                                        │
 │                                │                                        │
 │ GPS samples buffered locally   │                                        │
 │── POST …/location-samples ────→│ store samples (batched, idempotent)   │
 │   (every ~15 s)                │                                        │
 │                                │                                        │
 │── POST …/finish ──────────────→│ validate activity → activeMinutes,     │
 │                                │ distanceMeters; enqueue settlement     │
 │←── session (status: settling)─│                                        │
 │                                │ job: SneakerGame.settleSession(...) ──→│ consume energy
 │                                │                                        │ reduce durability
 │                                │←── receipt + SessionSettled event ─────│ mint SOLE
 │── GET …/:sessionId (poll) ────→│ status: settled, reward, txHash       │
 │←── summary ────────────────────│                                        │
```

### Repair or upgrade (no API involved)

```text
App                                              Monad
 │── read quoteRepairCost(tokenId) ─────────────→│
 │ user confirms, wallet signs repair(tokenId) ─→│ burns SOLE from player,
 │←── receipt ───────────────────────────────────│ restores durability
 │ refetch Sneaker + balance                      │
```

## Environments

| Environment | Chain | Database | API |
|-------------|-------|----------|-----|
| Local | Monad testnet (or local Anvil for contract tests) | Project-local `mongod` | Laptop, reached over LAN |
| Hackathon demo | Monad testnet | MongoDB Atlas (free tier) | Hosted (chosen in Phase 8) |
| Production (post-hackathon) | Monad mainnet | Atlas (paid tier) | Hosted, multiple instances |

**Everything targets Monad testnet until Phase 10.** No real money is involved,
and every key and faucet shortcut in these docs is testnet-only.
