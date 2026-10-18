import type { EmailCheckMethod } from '@stridemon/shared/domain'
import type { Db } from 'mongodb'
import { buildWaitlistInviteIdentity } from '../lib/waitlist/invite-code'
import {
  confirmWaitlistSignupEmail,
  insertWaitlistSignupIfNew,
} from '../repositories/waitlist-signups-repository'
import { TEST_WAITLIST_INVITE_CODE_SECRET } from './build-test-server'

/** An email's invite code as a test server builds it. */
export function buildTestInviteCode(email: string): string {
  return buildWaitlistInviteIdentity({ email, inviteCodeSecret: TEST_WAITLIST_INVITE_CODE_SECRET })
    .inviteCode
}

/**
 * A sign-up as joining would write it, with the tests' invite secret, straight into the database:
 * no Turnstile, no route. Optionally invited by someone and confirmed at a given time.
 */
export async function insertTestWaitlistSignup(
  database: Db,
  {
    email,
    createdAt = new Date(),
    invitedByInviteCode = null,
    emailConfirmedAt,
    emailConfirmedBy = 'code',
  }: {
    email: string
    createdAt?: Date
    invitedByInviteCode?: string | null
    emailConfirmedAt?: Date
    emailConfirmedBy?: EmailCheckMethod
  },
): Promise<void> {
  const { canonicalEmail, inviteCode } = buildWaitlistInviteIdentity({
    email,
    inviteCodeSecret: TEST_WAITLIST_INVITE_CODE_SECRET,
  })
  await insertWaitlistSignupIfNew(database, {
    email,
    canonicalEmail,
    inviteCode,
    invitedByInviteCode,
    phonePlatform: null,
    source: null,
    createdAt,
  })
  if (emailConfirmedAt !== undefined) {
    await confirmWaitlistSignupEmail(database, {
      canonicalEmail,
      emailConfirmedBy,
      now: emailConfirmedAt,
    })
  }
}
