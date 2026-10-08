import type {
  SendPassEmailCodeBody,
  SendPassEmailCodeResponse,
} from '@stridemon/shared/api-contracts'
import type { FastifyBaseLogger } from 'fastify'
import type { Db } from 'mongodb'
import { ApiError } from '../../common/api-error'
import { generateEmailCode, hashEmailCode } from '../../lib/founding-pass/email-code'
import { buildEmailCodeEmail } from '../../lib/founding-pass/pass-emails'
import {
  deletePassEmailCode,
  replacePassEmailCodeIfDue,
} from '../../repositories/pass-email-codes-repository'
import type { EmailSender } from '../../services/email-sender'
import type { TurnstileVerifier } from '../../services/turnstile-verifier'
import { assertTurnstileTokenValid } from './assert-turnstile-token-valid'

// The brief's §15 rules: valid for 10 minutes, one email a minute per address.
export const EMAIL_CODE_VALID_MINUTES = 10
const EMAIL_CODE_RESEND_AFTER_MILLISECONDS = 60_000
const MILLISECONDS_PER_MINUTE = 60_000
const MILLISECONDS_PER_SECOND = 1000
const HTTP_STATUS_TOO_MANY_REQUESTS = 429
const HTTP_STATUS_SERVICE_UNAVAILABLE = 503

/**
 * Emails a 6-digit code. Answers `sent` for every email, on the waitlist or not, with a pass or
 * not, so the route reveals nothing about anyone.
 */
export async function sendPassEmailCode({
  database,
  emailProofSecret,
  emailSender,
  turnstileVerifier,
  body,
  remoteIpAddress,
  now,
  log,
}: {
  database: Db
  emailProofSecret: string
  emailSender: EmailSender
  turnstileVerifier: TurnstileVerifier
  body: SendPassEmailCodeBody
  remoteIpAddress: string
  now: Date
  log: FastifyBaseLogger
}): Promise<SendPassEmailCodeResponse> {
  await assertTurnstileTokenValid({
    turnstileVerifier,
    turnstileToken: body.turnstileToken,
    remoteIpAddress,
  })

  const { email } = body
  const emailCode = generateEmailCode()
  const replaceResult = await replacePassEmailCodeIfDue(database, {
    email,
    codeHash: hashEmailCode({ email, emailCode, emailProofSecret }),
    now,
    resendAfterMilliseconds: EMAIL_CODE_RESEND_AFTER_MILLISECONDS,
    validForMilliseconds: EMAIL_CODE_VALID_MINUTES * MILLISECONDS_PER_MINUTE,
  })
  if (!replaceResult.isReplaced) {
    const resendAtMilliseconds =
      replaceResult.lastSentAt.getTime() + EMAIL_CODE_RESEND_AFTER_MILLISECONDS
    throw new ApiError('EMAIL_CODE_RECENTLY_SENT', HTTP_STATUS_TOO_MANY_REQUESTS, {
      retryAfterSeconds: Math.max(
        1,
        Math.ceil((resendAtMilliseconds - now.getTime()) / MILLISECONDS_PER_SECOND),
      ),
    })
  }

  try {
    await emailSender.sendEmail({
      toEmailAddress: email,
      ...buildEmailCodeEmail({ emailCode, validForMinutes: EMAIL_CODE_VALID_MINUTES }),
    })
  } catch (error) {
    // No address in the log. The record goes, so the person can ask again at once.
    log.warn({ err: error }, 'Sending an email code failed')
    await deletePassEmailCode(database, email)
    throw new ApiError('EMAIL_SEND_FAILED', HTTP_STATUS_SERVICE_UNAVAILABLE)
  }
  return { status: 'sent' }
}
