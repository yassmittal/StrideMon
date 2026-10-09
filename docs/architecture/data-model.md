# Data Model

Two stores, each with a clear job:

- **Monad** holds game state: Sneakers, energy, rewards. See `smart-contracts.md`.
- **MongoDB** holds what must *not* be on-chain (raw GPS, auth) and bookkeeping
  about our own chain writes.

**MongoDB never caches chain state as truth.** If the app needs a Sneaker's
durability, it reads the chain. An indexer that mirrors chain events into Mongo
for fast lists is a Phase 9/10 concern, and even then it's a cache.

## Conventions

- Collection names are camelCase plurals: `activitySessions`.
- Every document has `_id: ObjectId`, `createdAt: Date` and `updatedAt: Date`.
- Wallet addresses are stored **lowercase** and compared lowercase. They are
  displayed checksummed (viem `getAddress`).
- Token amounts are stored as **decimal strings of wei** (`"50000000000000000000"`),
  never as numbers. A JavaScript `number` silently loses precision above 2^53.
- Enum-like fields are string unions defined once in `packages/shared/src/domain/`.
- Each collection's TypeScript type lives next to its repository in
  `apps/api/src/repositories/`, and every index is declared in `plugins/mongo-indexes.ts`.

**Naming note.** "Session" means two different things in this product, so we
never use it bare. `authSessions` holds login sessions (refresh tokens), and
`activitySessions` holds walks and runs.

---

## `users`

```ts
type UserDocument = {
  _id: ObjectId
  walletAddress: string          // lowercase, unique
  hasReceivedStarterSneaker: boolean
  hasReceivedGasDrip: boolean
  lastSignedInAt: Date
  createdAt: Date
  updatedAt: Date
}
```

Index: `{ walletAddress: 1 }` unique.

## `authNonces`

One-time nonces for SIWE messages.

```ts
type AuthNonceDocument = {
  _id: ObjectId
  nonce: string                  // random, unique
  walletAddress: string
  expiresAt: Date                // TTL index deletes it
  createdAt: Date
}
```

Indexes: `{ nonce: 1 }` unique, `{ expiresAt: 1 }` TTL (`expireAfterSeconds: 0`).
The nonce is deleted when it's used, so a signed message can't be replayed.

## `authSessions`

One per signed-in device.

```ts
type AuthSessionDocument = {
  _id: ObjectId
  userId: ObjectId
  refreshTokenHash: string       // SHA-256 of the refresh token, never the token itself
  deviceLabel: string | null     // e.g. "iPhone 15", for a future "your devices" screen
  expiresAt: Date
  revokedAt: Date | null
  revocationReason: AuthSessionRevocationReason | null   // set together with revokedAt
  createdAt: Date
  updatedAt: Date
}

type AuthSessionRevocationReason =
  | 'rotated'        // its refresh token was exchanged for a new auth session
  | 'signedOut'      // the player signed out on this device
  | 'reuseDetected'  // another of the user's rotated tokens was replayed
```

Indexes: `{ refreshTokenHash: 1 }` unique, `{ userId: 1 }`, and `{ expiresAt: 1 }` TTL.
Refresh tokens rotate: each refresh revokes the old auth session (`rotated`) and
inserts a new one. Only a replayed **`rotated`** token means a copy exists, so only
that revokes every auth session of the user. A signed-out token is just refused, so
a stale request from one device can't sign the player out everywhere.

## `activitySessions`

One document per walk or run.

```ts
type ActivitySessionStatus =
  | 'active'       // tracking in progress
  | 'validating'   // finish received, being validated (short-lived)
  | 'settling'     // valid; settlement transaction queued or in flight
  | 'settled'      // on-chain settlement confirmed
  | 'rejected'     // failed validation, or settlement reverted — see rejectionReason
  | 'abandoned'    // never finished; closed by a cleanup job

type ActivitySessionDocument = {
  _id: ObjectId
  userId: ObjectId
  walletAddress: string
  sneakerTokenId: string                 // uint256 as a decimal string
  onChainSessionId: string               // 0x… keccak256(_id), sent to settleSession
  status: ActivitySessionStatus

  startedAt: Date
  finishedAt: Date | null
  energyAtStart: number                  // read from chain at start, for display and audit

  validationResult: {
    activeMinutes: number
    distanceMeters: number
    averageSpeedKilometersPerHour: number
    rejectedSampleCount: number
    warnings: ActivityValidationWarning[]
  } | null

  settlement: {                          // written once, when settled (D-026)
    chainTransactionId: ObjectId | null  // null only for a 0-minute run (no transaction sent)
    transactionHash: string | null       // null only for a 0-minute run
    rewardAmountWei: string              // from the SessionSettled event, not our estimate
    durabilityLoss: number
    rewardedMinutes: number
    settledAt: Date
  } | null

  rejectionReason: ActivitySessionRejectionReason | null
  createdAt: Date
  updatedAt: Date                        // also bumped by every sample upload (see the cleanup job)
}

type ActivitySessionRejectionReason =    // each is also an ApiErrorCode
  | 'MOCK_LOCATION_DETECTED'             // Phase 4
  | 'INSUFFICIENT_ACTIVITY_DATA'         // Phase 4
  | 'SNEAKER_TRANSFERRED_DURING_SESSION' // Phase 5

type ActivityValidationWarning =         // security.md → Activity validation
  | 'lowGpsAccuracy' | 'deviceClockMismatch' | 'sessionTooLong'
  | 'teleportDetected' | 'samplingGap' | 'vehicleSpeedDetected'
```

