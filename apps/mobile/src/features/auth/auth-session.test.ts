import { registerAccessTokenSource } from '../../lib/api-client'
import {
  authSessionAccessTokenSource,
  refreshAccessToken,
  restoreAuthSession,
  signOutOfAuthSession,
} from './auth-session'
import { useAuthSessionStore } from './auth-session-store'

jest.mock('expo-secure-store', () => {
  const storedValues = new Map<string, string>()
  return {
    getItemAsync: jest.fn(async (key: string) => storedValues.get(key) ?? null),
    setItemAsync: jest.fn(async (key: string, value: string) => {
      storedValues.set(key, value)
    }),
    deleteItemAsync: jest.fn(async (key: string) => {
      storedValues.delete(key)
    }),
  }
})

// Imported after the mock so these are the in-memory versions.
const { readStoredRefreshToken, storeRefreshToken, deleteStoredRefreshToken } =
  jest.requireActual<typeof import('./auth-token-storage')>('./auth-token-storage')

const fetchMock = jest.spyOn(globalThis, 'fetch')

const AUTH_TOKENS_BODY = {
  accessToken: 'new-access-token',
  refreshToken: 'new-refresh-token',
  user: {
    userId: '66f9a1b2c3d4e5f607182930',
    walletAddress: '0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266',
    hasReceivedStarterSneaker: false,
    hasReceivedGasDrip: false,
    createdAt: '2026-09-29T10:00:00.000Z',
  },
}

function buildJsonResponse(statusCode: number, body: unknown): Response {
  return new Response(body === null ? null : JSON.stringify(body), {
    status: statusCode,
    headers: { 'Content-Type': 'application/json' },
  })
}

function readAuthSession() {
  return useAuthSessionStore.getState().authSession
}

describe('auth session', () => {
  beforeAll(() => {
    // The same wiring useRestoreAuthSessionOnLaunch does in the app.
    registerAccessTokenSource(authSessionAccessTokenSource)
  })

  beforeEach(async () => {
    fetchMock.mockReset()
    await deleteStoredRefreshToken()
    useAuthSessionStore.setState({ authSession: { status: 'restoring' } })
  })

  it('restores to signed out when no refresh token is stored', async () => {
    await restoreAuthSession()

    expect(readAuthSession()).toEqual({ status: 'signedOut' })
    expect(fetchMock).not.toHaveBeenCalled()
  })

  it('restores a stored session silently and keeps the rotated refresh token', async () => {
    await storeRefreshToken('old-refresh-token')
    fetchMock.mockResolvedValue(buildJsonResponse(200, AUTH_TOKENS_BODY))

    await restoreAuthSession()

    expect(readAuthSession()).toEqual({ status: 'signedIn', accessToken: 'new-access-token' })
    await expect(readStoredRefreshToken()).resolves.toBe('new-refresh-token')
  })

  it('stays signed in when the API cannot be reached at launch', async () => {
    await storeRefreshToken('old-refresh-token')
    fetchMock.mockRejectedValue(new TypeError('Network request failed'))

    await restoreAuthSession()

    expect(readAuthSession()).toEqual({ status: 'signedIn', accessToken: null })
    await expect(readStoredRefreshToken()).resolves.toBe('old-refresh-token')
  })

  it('signs out on this device when the API refuses the refresh token', async () => {
    await storeRefreshToken('revoked-refresh-token')
    fetchMock.mockResolvedValue(
      buildJsonResponse(401, {
        error: { code: 'REFRESH_TOKEN_REVOKED', message: 'Revoked.' },
      }),
    )

    await expect(refreshAccessToken()).resolves.toBeNull()

    expect(readAuthSession()).toEqual({ status: 'signedOut' })
    await expect(readStoredRefreshToken()).resolves.toBeNull()
  })

  it('shares one refresh between concurrent callers, because refresh tokens are single-use', async () => {
    await storeRefreshToken('old-refresh-token')
    fetchMock.mockResolvedValue(buildJsonResponse(200, AUTH_TOKENS_BODY))

    const accessTokens = await Promise.all([refreshAccessToken(), refreshAccessToken()])

    expect(accessTokens).toEqual(['new-access-token', 'new-access-token'])
    expect(fetchMock).toHaveBeenCalledTimes(1)
  })

  it('revokes the auth session on the server when signing out, then forgets it', async () => {
    await storeRefreshToken('current-refresh-token')
    useAuthSessionStore.setState({
      authSession: { status: 'signedIn', accessToken: 'current-access-token' },
    })
    fetchMock.mockResolvedValue(buildJsonResponse(204, null))

    await signOutOfAuthSession()

    const [signOutUrl, signOutInit] = fetchMock.mock.calls[0] ?? []
    expect(signOutUrl).toBe('http://api.test/v1/auth/sign-out')
    expect(JSON.parse(String(signOutInit?.body))).toEqual({ refreshToken: 'current-refresh-token' })
    expect(readAuthSession()).toEqual({ status: 'signedOut' })
    await expect(readStoredRefreshToken()).resolves.toBeNull()
  })

  it('still signs out on this device when the server cannot be reached', async () => {
    await storeRefreshToken('current-refresh-token')
    useAuthSessionStore.setState({
      authSession: { status: 'signedIn', accessToken: 'current-access-token' },
    })
    fetchMock.mockRejectedValue(new TypeError('Network request failed'))

    await expect(signOutOfAuthSession()).rejects.toMatchObject({ code: 'NETWORK_UNREACHABLE' })

    expect(readAuthSession()).toEqual({ status: 'signedOut' })
    await expect(readStoredRefreshToken()).resolves.toBeNull()
  })
})
