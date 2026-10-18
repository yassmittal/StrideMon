import type {
  CheckPassEmailWithGoogleBody,
  VerifyPassEmailCodeResponse,
} from '@stridemon/shared/api-contracts'
import { ApiError } from '../../common/api-error'
import { signEmailProof } from '../../lib/founding-pass/email-proof'
import {
  type GoogleIdTokenVerifier,
  GoogleSignInUnavailableError,
} from '../../services/google-id-token-verifier'

const HTTP_STATUS_UNAUTHORIZED = 401
const HTTP_STATUS_SERVICE_UNAVAILABLE = 503

/**
 * Checks an email with Sign in with Google instead of a code (D-057), and answers the same email
 * proof as `email-verify`. Nothing is stored: the proof carries the email, and nothing from Google
 * but the email is ever read.
 */
export async function checkPassEmailWithGoogle({
  googleIdTokenVerifier,
  emailProofSecret,
  body,
  now,
}: {
  /** `null` without `GOOGLE_CLIENT_ID`. */
  googleIdTokenVerifier: GoogleIdTokenVerifier | null
  emailProofSecret: string
  body: CheckPassEmailWithGoogleBody
  now: Date
}): Promise<VerifyPassEmailCodeResponse> {
  if (googleIdTokenVerifier === null) {
    throw new ApiError('GOOGLE_SIGN_IN_UNAVAILABLE', HTTP_STATUS_SERVICE_UNAVAILABLE)
  }
  let googleIdTokenCheck: Awaited<ReturnType<GoogleIdTokenVerifier['checkGoogleIdToken']>>
  try {
    googleIdTokenCheck = await googleIdTokenVerifier.checkGoogleIdToken({
      googleIdToken: body.googleIdToken,
      now,
    })
  } catch (error) {
    if (error instanceof GoogleSignInUnavailableError) {
      throw new ApiError('GOOGLE_SIGN_IN_UNAVAILABLE', HTTP_STATUS_SERVICE_UNAVAILABLE)
    }
    throw error
  }
  if (googleIdTokenCheck.status === 'refused') {
    throw new ApiError('GOOGLE_SIGN_IN_FAILED', HTTP_STATUS_UNAUTHORIZED)
  }

  const { emailProof, emailProofExpiresAt } = await signEmailProof({
    email: googleIdTokenCheck.email,
    emailCheckMethod: 'google',
    emailProofSecret,
    issuedAt: now,
  })
  return {
    email: googleIdTokenCheck.email,
    emailProof,
    emailProofExpiresAt: emailProofExpiresAt.toISOString(),
  }
}