`validationResult` is set when validation accepts the run, and `rejectionReason` when
it rejects it. Only one of them is non-null, except for `SNEAKER_TRANSFERRED_DURING_SESSION`:
that run passed validation, so it keeps its `validationResult`. An active session whose `updatedAt`
is 30 minutes old (no sample upload since) is `abandoned` by the cleanup job.

Indexes:

- `{ userId: 1, createdAt: -1 }` for history, newest first.
- A partial unique index on `{ walletAddress: 1 }` where `status: 'active'`, so
  the **database** enforces "one active run per wallet". The same pattern on
  `{ sneakerTokenId: 1 }` covers "one active run per Sneaker".
- `{ status: 1, updatedAt: 1 }` for the cleanup job that abandons stale sessions.

## `locationSamples`

Raw GPS, kept separate from `activitySessions` so a long run can't approach
Mongo's 16 MB document limit and the history list stays light.

```ts
type LocationSampleDocument = {
  _id: ObjectId
  activitySessionId: ObjectId
  sequenceNumber: number        // assigned on the device, makes uploads idempotent
  recordedAt: Date              // device timestamp of the fix
  latitude: number
  longitude: number
  accuracyMeters: number | null
  speedMetersPerSecond: number | null
  isMockedLocation: boolean     // Android only (expo-location `mocked`); always false from iOS (D-020)
  receivedAt: Date              // server time, used to detect clock tampering
}
```

Indexes: `{ activitySessionId: 1, sequenceNumber: 1 }` unique, so re-uploading a
batch after a network error is a no-op, and `{ receivedAt: 1 }` TTL
(`expireAfterSeconds`: 30 days).

**Retention:** samples are needed for validation and dispute review, not
forever. The TTL index deletes each one 30 days after it arrived (Phase 8.4),
and the location permission explainer tells the player so.

## `chainTransactions` (outbox)

Every transaction the **game server** sends. Player-signed transactions
(repair, upgrade, transfer) never appear here.

```ts
type ChainTransactionKind =
  | 'mintStarterSneaker' | 'settleSession' | 'sendGasDrip'
  | 'mintFoundingPass' | 'mintFounderSneaker' | 'laceFoundingPass'   // Founding Pass (D-043)

type ChainTransactionStatus =
  | 'queued'      // written, not yet signed
  | 'submitted'   // signed and saved (D-019), then broadcast. Has a hash
  | 'confirmed'   // receipt status success
  | 'failed'      // simulation or the transaction reverted — see lastError

type ChainTransactionDocument = {
  _id: ObjectId
  kind: ChainTransactionKind
  idempotencyKey: string        // e.g. "settleSession:<activitySessionId>", unique
  payload: Record<string, unknown>  // arguments, validated per kind with zod
  status: ChainTransactionStatus
  transactionHash: string | null
  senderNonce: number | null
  signedTransaction: string | null  // the signed bytes, saved before broadcast (D-019)
  attemptCount: number          // broadcasts so far
  lastError: string | null
  createdAt: Date
  updatedAt: Date
}
```

Indexes: `{ idempotencyKey: 1 }` unique, `{ status: 1, createdAt: 1 }`.

The unique `idempotencyKey` is what makes "enqueue a settlement" safe to call
twice. Phase 3 keys: `mintStarterSneaker:<walletAddress>` and
`sendGasDrip:<walletAddress>` (lowercase), so each wallet gets at most one of each.

A transient failure (the RPC is down, the game server is out of MON) leaves the
record where it was, with `lastError` set, and the next run retries it. Only a
revert is `failed`.

## `jobLeases`

Which API process may run a background job right now (D-019). The outbox sender
holds `processChainTransactions`, so only one process ever signs with the
game-server key.

```ts
type JobLeaseDocument = {
  _id: string          // the job name, e.g. "processChainTransactions"
  holderId: string     // "<hostname>:<apiPort>", so a restarted process reclaims its own lease
  expiresAt: Date      // renewed while the job runs; anyone may take it after this
  updatedAt: Date
}
```

No extra indexes: every lookup is by `_id`.

## `waitlistSignups`

