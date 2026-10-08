import { getErrorMessage } from '@stridemon/shared/errors'
import type { Db } from 'mongodb'
import { buildWaitlistWindowEmail } from '../lib/founding-pass/pass-emails'
import type { PassScheduleTimes } from '../lib/founding-pass/pass-schedule'
import {
  claimWaitlistWindowEmail,
  countWaitlistSignupsAwaitingWindowEmail,
  listWaitlistSignupsAwaitingWindowEmail,
  releaseWaitlistWindowEmail,
} from '../repositories/waitlist-signups-repository'
import { EmailRefusedError, type EmailSender } from '../services/email-sender'

/** What one run did, for the person running it. */
export type WaitlistWindowEmailReport = {
  /** Sign-ups from before the window that hadn't had their email when the run started. */
  awaitingCount: number
  sentEmailAddresses: string[]
  /** The address the run stopped at, if a send failed, and whether the next run retries it. */
  failure: { emailAddress: string; willRetry: boolean; reason: string } | null
  /** Still waiting after the run. */
  remainingCount: number
}

/**
 * The waitlist's one email, "Your 48 hours start now" (D-043): to each sign-up from before the
 * window opened, oldest first, at most `limit` a run (Brevo's free plan sends 300 a day). Each
 * address is stamped before its email goes, so it's never emailed twice. A run stops at the first
 * failure: a refusal (the daily limit, say) gives the stamp back for the next run, and an unknown
 * outcome (a timeout) keeps it, since that email may have gone out.
 */
export async function sendWaitlistWindowEmails({
  database,
  emailSender,
  scheduleTimes,
  limit,
  shouldSend,
  now,
}: {
  database: Db
  emailSender: EmailSender
  scheduleTimes: PassScheduleTimes
  limit: number
  /** `false` only counts: nothing is stamped or sent. */
  shouldSend: boolean
  now: Date
}): Promise<WaitlistWindowEmailReport> {
  const joinedBefore = scheduleTimes.waitlistWindowStartsAt
  const awaitingCount = await countWaitlistSignupsAwaitingWindowEmail(database, { joinedBefore })
  if (!shouldSend) {
    return { awaitingCount, sentEmailAddresses: [], failure: null, remainingCount: awaitingCount }
  }

  const windowEmail = buildWaitlistWindowEmail({ scheduleTimes, now })
  const sentEmailAddresses: string[] = []
  let failure: WaitlistWindowEmailReport['failure'] = null
  const waitlistSignups = await listWaitlistSignupsAwaitingWindowEmail(database, {
    joinedBefore,
    limit,
  })
  for (const waitlistSignup of waitlistSignups) {
    const isClaimed = await claimWaitlistWindowEmail(database, {
      waitlistSignupId: waitlistSignup._id,
      now: new Date(),
    })
    if (!isClaimed) continue
    try {
      await emailSender.sendEmail({ toEmailAddress: waitlistSignup.email, ...windowEmail })
      sentEmailAddresses.push(waitlistSignup.email)
    } catch (error) {
      const willRetry = error instanceof EmailRefusedError
      if (willRetry) await releaseWaitlistWindowEmail(database, waitlistSignup._id)
      failure = { emailAddress: waitlistSignup.email, willRetry, reason: getErrorMessage(error) }
      break
    }
  }

  return {
    awaitingCount,
    sentEmailAddresses,
    failure,
    remainingCount: await countWaitlistSignupsAwaitingWindowEmail(database, { joinedBefore }),
  }
}
