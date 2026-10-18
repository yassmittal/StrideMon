import type { Db } from 'mongodb'
import { foldEmailAddress } from '../lib/waitlist/canonical-email'
import { buildInviteCode } from '../lib/waitlist/invite-code'
import {
  fillWaitlistSignupCanonicalEmail,
  listWaitlistSignupEmails,
} from '../repositories/waitlist-signups-repository'

/** What the backfill did, or the inboxes that stopped it. */
export type CanonicalEmailBackfillReport =
  | { status: 'filled'; filledCount: number; alreadyFilledCount: number }
  | { status: 'clash'; clashes: { canonicalEmail: string; emails: string[] }[] }

/**
 * Fills `canonicalEmail` and the invite codes on sign-ups from before D-056, once. It's
 * idempotent: a filled sign-up is left alone. If two sign-ups fold to one inbox (`j.ohn@gmail.com`
 * and `john@gmail.com`), it writes nothing and names them, so Yash decides which to keep.
 */
export async function backfillWaitlistCanonicalEmails({
  database,
  inviteCodeSecret,
}: {
  database: Db
  inviteCodeSecret: string
}): Promise<CanonicalEmailBackfillReport> {
  const waitlistSignups = await listWaitlistSignupEmails(database)
  const emailsByCanonicalEmail = new Map<string, string[]>()
  for (const waitlistSignup of waitlistSignups) {
    const canonicalEmail = waitlistSignup.canonicalEmail ?? foldEmailAddress(waitlistSignup.email)
    emailsByCanonicalEmail.set(canonicalEmail, [
      ...(emailsByCanonicalEmail.get(canonicalEmail) ?? []),
      waitlistSignup.email,
    ])
  }
  const clashes = [...emailsByCanonicalEmail]
    .filter(([, emails]) => emails.length > 1)
    .map(([canonicalEmail, emails]) => ({ canonicalEmail, emails }))
  if (clashes.length > 0) return { status: 'clash', clashes }

  let filledCount = 0
  for (const waitlistSignup of waitlistSignups) {
    if (waitlistSignup.canonicalEmail !== undefined) continue
    const canonicalEmail = foldEmailAddress(waitlistSignup.email)
    const isFilled = await fillWaitlistSignupCanonicalEmail(database, {
      waitlistSignupId: waitlistSignup._id,
      canonicalEmail,
      inviteCode: buildInviteCode({ canonicalEmail, inviteCodeSecret }),
    })
    if (isFilled) filledCount += 1
  }
  return {
    status: 'filled',
    filledCount,
    alreadyFilledCount: waitlistSignups.length - filledCount,
  }
}
