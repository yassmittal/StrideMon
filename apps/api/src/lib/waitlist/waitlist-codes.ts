import { createHash, randomInt } from 'node:crypto'
import {
  REFERRAL_CODE_ALPHABET,
  REFERRAL_CODE_LENGTH,
  VERIFICATION_CODE_DIGIT_COUNT,
} from '@stridemon/shared/domain'

/** A uniformly random 6-digit code, leading zeros kept ("004271"). */
export function generateVerificationCode(): string {
  return randomInt(0, 10 ** VERIFICATION_CODE_DIGIT_COUNT)
    .toString()
    .padStart(VERIFICATION_CODE_DIGIT_COUNT, '0')
}

/**
 * SHA-256 of the code bound to its email, as hex. Only this is stored. A 6-digit code could be
 * brute-forced from a leaked hash, but it lives 10 minutes and allows 5 tries, so the hash only
 * keeps codes out of backups and logs.
 */
export function hashVerificationCode({
  email,
  verificationCode,
}: {
  email: string
  verificationCode: string
}): string {
  return createHash('sha256').update(`${email}:${verificationCode}`).digest('hex')
}

/** 8 characters from the unambiguous referral alphabet, about 8.5 × 10^11 possible codes. */
export function generateReferralCode(): string {
  let referralCode = ''
  for (let characterIndex = 0; characterIndex < REFERRAL_CODE_LENGTH; characterIndex += 1) {
    referralCode += REFERRAL_CODE_ALPHABET[randomInt(0, REFERRAL_CODE_ALPHABET.length)]
  }
  return referralCode
}
