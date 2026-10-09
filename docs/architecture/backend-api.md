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
│   ├── cors.ts                    browser access for the website's routes only (D-037, D-043)
│   ├── pass-services.ts           the email sender, the Turnstile check and the collection's chain cache
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
| POST/GET | `/v1/pass/*` | Founding Pass | email codes, mints and the collection: see "The Founding Pass" below (D-041, D-043) |
| POST | `/v1/help/chat` | Founding Pass | `{ messages }` → an answer from the help page's text: see "The help chatbot" below (D-048) |

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
| `SIWE_DOMAIN` | `stridemon.xyz` | must match the domain in the message the app requests |
| `MONAD_RPC_URL` | testnet RPC | |
| `MONAD_CHAIN_ID` | `10143` | selects addresses from `@stridemon/chain` |
| `GAME_SERVER_PRIVATE_KEY` | `0x…` | **testnet only**; KMS in Phase 10 |
| `GAS_DRIP_AMOUNT_WEI` | `"100000000000000000"` | 0.1 testnet MON |
| `WAITLIST_ALLOWED_ORIGINS` | `https://stridemon.xyz` | comma-separated origins allowed to call the browser routes: `/v1/waitlist`, `/v1/pass/*` and SIWE's nonce, verify and refresh (D-037, D-040, D-043) |
| `EARLY_ACCESS_REQUIRED` | `false` | `true` turns the early-access gate on (D-041). Off until Metropolis judging ends |
| `PASS_WAITLIST_WINDOW_STARTS_AT` | `2026-11-28T14:30:00Z` | when the waitlist window opens (ISO 8601) |
| `PASS_WAITLIST_WINDOW_HOURS` | `48` | the window's length; the open mint starts when it ends |
| `PASS_BACKUP_OPENING_AT` | `2026-12-14T14:30:00Z` | the backup opening date: after the window ends |
| `TURNSTILE_SECRET_KEY` | Cloudflare's | production refuses Cloudflare's test secrets |
| `EMAIL_PROOF_SECRET` | 64 random bytes | signs email proofs and keys the code hashes; not the access-token secret |
| `EMAIL_SENDER_ADDRESS` | `hello@stridemon.xyz` | the From of every email |
| `BREVO_API_KEY` | Brevo's | required in production; development logs codes instead of sending |
| `BEDROCK_API_KEY` | Bedrock's | the help chatbot's model (D-048). Optional: without it the chatbot answers `HELP_CHAT_UNAVAILABLE` |
| `HELP_CHAT_MONTHLY_CAP_USD` | `5` | the chatbot's monthly budget at the model's list price (D-048) |

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
- **CORS** (`plugins/cors.ts`, `@fastify/cors`): `/v1/waitlist` answers browser requests, but
  only for an origin in `WAITLIST_ALLOWED_ORIGINS`. The Founding Pass adds its own routes to the
  list (below). Every other route sends no CORS headers, so browsers still can't call it. The
  mobile app sends no `Origin` and is unaffected.

## The Founding Pass (Part 3, D-041, D-043)

The website's `/pass` page is the second client of these routes. The brief's §10.2
([`../founding-pass-brief.md`](../founding-pass-brief.md)) has the why, D-043 the choices.

| Method | Path | Purpose |
|--------|------|---------|
| POST | `/v1/pass/email-code` | `{ email, turnstileToken }` → `{ status: 'sent' }`. Emails a 6-digit code. The same answer for new and known emails |
| POST | `/v1/pass/email-verify` | `{ email, code }` → `{ emailProof, emailProofExpiresAt }`, a signed proof good for 6 hours ("Get ready" before mint day) |
| POST | `/v1/pass/mints` | 🔒 `{ designNumber, emailProof, turnstileToken }` → `201 { mint }` (or `200` with the same mint, for a repeat from the same wallet for the same design). Queues `mintFoundingPass` in the outbox |
| GET | `/v1/pass/mints/:mintId` | 🔒 `{ mint }`; 404 for another wallet's mint. The website polls it for the reveal |
| GET | `/v1/pass/collection` | the minted designs, the pending ones, the counts, the last 10 mints, the schedule and the gate |

A mint, as both mint routes answer it:

```json
{
  "mint": {
    "mintId": "6705…",
    "designNumber": 137,
    "status": "confirmed",
    "transactionHash": "0x…",
    "founderNumber": 42,
    "hasGoldFrame": false,
    "failureCode": null,
    "createdAt": "2026-11-28T14:30:02.000Z",
    "mintedAt": "2026-11-28T14:30:03.000Z"
  }
}
```

`status` is `queued` (until the receipt), `confirmed` or `failed`. `transactionHash` is set once
the outbox signs it, so the reveal can link to MonadVision while it waits. `founderNumber` and
`hasGoldFrame` come from the `FoundingPassMinted` event. A failed mint names why in
`failureCode` (`PASS_ALREADY_MINTED`, `PASS_WALLET_ALREADY_USED` or `PASS_MINT_FAILED`), and
nothing was minted.

The collection:

