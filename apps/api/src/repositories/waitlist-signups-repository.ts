import type { WaitlistPhonePlatform } from '@stridemon/shared/domain'
import { type Collection, type Db, MongoServerError, type ObjectId } from 'mongodb'

const MONGO_DUPLICATE_KEY_ERROR_CODE = 11000

/**
 * Written once, and changed only to stamp its one email, so there's no `updatedAt`
 * (data-model.md → waitlistSignups).
 */
export type WaitlistSignupDocument = {
  _id: ObjectId
  /** Trimmed and lowercased. */
  email: string
  phonePlatform: WaitlistPhonePlatform | null
  /** The landing page's `?source=`. */
  source: string | null
  createdAt: Date
  /** When its one email ("Your 48 hours start now") went out. Absent until then (D-043). */
  windowEmailSentAt?: Date
}

export function getWaitlistSignupsCollection(database: Db): Collection<WaitlistSignupDocument> {
  return database.collection<WaitlistSignupDocument>('waitlistSignups')
}

/**
 * Adds the email to the waitlist. A repeat email changes nothing: the first sign-up's
 * platform and source stay.
 */
export async function insertWaitlistSignupIfNew(
  database: Db,
  signup: Omit<WaitlistSignupDocument, '_id'>,
): Promise<void> {
  try {
    await getWaitlistSignupsCollection(database).updateOne(
      { email: signup.email },
      { $setOnInsert: signup },
      { upsert: true },
    )
  } catch (error) {
    // Two sign-ups with the same email at once: the other one inserted it, which is all we want.
    if (error instanceof MongoServerError && error.code === MONGO_DUPLICATE_KEY_ERROR_CODE) return
    throw error
  }
}

export function findWaitlistSignupByEmail(
  database: Db,
  email: string,
): Promise<WaitlistSignupDocument | null> {
  return getWaitlistSignupsCollection(database).findOne({ email })
}

/** Sign-ups from before `joinedBefore` that haven't had their one email, oldest first. */
export function listWaitlistSignupsAwaitingWindowEmail(
  database: Db,
  { joinedBefore, limit }: { joinedBefore: Date; limit: number },
): Promise<WaitlistSignupDocument[]> {
  return getWaitlistSignupsCollection(database)
    .find({ createdAt: { $lt: joinedBefore }, windowEmailSentAt: { $exists: false } })
    .sort({ createdAt: 1, _id: 1 })
    .limit(limit)
    .toArray()
}

export function countWaitlistSignupsAwaitingWindowEmail(
  database: Db,
  { joinedBefore }: { joinedBefore: Date },
): Promise<number> {
  return getWaitlistSignupsCollection(database).countDocuments({
    createdAt: { $lt: joinedBefore },
    windowEmailSentAt: { $exists: false },
  })
}

/**
 * Stamps the sign-up's one email before it's sent. `false` if another run stamped it first, so an
 * address is never emailed twice.
 */
export async function claimWaitlistWindowEmail(
  database: Db,
  { waitlistSignupId, now }: { waitlistSignupId: ObjectId; now: Date },
): Promise<boolean> {
  const updateResult = await getWaitlistSignupsCollection(database).updateOne(
    { _id: waitlistSignupId, windowEmailSentAt: { $exists: false } },
    { $set: { windowEmailSentAt: now } },
  )
  return updateResult.modifiedCount === 1
}

/** Gives the claim back after a send that failed, so the next run tries that address again. */
export async function releaseWaitlistWindowEmail(
  database: Db,
  waitlistSignupId: ObjectId,
): Promise<void> {
  await getWaitlistSignupsCollection(database).updateOne(
    { _id: waitlistSignupId },
    { $unset: { windowEmailSentAt: '' } },
  )
}
