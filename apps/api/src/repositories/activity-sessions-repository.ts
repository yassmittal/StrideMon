import type { ActivityValidationResult } from '@stridemon/shared/api-contracts'
import type {
  ActivitySessionRejectionReason,
  ActivitySessionStatus,
} from '@stridemon/shared/domain'
import { type Collection, type Db, MongoServerError, type ObjectId } from 'mongodb'

const MONGO_DUPLICATE_KEY_ERROR_CODE = 11000

export type ActivitySessionDocument = {
  _id: ObjectId
  userId: ObjectId
  /** Lowercase. */
  walletAddress: string
  /** uint256 as a decimal string. */
  sneakerTokenId: string
  /** `keccak256` of `_id`, the `sessionId` Phase 5 sends to `settleSession`. */
  onChainSessionId: string
  status: ActivitySessionStatus
  startedAt: Date
  finishedAt: Date | null
  /** Read from the chain at start, for display and audit. */
  energyAtStart: number
  validationResult: ActivityValidationResult | null
  rejectionReason: ActivitySessionRejectionReason | null
  createdAt: Date
  /** Also bumped by every sample upload: the abandon job reads it. */
  updatedAt: Date
}

export function getActivitySessionsCollection(database: Db): Collection<ActivitySessionDocument> {
  return database.collection<ActivitySessionDocument>('activitySessions')
}

/**
 * Inserts a new `active` session. Returns null when the wallet or the Sneaker
 * already has one: the partial unique indexes refuse the second, so two starts
 * racing can never both succeed.
 */
export async function insertActiveActivitySession(
  database: Db,
  {
    activitySessionId,
    userId,
    walletAddress,
    sneakerTokenId,
    onChainSessionId,
    energyAtStart,
    now,
  }: {
    activitySessionId: ObjectId
    userId: ObjectId
    walletAddress: string
    sneakerTokenId: string
    onChainSessionId: string
    energyAtStart: number
    now: Date
  },
): Promise<ActivitySessionDocument | null> {
  const activitySession: ActivitySessionDocument = {
    _id: activitySessionId,
    userId,
    walletAddress: walletAddress.toLowerCase(),
    sneakerTokenId,
    onChainSessionId,
    status: 'active',
    startedAt: now,
    finishedAt: null,
    energyAtStart,
    validationResult: null,
    rejectionReason: null,
    createdAt: now,
    updatedAt: now,
  }
  try {
    await getActivitySessionsCollection(database).insertOne(activitySession)
    return activitySession
  } catch (error) {
    if (error instanceof MongoServerError && error.code === MONGO_DUPLICATE_KEY_ERROR_CODE) {
      return null
    }
    throw error
  }
}

/** The session in the way of a new one: this wallet's, or this Sneaker's. */
export function findActiveActivitySessionForWalletOrSneaker(
  database: Db,
  { walletAddress, sneakerTokenId }: { walletAddress: string; sneakerTokenId: string },
): Promise<ActivitySessionDocument | null> {
  return getActivitySessionsCollection(database).findOne({
    status: 'active',
    $or: [{ walletAddress: walletAddress.toLowerCase() }, { sneakerTokenId }],
  })
}

/** One of the user's sessions. Someone else's reads as missing (security.md → Authorization). */
export function findActivitySessionOfUser(
  database: Db,
  { activitySessionId, userId }: { activitySessionId: ObjectId; userId: ObjectId },
): Promise<ActivitySessionDocument | null> {
  return getActivitySessionsCollection(database).findOne({ _id: activitySessionId, userId })
}

/** Records that samples arrived, which keeps an active session from being abandoned. */
export async function touchActiveActivitySession(
  database: Db,
  { activitySessionId, now }: { activitySessionId: ObjectId; now: Date },
): Promise<void> {
  await getActivitySessionsCollection(database).updateOne(
    { _id: activitySessionId, status: 'active' },
    { $set: { updatedAt: now } },
  )
}

/**
 * active → validating, stamping `finishedAt`. Returns false if the session was no
 * longer active, so only one finish request ever moves it.
 */
export async function markActivitySessionValidating(
  database: Db,
  { activitySessionId, now }: { activitySessionId: ObjectId; now: Date },
): Promise<boolean> {
  const updateResult = await getActivitySessionsCollection(database).updateOne(
    { _id: activitySessionId, status: 'active' },
    { $set: { status: 'validating', finishedAt: now, updatedAt: now } },
  )
  return updateResult.modifiedCount === 1
}

/** validating → settling, with the validated numbers. Phase 5 enqueues the settlement. */
export async function markActivitySessionSettling(
  database: Db,
  {
    activitySessionId,
    validationResult,
    now,
  }: { activitySessionId: ObjectId; validationResult: ActivityValidationResult; now: Date },
): Promise<void> {
  await getActivitySessionsCollection(database).updateOne(
    { _id: activitySessionId, status: 'validating' },
    { $set: { status: 'settling', validationResult, updatedAt: now } },
  )
}

export async function markActivitySessionRejected(
  database: Db,
  {
    activitySessionId,
    rejectionReason,
    now,
  }: {
    activitySessionId: ObjectId
    rejectionReason: ActivitySessionRejectionReason
    now: Date
  },
): Promise<void> {
  await getActivitySessionsCollection(database).updateOne(
    { _id: activitySessionId, status: 'validating' },
    { $set: { status: 'rejected', rejectionReason, updatedAt: now } },
  )
}

/** Every active session untouched since `staleBefore` becomes `abandoned`. Returns how many. */
export async function abandonActivitySessionsIdleSince(
  database: Db,
  { staleBefore, now }: { staleBefore: Date; now: Date },
): Promise<number> {
  const updateResult = await getActivitySessionsCollection(database).updateMany(
    { status: 'active', updatedAt: { $lt: staleBefore } },
    { $set: { status: 'abandoned', updatedAt: now } },
  )
  return updateResult.modifiedCount
}
