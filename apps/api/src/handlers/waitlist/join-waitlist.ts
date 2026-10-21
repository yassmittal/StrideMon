import type { JoinWaitlistBody, JoinWaitlistResponse } from '@stridemon/shared/api-contracts'
import type { FastifyBaseLogger } from 'fastify'
import type { Db } from 'mongodb'
import { ApiError } from '../../common/api-error'
import { verifyEmailProof } from '../../lib/founding-pass/email-proof'
import { foldEmailAddress } from '../../lib/waitlist/canonical-email'
import { isDisposableEmailDomain } from '../../lib/waitlist/disposable-email-domain'
import { buildInviteUrl, buildWaitlistInviteIdentity } from '../../lib/waitlist/invite-code'
import {
  confirmWaitlistSignupEmail,
  insertWaitlistSignupIfNew,
} from '../../repositories/waitlist-signups-repository'
import type { EmailSender } from '../../services/email-sender'
import type { TurnstileVerifier } from '../../services/turnstile-verifier'
import { assertTurnstileTokenValid } from '../founding-pass/assert-turnstile-token-valid'
import { sendWaitlistWelcomeEmail } from './send-waitlist-welcome-email'

const HTTP_STATUS_BAD_REQUEST = 400

/**
 * Stores a waitlist sign-up (D-037, D-056), cheapest checks first: the honeypot, Turnstile, the
 * temporary-inbox list, then one upsert per inbox. Always answers `joined` with the inbox's
 * invite link, for a new email, a repeat and a filled-in honeypot alike, so the answer tells
 * neither a visitor nor a bot anything. A new sign-up whose proof checked this same inbox also
 * gets the invite email (D-062).
 */
export async function joinWaitlist({
  database,
  inviteCodeSecret,
  emailProofSecret,
  turnstileVerifier,
  emailSender,
  log,
  waitlistWindowStartsAt,
  earlyHourStartsAt,
  waitlistCodeDailyEmailLimit,
  body,
  remoteIpAddress,
  now,
}: {
  database: Db
  inviteCodeSecret: string
  emailProofSecret: string
  turnstileVerifier: TurnstileVerifier
  emailSender: EmailSender
  log: FastifyBaseLogger
  waitlistWindowStartsAt: Date
  earlyHourStartsAt: Date
  /** The invite email shares the waitlist codes' daily limit (D-057, D-062). */
  waitlistCodeDailyEmailLimit: number
  body: JoinWaitlistBody
  remoteIpAddress: string
  now: Date
}): Promise<JoinWaitlistResponse> {
  const { canonicalEmail, inviteCode } = buildWaitlistInviteIdentity({
    email: body.email,
    inviteCodeSecret,
  })
  const joinedResponse: JoinWaitlistResponse = {
    status: 'joined',
    inviteUrl: buildInviteUrl(inviteCode),
  }
  const isHoneypotFilled = body.website !== undefined && body.website !== ''
  if (isHoneypotFilled) return joinedResponse

  await assertTurnstileTokenValid({
    turnstileVerifier,
    turnstileToken: body.turnstileToken,
    remoteIpAddress,
    expectedAction: 'join-waitlist',
  })
  if (isDisposableEmailDomain(body.email)) {
    throw new ApiError('EMAIL_DOMAIN_DISPOSABLE', HTTP_STATUS_BAD_REQUEST)
  }

  // Your own code never counts as your inviter.
  const invitedByInviteCode =
    body.inviteCode === undefined || body.inviteCode === inviteCode ? null : body.inviteCode
  const newWaitlistSignupId = await insertWaitlistSignupIfNew(database, {
    email: body.email,
    canonicalEmail,
    inviteCode,
    invitedByInviteCode,
    phonePlatform: body.phonePlatform ?? null,
    source: body.source ?? null,
    createdAt: now,
  })

  // A proof for this same inbox (Google, or a code) confirms it now. Any other proof is ignored.
  let isInboxChecked = false
  if (body.emailProof !== undefined) {
    const verifiedEmail = await verifyEmailProof({
      emailProof: body.emailProof,
      emailProofSecret,
      now,
    })
    if (verifiedEmail !== null && foldEmailAddress(verifiedEmail.email) === canonicalEmail) {
      await confirmWaitlistSignupEmail(database, {
        canonicalEmail,
        emailConfirmedBy: verifiedEmail.emailCheckMethod,
        now,
      })
      isInboxChecked = true
    }
  }

  // Only a new sign-up whose inbox this join checked, so nobody can make us email an address
  // they don't own.
  if (newWaitlistSignupId !== null && isInboxChecked) {
    await sendWaitlistWelcomeEmail({
      database,
      emailSender,
      log,
      waitlistSignupId: newWaitlistSignupId,
      email: body.email,
      inviteCode,
      waitlistWindowStartsAt,
      earlyHourStartsAt,
      dailyEmailLimit: waitlistCodeDailyEmailLimit,
      now,
    })
  }
  return joinedResponse
}
