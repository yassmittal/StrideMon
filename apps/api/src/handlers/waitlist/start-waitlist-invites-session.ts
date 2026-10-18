import type {
  StartWaitlistInvitesSessionBody,
  WaitlistInvitesSessionResponse,
} from '@stridemon/shared/api-contracts'
import type { Db } from 'mongodb'
import { ApiError } from '../../common/api-error'
import { verifyEmailProof } from '../../lib/founding-pass/email-proof'
import { foldEmailAddress } from '../../lib/waitlist/canonical-email'
import { signInvitesToken } from '../../lib/waitlist/invites-token'
import { confirmWaitlistSignupEmail } from '../../repositories/waitlist-signups-repository'
import { buildWaitlistInvites } from './build-waitlist-invites'

const HTTP_STATUS_UNAUTHORIZED = 401

/**
 * Opens `/waitlist/invites` for a checked email (D-056): confirms the sign-up if the email is on
 * the list, and answers a 30-day invites token with the invites, so coming back costs no email.
 */
export async function startWaitlistInvitesSession({
  database,
  emailProofSecret,
  inviteCodeSecret,
  earlyHourStartsAt,
  body,
  now,
}: {
  database: Db
  emailProofSecret: string
  inviteCodeSecret: string
  earlyHourStartsAt: Date
  body: StartWaitlistInvitesSessionBody
  now: Date
}): Promise<WaitlistInvitesSessionResponse> {
  const verifiedEmail = await verifyEmailProof({
    emailProof: body.emailProof,
    emailProofSecret,
    now,
  })
  if (verifiedEmail === null) throw new ApiError('EMAIL_PROOF_INVALID', HTTP_STATUS_UNAUTHORIZED)

  // Does nothing when the email isn't on the list, or was confirmed before.
  await confirmWaitlistSignupEmail(database, {
    canonicalEmail: foldEmailAddress(verifiedEmail.email),
    emailConfirmedBy: verifiedEmail.emailCheckMethod,
    now,
  })
  const { invitesToken, invitesTokenExpiresAt } = await signInvitesToken({
    email: verifiedEmail.email,
    emailProofSecret,
    issuedAt: now,
  })
  return {
    invitesToken,
    invitesTokenExpiresAt: invitesTokenExpiresAt.toISOString(),
    invites: await buildWaitlistInvites({
      database,
      email: verifiedEmail.email,
      inviteCodeSecret,
      earlyHourStartsAt,
    }),
  }
}