Emails left on the landing page's waitlist (D-037). Not tied to a wallet or a user: the app
gets the wallet when someone plays.

```ts
type WaitlistPhonePlatform = 'android' | 'ios'

type WaitlistSignupDocument = {
  _id: ObjectId
  email: string                                // trimmed and lowercased, unique
  phonePlatform: WaitlistPhonePlatform | null  // optional on the form
  source: string | null                        // the page's ?source=, at most 32 of [a-z0-9-]
  createdAt: Date
}
```

Index: `{ email: 1 }` unique.

A sign-up is written once and never changed, so there's no `updatedAt`. A repeat email is an
upsert with `$setOnInsert` only: the first sign-up's platform and source stay. No IP address
or user agent is ever stored. An email is deleted by hand when its owner asks (security.md →
Privacy).

---

## `helpChatUsage`

The help chatbot's spend, one document per UTC month (D-048). It holds counts only: never a
question, an answer or an IP address.

```ts
type HelpChatUsageDocument = {
  _id: string               // the month, '2026-10'
  inputTokenCount: number   // summed from Bedrock's usage numbers
  outputTokenCount: number
  answerCount: number       // answers that used the model
  updatedAt: Date
}
```

No extra index: reads and writes go by `_id`. Each answer `$inc`s the counts with an upsert.

---

## Founding Pass collections (Part 3, D-041, D-043)

**The chain stays the truth** for who holds which pass and Sneaker. These collections hold the
email side, which the chain never sees, and the bookkeeping for our own mints.

### `passEmailCodes`

One pending 6-digit code per email, for the website's email step.

```ts
type PassEmailCodeDocument = {
  _id: ObjectId
  email: string            // trimmed and lowercased, unique
  codeHash: string         // HMAC-SHA-256 of "<email>:<code>", keyed with EMAIL_PROOF_SECRET (D-043)
  attemptCount: number     // tries so far, the right one included; at most 5
  sentAt: Date             // a new code waits a minute after this
  expiresAt: Date          // sentAt + 10 minutes; TTL index deletes it
  createdAt: Date
}
```

Indexes: `{ email: 1 }` unique, `{ expiresAt: 1 }` TTL (`expireAfterSeconds: 0`).

- The code itself is never stored. A new code replaces the record (and resets the tries) once
  the minute has passed. The right code deletes it, so a code works once.
- The unique email makes "one a minute" safe against two requests at once: the second can't
  insert a second record.

A verified code becomes a signed **email proof** (a JWT, D-043), so nothing more is stored for it.

### `foundingPassMints`

One document per mint request.

```ts
type FoundingPassMintStatus = 'queued' | 'confirmed' | 'failed'

type FoundingPassMintDocument = {
  _id: ObjectId                 // the mintId
  designNumber: number          // 1 to 1,000, the pass's token id
  email: string                 // from the email proof, lowercased
  walletAddress: string         // lowercase, from the access token
  status: FoundingPassMintStatus  // its outbox record is keyed mintFoundingPass:<_id>
  founderNumber: number | null  // from FoundingPassMinted, once confirmed
  hasGoldFrame: boolean | null  // likewise
  transactionHash: string | null
  failureCode: 'PASS_ALREADY_MINTED' | 'PASS_WALLET_ALREADY_USED' | 'PASS_MINT_FAILED' | null
  mintedAt: Date | null         // when the confirmation was recorded (updatedAt then too)
  createdAt: Date
  updatedAt: Date
}
```

Indexes:
- **Unique by design number, by email and by wallet**, each a partial index over
  `status: { $in: ['queued', 'confirmed'] }` (MongoDB 6.0 or later). So two racing requests
  can't both take #0137, an email or wallet can't get two passes, and a failed mint frees all
  three.
- `{ status: 1, updatedAt: -1 }` for the queued mints and the last 10 confirmed.

It links an email to a wallet: personal data, named on the privacy page (Part 5). It's how
support checks a lost-wallet request (D-041).

### How the waitlist counts for the window

During the 48-hour waitlist window, a mint's verified email must be in `waitlistSignups` with a
`createdAt` **before** the window opened. Nothing is copied: the mint looks the email up. After
the window, the waitlist no longer matters for minting.

`waitlistSignups` gains one field, `windowEmailSentAt: Date` (absent until then): the time its one
email ("Your 48 hours start now") was sent. The sender sets it before sending, so it never emails
an address twice. It's the one change to a sign-up after it's written. Index:
`{ createdAt: 1 }`, for the sender's oldest-first order.

### New `chainTransactions` kinds

`mintFoundingPass` (key `mintFoundingPass:<mintId>`), `mintFounderSneaker` (key
`mintFounderSneaker:<passTokenId>`) and `laceFoundingPass` (key `laceFoundingPass:<passTokenId>`),
all sent by the game-server key through the outbox (D-043).
