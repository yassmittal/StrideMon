import { afterAll, afterEach, beforeAll, beforeEach, describe, expect, it } from 'bun:test'
import {
  type ApiErrorResponse,
  apiErrorResponseSchema,
  authNonceResponseSchema,
  authTokensResponseSchema,
  currentUserResponseSchema,
} from '@stridemon/shared/api-contracts'
import type { FastifyInstance } from 'fastify'
import { generatePrivateKey, type PrivateKeyAccount, privateKeyToAccount } from 'viem/accounts'
import { parseSiweMessage } from 'viem/siwe'
import { getAuthNoncesCollection } from '../../repositories/auth-nonces-repository'
import { getAuthSessionsCollection } from '../../repositories/auth-sessions-repository'
import { buildTestServer, TEST_SIWE_DOMAIN } from '../../test-support/build-test-server'
import { startTestChain, type TestChain } from '../../test-support/start-test-chain'

let testChain: TestChain
let server: FastifyInstance
let playerAccount: PrivateKeyAccount

beforeAll(async () => {
  testChain = await startTestChain()
})

afterAll(() => {
  testChain.stop()
})

beforeEach(async () => {
  server = await buildTestServer({ monadRpcUrl: testChain.rpcUrl })
  playerAccount = privateKeyToAccount(generatePrivateKey())
})

afterEach(async () => {
  await server.close()
})

describe('POST /v1/auth/nonce', () => {
  it('returns a SIWE message for our domain and chain, carrying the checksummed wallet', async () => {
    const message = await requestSiweMessage(playerAccount.address.toLowerCase())

    expect(parseSiweMessage(message)).toMatchObject({
      domain: TEST_SIWE_DOMAIN,
      address: playerAccount.address,
      chainId: 10143,
    })
  })

  it('rejects a malformed wallet address with VALIDATION_FAILED', async () => {
    const response = await postJson('/v1/auth/nonce', { walletAddress: '0x1234' })

    expect(response.statusCode).toBe(400)
    expect(readErrorCode(response.json())).toBe('VALIDATION_FAILED')
  })

  it('rate-limits auth routes to 10 requests a minute per IP', async () => {
    for (let requestIndex = 0; requestIndex < 10; requestIndex++) {
      const response = await postJson('/v1/auth/nonce', { walletAddress: playerAccount.address })
      expect(response.statusCode).toBe(200)
    }

    const limitedResponse = await postJson('/v1/auth/nonce', {
      walletAddress: playerAccount.address,
    })

    expect(limitedResponse.statusCode).toBe(429)
    expect(readErrorCode(limitedResponse.json())).toBe('RATE_LIMITED')
  })
})

