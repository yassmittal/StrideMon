import type {
  VerifyWaitlistEmailBody,
  WaitlistPlaceResponse,
} from '@stridemon/shared/api-contracts'
import type { Db } from 'mongodb'
import { ApiError } from '../../common/api-error'
import { generateReferralCode, hashVerificationCode } from '../../lib/waitlist/waitlist-codes'
import {
  countVerifiedWaitlistSignups,
  creditWaitlistReferral,
  findWaitlistSignupByEmail,
  isDuplicateKeyError,
  markWaitlistSignupVerified,
  toVerifiedWaitlistSignup,
} from '../../repositories/waitlist-signups-repository'
import {
  deleteWaitlistVerificationCode,
  spendWaitlistVerificationAttempt,
} from '../../repositories/waitlist-verification-codes-repository'
import { readPlaceInLine } from './read-place-in-line'

// A fresh referral code colliding even once is about 1 in 10^9 at 1,000 sign-ups.
const MAX_REFERRAL_CODE_ATTEMPTS = 3

/**
 * Checks the emailed code (D-041). The first success puts the sign-up in the line and credits
 * its referrer; a later one (a returning visitor) just answers the current place.
 */
export async function verifyWaitlistEmail({
  database,
  body,
  now,
}: {
  database: Db
  body: VerifyWaitlistEmailBody
  now: Date
}): Promise<WaitlistPlaceResponse> {
  const { email, verificationCode } = body
  const storedCode = await spendWaitlistVerificationAttempt(database, { email, now })
  const isCodeCorrect =
    storedCode !== null && storedCode.codeHash === hashVerificationCode({ email, verificationCode })
  if (!isCodeCorrect) throw new ApiError('VERIFICATION_CODE_INVALID', 400)
  await deleteWaitlistVerificationCode(database, email)

  const signup = await findWaitlistSignupByEmail(database, email)
  // Deleted on request between sign-up and verification: nothing to verify.
  if (signup === null) throw new ApiError('VERIFICATION_CODE_INVALID', 400)

  if (toVerifiedWaitlistSignup(signup) === null) {
    const isNewlyVerified = await joinLine(database, { email, now })
    if (isNewlyVerified && signup.referredByCode != null) {
      await creditWaitlistReferral(database, {
        referralCode: signup.referredByCode,
        referredEmail: email,
      })
    }
  }

  const verifiedSignup = await findWaitlistSignupByEmail(database, email)
  const lineEntry = verifiedSignup === null ? null : toVerifiedWaitlistSignup(verifiedSignup)
  if (lineEntry === null) throw new Error(`Waitlist sign-up ${email} is missing after verification`)
  return readPlaceInLine(database, lineEntry)
}

async function joinLine(database: Db, { email, now }: { email: string; now: Date }) {
  const verificationOrder = (await countVerifiedWaitlistSignups(database)) + 1
  for (let attempt = 1; ; attempt += 1) {
    try {
      return await markWaitlistSignupVerified(database, {
        email,
        verificationOrder,
        referralCode: generateReferralCode(),
        now,
      })
    } catch (error) {
      if (!isDuplicateKeyError(error) || attempt === MAX_REFERRAL_CODE_ATTEMPTS) throw error
    }
  }
}
