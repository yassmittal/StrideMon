import { errors as joseErrors, jwtVerify, SignJWT } from 'jose'

const INVITES_TOKEN_ALGORITHM = 'HS256'
// Its own audience, so an invites token can't pass as an email proof, or the other way round.
const INVITES_TOKEN_AUDIENCE = 'stridemon:waitlist-invites'
const MILLISECONDS_PER_SECOND = 1000

/** A return visit to the invites page costs no email for 30 days (D-056). */
export const INVITES_TOKEN_TTL_SECONDS = 30 * 24 * 60 * 60

/** An HS256 JWT saying "this browser checked this email", with the email as its subject. */
export async function signInvitesToken({
  email,
  emailProofSecret,
  issuedAt,
}: {
  email: string
  emailProofSecret: string
  issuedAt: Date
}): Promise<{ invitesToken: string; invitesTokenExpiresAt: Date }> {
  const issuedAtSeconds = Math.floor(issuedAt.getTime() / MILLISECONDS_PER_SECOND)
  const expiresAtSeconds = issuedAtSeconds + INVITES_TOKEN_TTL_SECONDS
  const invitesToken = await new SignJWT({})
    .setProtectedHeader({ alg: INVITES_TOKEN_ALGORITHM })
    .setSubject(email)
    .setAudience(INVITES_TOKEN_AUDIENCE)
    .setIssuedAt(issuedAtSeconds)
    .setExpirationTime(expiresAtSeconds)
    .sign(new TextEncoder().encode(emailProofSecret))
  return {
    invitesToken,
    invitesTokenExpiresAt: new Date(expiresAtSeconds * MILLISECONDS_PER_SECOND),
  }
}

/** The email of a valid, unexpired invites token, or `null` for anything else. */
export async function verifyInvitesToken({
  invitesToken,
  emailProofSecret,
  now,
}: {
  invitesToken: string
  emailProofSecret: string
  now: Date
}): Promise<string | null> {
  try {
    const { payload } = await jwtVerify(invitesToken, new TextEncoder().encode(emailProofSecret), {
      algorithms: [INVITES_TOKEN_ALGORITHM],
      audience: INVITES_TOKEN_AUDIENCE,
      currentDate: now,
    })
    return payload.sub ?? null
  } catch (error) {
    if (error instanceof joseErrors.JOSEError) return null
    throw error
  }
}