describe('POST /v1/auth/verify', () => {
  it('signs a new wallet in and GET /v1/me returns that user', async () => {
    const authTokens = await signIn(playerAccount)

    expect(authTokens.user).toMatchObject({
      walletAddress: playerAccount.address,
      hasReceivedStarterSneaker: false,
      hasReceivedGasDrip: false,
    })
    const meResponse = await server.inject({
      method: 'GET',
      url: '/v1/me',
      headers: { authorization: `Bearer ${authTokens.accessToken}` },
    })
    expect(meResponse.statusCode).toBe(200)
    expect(currentUserResponseSchema.parse(meResponse.json()).user).toEqual(authTokens.user)
  })

  it('signs a returning wallet in as the same user', async () => {
    const firstSignIn = await signIn(playerAccount)

    const secondSignIn = await signIn(playerAccount)

    expect(secondSignIn.user.userId).toBe(firstSignIn.user.userId)
  })

  it('rejects a replayed message with NONCE_EXPIRED, because the nonce was used up', async () => {
    const message = await requestSiweMessage(playerAccount.address)
    const signature = await playerAccount.signMessage({ message })
    await postJson('/v1/auth/verify', { message, signature })

    const replayResponse = await postJson('/v1/auth/verify', { message, signature })

    expect(replayResponse.statusCode).toBe(401)
    expect(readErrorCode(replayResponse.json())).toBe('NONCE_EXPIRED')
  })

  it('rejects a nonce past its expiry with NONCE_EXPIRED', async () => {
    const message = await requestSiweMessage(playerAccount.address)
    await getAuthNoncesCollection(server.mongo.database).updateMany(
      {},
      { $set: { expiresAt: new Date(Date.now() - 1000) } },
    )

    const response = await postJson('/v1/auth/verify', {
      message,
      signature: await playerAccount.signMessage({ message }),
    })

    expect(response.statusCode).toBe(401)
    expect(readErrorCode(response.json())).toBe('NONCE_EXPIRED')
  })

  it('rejects a signature from a different wallet with INVALID_SIGNATURE', async () => {
    const message = await requestSiweMessage(playerAccount.address)
    const otherAccount = privateKeyToAccount(generatePrivateKey())

    const response = await postJson('/v1/auth/verify', {
      message,
      signature: await otherAccount.signMessage({ message }),
    })

    expect(response.statusCode).toBe(401)
    expect(readErrorCode(response.json())).toBe('INVALID_SIGNATURE')
  })

  it('rejects a message whose domain was changed before signing with INVALID_SIGNATURE', async () => {
    const issuedMessage = await requestSiweMessage(playerAccount.address)
    const tamperedMessage = issuedMessage.replace(TEST_SIWE_DOMAIN, 'evil.example')

    const response = await postJson('/v1/auth/verify', {
      message: tamperedMessage,
      signature: await playerAccount.signMessage({ message: tamperedMessage }),
    })

    expect(response.statusCode).toBe(401)
    expect(readErrorCode(response.json())).toBe('INVALID_SIGNATURE')
  })

  it('rejects a message whose chain id was changed before signing with INVALID_SIGNATURE', async () => {
    const issuedMessage = await requestSiweMessage(playerAccount.address)
    const tamperedMessage = issuedMessage.replace('Chain ID: 10143', 'Chain ID: 1')

    const response = await postJson('/v1/auth/verify', {
      message: tamperedMessage,
      signature: await playerAccount.signMessage({ message: tamperedMessage }),
    })

    expect(response.statusCode).toBe(401)
    expect(readErrorCode(response.json())).toBe('INVALID_SIGNATURE')
  })

  it('rejects a nonce issued to another wallet with INVALID_SIGNATURE', async () => {
    const otherAccount = privateKeyToAccount(generatePrivateKey())
    const issuedMessage = await requestSiweMessage(otherAccount.address)
    const tamperedMessage = issuedMessage.replace(otherAccount.address, playerAccount.address)

    const response = await postJson('/v1/auth/verify', {
      message: tamperedMessage,
      signature: await playerAccount.signMessage({ message: tamperedMessage }),
    })

    expect(response.statusCode).toBe(401)
    expect(readErrorCode(response.json())).toBe('INVALID_SIGNATURE')
  })
})

describe('POST /v1/auth/refresh', () => {
  it('rotates the refresh token, and the new one keeps working', async () => {
    const signedIn = await signIn(playerAccount)

    const firstRefresh = await refresh(signedIn.refreshToken)
    const secondRefresh = await refresh(firstRefresh.refreshToken)

    expect(firstRefresh.refreshToken).not.toBe(signedIn.refreshToken)
    expect(secondRefresh.user.userId).toBe(signedIn.user.userId)
  })

  it('treats a reused refresh token as stolen and revokes every auth session of the user', async () => {
    const phoneSignIn = await signIn(playerAccount)
    const tabletSignIn = await signIn(playerAccount)
    const rotated = await refresh(phoneSignIn.refreshToken)

    const reuseResponse = await postJson('/v1/auth/refresh', {
      refreshToken: phoneSignIn.refreshToken,
    })

    expect(reuseResponse.statusCode).toBe(401)
    expect(readErrorCode(reuseResponse.json())).toBe('REFRESH_TOKEN_REVOKED')
    for (const refreshToken of [rotated.refreshToken, tabletSignIn.refreshToken]) {
      const response = await postJson('/v1/auth/refresh', { refreshToken })
      expect(readErrorCode(response.json())).toBe('REFRESH_TOKEN_REVOKED')
    }
  })

  it('rejects an unknown refresh token with UNAUTHENTICATED', async () => {
    const response = await postJson('/v1/auth/refresh', { refreshToken: 'not-a-real-token' })

    expect(response.statusCode).toBe(401)
    expect(readErrorCode(response.json())).toBe('UNAUTHENTICATED')
  })

  it('rejects an expired refresh token with UNAUTHENTICATED', async () => {
    const signedIn = await signIn(playerAccount)
    await getAuthSessionsCollection(server.mongo.database).updateMany(
      {},
      { $set: { expiresAt: new Date(Date.now() - 1000) } },
    )

    const response = await postJson('/v1/auth/refresh', { refreshToken: signedIn.refreshToken })

    expect(response.statusCode).toBe(401)
    expect(readErrorCode(response.json())).toBe('UNAUTHENTICATED')
  })
})

