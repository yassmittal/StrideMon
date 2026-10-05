import { errors as joseErrors, jwtVerify, SignJWT } from 'jose'
import { type Address, getAddress, isAddress } from 'viem'

const ACCESS_TOKEN_ALGORITHM = 'HS256'

export type AccessTokenClaims = {
  userId: string
  walletAddress: Address
}

type SignAccessTokenOptions = AccessTokenClaims & {
  jwtAccessTokenSecret: string
  issuedAt: Date
  accessTokenTtlSeconds: number
}

/** A short-lived HS256 JWT carrying `{ sub: userId, walletAddress }` and nothing else. */
export async function signAccessToken({
  userId,
  walletAddress,
  jwtAccessTokenSecret,
  issuedAt,
  accessTokenTtlSeconds,
}: SignAccessTokenOptions): Promise<string> {
  const issuedAtSeconds = Math.floor(issuedAt.getTime() / 1000)
  return new SignJWT({ walletAddress })
    .setProtectedHeader({ alg: ACCESS_TOKEN_ALGORITHM })
    .setSubject(userId)
    .setIssuedAt(issuedAtSeconds)
    .setExpirationTime(issuedAtSeconds + accessTokenTtlSeconds)
    .sign(encodeSecret(jwtAccessTokenSecret))
}

type VerifyAccessTokenOptions = {
  accessToken: string
  jwtAccessTokenSecret: string
  now: Date
}

/**
 * The claims of a valid, unexpired access token, or `null` for anything else
 * (bad signature, expired, malformed, wrong algorithm). Callers only need to know
 * whether to trust it; the reason is not shown to clients.
 */
export async function verifyAccessToken({
  accessToken,
  jwtAccessTokenSecret,
  now,
}: VerifyAccessTokenOptions): Promise<AccessTokenClaims | null> {
  try {
    const { payload } = await jwtVerify(accessToken, encodeSecret(jwtAccessTokenSecret), {
      algorithms: [ACCESS_TOKEN_ALGORITHM],
      currentDate: now,
    })
    const walletAddress = payload.walletAddress
    if (payload.sub === undefined || typeof walletAddress !== 'string') return null
    if (!isAddress(walletAddress)) return null
    return { userId: payload.sub, walletAddress: getAddress(walletAddress) }
  } catch (error) {
    if (error instanceof joseErrors.JOSEError) return null
    throw error
  }
}

function encodeSecret(jwtAccessTokenSecret: string): Uint8Array {
  return new TextEncoder().encode(jwtAccessTokenSecret)
}
