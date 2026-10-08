import { type Collection, type Db, MongoServerError, type ObjectId } from 'mongodb'

const MONGO_DUPLICATE_KEY_ERROR_CODE = 11000

/** One pending code per email (data-model.md → passEmailCodes). The code itself is never stored. */
export type PassEmailCodeDocument = {
  _id: ObjectId
  /** Trimmed and lowercased. Unique. */
  email: string
  /** HMAC-SHA-256 of "<email>:<code>" (D-043). */
  codeHash: string
  /** Tries so far, the right one included. */
  attemptCount: number
  sentAt: Date
  /** TTL index deletes the record after this. */
  expiresAt: Date
  createdAt: Date
}

export function getPassEmailCodesCollection(database: Db): Collection<PassEmailCodeDocument> {
  return database.collection<PassEmailCodeDocument>('passEmailCodes')
}

type ReplaceResult = { isReplaced: true } | { isReplaced: false; lastSentAt: Date }

/**
 * Stores a new code for the email, unless one was sent less than `resendAfterMilliseconds` ago.
 * The unique email decides between two requests at once: only one of them gets to send.
 */
export async function replacePassEmailCodeIfDue(
  database: Db,
  {
    email,
    codeHash,
    now,
    resendAfterMilliseconds,
    validForMilliseconds,
  }: {
    email: string
    codeHash: string
    now: Date
    resendAfterMilliseconds: number
    validForMilliseconds: number
  },
): Promise<ReplaceResult> {
  const collection = getPassEmailCodesCollection(database)
  try {
    await collection.updateOne(
      { email, sentAt: { $lte: new Date(now.getTime() - resendAfterMilliseconds) } },
      {
        $set: {
          codeHash,
          attemptCount: 0,
          sentAt: now,
          expiresAt: new Date(now.getTime() + validForMilliseconds),
        },
        $setOnInsert: { createdAt: now },
      },
      { upsert: true },
    )
    return { isReplaced: true }
  } catch (error) {
    // A code went out within the minute: the filter missed it, and the upsert hit the unique email.
    if (!(error instanceof MongoServerError) || error.code !== MONGO_DUPLICATE_KEY_ERROR_CODE) {
      throw error
    }
    const recentCode = await collection.findOne({ email })
    if (recentCode === null) throw error
    return { isReplaced: false, lastSentAt: recentCode.sentAt }
  }
}

/**
 * Counts one try at the email's live code and returns the record as it is after it, or `null`
 * when there's no live code with tries left.
 */
export function recordPassEmailCodeAttempt(
  database: Db,
  { email, now, maxAttemptCount }: { email: string; now: Date; maxAttemptCount: number },
): Promise<PassEmailCodeDocument | null> {
  return getPassEmailCodesCollection(database).findOneAndUpdate(
    { email, expiresAt: { $gt: now }, attemptCount: { $lt: maxAttemptCount } },
    { $inc: { attemptCount: 1 } },
    { returnDocument: 'after' },
  )
}

export function findPassEmailCode(
  database: Db,
  { email, now }: { email: string; now: Date },
): Promise<PassEmailCodeDocument | null> {
  return getPassEmailCodesCollection(database).findOne({ email, expiresAt: { $gt: now } })
}

/** After the right code (it works once), or a send that failed (so a new one can go at once). */
export async function deletePassEmailCode(database: Db, email: string): Promise<void> {
  await getPassEmailCodesCollection(database).deleteOne({ email })
}
