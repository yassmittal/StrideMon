import { EMAIL_CHECK_METHODS, type EmailCheckMethod } from '@stridemon/shared/domain'
import { errors as joseErrors, jwtVerify, SignJWT } from 'jose'

const EMAIL_PROOF_ALGORITHM = 'HS256'
// Ties the token to this one use, so no other token signed with the secret passes as a proof.
const EMAIL_PROOF_AUDIENCE = 'stridemon:founding-pass-email'
const MILLISECONDS_PER_SECOND = 1000

/** How long a verified email stays verified: "Get ready" a few hours before the mint (D-043). */
export const EMAIL_PROOF_TTL_SECONDS = 6 * 60 * 60

/** What a valid proof says: the email, and how it was checked (D-057). */
export type VerifiedEmail = { email: string; emailCheckMethod: EmailCheckMethod }

/**
 * An HS256 JWT saying "this email was verified", with the email as its subject and how it was
 * checked (a code or Google) as `emailCheckMethod`.
 */
export async function signEmailProof({
  email,
  emailCheckMethod,
  emailProofSecret,
  issuedAt,
}: {
  email: string
  emailCheckMethod: EmailCheckMethod
  emailProofSecret: string
  issuedAt: Date
}): Promise<{ emailProof: string; emailProofExpiresAt: Date }> {
  const issuedAtSeconds = Math.floor(issuedAt.getTime() / MILLISECONDS_PER_SECOND)
  const expiresAtSeconds = issuedAtSeconds + EMAIL_PROOF_TTL_SECONDS
  const emailProof = await new SignJWT({ emailCheckMethod })
    .setProtectedHeader({ alg: EMAIL_PROOF_ALGORITHM })
    .setSubject(email)
    .setAudience(EMAIL_PROOF_AUDIENCE)
    .setIssuedAt(issuedAtSeconds)
    .setExpirationTime(expiresAtSeconds)
    .sign(new TextEncoder().encode(emailProofSecret))
  return { emailProof, emailProofExpiresAt: new Date(expiresAtSeconds * MILLISECONDS_PER_SECOND) }
}

/**
 * The verified email of a valid, unexpired proof, or `null` for anything else. A proof from
 * before D-057 has no method, and was a code.
 */
export async function verifyEmailProof({
  emailProof,
  emailProofSecret,
  now,
}: {
  emailProof: string
  emailProofSecret: string
  now: Date
}): Promise<VerifiedEmail | null> {
  try {
    const { payload } = await jwtVerify(emailProof, new TextEncoder().encode(emailProofSecret), {
      algorithms: [EMAIL_PROOF_ALGORITHM],
      audience: EMAIL_PROOF_AUDIENCE,
      currentDate: now,
    })
    if (payload.sub === undefined) return null
    const emailCheckMethod = EMAIL_CHECK_METHODS.find(
      (method) => method === payload.emailCheckMethod,
    )
    return { email: payload.sub, emailCheckMethod: emailCheckMethod ?? 'code' }
  } catch (error) {
    if (error instanceof joseErrors.JOSEError) return null
    throw error
  }
}
