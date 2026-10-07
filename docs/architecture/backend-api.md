# Backend API

`apps/api`: Fastify 5, TypeScript (strict), Bun runtime, MongoDB (official
driver), viem, and zod through `fastify-type-provider-zod`.

## What the API is responsible for

1. **Identity:** proving a wallet with SIWE and issuing tokens.
2. **Activity oracle:** receiving GPS samples, deciding whether a run was real,
   and producing `activeMinutes` and `distanceMeters`.
3. **Game-server relayer:** sending the transactions only the game server may
   send (starter mint, settlement, gas drip), reliably and exactly once.

It is **not** responsible for game rules (the contract enforces those), for
storing Sneaker stats or balances (they're on-chain), or for anything the player
signs themselves.

## Folder layout

```text
apps/api/src/
├── index.ts                     starts the server (listen + graceful shutdown), nothing else
├── build-server.ts              creates the Fastify instance, registers plugins and routes in order
│
├── plugins/                     cross-cutting setup, registered by hand in dependency order
│   ├── env.ts                     validates process.env with zod → fastify.config
│   ├── cors.ts                    browser access for /v1/waitlist only (D-037)
│   ├── mongo.ts                   connects, decorates fastify.mongo, closes on shutdown
│   ├── mongo-indexes.ts           every index from data-model.md, created at boot
│   ├── chain-clients.ts           viem publicClient + gameServerWalletClient → fastify.chain
│   ├── authentication.ts          verifies access JWT → request.authenticatedUser
│   ├── rate-limit.ts
│   ├── error-handler.ts           maps errors to the ApiError response shape
│   ├── api-docs.ts                OpenAPI + Swagger UI (dev only)
│   └── background-jobs.ts         runs jobs/ on intervals, one process per job (jobLeases lease)
│
├── routes/<resource>/
│   ├── index.ts                 THIN: method + url + schema + preHandler + delegate to a handler
│   └── schemas.ts               route schema objects built from @stridemon/shared api-contracts
│
├── handlers/<resource>/         request orchestration: call repositories, services, lib; shape the reply
│   └── start-activity-session.ts
│
├── lib/<domain>/                PURE domain logic. No fastify, no mongo, no viem clients, no I/O
│   ├── activity-validation/
│   │   ├── validate-activity.ts       composes the rest; security.md → Activity validation
│   │   ├── filter-plausible-samples.ts
│   │   ├── bucket-samples-into-minutes.ts
│   │   └── speed-band.ts              (haversine distance is in @stridemon/shared/geo, D-021)
│   └── auth/
│       ├── build-siwe-message.ts
│       ├── access-token.ts          sign / verify the access JWT (jose)
│       └── generate-refresh-token.ts, hash-refresh-token.ts, generate-siwe-nonce.ts
│
├── repositories/                ALL MongoDB access, one file per collection
│   ├── users-repository.ts
│   ├── activity-sessions-repository.ts
│   └── …
│
├── services/                    external I/O other than Mongo
│   ├── siwe-signature-verifier.ts viem verifySiweMessage (EOA + ERC-1271/6492 wallets)
│   ├── sneaker-chain-reader.ts    reads SneakerNft / SneakerGame / StrideToken
│   └── chain-transaction-sender.ts signs and broadcasts outbox transactions
│
├── jobs/                        background work run by plugins/background-jobs.ts
│   ├── process-chain-transactions.ts
│   └── abandon-stale-activity-sessions.ts
│
├── common/                      small cross-cutting helpers (errors, time, ids)
│   └── api-error.ts
│
├── test-support/                test-only helpers: buildTestServer (throwaway DB), startTestChain (Anvil),
│                                deployTestContracts (D-019), runOutboxJob, signInTestPlayer
│
└── types/
    └── fastify.d.ts             declaration merging for decorators — never cast instead
```

(`common/` rather than `shared/`, so it can never be confused with `packages/shared`.)

## Layer rules

```text
routes ──→ handlers ──→ lib           (pure)
                   ├──→ repositories  (Mongo)
                   └──→ services      (chain / external)
jobs ──────────────┴──→ same as handlers
```

| Layer | May import | Must not |
|-------|-----------|----------|
| `routes/` | `handlers/`, route `schemas.ts` | contain logic beyond wiring |
| `handlers/` | `lib/`, `repositories/`, `services/`, `common/` | touch `fastify.mongo` collections directly |
| `lib/` | other `lib/`, `@stridemon/shared` | import fastify, mongodb, viem clients, `process.env`, `Date.now()` (pass time in) |
| `repositories/` | mongodb types, `common/` | contain business rules |
| `services/` | viem, `@stridemon/chain`, `common/` | know about HTTP requests |

Why this matters: `lib/activity-validation` is the heart of anti-cheat. Because
it's pure, you can test it with a thousand synthetic GPS traces and never start
a server.

## Endpoints (v1)

All endpoints are prefixed `/v1`. `🔒` means an access token is required.

| Method | Path | Phase | Purpose |
|--------|------|-------|---------|
| GET | `/health` | 0 | liveness (no prefix) |
| POST | `/v1/auth/nonce` | 2 | `{ walletAddress }` → `{ message }`, the SIWE message to sign |
| POST | `/v1/auth/verify` | 2 | `{ message, signature }` → `{ accessToken, refreshToken, user }` |
| POST | `/v1/auth/refresh` | 2 | `{ refreshToken }` → the same shape as verify, with a rotated refresh token |
| POST | `/v1/auth/sign-out` | 2 | 🔒 `{ refreshToken }` → 204. Revokes that auth session. The access token only carries the user, so the body names the auth session |
| GET | `/v1/me` | 2 | 🔒 current user + onboarding state |
| DELETE | `/v1/me` | 8 | 🔒 → 204. Deletes the player's off-chain data: user, auth sessions, activity sessions and their location samples. Keeps `chainTransactions` (D-039) |
| POST | `/v1/onboarding/starter-sneaker` | 3 | 🔒 enqueue starter mint + gas drip (idempotent) |
| GET | `/v1/onboarding/status` | 3 | 🔒 state of those transactions |
| POST | `/v1/activity-sessions` | 4 | 🔒 `{ sneakerTokenId }` → start a session |
| POST | `/v1/activity-sessions/:activitySessionId/location-samples` | 4 | 🔒 batch upload (idempotent by sequence number) |
| POST | `/v1/activity-sessions/:activitySessionId/finish` | 4/5 | 🔒 validate + enqueue settlement |
| GET | `/v1/activity-sessions/:activitySessionId` | 4 | 🔒 one session (the app polls this while settling) |
| GET | `/v1/activity-sessions` | 5 | 🔒 history, cursor-paginated |
| POST | `/v1/waitlist` | 8.8 | `{ email, phonePlatform?, source? }` → `{ status: 'joined' }`. Called from the landing page (D-037) |

There are deliberately **no endpoints** for Sneaker stats, balances, repair or
upgrade: the app reads and writes those on-chain directly.

## Request / response conventions

- Every route declares `body`, `params`, `querystring` **and `response`**
  schemas. The response schema is also the serializer, so a field that isn't in
  the schema can never leak (e.g. `refreshTokenHash`).
- Schemas are zod objects from `@stridemon/shared/api-contracts`, so the mobile
  client gets the exact same types.
- JSON field names are camelCase and carry units: `distanceMeters`, not `distance`.
- `bigint` values (token amounts, token ids) travel as **decimal strings**.
- Timestamps travel as ISO-8601 strings in UTC.
- Pagination uses `?cursor=<opaque>&limit=20` and returns
  `{ items, nextCursor: string | null }`.

### Error shape (every non-2xx response)

```json
{
  "error": {
    "code": "SNEAKER_OUT_OF_ENERGY",
    "message": "This Sneaker has no energy left. It regenerates over time.",
    "details": { "sneakerTokenId": "1", "currentEnergy": 0 }
  }
}
```

- `code` is a member of the `ApiErrorCode` union in `@stridemon/shared/domain`. The
  mobile app switches on `code` and **never parses `message`**.
- Handlers throw `new ApiError('SNEAKER_OUT_OF_ENERGY', 409, details)` from
  `common/api-error.ts`. `plugins/error-handler.ts` is the single place that
  shapes errors, including zod validation failures (`VALIDATION_FAILED`) and
  unknown errors (`INTERNAL_ERROR`, with the real error only in the logs).

## Configuration

`plugins/env.ts` parses `process.env` once with zod and fails fast at boot.

| Variable | Example | Notes |
|----------|---------|-------|
| `NODE_ENV` | `development` | |
| `API_PORT` | `3000` | |
| `MONGODB_URI` | `mongodb://127.0.0.1:27019/stridemon` | |
| `JWT_ACCESS_TOKEN_SECRET` | 64 random bytes | |
| `ACCESS_TOKEN_TTL_SECONDS` | `900` | 15 minutes |
| `REFRESH_TOKEN_TTL_DAYS` | `30` | |
| `SIWE_DOMAIN` | `stridemon.com` | must match the domain in the message the app requests |
| `MONAD_RPC_URL` | testnet RPC | |
| `MONAD_CHAIN_ID` | `10143` | selects addresses from `@stridemon/chain` |
| `GAME_SERVER_PRIVATE_KEY` | `0x…` | **testnet only**; KMS in Phase 10 |
| `GAS_DRIP_AMOUNT_WEI` | `"100000000000000000"` | 0.1 testnet MON |
| `WAITLIST_ALLOWED_ORIGINS` | `https://stridemon.yashmittal.xyz` | comma-separated origins allowed to call `/v1/waitlist` from a browser (D-037) |

Contract addresses come from `@stridemon/chain` for `MONAD_CHAIN_ID`, and boot fails if
that chain has none. API tests pass `buildServer({ contractAddresses })` instead, with the
addresses of the contracts they deployed to their Anvil (D-019).

Code reads `fastify.config.mongodbUri`, never `process.env.MONGODB_URI`.

## The transaction outbox (from Phase 3)

```text
handler                        Mongo chainTransactions            job (holds the jobLeases lease)
  │ insert {kind, idempotencyKey,  │                                 │
  │         payload, status:queued}│                                 │
  │──────────────────────────────→│                                 │
  │ (duplicate key? → return the   │  1. re-check every submitted ←──│
  │  existing one)                 │  2. oldest queued ←─────────────│ simulate → sign
  │                                │←─ submitted: hash, nonce, ──────│
  │                                │   signedTransaction             │ broadcast
  │                                │                                 │ wait for receipt
  │                                │←─ confirmed / failed ───────────│
  │                                │                                 │ on settleSession: parse
  │                                │                                 │ SessionSettled → update
  │                                │                                 │ activitySessions.settlement
```

- **One sender at a time** per game-server key. Each run first takes the
  `processChainTransactions` lease in `jobLeases`, and renews it between
  transactions (D-019).
- **One nonce at a time.** Outstanding `submitted` records are settled before a
  new transaction is signed, so the next nonce is always the chain's `pending`
  count.
- **Simulate before sending** (`simulateContract`). A predictable revert (such
  as `NotSneakerOwner`) becomes a `failed` record with a clear reason, and no gas
  is wasted.
- **Sign, save, then broadcast (D-019).** The signed bytes, hash and nonce are in
  Mongo before anything leaves the process.
- **Crash recovery:** a `submitted` record is re-checked by receipt, never
  re-signed. No receipt, and its nonce is still unused → the saved bytes are
  broadcast again. No receipt, and another transaction used its nonce → it goes
  back to `queued`.
- **Transient failures** (RPC down, not enough MON, `SneakerGame` paused) leave the
  record where it is, with `lastError`, and the next run retries. A paused game holds
  the whole queue until `unpause` (D-032).
- **Side effects on success** are written by the job: a confirmed
  `mintStarterSneaker` sets `users.hasReceivedStarterSneaker`, and a confirmed
  `sendGasDrip` sets `users.hasReceivedGasDrip`.
- In `NODE_ENV=test` the interval runner doesn't start. Tests call
  `processChainTransactions` directly, so they are deterministic.

### Onboarding responses (Phase 3)

`POST /v1/onboarding/starter-sneaker` enqueues the starter mint and the gas drip
(in that order) and returns the same body as `GET /v1/onboarding/status`:

```json
{
  "starterSneaker": { "status": "pending", "transactionHash": null },
  "gasDrip": { "status": "notStarted", "transactionHash": null }
}
```

Each step is `notStarted` (no outbox record), `pending` (`queued` or
`submitted`), `confirmed` or `failed`. `transactionHash` is set once the
transaction is signed, so the app can link to the explorer while it waits. The
Sneaker itself (its id and stats) is read from the chain by the app, never from
this response.

### Activity session responses (Phase 4)

Every activity-session route answers with `{ activitySession }`:

```json
{
  "activitySession": {
    "activitySessionId": "66f9…",
    "sneakerTokenId": "7",
    "status": "settling",
    "startedAt": "2026-09-29T10:00:00.000Z",
    "finishedAt": "2026-09-29T10:11:05.000Z",
    "energyAtStart": 10,
    "validationResult": { "activeMinutes": 10, "distanceMeters": 842, "averageSpeedKilometersPerHour": 5.05,
                          "rejectedSampleCount": 2, "warnings": ["lowGpsAccuracy"] },
    "rejectionReason": null
  }
}
```

Except the sample upload, which answers `{ newSampleCount, duplicateSampleCount }`.

| Route | Errors |
|-------|--------|
| `POST /activity-sessions` (201) | `SNEAKER_NOT_OWNED` 403, `SNEAKER_OUT_OF_ENERGY` 409, `SNEAKER_NEEDS_REPAIR` 409, `ACTIVITY_SESSION_ALREADY_ACTIVE` 409 (details name the active `activitySessionId`, so the app can resume it) |
| `POST …/location-samples` | `NOT_FOUND` 404, `ACTIVITY_SESSION_NOT_ACTIVE` 409, `VALIDATION_FAILED` 400 (over 500 samples) |
| `POST …/finish` | `NOT_FOUND` 404, `ACTIVITY_SESSION_NOT_ACTIVE` 409 (only when `abandoned`) |
| `GET …/:activitySessionId` | `NOT_FOUND` 404 (also for someone else's session) |

- **Start** reads the chain (`sneaker-chain-reader`): ownership first, then energy and
  durability. The "one active session per wallet and per Sneaker" rule is the partial unique
  indexes. Two concurrent starts can't both insert, because a duplicate key becomes
  `ACTIVITY_SESSION_ALREADY_ACTIVE`.
- **Upload** inserts unordered. A duplicate `(activitySessionId, sequenceNumber)` is counted and
  skipped, so re-sending a batch is harmless. Each upload bumps the session's `updatedAt`.
- **Finish** moves `active → validating` in one conditional write, validates, then stores
  `settling` (with `validationResult`) or `rejected` (with `rejectionReason`). It's idempotent:
  a finished session is returned unchanged, and one left in `validating` by a crash is validated
  again (D-021). A valid run is then queued for settlement (`settleSession:<activitySessionId>`),
  also on a retried finish, and a 0-minute run is `settled` at once with no transaction (D-026).
- **Settlement** (Phase 5): on the receipt, the outbox job reads `SessionSettled` and writes
  `settlement` + `settled`. A simulated `NotSneakerOwner` revert rejects the session with
  `SNEAKER_TRANSFERRED_DURING_SESSION`.
- **History** `GET /activity-sessions?cursor=…&limit=20` (max 50) returns `{ items, nextCursor }`,
  newest first. The cursor is opaque; one the API didn't issue is `VALIDATION_FAILED`.
- **`jobs/abandon-stale-activity-sessions.ts`** runs every minute through `plugins/background-jobs.ts`
  under its own lease. It marks every `active` session whose `updatedAt` is 30 minutes old as `abandoned`.
- Sample uploads have their own rate-limit budget (security.md → API hardening).

## The waitlist (Phase 8.8, D-037)

The landing page is a static site, so its waitlist form posts straight to the API.

- **`POST /v1/waitlist`** takes `{ email, phonePlatform?, source?, website? }` and always
  answers `200 { status: 'joined' }`, for a new email and a repeat one alike, so the response
  never reveals who signed up. A malformed email is `VALIDATION_FAILED` 400.
- `email` is trimmed and lowercased. A `source` that isn't 1–32 characters of `[a-z0-9-]` is
  dropped, not refused.
- `website` is a **honeypot**: the form hides it, so only a bot fills it in. When it's set the
  handler answers `200` and stores nothing.
- The repository upserts with `$setOnInsert` on the unique `email` index (`waitlistSignups`,
  data-model.md), so a repeat is a no-op.
- Its own rate limit: 5 requests a minute per IP.
- **CORS** (`plugins/cors.ts`, `@fastify/cors`): only `/v1/waitlist` answers browser requests,
  and only for an origin in `WAITLIST_ALLOWED_ORIGINS`. Every other route sends no CORS headers,
  so browsers still can't call it. The mobile app sends no `Origin` and is unaffected.

## Logging

Pino (Fastify's logger), JSON in production and pretty in development.

- `request.log`, not `console.log`.
- Errors are logged as `log.error({ err: error, activitySessionId }, 'Settlement failed')`.
- Never log tokens, signatures, private keys or raw GPS. Log counts and ids.
