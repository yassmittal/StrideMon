import { createHmac, randomInt, timingSafeEqual } from 'node:crypto'

const EMAIL_CODE_DIGIT_COUNT = 6
const EMAIL_CODE_UPPER_BOUND = 10 ** EMAIL_CODE_DIGIT_COUNT

/** A 6-digit code from a secure random source, leading zeros kept ("004817"). */
export function generateEmailCode(): string {
  return randomInt(0, EMAIL_CODE_UPPER_BOUND).toString().padStart(EMAIL_CODE_DIGIT_COUNT, '0')
}

/**
 * HMAC-SHA-256 of the email and code, as hex: the only form a code is stored in (D-043). Keyed
 * with the email-proof secret, so a copy of the database can't be tried against all million codes.
 */
export function hashEmailCode({
  email,
  emailCode,
  emailProofSecret,
}: {
  email: string
  emailCode: string
  emailProofSecret: string
}): string {
  return createHmac('sha256', emailProofSecret).update(`${email}:${emailCode}`).digest('hex')
}

/** Compares two code hashes in constant time. */
export function isEmailCodeHashMatch(storedCodeHash: string, candidateCodeHash: string): boolean {
  const storedBytes = Buffer.from(storedCodeHash, 'hex')
  const candidateBytes = Buffer.from(candidateCodeHash, 'hex')
  return (
    storedBytes.length === candidateBytes.length && timingSafeEqual(storedBytes, candidateBytes)
  )
}
