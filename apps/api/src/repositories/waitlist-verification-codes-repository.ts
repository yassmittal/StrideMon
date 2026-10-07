import type { Collection, Db, ObjectId } from 'mongodb'
import {
  VERIFICATION_CODE_MAX_ATTEMPTS,
  VERIFICATION_CODE_RESEND_INTERVAL_SECONDS,
  VERIFICATION_CODE_TTL_SECONDS,
} from '../lib/waitlist/waitlist-line-rules'
import { isDuplicateKeyError } from './waitlist-signups-repository'

const MILLISECONDS_PER_SECOND = 1000

/** data-model.md → waitlistVerificationCodes. At most one per email. */
type WaitlistVerificationCodeDocument = {
  _id: ObjectId
  email: string
  /** `hashVerificationCode`; the code itself is never stored. */
  codeHash: string
  attemptCount: number
  sentAt: Date
  /** A TTL index deletes the document after this. */
  expiresAt: Date
}

export function getWaitlistVerificationCodesCollection(
  database: Db,
): Collection<WaitlistVerificationCodeDocument> {
  return database.collection<WaitlistVerificationCodeDocument>('waitlistVerificationCodes')
}

/**
 * Stores a new code for the email, replacing the last one, unless the last one was sent less
 * than a minute ago. Returns whether it stored the code (and so whether to email it). One write:
 * when a recent code exists, the filter misses and the upsert's insert hits the unique email index.
 */
export async function replaceWaitlistVerificationCodeUnlessRecent(
  database: Db,
  { email, codeHash, now }: { email: string; codeHash: string; now: Date },
): Promise<boolean> {
  const resendAllowedBefore = new Date(
    now.getTime() - VERIFICATION_CODE_RESEND_INTERVAL_SECONDS * MILLISECONDS_PER_SECOND,
  )
  try {
    await getWaitlistVerificationCodesCollection(database).updateOne(
      { email, sentAt: { $lte: resendAllowedBefore } },
      {
        $set: {
          codeHash,
          attemptCount: 0,
          sentAt: now,
          expiresAt: new Date(
            now.getTime() + VERIFICATION_CODE_TTL_SECONDS * MILLISECONDS_PER_SECOND,
          ),
        },
      },
      { upsert: true },
    )
    return true
  } catch (error) {
    if (isDuplicateKeyError(error)) return false
    throw error
  }
}

/**
 * Spends one try on the email's code and returns it, while it's unexpired and has tries left.
 * Counting the try before comparing means parallel guesses can't exceed the limit.
 */
export function spendWaitlistVerificationAttempt(
  database: Db,
  { email, now }: { email: string; now: Date },
): Promise<WaitlistVerificationCodeDocument | null> {
  return getWaitlistVerificationCodesCollection(database).findOneAndUpdate(
    { email, expiresAt: { $gt: now }, attemptCount: { $lt: VERIFICATION_CODE_MAX_ATTEMPTS } },
    { $inc: { attemptCount: 1 } },
    { returnDocument: 'after' },
  )
}

export async function deleteWaitlistVerificationCode(database: Db, email: string): Promise<void> {
  await getWaitlistVerificationCodesCollection(database).deleteOne({ email })
}