```json
{
  "designCount": 1000,
  "mintedCount": 612,
  "mintedDesignNumbers": [3, 7, 137],
  "pendingDesignNumbers": [212],
  "recentMints": [
    { "designNumber": 137, "walletAddress": "0x3f…a1", "founderNumber": 612, "mintedAt": "…" }
  ],
  "schedule": {
    "phase": "openMint",
    "nextPhaseAt": "2026-12-14T14:30:00.000Z",
    "waitlistWindowStartsAt": "2026-11-28T14:30:00.000Z",
    "openMintStartsAt": "2026-11-30T14:30:00.000Z",
    "backupOpeningAt": "2026-12-14T14:30:00.000Z"
  },
  "isEarlyAccessGateOn": true
}
```

- `mintedCount` and `mintedDesignNumbers` are the chain's (`mintedCount()`, `mintedBitmap()`),
  read at most every 3 seconds. `pendingDesignNumbers` are mints still queued, plus any confirmed
  since that read, so a design never looks free in between. `recentMints` are the last 10
  confirmed, newest first (the live line), with the wallet checksummed.
- `nextPhaseAt` is when the phase changes by the clock (`null` once it's `allMinted` or
  `openToAll`), for the countdowns.

**Errors** (every refusal has its own code, so the site can say what to do next):

| Route | Errors |
|-------|--------|
| `email-code` | `TURNSTILE_FAILED` 403, `EMAIL_CODE_RECENTLY_SENT` 429 (`details.retryAfterSeconds`), `EMAIL_SEND_FAILED` 503 |
| `email-verify` | `EMAIL_CODE_INCORRECT` 400 (`details.attemptsLeft`), `EMAIL_CODE_EXPIRED` 400 (none pending, expired or used), `EMAIL_CODE_TOO_MANY_ATTEMPTS` 429 |
| `POST mints` | `TURNSTILE_FAILED` 403, `EMAIL_PROOF_INVALID` 401, `PASS_MINT_NOT_OPEN` 409 (`details.opensAt`), `PASS_WAITLIST_WINDOW_ONLY` 403 (`details.openMintStartsAt`), `PASS_ALL_MINTED` 409, `PASS_MINT_CLOSED` 409, `PASS_EMAIL_ALREADY_USED` 409 (`details.designNumber`), `PASS_WALLET_ALREADY_USED` 409 (`details.designNumber`, and `details.mintId` when the API minted it), `PASS_ALREADY_MINTED` 409 (`details.similarAvailableDesignNumbers`: 3 similar designs still free) |

**Turnstile** (D-043, D-045): siteverify must answer `success`, the route's action (`send-code`
for `email-code`, `mint` for `POST mints`) and a hostname of `WAITLIST_ALLOWED_ORIGINS`. Answers
from Cloudflare's test keys (development and tests; production refuses them at boot) carry no
action and the hostname `example.com`, so they count on `success` alone.

The mint checks run in that order: Turnstile, the email proof, the phase, the waitlist window,
the email, the wallet (in Mongo, then `balanceOf` on the chain), the design (the chain's bitmap,
then the unique index on insert). Racing mints of one design: the database lets the first insert
through, and the second gets `PASS_ALREADY_MINTED`.

**Email codes** (brief §15): 6 digits from `crypto.randomInt`, stored in `passEmailCodes` only as
an HMAC-SHA-256 hash, valid for 10 minutes and 5 tries, one email a minute per address. Each try
counts, the right code included; the right code deletes the record, so it works once. Sending a
code answers `sent` whether or not the email is on the waitlist or already has a pass.
A failed send deletes the record, so the person can try again at once.

**The schedule** (`lib/founding-pass/pass-schedule.ts`): from `PASS_WAITLIST_WINDOW_STARTS_AT`,
`PASS_WAITLIST_WINDOW_HOURS` and `PASS_BACKUP_OPENING_AT`, the clock and the minted count:

| Phase | When | Minting | Gate (if `EARLY_ACCESS_REQUIRED`) |
|-------|------|---------|------|
| `preview` | before the window | no (`PASS_MINT_NOT_OPEN`) | on |
| `waitlistWindow` | the window's 48 hours | waitlist emails that joined **before** it opened | on |
| `openMint` | from the window's end to the backup opening date | anyone | on |
| `allMinted` | all 1,000 minted (whatever the date) | no (`PASS_ALL_MINTED`) | off |
| `openToAll` | from the backup opening date, not all minted | no (`PASS_MINT_CLOSED`) | off |

**The early-access gate and Founder Sneakers** (`POST /v1/onboarding/starter-sneaker`): the
handler reads the wallet's pass from the chain (`balanceOf`, `tokenOfOwnerByIndex`) and the
pass's Founder Sneaker (`SneakerNft.founderSneakerTokenIdOf`).
- **Holds a pass, no Founder Sneaker yet:** queues `mintFounderSneaker` and the gas drip, even
  when the wallet already owns a normal Sneaker.
- **No pass, gate on:** `FOUNDING_PASS_REQUIRED` 403 (`details.phase`).
- **No pass, gate off:** today's starter Sneaker and gas drip.

