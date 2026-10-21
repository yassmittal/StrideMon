import { getErrorMessage } from '@stridemon/shared/errors'
import type { Db } from 'mongodb'
import { formatUtcDay } from '../lib/email/email-day'
import { buildInviteUrl } from '../lib/waitlist/invite-code'
import { buildWaitlistInviteEmail } from '../lib/waitlist/waitlist-invite-email'
import {
  giveBackDailyEmailPlace,
  takeDailyEmailPlace,
} from '../repositories/email-daily-counts-repository'
import {
  claimWaitlistInviteEmail,
  countConfirmedFriends,
  countWaitlistSignupsAwaitingInviteEmail,
  listWaitlistSignupsAwaitingInviteEmail,
  releaseWaitlistInviteEmail,
} from '../repositories/waitlist-signups-repository'
import { EmailRefusedError, type EmailSender } from '../services/email-sender'

/** What one run did, for the person running it. */
export type ExistingWaitlistInviteEmailReport = {
  /** Sign-ups from before `joinedBefore` without their invite email when the run started. */
  awaitingCount: number
  sentEmailAddresses: string[]
  /** The address the run stopped at, if a send failed, and whether the next run retries it. */
  failure: { emailAddress: string; willRetry: boolean; reason: string } | null
  /** Still waiting after the run. */
  remainingCount: number
}

/**
 * The invite email to the sign-ups from before it existed (D-062), worded as one extra email, with
 * their friends so far: oldest first, at most `limit` a run. Stamped before each send so nobody gets
 * it twice; a run stops at the first failure, the way the window email does.
 */
export async function sendExistingWaitlistInviteEmails({
  database,
  emailSender,
  joinedBefore,
  waitlistWindowStartsAt,
  earlyHourStartsAt,
  limit,
  shouldSend,
}: {
  database: Db
  emailSender: EmailSender
  /** Sign-ups from before this get it: the moment new joins started getting it themselves. */
  joinedBefore: Date
  waitlistWindowStartsAt: Date
  earlyHourStartsAt: Date
  limit: number
  /** `false` only counts: nothing is stamped or sent. */
  shouldSend: boolean
}): Promise<ExistingWaitlistInviteEmailReport> {
  const awaitingCount = await countWaitlistSignupsAwaitingInviteEmail(database, { joinedBefore })
  if (!shouldSend) {
    return { awaitingCount, sentEmailAddresses: [], failure: null, remainingCount: awaitingCount }
  }

  const sentEmailAddresses: string[] = []
  let failure: ExistingWaitlistInviteEmailReport['failure'] = null
  const waitlistSignups = await listWaitlistSignupsAwaitingInviteEmail(database, {
    joinedBefore,
    limit,
  })
  for (const waitlistSignup of waitlistSignups) {
    const isClaimed = await claimWaitlistInviteEmail(database, {
      waitlistSignupId: waitlistSignup._id,
      now: new Date(),
    })
    if (!isClaimed) continue
    const confirmedFriendCount = await countConfirmedFriends(database, {
      inviteCode: waitlistSignup.inviteCode,
      canonicalEmail: waitlistSignup.canonicalEmail,
      confirmedBefore: earlyHourStartsAt,
    })
    const sendStartedAt = new Date()
    const utcDay = formatUtcDay(sendStartedAt)
    await takeDailyEmailPlace(database, { utcDay, limit: null, now: sendStartedAt })
    try {
      await emailSender.sendEmail({
        toEmailAddress: waitlistSignup.email,
        ...buildWaitlistInviteEmail({
          kind: 'existingList',
          inviteUrl: buildInviteUrl(waitlistSignup.inviteCode),
          waitlistWindowStartsAt,
          earlyHourStartsAt,
          confirmedFriendCount,
        }),
      })
      sentEmailAddresses.push(waitlistSignup.email)
    } catch (error) {
      const willRetry = error instanceof EmailRefusedError
      if (willRetry) {
        await releaseWaitlistInviteEmail(database, waitlistSignup._id)
        await giveBackDailyEmailPlace(database, { utcDay, now: new Date() })
      }
      failure = { emailAddress: waitlistSignup.email, willRetry, reason: getErrorMessage(error) }
      break
    }
  }

  return {
    awaitingCount,
    sentEmailAddresses,
    failure,
    remainingCount: await countWaitlistSignupsAwaitingInviteEmail(database, { joinedBefore }),
  }
}
