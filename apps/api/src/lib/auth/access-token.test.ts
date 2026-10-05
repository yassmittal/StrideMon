import { describe, expect, it } from 'bun:test'
import { signAccessToken, verifyAccessToken } from './access-token'

const JWT_ACCESS_TOKEN_SECRET = 'x'.repeat(128)
const ISSUED_AT = new Date('2026-09-29T10:00:00Z')
const ACCESS_TOKEN_TTL_SECONDS = 900
const CLAIMS = {
  userId: '66f9a1b2c3d4e5f607182930',
  walletAddress: '0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266',
} as const

function signTestAccessToken() {
  return signAccessToken({
    ...CLAIMS,
    jwtAccessTokenSecret: JWT_ACCESS_TOKEN_SECRET,
    issuedAt: ISSUED_AT,
    accessTokenTtlSeconds: ACCESS_TOKEN_TTL_SECONDS,
  })
}

describe('access tokens', () => {
  it('round-trips the user id and wallet address while unexpired', async () => {
    const accessToken = await signTestAccessToken()

    const claims = await verifyAccessToken({
      accessToken,
      jwtAccessTokenSecret: JWT_ACCESS_TOKEN_SECRET,
      now: new Date(ISSUED_AT.getTime() + 60_000),
    })

    expect(claims).toEqual(CLAIMS)
  })

  it('rejects a token once its lifetime has passed', async () => {
    const accessToken = await signTestAccessToken()

    const claims = await verifyAccessToken({
      accessToken,
      jwtAccessTokenSecret: JWT_ACCESS_TOKEN_SECRET,
      now: new Date(ISSUED_AT.getTime() + (ACCESS_TOKEN_TTL_SECONDS + 1) * 1000),
    })

    expect(claims).toBeNull()
  })

  it('rejects a token signed with a different secret', async () => {
    const accessToken = await signTestAccessToken()

    const claims = await verifyAccessToken({
      accessToken,
      jwtAccessTokenSecret: 'y'.repeat(128),
      now: ISSUED_AT,
    })

    expect(claims).toBeNull()
  })

  it('rejects a string that is not a JWT', async () => {
    const claims = await verifyAccessToken({
      accessToken: 'not-a-jwt',
      jwtAccessTokenSecret: JWT_ACCESS_TOKEN_SECRET,
      now: ISSUED_AT,
    })

    expect(claims).toBeNull()
  })
})