The onboarding status adds `starterSneakerKind` (`founder` or `normal`: which free Sneaker this
wallet gets) and `isFoundingPassRequired` (the gate is on and the wallet holds no pass), so the
app knows which screen to show. The gate stays off until Metropolis judging ends (2026-10-27).

**Lacing:** when a `settleSession` confirms, the outbox job reads the wallet's pass. If it holds
one that isn't laced, it queues `laceFoundingPass` (`setLaced`). A 0-minute run sends no
transaction, so it laces nothing.

**New outbox kinds:** `mintFoundingPass` (key `mintFoundingPass:<mintId>`), `mintFounderSneaker`
(key `mintFounderSneaker:<passTokenId>`) and `laceFoundingPass` (key
`laceFoundingPass:<passTokenId>`). A confirmed `mintFoundingPass` writes the founder number, frame
and hash to its mint. A failed one (simulated or on-chain revert) marks its mint `failed`, which
frees the design, email and wallet. A confirmed `mintFounderSneaker` sets
`users.hasReceivedStarterSneaker`. `FoundingPass` has no pause, so a paused game holds only
`mintFounderSneaker` (D-032).

**CORS and limits:** the `/v1/pass/*` routes and `/v1/auth/nonce`, `/v1/auth/verify` and
`/v1/auth/refresh` answer the origins in `WAITLIST_ALLOWED_ORIGINS` (D-043). Per IP and minute:
`email-code` 5, `email-verify` 10, `POST mints` 10, `GET mints/:mintId` 60, `collection` 60. In
`bun test`, each injected request gets its own `remoteAddress`.

**The waitlist email** (`jobs/send-waitlist-window-emails.ts`, run by hand with
`bun run pass:send-waitlist-emails`): each sign-up from before the window opened gets exactly
one email, "Your 48 hours start now" (or, if it goes out before the window, when it starts), with
the window's open and close times. Oldest sign-ups first, `--limit` per run (Brevo's free plan
sends 300 a day). It stamps `windowEmailSentAt` before sending, so an address is never emailed
twice, and prints what it sent. A run stops at the first failed send: a refusal from Brevo (the
daily limit, say) gives that address back for the next run, while an unknown outcome (a timeout)
keeps the stamp, since that email may have gone out. Without `--send` it only counts, and `--send`
runs only with `NODE_ENV=production`.

**The deliverability check:** `cd apps/api && bun run pass:send-test-email <address>` sends one
sample code email through Brevo, reading only `BREVO_API_KEY` and `EMAIL_SENDER_ADDRESS`.

**The local stack** (D-045): `cd apps/api && bun run pass:local-stack` runs the whole Founding Pass
backend on the laptop for testing the website's mint: its own Anvil on port 8546 (chain 10143,
Monad's contract size limit), the contracts deployed by the tests' `deployTestContracts`, the
throwaway database `stridemon-pass-local` (dropped at start), and the API on port 3001. It builds
the API's environment itself (Anvil's keys, Cloudflare's test Turnstile secrets, codes printed
instead of sent) and never reads `.env`. Flags pick the phase, add waitlist emails, mint passes
ahead, fail Turnstile, slow the blocks and allow another site origin (`website/README.md`).

**The lost-wallet move** (D-041) isn't an API route. Support checks the email by hand and runs
`scripts/recover-founding-pass` from the deployer key.

## Logging

Pino (Fastify's logger), JSON in production and pretty in development.

- `request.log`, not `console.log`.
- Errors are logged as `log.error({ err: error, activitySessionId }, 'Settlement failed')`.
- Never log tokens, signatures, private keys or raw GPS. Log counts and ids.

## The help chatbot (Part 8, D-048)

`POST /v1/help/chat` answers questions on the website's `/pass` and `/help` pages from the help
page's own text (`lib/help-chat/help-knowledge.ts`, generated by `bun run help:export-knowledge`
from `website/src/content/help.ts`).

```json
{ "messages": [{ "role": "visitor", "text": "The code didn't arrive" }] }
```

At most 8 messages of 500 characters, oldest first, ending with the visitor's question. It
answers `200` with one of:

```json
{ "status": "answered", "answerText": "Look in spam and promotions…", "helpTopicIds": ["code-not-arriving"] }
{ "status": "monthlyCapReached" }
```

`helpTopicIds` (at most two) are anchors on `/help`. Errors: `VALIDATION_FAILED` 400,
`RATE_LIMITED` 429 (30 an hour per IP), `HELP_CHAT_UNAVAILABLE` 503 (no `BEDROCK_API_KEY`, or
Bedrock failed).

- **Order:** a question holding a wallet secret gets a fixed answer without the model and costs
  nothing. Otherwise the handler prices this month's `helpChatUsage` at `HELP_CHAT_MODEL`'s list
  price; at `HELP_CHAT_MONTHLY_CAP_USD` it answers `monthlyCapReached`. Otherwise it asks Bedrock
  (`services/help-chat-model.ts`), parses the `TOPICS:` line (`lib/help-chat/parse-help-chat-reply.ts`)
  and adds the reply's tokens to the month.
- **Nothing personal is kept:** no messages, no IPs. The request body is never logged.
- **The test list:** `cd apps/api && bun run help:check-answers` (live model, needs the key).

