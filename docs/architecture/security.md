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
- The game-server key holds **only** `GAME_SERVER_ROLE` (and, for the Founding Pass,
  `MINTER_ROLE` on `FoundingPass`). It is not the admin.
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
- **CORS** is off everywhere except the website's routes (`POST /v1/waitlist`, the Founding Pass
  routes below), which allow only the origins in `WAITLIST_ALLOWED_ORIGINS` (D-037, D-043). The
  app is native and sends no origin.
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

## The Founding Pass (D-041)

The contracts are built (Part 2, D-042) and the API (Part 3, D-043). Part 5 of
[`../founding-pass/`](../founding-pass/README.md) builds the website's side, from the brief's §9, §10 and §15 ([`../founding-pass-brief.md`](../founding-pass-brief.md)).
The website becomes a second client of the API, with a wallet on `/pass` only.

**Email codes** (the first attempt's rules, brief §15):
- 6 digits, not magic links, because mail scanners open links and use them up.
- Stored only as a hash (HMAC-SHA-256 keyed with `EMAIL_PROOF_SECRET`, so a database copy can't
  be brute-forced through the million codes), valid for 10 minutes and 5 tries, and sent at most
  once a minute per email.
- The same answer for a new email and a known one, so the route never reveals who's there.
- A verified code gives a signed **email proof** that lasts a few hours. It has its own secret,
  not the access-token one.
- In production the API refuses to boot without `BREVO_API_KEY`. In development it logs the code
  instead.

**Bots:**
- **Cloudflare Turnstile** (free) on both **Send code** and **Mint**, checked server-side with
  Turnstile's siteverify: it must answer `success`, the route's action (`send-code` or `mint`, so
  a token from one can't be spent on the other) and a hostname of the site's own origins
  (`WAITLIST_ALLOWED_ORIGINS`) (D-045). On Send code it also stops bots from using up Brevo's 300
  free emails a day.
- A per-IP rate limit on every public pass route.
- One pass per email (the API) and per wallet (the API and the contract). One-of-ones give bots a
  reason to snipe the Legendaries the moment minting opens, so these are on from the start.

**CORS:** the `/v1/pass/*` routes and SIWE's `/v1/auth/nonce`, `/v1/auth/verify` and
`/v1/auth/refresh` accept the site's origins (the same list as the waitlist). Refresh is on the
list so "Get ready" survives until the mint without a second wallet signature (D-043). Every
other route stays closed to browsers.

**Who holds which role:**

| Role | Contract | Held by | Can |
|------|----------|---------|-----|
| `DEFAULT_ADMIN_ROLE` | `FoundingPass` | deployer | grant roles, `setArtRenderer` |
| `MINTER_ROLE` | `FoundingPass` | game-server key | `mint`, `setLaced` |
| `RECOVERY_ROLE` | `FoundingPass`, `SneakerGame` | deployer, **never** the game-server key | the lost-wallet move: a pass and its Founder Sneaker to a new wallet |
| `GAME_SERVER_ROLE` | `SneakerGame` | game-server key | as today, plus minting one Founder Sneaker per pass |

The deploy scripts wire exactly this, and `DeployGame.t.sol` checks it (D-042).

- If the game-server key leaks, an attacker could mint the remaining passes to wallets of their
  own. The admin revokes `MINTER_ROLE`, and the passes it minted are visible on-chain. The
  attacker still can't move a pass or touch a Sneaker someone owns.
- **The lost-wallet move** is manual, on request only. A code sent to the pass's email must
  check out, and the new wallet must not hold a pass. Yash runs it from the deployer key
  (`scripts/recover-founding-pass`). So the pass can't be sent or sold by its holder, but the
  admin can move it, and the help page says so. `SneakerGame.recoverFounderSneaker` can only move
  a Founder Sneaker to whoever holds its pass, so even `RECOVERY_ROLE` can't send a Sneaker
  anywhere else (D-042).

**Secrets** (API env only, like the others): `BREVO_API_KEY`, `TURNSTILE_SECRET_KEY` and
`EMAIL_PROOF_SECRET`. The Turnstile **site** key is public and lives in the website. Production
refuses Cloudflare's Turnstile test secrets, and an email-proof secret equal to the access-token
one.

**Privacy:** the website now collects an email and, for minting, a wallet. The mint record links
the two. The privacy page names Brevo and Turnstile and says so (Part 5). Showing "Minted by
0x3f…a1" is fine, since ownership is public on-chain anyway.
