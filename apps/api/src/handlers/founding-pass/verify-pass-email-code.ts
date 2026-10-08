import type {
  VerifyPassEmailCodeBody,
  VerifyPassEmailCodeResponse,
} from '@stridemon/shared/api-contracts'
import type { Db } from 'mongodb'
import { ApiError } from '../../common/api-error'
import { hashEmailCode, isEmailCodeHashMatch } from '../../lib/founding-pass/email-code'
import { signEmailProof } from '../../lib/founding-pass/email-proof'
import {
  deletePassEmailCode,
  findPassEmailCode,
  recordPassEmailCodeAttempt,
} from '../../repositories/pass-email-codes-repository'

// The brief's §15: 5 tries per code, the right one included.
const MAX_EMAIL_CODE_ATTEMPT_COUNT = 5
const HTTP_STATUS_BAD_REQUEST = 400
const HTTP_STATUS_TOO_MANY_REQUESTS = 429

/**
 * Checks a code and, if it's right, answers a signed email proof (D-043). Every try counts, and
 * the right code works once.
 */
export async function verifyPassEmailCode({
  database,
  emailProofSecret,
  body,
  now,
}: {
  database: Db
  emailProofSecret: string
  body: VerifyPassEmailCodeBody
  now: Date
}): Promise<VerifyPassEmailCodeResponse> {
  const { email, code } = body
  const attemptedCode = await recordPassEmailCodeAttempt(database, {
    email,
    now,
    maxAttemptCount: MAX_EMAIL_CODE_ATTEMPT_COUNT,
  })
  if (attemptedCode === null) {
    // A live code with no tries left, or no live code at all.
    const liveCode = await findPassEmailCode(database, { email, now })
    throw liveCode === null
      ? new ApiError('EMAIL_CODE_EXPIRED', HTTP_STATUS_BAD_REQUEST)
      : new ApiError('EMAIL_CODE_TOO_MANY_ATTEMPTS', HTTP_STATUS_TOO_MANY_REQUESTS)
  }

  const candidateCodeHash = hashEmailCode({ email, emailCode: code, emailProofSecret })
  if (!isEmailCodeHashMatch(attemptedCode.codeHash, candidateCodeHash)) {
    const attemptsLeft = MAX_EMAIL_CODE_ATTEMPT_COUNT - attemptedCode.attemptCount
    throw attemptsLeft === 0
      ? new ApiError('EMAIL_CODE_TOO_MANY_ATTEMPTS', HTTP_STATUS_TOO_MANY_REQUESTS)
      : new ApiError('EMAIL_CODE_INCORRECT', HTTP_STATUS_BAD_REQUEST, { attemptsLeft })
  }

  await deletePassEmailCode(database, email)
  const { emailProof, emailProofExpiresAt } = await signEmailProof({
    email,
    emailProofSecret,
    issuedAt: now,
  })
  return { emailProof, emailProofExpiresAt: emailProofExpiresAt.toISOString() }
}
