import type { EmailCheckMethod, WaitlistPhonePlatform } from '@stridemon/shared/domain'
import { type Collection, type Db, MongoServerError, type ObjectId } from 'mongodb'

const MONGO_DUPLICATE_KEY_ERROR_CODE = 11000

/**
 * Written once, then changed only to confirm its email and to stamp its one window email, so
 * there's no `updatedAt` (data-model.md → waitlistSignups).
 */
export type WaitlistSignupDocument = {
  _id: ObjectId
  /** Trimmed and lowercased, as typed. Every email goes here. */
  email: string
  /** The inbox, folded (D-056). Unique. Absent only on old sign-ups the backfill hasn't reached. */
  canonicalEmail: string
  /** This sign-up's own code, from `canonicalEmail` (D-056). */
  inviteCode: string
  /** The `?ref=` it first joined through; never its own code. */
  invitedByInviteCode: string | null
  phonePlatform: WaitlistPhonePlatform | null
  /** The landing page's `?source=`. */
  source: string | null
  createdAt: Date
  /** When the email was first checked (D-056). Absent until then; set once. */
  emailConfirmedAt?: Date
  emailConfirmedBy?: EmailCheckMethod
  /** When its one email ("Your 48 hours start now") went out. Absent until then (D-043). */
  windowEmailSentAt?: Date
}

/** A sign-up as joining writes it: never confirmed or emailed yet. */
export type NewWaitlistSignup = Omit<
  WaitlistSignupDocument,
  '_id' | 'emailConfirmedAt' | 'emailConfirmedBy' | 'windowEmailSentAt'
>

export function getWaitlistSignupsCollection(database: Db): Collection<WaitlistSignupDocument> {
  return database.collection<WaitlistSignupDocument>('waitlistSignups')
}

/**
 * Adds the inbox to the waitlist. A repeat inbox changes nothing: the first sign-up's email,
 * platform, source and inviter stay.
 */
export async function insertWaitlistSignupIfNew(
  database: Db,
  signup: NewWaitlistSignup,
): Promise<void> {
  try {
    await getWaitlistSignupsCollection(database).updateOne(
      { canonicalEmail: signup.canonicalEmail },
      { $setOnInsert: signup },
      { upsert: true },
    )
  } catch (error) {
    // The same inbox at once (the other request inserted it), or an old sign-up with this email
    // the backfill hasn't reached: either way it's on the list, which is all we want.
    if (error instanceof MongoServerError && error.code === MONGO_DUPLICATE_KEY_ERROR_CODE) return
    throw error
  }
}

/** Confirms the sign-up's email, once: the first confirmation stays (D-056). */
export async function confirmWaitlistSignupEmail(
  database: Db,
  {
    canonicalEmail,
    emailConfirmedBy,
    now,
  }: { canonicalEmail: string; emailConfirmedBy: EmailCheckMethod; now: Date },
): Promise<void> {
  await getWaitlistSignupsCollection(database).updateOne(
    { canonicalEmail, emailConfirmedAt: { $exists: false } },
    { $set: { emailConfirmedAt: now, emailConfirmedBy } },
  )
}

export function findWaitlistSignupByCanonicalEmail(
  database: Db,
  canonicalEmail: string,
): Promise<WaitlistSignupDocument | null> {
  return getWaitlistSignupsCollection(database).findOne({ canonicalEmail })
}

/**
 * Friends who count for a sign-up (D-056): joined through its code, confirmed before
 * `confirmedBefore` (the early hour's start), and another inbox.
 */
export function countConfirmedFriends(
  database: Db,
  {
    inviteCode,
    canonicalEmail,
    confirmedBefore,
  }: { inviteCode: string; canonicalEmail: string; confirmedBefore: Date },
): Promise<number> {
  return getWaitlistSignupsCollection(database).countDocuments({
    invitedByInviteCode: inviteCode,
    emailConfirmedAt: { $lt: confirmedBefore },
    canonicalEmail: { $ne: canonicalEmail },
  })
}

/** Everyone on the list: the one public number (D-056). */
export function countWaitlistSignups(database: Db): Promise<number> {
  return getWaitlistSignupsCollection(database).countDocuments()
}

/**
 * Every sign-up's id, email and folded email, for the one-off backfill (D-056). An old sign-up
 * has no folded email yet.
 */
export function listWaitlistSignupEmails(
  database: Db,
): Promise<(Pick<WaitlistSignupDocument, '_id' | 'email'> & { canonicalEmail?: string })[]> {
  return getWaitlistSignupsCollection(database)
    .find({}, { projection: { email: 1, canonicalEmail: 1 } })
    .sort({ createdAt: 1, _id: 1 })
    .toArray()
}

/** Fills an old sign-up's folded email and codes, unless the backfill already did. */
export async function fillWaitlistSignupCanonicalEmail(
  database: Db,
  {
    waitlistSignupId,
    canonicalEmail,
    inviteCode,
  }: { waitlistSignupId: ObjectId; canonicalEmail: string; inviteCode: string },
): Promise<boolean> {
  const updateResult = await getWaitlistSignupsCollection(database).updateOne(
    { _id: waitlistSignupId, canonicalEmail: { $exists: false } },
    { $set: { canonicalEmail, inviteCode, invitedByInviteCode: null } },
  )
  return updateResult.modifiedCount === 1
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
