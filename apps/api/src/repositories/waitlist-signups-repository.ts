import type { WaitlistPhonePlatform } from '@stridemon/shared/domain'
import { type Collection, type Db, MongoServerError, type ObjectId } from 'mongodb'

const MONGO_DUPLICATE_KEY_ERROR_CODE = 11000

/** Written once, never changed, so there's no `updatedAt` (data-model.md → waitlistSignups). */
export type WaitlistSignupDocument = {
  _id: ObjectId
  /** Trimmed and lowercased. */
  email: string
  phonePlatform: WaitlistPhonePlatform | null
  /** The landing page's `?source=`. */
  source: string | null
  createdAt: Date
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
