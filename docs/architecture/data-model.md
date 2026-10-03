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
type ChainTransactionKind = 'mintStarterSneaker' | 'settleSession' | 'sendGasDrip'

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
