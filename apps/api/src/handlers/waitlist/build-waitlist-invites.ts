import type { WaitlistInvites } from '@stridemon/shared/api-contracts'
import { REQUIRED_CONFIRMED_FRIEND_COUNT } from '@stridemon/shared/domain'
import type { Db } from 'mongodb'
import { buildInviteUrl, buildWaitlistInviteIdentity } from '../../lib/waitlist/invite-code'
import {
  countConfirmedFriends,
  findWaitlistSignupByCanonicalEmail,
} from '../../repositories/waitlist-signups-repository'

/**
 * A checked email's invites (D-056): its link, its confirmed friends and whether it has the
 * early hour. An email that isn't on the list gets its link and zeros, so the page shows the form.
 */
export async function buildWaitlistInvites({
  database,
  email,
  inviteCodeSecret,
  earlyHourStartsAt,
}: {
  database: Db
  email: string
  inviteCodeSecret: string
  earlyHourStartsAt: Date
}): Promise<WaitlistInvites> {
  const { canonicalEmail, inviteCode } = buildWaitlistInviteIdentity({ email, inviteCodeSecret })
  const waitlistSignup = await findWaitlistSignupByCanonicalEmail(database, canonicalEmail)
  const confirmedFriendCount =
    waitlistSignup === null
      ? 0
      : await countConfirmedFriends(database, {
          inviteCode: waitlistSignup.inviteCode,
          canonicalEmail,
          confirmedBefore: earlyHourStartsAt,
        })
  return {
    isOnWaitlist: waitlistSignup !== null,
    inviteUrl: buildInviteUrl(waitlistSignup?.inviteCode ?? inviteCode),
    confirmedFriendCount,
    requiredFriendCount: REQUIRED_CONFIRMED_FRIEND_COUNT,
    hasEarlyHour: confirmedFriendCount >= REQUIRED_CONFIRMED_FRIEND_COUNT,
    isEmailConfirmed: waitlistSignup?.emailConfirmedAt !== undefined,
    countsUntil: earlyHourStartsAt.toISOString(),
  }
}