describe('POST /v1/auth/sign-out', () => {
  it('revokes that auth session only, leaving the user signed in on other devices', async () => {
    const phoneSignIn = await signIn(playerAccount)
    const tabletSignIn = await signIn(playerAccount)

    const signOutResponse = await postJson(
      '/v1/auth/sign-out',
      { refreshToken: phoneSignIn.refreshToken },
      phoneSignIn.accessToken,
    )

    expect(signOutResponse.statusCode).toBe(204)
    const phoneRefresh = await postJson('/v1/auth/refresh', {
      refreshToken: phoneSignIn.refreshToken,
    })
    expect(readErrorCode(phoneRefresh.json())).toBe('REFRESH_TOKEN_REVOKED')
    await expect(refresh(tabletSignIn.refreshToken)).resolves.toBeDefined()
  })

  it('does not sign out an auth session that belongs to someone else', async () => {
    const playerSignIn = await signIn(playerAccount)
    const otherSignIn = await signIn(privateKeyToAccount(generatePrivateKey()))

    await postJson(
      '/v1/auth/sign-out',
      { refreshToken: playerSignIn.refreshToken },
      otherSignIn.accessToken,
    )

    await expect(refresh(playerSignIn.refreshToken)).resolves.toBeDefined()
  })

  it('requires an access token', async () => {
    const response = await postJson('/v1/auth/sign-out', { refreshToken: 'anything' })

    expect(response.statusCode).toBe(401)
    expect(readErrorCode(response.json())).toBe('UNAUTHENTICATED')
  })
})

describe('GET /v1/me', () => {
  it('rejects a request without an access token', async () => {
    const response = await server.inject({ method: 'GET', url: '/v1/me' })

    expect(response.statusCode).toBe(401)
    expect(readErrorCode(response.json())).toBe('UNAUTHENTICATED')
  })

  it('rejects an access token that is not one we signed', async () => {
    const response = await server.inject({
      method: 'GET',
      url: '/v1/me',
      headers: { authorization: 'Bearer not-a-jwt' },
    })

    expect(response.statusCode).toBe(401)
    expect(readErrorCode(response.json())).toBe('UNAUTHENTICATED')
  })
})

function postJson(url: string, body: unknown, accessToken?: string) {
  return server.inject({
    method: 'POST',
    url,
    payload: body as Record<string, unknown>,
    ...(accessToken === undefined ? {} : { headers: { authorization: `Bearer ${accessToken}` } }),
  })
}

async function requestSiweMessage(walletAddress: string): Promise<string> {
  const response = await postJson('/v1/auth/nonce', { walletAddress })
  expect(response.statusCode).toBe(200)
  return authNonceResponseSchema.parse(response.json()).message
}

async function signIn(account: PrivateKeyAccount) {
  const message = await requestSiweMessage(account.address)
  const response = await postJson('/v1/auth/verify', {
    message,
    signature: await account.signMessage({ message }),
  })
  expect(response.statusCode).toBe(200)
  return authTokensResponseSchema.parse(response.json())
}

async function refresh(refreshToken: string) {
  const response = await postJson('/v1/auth/refresh', { refreshToken })
  expect(response.statusCode).toBe(200)
  return authTokensResponseSchema.parse(response.json())
}

function readErrorCode(responseBody: unknown): ApiErrorResponse['error']['code'] {
  return apiErrorResponseSchema.parse(responseBody).error.code
}
