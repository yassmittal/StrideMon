import type { AuthTokensResponse } from '@stridemon/shared/api-contracts'
import { type AccessTokenSource, ApiError } from '../../lib/api-client'
import { refreshAuthTokens, revokeAuthSession } from './api/auth-api'
import { readAccessToken, setAuthSession } from './auth-session-store'
import {
  deleteStoredRefreshToken,
  readStoredRefreshToken,
  storeRefreshToken,
} from './auth-token-storage'

const HTTP_STATUS_UNAUTHORIZED = 401

let inFlightRefresh: Promise<string | null> | null = null

/** What `lib/api-client` uses to attach and renew access tokens. */
export const authSessionAccessTokenSource: AccessTokenSource = {
  readAccessToken,
  refreshAccessToken,
}

/**
 * Decides at launch whether the player is signed in. With a stored refresh token
 * it refreshes silently, and never opens the wallet. If the API can't be reached,
 * the player stays signed in and the next request retries the refresh.
 */
export async function restoreAuthSession(): Promise<void> {
  const refreshToken = await readStoredRefreshToken()
  if (refreshToken === null) {
    setAuthSession({ status: 'signedOut' })
    return
  }

  try {
    await refreshAccessToken()
  } catch (error) {
    if (!(error instanceof ApiError)) throw error
    setAuthSession({ status: 'signedIn', accessToken: null })
  }
}

/** Keeps the tokens from a successful verify or refresh. */
export async function startAuthSession(authTokens: AuthTokensResponse): Promise<void> {
  // Store first: once the server has rotated, the old token only signs the player out.
  await storeRefreshToken(authTokens.refreshToken)
  setAuthSession({ status: 'signedIn', accessToken: authTokens.accessToken })
}

/**
 * Exchanges the stored refresh token for a new access token. Concurrent callers
 * share one request: refresh tokens are single-use, so a second parallel refresh
 * would look like a stolen token and sign the player out everywhere.
 *
 * Resolves null (and signs out on this device) when the API refuses the token.
 * Rejects when the API couldn't answer, leaving the session in place.
 */
export function refreshAccessToken(): Promise<string | null> {
  inFlightRefresh ??= refreshAccessTokenOnce().finally(() => {
    inFlightRefresh = null
  })
  return inFlightRefresh
}

/**
 * Revokes this device's auth session on the server, then forgets it locally. The
 * local sign-out always happens; a failed revoke is rethrown for the caller to report.
 */
export async function signOutOfAuthSession(): Promise<void> {
  try {
    // Refresh (if needed) before reading the token, so the body names the auth
    // session that is current after any rotation.
    const accessToken = readAccessToken() ?? (await refreshAccessToken())
    const refreshToken = await readStoredRefreshToken()
    if (accessToken !== null && refreshToken !== null) await revokeAuthSession(refreshToken)
  } finally {
    await endAuthSessionOnThisDevice()
  }
}

async function refreshAccessTokenOnce(): Promise<string | null> {
  const refreshToken = await readStoredRefreshToken()
  if (refreshToken === null) {
    setAuthSession({ status: 'signedOut' })
    return null
  }

  try {
    const authTokens = await refreshAuthTokens(refreshToken)
    await startAuthSession(authTokens)
    return authTokens.accessToken
  } catch (error) {
    if (error instanceof ApiError && error.statusCode === HTTP_STATUS_UNAUTHORIZED) {
      await endAuthSessionOnThisDevice()
      return null
    }
    throw error
  }
}

/** Forgets the auth session on this device only. Also used after the account is deleted. */
export async function endAuthSessionOnThisDevice(): Promise<void> {
  await deleteStoredRefreshToken()
  setAuthSession({ status: 'signedOut' })
}
