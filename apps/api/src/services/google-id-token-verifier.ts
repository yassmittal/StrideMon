import { createRemoteJWKSet, type JWTVerifyGetKey, errors as joseErrors, jwtVerify } from 'jose'

// Google's published signing keys, and the two forms of issuer its ID tokens carry (D-057).
const GOOGLE_SIGNING_KEYS_URL = new URL('https://www.googleapis.com/oauth2/v3/certs')
const GOOGLE_ISSUERS = ['accounts.google.com', 'https://accounts.google.com']
const GOOGLE_ID_TOKEN_ALGORITHM = 'RS256'
const GOOGLE_KEYS_TIMEOUT_MILLISECONDS = 10_000
// When Google's keys couldn't be fetched or read: nothing is wrong with the token itself.
const UNAVAILABLE_JOSE_ERROR_CODES: ReadonlySet<string> = new Set([
  'ERR_JWKS_TIMEOUT',
  'ERR_JWKS_INVALID',
  'ERR_JOSE_GENERIC',
])

/** A token Google signed for us with a verified email, or a token we can't trust. */
export type GoogleIdTokenCheck = { status: 'verified'; email: string } | { status: 'refused' }

export type GoogleIdTokenVerifier = {
  /**
   * Checks an ID token from the website's Sign in with Google button. Throws
   * `GoogleSignInUnavailableError` when Google's keys can't be had, so it's not the person's fault.
   */
  checkGoogleIdToken: (check: { googleIdToken: string; now: Date }) => Promise<GoogleIdTokenCheck>
}

/** Google's keys couldn't be fetched: try again later, or use a code. */
export class GoogleSignInUnavailableError extends Error {
  constructor(cause: unknown) {
    super('Google’s signing keys could not be read', { cause })
    this.name = 'GoogleSignInUnavailableError'
  }
}

/**
 * Checks Google ID tokens on the server (security.md → Checking an email with Google): the
 * signature against Google's keys, the issuer, our client id as the audience, the expiry, and
 * `email_verified`. Only the email is read: never the name, photo or account id. Tests pass their
 * own `signingKeys`, so the same checks run against tokens they sign.
 */
export function createGoogleIdTokenVerifier({
  googleClientId,
  signingKeys = createRemoteJWKSet(GOOGLE_SIGNING_KEYS_URL, {
    timeoutDuration: GOOGLE_KEYS_TIMEOUT_MILLISECONDS,
  }),
}: {
  googleClientId: string
  signingKeys?: JWTVerifyGetKey
}): GoogleIdTokenVerifier {
  return {
    checkGoogleIdToken: async ({ googleIdToken, now }) => {
      try {
        const { payload } = await jwtVerify(googleIdToken, signingKeys, {
          algorithms: [GOOGLE_ID_TOKEN_ALGORITHM],
          issuer: GOOGLE_ISSUERS,
          audience: googleClientId,
          currentDate: now,
        })
        // Google has sent it as a boolean, and in older tokens as the string "true".
        const isEmailVerified = payload.email_verified === true || payload.email_verified === 'true'
        if (typeof payload.email !== 'string' || !isEmailVerified) return { status: 'refused' }
        return { status: 'verified', email: payload.email.trim().toLowerCase() }
      } catch (error) {
        if (
          error instanceof joseErrors.JOSEError &&
          !UNAVAILABLE_JOSE_ERROR_CODES.has(error.code)
        ) {
          return { status: 'refused' }
        }
        throw new GoogleSignInUnavailableError(error)
      }
    },
  }
}
