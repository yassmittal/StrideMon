import { errors as joseErrors, jwtVerify, SignJWT } from 'jose'

const EMAIL_PROOF_ALGORITHM = 'HS256'
// Ties the token to this one use, so no other token signed with the secret passes as a proof.
const EMAIL_PROOF_AUDIENCE = 'stridemon:founding-pass-email'
const MILLISECONDS_PER_SECOND = 1000

/** How long a verified email stays verified: "Get ready" a few hours before the mint (D-043). */
export const EMAIL_PROOF_TTL_SECONDS = 6 * 60 * 60

/** An HS256 JWT saying "this email was verified", with the email as its subject. */
export async function signEmailProof({
  email,
  emailProofSecret,
  issuedAt,
}: {
  email: string
  emailProofSecret: string
  issuedAt: Date
}): Promise<{ emailProof: string; emailProofExpiresAt: Date }> {
  const issuedAtSeconds = Math.floor(issuedAt.getTime() / MILLISECONDS_PER_SECOND)
  const expiresAtSeconds = issuedAtSeconds + EMAIL_PROOF_TTL_SECONDS
  const emailProof = await new SignJWT({})
    .setProtectedHeader({ alg: EMAIL_PROOF_ALGORITHM })
    .setSubject(email)
    .setAudience(EMAIL_PROOF_AUDIENCE)
    .setIssuedAt(issuedAtSeconds)
    .setExpirationTime(expiresAtSeconds)
    .sign(new TextEncoder().encode(emailProofSecret))
  return { emailProof, emailProofExpiresAt: new Date(expiresAtSeconds * MILLISECONDS_PER_SECOND) }
}

/** The verified email of a valid, unexpired proof, or `null` for anything else. */
export async function verifyEmailProof({
  emailProof,
  emailProofSecret,
  now,
}: {
  emailProof: string
  emailProofSecret: string
  now: Date
}): Promise<string | null> {
  try {
    const { payload } = await jwtVerify(emailProof, new TextEncoder().encode(emailProofSecret), {
      algorithms: [EMAIL_PROOF_ALGORITHM],
      audience: EMAIL_PROOF_AUDIENCE,
      currentDate: now,
    })
    return payload.sub ?? null
  } catch (error) {
    if (error instanceof joseErrors.JOSEError) return null
    throw error
  }
}
