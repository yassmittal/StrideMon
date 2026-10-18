import type { WaitlistInvitesResponse } from '@stridemon/shared/api-contracts'
import type { Db } from 'mongodb'
import { ApiError } from '../../common/api-error'
import { verifyInvitesToken } from '../../lib/waitlist/invites-token'
import { buildWaitlistInvites } from './build-waitlist-invites'

const HTTP_STATUS_UNAUTHORIZED = 401
const BEARER_PREFIX = 'Bearer '

/** A return visit to `/waitlist/invites`, with the invites token from its session (D-056). */
export async function readWaitlistInvites({
  database,
  emailProofSecret,
  inviteCodeSecret,
  earlyHourStartsAt,
  authorizationHeader,
  now,
}: {
  database: Db
  emailProofSecret: string
  inviteCodeSecret: string
  earlyHourStartsAt: Date
  authorizationHeader: string | undefined
  now: Date
}): Promise<WaitlistInvitesResponse> {
  const email =
    authorizationHeader?.startsWith(BEARER_PREFIX) === true
      ? await verifyInvitesToken({
          invitesToken: authorizationHeader.slice(BEARER_PREFIX.length),
          emailProofSecret,
          now,
        })
      : null
  if (email === null) throw new ApiError('INVITES_TOKEN_INVALID', HTTP_STATUS_UNAUTHORIZED)
  return {
    invites: await buildWaitlistInvites({ database, email, inviteCodeSecret, earlyHourStartsAt }),
  }
}
