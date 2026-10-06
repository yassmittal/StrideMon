# Security

This is testnet, so nothing here protects real money yet. We still build it the
way mainnet will need it. Retrofitting security is far more expensive than
starting with it.

## Keys and secrets

| Secret | Lives in | Never in |
|--------|----------|----------|
| `GAME_SERVER_PRIVATE_KEY` | API env (testnet); KMS/HSM signer (Phase 10) | mobile app, logs, Mongo, docs |
| Deployer / admin key | developer machine for testnet; multisig for mainnet | API env |
| `JWT_ACCESS_TOKEN_SECRET` | API env | mobile app |
| Refresh tokens | device secure store; **SHA-256 hash** in Mongo | logs, plain-text Mongo |
| MongoDB URI | API env | mobile app |

- `.env` files are gitignored, and `.env.example` documents every variable with
  fake values.
- The game-server key holds **only** `GAME_SERVER_ROLE`. It is not the admin.
  If it leaks, the attacker can settle fake sessions (capped by each Sneaker's
  energy, see below) and mint starters, but can't change rules, grant roles or
  touch anyone's balance.

## Authentication (SIWE → JWT)

- The API builds the SIWE message itself (domain, chain id, nonce, issued-at,
  expiration of 5 minutes). The client only signs it.
- On verify, the API checks:
  - the signature (viem `verifySiweMessage`)
  - the domain equals `SIWE_DOMAIN`
  - the chain id is the Monad chain id
  - the nonce exists, isn't expired, and belongs to this address. The nonce is
    then **deleted**.
- The access token is a JWT, expires in 15 minutes, and carries
  `{ sub: userId, walletAddress }` only.
- The refresh token is 32 random bytes and rotates on every use. If an
  already-rotated token is reused, all of that user's auth sessions are revoked
  (a stolen token has been detected).

## Authorization

- Every 🔒 route loads the user from the token and checks **ownership of the
  resource**. For example, `GET /activity-sessions/:id` returns 404 (not 403)
  for someone else's session, so ids can't be probed.
- Chain ownership is checked against the chain, never against something the
  client sent.

## Activity validation (MVP anti-cheat)

`MVP.md` §8 asks for basic validation, not a sophisticated system. What we
check, all in pure functions in `apps/api/src/lib/activity-validation/`:

| Check | Rule (initial) | On failure |
|-------|----------------|------------|
| Mock location | Any sample with `isMockedLocation === true` (Android only, D-020) | **Session rejected** (`MOCK_LOCATION_DETECTED`) |
| Sample plausibility | Drop a sample if its accuracy is missing or worse than 50 m, its timestamp isn't after the previous kept sample (in `sequenceNumber` order), or it's more than 60 s in the future of `receivedAt` | Sample ignored, counted |
| Duration sanity | Samples inside `[startedAt − 60 s, finishedAt + 60 s]` and no later than `startedAt + 4 h + 60 s`. The 60 s allows for the phone's clock differing from the server's (D-021) | Samples outside ignored |
| Too little data | Fewer than 10 valid samples | Session rejected (`INSUFFICIENT_ACTIVITY_DATA`) |
| Teleport | Implied speed between consecutive fixes > 40 km/h | That segment ignored (its distance and time) |
| Sampling gaps | A gap longer than 60 s breaks every minute it touches | Minute not counted |
| Minute speed band | Minutes are whole 60 s windows from the first valid sample; segments crossing a boundary are split by time. A minute counts only if its average speed is 1–20 km/h. A trailing partial minute never counts | Minute not counted |

Output: `{ activeMinutes, distanceMeters, averageSpeedKilometersPerHour, rejectedSampleCount, warnings }`.
`distanceMeters` is the distance inside active minutes, in whole meters. `warnings` names each
rule that dropped something: `lowGpsAccuracy`, `deviceClockMismatch`, `sessionTooLong`,
`teleportDetected`, `samplingGap`, `vehicleSpeedDetected`.

The checks run in the table's order. A rejected run isn't an error: `POST …/finish`
answers 200 with `status: 'rejected'` and the code as `rejectionReason` (D-021).

**Why this is enough for the MVP:** the contract caps any single settlement at
the Sneaker's current energy (at most 10 minutes' worth), and energy regenerates
slowly. The most a perfect cheater can earn is exactly what an honest player can
earn, which bounds the damage. Stronger anti-cheat (motion-sensor correlation,
device attestation with App Attest / Play Integrity, per-device rate limits) is
Phase 10.

## Privacy

- Raw GPS **never** goes on-chain. It would publish where players live and run,
  permanently. Only the aggregates (`activeMinutes`, `distanceMeters`) and a
  hashed `sessionId` are settled.
- `locationSamples` get a 30-day TTL (Phase 8).
- The app explains location use before the OS prompt appears.
- The landing page's waitlist (D-037) stores an email, an optional phone platform and the
  page's `?source=`, never a wallet address, an IP address or a user agent. An email is deleted
  on request (the form says so): `db.waitlistSignups.deleteOne({ email: '<lowercased email>' })`
  against the Atlas `stridemon` database.

## API hardening

- `@fastify/rate-limit`: strict limits on `/v1/auth/*` (e.g. 10 per minute per
  IP), moderate limits elsewhere, and a separate budget for sample uploads.
- Body size limit, with an upper bound on samples per upload request (e.g. 500).
- All input is validated by zod schemas, and unknown fields are stripped.
- Response schemas serialize, so internal fields can't leak.
- Stack traces are never returned to clients.
- The gas drip is one per wallet, ever, recorded in `users.hasReceivedGasDrip`
  and the outbox idempotency key.
- **CORS** is off everywhere except `POST /v1/waitlist`, which allows only the origins in
  `WAITLIST_ALLOWED_ORIGINS` (the landing page, D-037). The app is native and sends no origin.
- **The waitlist route** is public, so it has its own limit (5 a minute per IP) and a hidden
  honeypot field: a filled-in honeypot answers `200` and stores nothing, so a bot learns nothing.
  No CAPTCHA (Turnstile is the free next step if junk appears).

## Smart contracts

- Access is controlled by OpenZeppelin `AccessControl` roles, with no single
  all-powerful owner key in daily use.
- `SneakerGame` is `Pausable`: if something goes wrong in a demo or in
  production, settlement, repair and upgrade stop with one transaction.
- `nonReentrant` is on every state-changing external function, and
  checks-effects-interactions is followed everywhere.
- Burning only ever happens from `msg.sender`, and a test pins this invariant.
- `settleSession` is idempotent by `sessionId`, and a test pins that too.
- Invariant tests: total `StrideToken` supply equals the sum of minted
  settlement rewards minus the sum of repair and upgrade burns.
- **Before mainnet** (Phase 10): an external audit, a multisig admin,
  timelocked config changes, and a static analysis pass (Slither) in the pipeline.

## Mobile

- No secrets in the bundle, because every `EXPO_PUBLIC_*` value is public.
- Refresh tokens go in `expo-secure-store`, never in AsyncStorage or SQLite.
- HTTPS only outside local development.
- The app never asks the wallet to sign anything except the SIWE message and
  the explicit player transactions, and each has a screen that explains it first.
