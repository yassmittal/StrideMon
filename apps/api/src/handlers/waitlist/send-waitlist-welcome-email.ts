import type { FastifyBaseLogger } from 'fastify'
import type { Db, ObjectId } from 'mongodb'
import { formatUtcDay } from '../../lib/email/email-day'
import { buildInviteUrl } from '../../lib/waitlist/invite-code'
import { buildWaitlistInviteEmail } from '../../lib/waitlist/waitlist-invite-email'
import {
  giveBackDailyEmailPlace,
  takeDailyEmailPlace,
} from '../../repositories/email-daily-counts-repository'
import {
  claimWaitlistInviteEmail,
  releaseWaitlistInviteEmail,
} from '../../repositories/waitlist-signups-repository'
import { EmailRefusedError, type EmailSender } from '../../services/email-sender'

/**
 * The invite email to someone who just joined (D-062). It never throws: the join already worked
 * and its card shows the link, so a full day or a failed send is only logged (no address). It
 * shares the waitlist codes' daily limit, so a mint code always has room.
 */
export async function sendWaitlistWelcomeEmail({
  database,
  emailSender,
  log,
  waitlistSignupId,
  email,
  inviteCode,
  waitlistWindowStartsAt,
  earlyHourStartsAt,
  dailyEmailLimit,
  now,
}: {
  database: Db
  emailSender: EmailSender
  log: FastifyBaseLogger
  waitlistSignupId: ObjectId
  email: string
  inviteCode: string
  waitlistWindowStartsAt: Date
  earlyHourStartsAt: Date
  dailyEmailLimit: number
  now: Date
}): Promise<void> {
  const utcDay = formatUtcDay(now)
  try {
    const isClaimed = await claimWaitlistInviteEmail(database, { waitlistSignupId, now })
    if (!isClaimed) return
    const hasDailyPlace = await takeDailyEmailPlace(database, {
      utcDay,
      limit: dailyEmailLimit,
      now,
    })
    if (!hasDailyPlace) {
      await releaseWaitlistInviteEmail(database, waitlistSignupId)
      log.warn('Invite email skipped: the day’s email budget is full')
      return
    }
    try {
      await emailSender.sendEmail({
        toEmailAddress: email,
        ...buildWaitlistInviteEmail({
          kind: 'welcome',
          inviteUrl: buildInviteUrl(inviteCode),
          waitlistWindowStartsAt,
          earlyHourStartsAt,
          confirmedFriendCount: 0,
        }),
      })
    } catch (error) {
      // A refusal sent nothing, so the stamp and the day's place go back; an unknown outcome
      // (a timeout) keeps both, since it may have gone out.
      log.warn({ err: error }, 'Sending an invite email failed')
      if (error instanceof EmailRefusedError) {
        await releaseWaitlistInviteEmail(database, waitlistSignupId)
        await giveBackDailyEmailPlace(database, { utcDay, now: new Date() })
      }
    }
  } catch (error) {
    log.warn({ err: error }, 'The invite email step failed')
  }
}
