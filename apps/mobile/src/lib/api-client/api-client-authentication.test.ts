import { currentUserResponseSchema } from '@stridemon/shared/api-contracts'
import { registerAccessTokenSource } from './access-token-source'
import { requestJson } from './api-client'
import { ApiError } from './api-error'

const fetchMock = jest.spyOn(globalThis, 'fetch')

const CURRENT_USER_BODY = {
  user: {
    userId: '66f9a1b2c3d4e5f607182930',
    walletAddress: '0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266',
    hasReceivedStarterSneaker: false,
    hasReceivedGasDrip: false,
    createdAt: '2026-09-29T10:00:00.000Z',
  },
}

function buildJsonResponse(statusCode: number, body: unknown): Response {
  return new Response(JSON.stringify(body), {
    status: statusCode,
    headers: { 'Content-Type': 'application/json' },
  })
}

const UNAUTHENTICATED_BODY = { error: { code: 'UNAUTHENTICATED', message: 'Sign in first.' } }

function requestCurrentUser() {
  return requestJson({
    method: 'GET',
    path: '/v1/me',
    responseSchema: currentUserResponseSchema,
    requiresAuthentication: true,
  })
}

function readAuthorizationHeader(callIndex: number): string | undefined {
  const requestInit = fetchMock.mock.calls[callIndex]?.[1]
  return new Headers(requestInit?.headers).get('Authorization') ?? undefined
}

describe('requestJson with requiresAuthentication', () => {
  beforeEach(() => {
    fetchMock.mockReset()
  })

  it('sends the in-memory access token as a bearer token', async () => {
    registerAccessTokenSource({
      readAccessToken: () => 'access-token-1',
      refreshAccessToken: jest.fn(),
    })
    fetchMock.mockResolvedValue(buildJsonResponse(200, CURRENT_USER_BODY))

    await expect(requestCurrentUser()).resolves.toEqual(CURRENT_USER_BODY)
    expect(readAuthorizationHeader(0)).toBe('Bearer access-token-1')
  })

  it('refreshes once and retries once when the API answers 401', async () => {
    const refreshAccessToken = jest.fn().mockResolvedValue('access-token-2')
    registerAccessTokenSource({ readAccessToken: () => 'expired-token', refreshAccessToken })
    fetchMock
      .mockResolvedValueOnce(buildJsonResponse(401, UNAUTHENTICATED_BODY))
      .mockResolvedValueOnce(buildJsonResponse(200, CURRENT_USER_BODY))

    await expect(requestCurrentUser()).resolves.toEqual(CURRENT_USER_BODY)
    expect(refreshAccessToken).toHaveBeenCalledTimes(1)
    expect(readAuthorizationHeader(1)).toBe('Bearer access-token-2')
  })

  it('gives up with the 401 when the refresh signs the player out', async () => {
    registerAccessTokenSource({
      readAccessToken: () => 'expired-token',
      refreshAccessToken: jest.fn().mockResolvedValue(null),
    })
    fetchMock.mockResolvedValue(buildJsonResponse(401, UNAUTHENTICATED_BODY))

    await expect(requestCurrentUser()).rejects.toMatchObject({
      code: 'UNAUTHENTICATED',
      statusCode: 401,
    })
    expect(fetchMock).toHaveBeenCalledTimes(1)
  })

  it('does not retry a second time if the retried request is also refused', async () => {
    const refreshAccessToken = jest.fn().mockResolvedValue('access-token-2')
    registerAccessTokenSource({ readAccessToken: () => 'expired-token', refreshAccessToken })
    fetchMock.mockResolvedValue(buildJsonResponse(401, UNAUTHENTICATED_BODY))

    await expect(requestCurrentUser()).rejects.toBeInstanceOf(ApiError)
    expect(refreshAccessToken).toHaveBeenCalledTimes(1)
    expect(fetchMock).toHaveBeenCalledTimes(2)
  })

  it('refreshes first when there is no access token in memory yet', async () => {
    const refreshAccessToken = jest.fn().mockResolvedValue('fresh-token')
    registerAccessTokenSource({ readAccessToken: () => null, refreshAccessToken })
    fetchMock.mockResolvedValue(buildJsonResponse(200, CURRENT_USER_BODY))

    await requestCurrentUser()

    expect(readAuthorizationHeader(0)).toBe('Bearer fresh-token')
  })
})
