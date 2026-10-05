import type { ChainTransactionKind, ChainTransactionStatus } from '@stridemon/shared/domain'
import { type Collection, type Db, MongoServerError, type ObjectId } from 'mongodb'

const MONGO_DUPLICATE_KEY_ERROR_CODE = 11000

export type ChainTransactionDocument = {
  _id: ObjectId
  kind: ChainTransactionKind
  /** Unique, e.g. `mintStarterSneaker:<walletAddress>`. What makes enqueueing safe to repeat. */
  idempotencyKey: string
  /** The call's arguments. Validated per kind with zod before use (lib/chain-transactions). */
  payload: Record<string, unknown>
  status: ChainTransactionStatus
  transactionHash: string | null
  senderNonce: number | null
  /** The signed bytes, saved before the first broadcast so recovery never signs twice (D-019). */
  signedTransaction: string | null
  /** Broadcasts so far. */
  attemptCount: number
  lastError: string | null
  createdAt: Date
  updatedAt: Date
}

export function getChainTransactionsCollection(database: Db): Collection<ChainTransactionDocument> {
  return database.collection<ChainTransactionDocument>('chainTransactions')
}

/**
 * Queues a transaction, or returns the one already queued under the same key.
 * Calling it twice never creates two transactions.
 */
export async function enqueueChainTransaction(
  database: Db,
  {
    kind,
    idempotencyKey,
    payload,
    now,
  }: {
    kind: ChainTransactionKind
    idempotencyKey: string
    payload: Record<string, unknown>
    now: Date
  },
): Promise<ChainTransactionDocument> {
  try {
    const chainTransaction = await getChainTransactionsCollection(database).findOneAndUpdate(
      { idempotencyKey },
      {
        $setOnInsert: {
          kind,
          payload,
          status: 'queued',
          transactionHash: null,
          senderNonce: null,
          signedTransaction: null,
          attemptCount: 0,
          lastError: null,
          createdAt: now,
          updatedAt: now,
        },
      },
      { upsert: true, returnDocument: 'after' },
    )
    if (chainTransaction === null) throw new Error('Enqueueing returned no document')
    return chainTransaction
  } catch (error) {
    // Two requests racing on one key: the loser's upsert hits the unique index,
    // and the winner's record is the one to return.
    if (!(error instanceof MongoServerError) || error.code !== MONGO_DUPLICATE_KEY_ERROR_CODE) {
      throw error
    }
    const existingChainTransaction = await findChainTransactionByIdempotencyKey(
      database,
      idempotencyKey,
    )
    if (existingChainTransaction === null) throw error
    return existingChainTransaction
  }
}

export function findChainTransactionByIdempotencyKey(
  database: Db,
  idempotencyKey: string,
): Promise<ChainTransactionDocument | null> {
  return getChainTransactionsCollection(database).findOne({ idempotencyKey })
}

/** Signed transactions whose outcome isn't recorded yet, oldest first. */
export function listSubmittedChainTransactions(database: Db): Promise<ChainTransactionDocument[]> {
  return getChainTransactionsCollection(database)
    .find({ status: 'submitted' })
    .sort({ createdAt: 1, _id: 1 })
    .toArray()
}

export function findOldestQueuedChainTransaction(
  database: Db,
): Promise<ChainTransactionDocument | null> {
  return getChainTransactionsCollection(database).findOne(
    { status: 'queued' },
    { sort: { createdAt: 1, _id: 1 } },
  )
}

/**
 * queued → submitted, with everything needed to re-broadcast it. Written before
 * the broadcast (D-019). Returns false if the record was no longer queued.
 */
export async function markChainTransactionSubmitted(
  database: Db,
  {
    chainTransactionId,
    transactionHash,
    senderNonce,
    signedTransaction,
    now,
  }: {
    chainTransactionId: ObjectId
    transactionHash: string
    senderNonce: number
    signedTransaction: string
    now: Date
  },
): Promise<boolean> {
  const updateResult = await getChainTransactionsCollection(database).updateOne(
    { _id: chainTransactionId, status: 'queued' },
    {
      $set: {
        status: 'submitted',
        transactionHash,
        senderNonce,
        signedTransaction,
        lastError: null,
        updatedAt: now,
      },
    },
  )
  return updateResult.modifiedCount === 1
}

export async function recordChainTransactionBroadcast(
  database: Db,
  { chainTransactionId, now }: { chainTransactionId: ObjectId; now: Date },
): Promise<void> {
  await getChainTransactionsCollection(database).updateOne(
    { _id: chainTransactionId },
    { $inc: { attemptCount: 1 }, $set: { lastError: null, updatedAt: now } },
  )
}

export async function markChainTransactionConfirmed(
  database: Db,
  { chainTransactionId, now }: { chainTransactionId: ObjectId; now: Date },
): Promise<void> {
  await getChainTransactionsCollection(database).updateOne(
    { _id: chainTransactionId },
    { $set: { status: 'confirmed', lastError: null, updatedAt: now } },
  )
}

export async function markChainTransactionFailed(
  database: Db,
  {
    chainTransactionId,
    lastError,
    now,
  }: { chainTransactionId: ObjectId; lastError: string; now: Date },
): Promise<void> {
  await getChainTransactionsCollection(database).updateOne(
    { _id: chainTransactionId },
    { $set: { status: 'failed', lastError, updatedAt: now } },
  )
}

/**
 * submitted → queued, for a signed transaction that can never be mined because
 * another transaction used its nonce. The next run signs it again.
 */
export async function requeueChainTransaction(
  database: Db,
  {
    chainTransactionId,
    lastError,
    now,
  }: { chainTransactionId: ObjectId; lastError: string; now: Date },
): Promise<void> {
  await getChainTransactionsCollection(database).updateOne(
    { _id: chainTransactionId, status: 'submitted' },
    {
      $set: {
        status: 'queued',
        transactionHash: null,
        senderNonce: null,
        signedTransaction: null,
        lastError,
        updatedAt: now,
      },
    },
  )
}

/** A transient failure: the status stays, and the next run retries. */
export async function recordChainTransactionError(
  database: Db,
  {
    chainTransactionId,
    lastError,
    now,
  }: { chainTransactionId: ObjectId; lastError: string; now: Date },
): Promise<void> {
  await getChainTransactionsCollection(database).updateOne(
    { _id: chainTransactionId },
    { $set: { lastError, updatedAt: now } },
  )
}
