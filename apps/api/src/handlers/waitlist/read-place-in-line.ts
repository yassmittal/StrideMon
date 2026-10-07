import type { WaitlistPlaceResponse } from '@stridemon/shared/api-contracts'
import type { Db } from 'mongodb'
import {
  countWaitlistSignupsAhead,
  type VerifiedWaitlistSignup,
} from '../../repositories/waitlist-signups-repository'

/** The verified sign-up's place in the Founding Pass line, 1 being the front (D-041). */
export async function readPlaceInLine(
  database: Db,
  lineEntry: VerifiedWaitlistSignup,
): Promise<WaitlistPlaceResponse> {
  const signupsAheadCount = await countWaitlistSignupsAhead(database, lineEntry)
  return {
    placeInLine: signupsAheadCount + 1,
    referralCode: lineEntry.referralCode,
    referralCount: lineEntry.referralCount,
  }
}
