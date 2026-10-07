import type { ReadWaitlistPlaceQuery, WaitlistPlaceResponse } from '@stridemon/shared/api-contracts'
import type { Db } from 'mongodb'
import { ApiError } from '../../common/api-error'
import {
  findWaitlistSignupByReferralCode,
  toVerifiedWaitlistSignup,
} from '../../repositories/waitlist-signups-repository'
import { readPlaceInLine } from './read-place-in-line'

/**
 * A returning visitor's place, by the referral code the site kept (D-041). The code is already
 * public in its owner's share link, and the answer holds no email, so this needs no sign-in.
 */
export async function readWaitlistPlace({
  database,
  query,
}: {
  database: Db
  query: ReadWaitlistPlaceQuery
}): Promise<WaitlistPlaceResponse> {
  const signup = await findWaitlistSignupByReferralCode(database, query.referralCode)
  const lineEntry = signup === null ? null : toVerifiedWaitlistSignup(signup)
  if (lineEntry === null) throw new ApiError('NOT_FOUND', 404)
  return readPlaceInLine(database, lineEntry)
}
