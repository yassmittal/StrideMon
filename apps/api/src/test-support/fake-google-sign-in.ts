import { createLocalJWKSet, exportJWK, generateKeyPair, SignJWT } from 'jose'
import {
  createGoogleIdTokenVerifier,
  type GoogleIdTokenVerifier,
} from '../services/google-id-token-verifier'
import { TEST_GOOGLE_CLIENT_ID } from './build-test-server'

// The tests' stand-in for Google's signing key: the verifier checks tokens against it exactly as
// it checks real ones against Google's published keys.
const TEST_GOOGLE_KEY_ID = 'test-google-key'
const testGoogleKeyPair = await generateKeyPair('RS256')
const testGooglePublicJwk = {
  ...(await exportJWK(testGoogleKeyPair.publicKey)),
  kid: TEST_GOOGLE_KEY_ID,
  alg: 'RS256',
}
const SECONDS_PER_HOUR = 3600

/** The real verifier, with the tests' signing key in place of Google's. */
export function createTestGoogleIdTokenVerifier(): GoogleIdTokenVerifier {
  return createGoogleIdTokenVerifier({
    googleClientId: TEST_GOOGLE_CLIENT_ID,
    signingKeys: createLocalJWKSet({ keys: [testGooglePublicJwk] }),
  })
}

/** An ID token as Google's button would give it; each claim can be changed to test a refusal. */
export function signTestGoogleIdToken({
  email,
  isEmailVerified = true,
  audience = TEST_GOOGLE_CLIENT_ID,
  issuer = 'https://accounts.google.com',
  issuedAt = new Date(),
}: {
  email: string
  isEmailVerified?: boolean
  audience?: string
  issuer?: string
  issuedAt?: Date
}): Promise<string> {
  const issuedAtSeconds = Math.floor(issuedAt.getTime() / 1000)
  return new SignJWT({
    email,
    email_verified: isEmailVerified,
    name: 'Test Runner',
    picture: 'https://example.com/photo.png',
  })
    .setProtectedHeader({ alg: 'RS256', kid: TEST_GOOGLE_KEY_ID })
    .setIssuer(issuer)
    .setAudience(audience)
    .setSubject('109876543210987654321')
    .setIssuedAt(issuedAtSeconds)
    .setExpirationTime(issuedAtSeconds + SECONDS_PER_HOUR)
    .sign(testGoogleKeyPair.privateKey)
}
