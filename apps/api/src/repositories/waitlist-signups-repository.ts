import type { WaitlistPhonePlatform } from '@stridemon/shared/domain'
import { type Collection, type Db, MongoServerError, type ObjectId } from 'mongodb'
import { MAX_CREDITED_REFERRALS, PLACES_PER_REFERRAL } from '../lib/waitlist/waitlist-line-rules'

const MONGO_DUPLICATE_KEY_ERROR_CODE = 11000

/**
 * data-model.md → waitlistSignups. The line fields are optional because sign-ups from before
 * D-041 don't have them; every query treats a missing field like `null`.
 */
export type WaitlistSignupDocument = {
  _id: ObjectId
  /** Trimmed and lowercased. */
  email: string
  phonePlatform: WaitlistPhonePlatform | null
  /** The landing page's `?source=`. */
  source: string | null
  /** The landing page's `?ref=` at the first sign-up. */
  referredByCode?: string | null
  createdAt: Date
  verifiedAt?: Date | null
  verificationOrder?: number | null
  /** `verificationOrder − PLACES_PER_REFERRAL × referralCount`; lower is nearer the front. */
  lineScore?: number | null
  referralCode?: string | null
  referralCount?: number
}

/** A sign-up that has verified its email, so it's in the line. */
export type VerifiedWaitlistSignup = {
  verifiedAt: Date
  lineScore: number
  referralCode: string
  referralCount: number
}

export function getWaitlistSignupsCollection(database: Db): Collection<WaitlistSignupDocument> {
  return database.collection<WaitlistSignupDocument>('waitlistSignups')
}

/**
 * Adds the email to the waitlist. A repeat email changes nothing: the first sign-up's
 * platform, source and referrer stay.
 */
export async function insertWaitlistSignupIfNew(
  database: Db,
  signup: Pick<
    WaitlistSignupDocument,
    'email' | 'phonePlatform' | 'source' | 'referredByCode' | 'createdAt'
  >,
): Promise<void> {
  try {
    await getWaitlistSignupsCollection(database).updateOne(
      { email: signup.email },
      {
        $setOnInsert: {
          ...signup,
          verifiedAt: null,
          verificationOrder: null,
          lineScore: null,
          referralCode: null,
          referralCount: 0,
        },
      },
      { upsert: true },
    )
  } catch (error) {
    // Two sign-ups with the same email at once: the other one inserted it, which is all we want.
    if (isDuplicateKeyError(error)) return
    throw error
  }
}

export function findWaitlistSignupByEmail(
  database: Db,
  email: string,
): Promise<WaitlistSignupDocument | null> {
  return getWaitlistSignupsCollection(database).findOne({ email })
}

export function findWaitlistSignupByReferralCode(
  database: Db,
  referralCode: string,
): Promise<WaitlistSignupDocument | null> {
  return getWaitlistSignupsCollection(database).findOne({ referralCode })
}

export function countVerifiedWaitlistSignups(database: Db): Promise<number> {
  return getWaitlistSignupsCollection(database).countDocuments({ verifiedAt: { $type: 'date' } })
}

/**
 * Puts the sign-up in the line, unless it's already there. Returns whether this call did it, so
 * only one of two racing verifications credits the referrer. Throws a duplicate-key error in the
 * near-impossible case that `referralCode` is taken; the caller retries with a new one.
 */
export async function markWaitlistSignupVerified(
  database: Db,
  {
    email,
    verificationOrder,
    referralCode,
    now,
  }: { email: string; verificationOrder: number; referralCode: string; now: Date },
): Promise<boolean> {
  const updateResult = await getWaitlistSignupsCollection(database).updateOne(
    { email, verifiedAt: null },
    {
      $set: {
        verifiedAt: now,
        verificationOrder,
        lineScore: verificationOrder,
        referralCode,
        referralCount: 0,
      },
    },
  )
  return updateResult.modifiedCount === 1
}

/**
 * Moves the referrer up the line for one verified friend. Nothing happens when the code is
 * unknown, belongs to the friend's own email, or has used up its credited referrals.
 */
export async function creditWaitlistReferral(
  database: Db,
  { referralCode, referredEmail }: { referralCode: string; referredEmail: string },
): Promise<void> {
  await getWaitlistSignupsCollection(database).updateOne(
    {
      referralCode,
      email: { $ne: referredEmail },
      referralCount: { $lt: MAX_CREDITED_REFERRALS },
    },
    { $inc: { referralCount: 1, lineScore: -PLACES_PER_REFERRAL } },
  )
}

/** Verified sign-ups ahead of this one: a lower score, or the same score and verified earlier. */
export function countWaitlistSignupsAhead(
  database: Db,
  { lineScore, verifiedAt }: Pick<VerifiedWaitlistSignup, 'lineScore' | 'verifiedAt'>,
): Promise<number> {
  return getWaitlistSignupsCollection(database).countDocuments({
    $or: [{ lineScore: { $lt: lineScore } }, { lineScore, verifiedAt: { $lt: verifiedAt } }],
  })
}

/** The sign-up's line fields, or `null` when it hasn't verified its email. */
export function toVerifiedWaitlistSignup(
  signup: WaitlistSignupDocument,
): VerifiedWaitlistSignup | null {
  const { verifiedAt, lineScore, referralCode, referralCount } = signup
  if (verifiedAt == null || lineScore == null || referralCode == null) return null
  return { verifiedAt, lineScore, referralCode, referralCount: referralCount ?? 0 }
}

export function isDuplicateKeyError(error: unknown): boolean {
  return error instanceof MongoServerError && error.code === MONGO_DUPLICATE_KEY_ERROR_CODE
}
