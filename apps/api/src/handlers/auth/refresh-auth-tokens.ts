import type { AuthTokensResponse } from '@stridemon/shared/api-contracts'
import type { Db } from 'mongodb'
import { ApiError } from '../../common/api-error'
import { hashRefreshToken } from '../../lib/auth/hash-refresh-token'
import type { ApiConfig } from '../../plugins/env'
import {
  findAuthSessionByRefreshTokenHash,
  revokeAllAuthSessionsOfUser,
  rotateUsableAuthSession,
} from '../../repositories/auth-sessions-repository'
import { findUserById } from '../../repositories/users-repository'
import { issueAuthTokens } from './issue-auth-tokens'

const HTTP_STATUS_UNAUTHORIZED = 401

type RefreshAuthTokensOptions = {
  database: Db
  apiConfig: ApiConfig
  refreshToken: string
  now: Date
}

/**
 * Rotates a refresh token: the old auth session is revoked and a new one issued.
 * Presenting an already-rotated token means it was copied, so every auth session
 * of that user is revoked (security.md → Authentication).
 */
export async function refreshAuthTokens({
  database,
  apiConfig,
  refreshToken,
  now,
}: RefreshAuthTokensOptions): Promise<AuthTokensResponse> {
  const refreshTokenHash = hashRefreshToken(refreshToken)

  const rotatedAuthSession = await rotateUsableAuthSession(database, { refreshTokenHash, now })
  if (rotatedAuthSession === null) {
    return rejectUnusableRefreshToken({ database, refreshTokenHash, now })
  }

  const userDocument = await findUserById(database, rotatedAuthSession.userId)
  if (userDocument === null) throw new ApiError('UNAUTHENTICATED', HTTP_STATUS_UNAUTHORIZED)

  return issueAuthTokens({ database, apiConfig, userDocument, now })
}

async function rejectUnusableRefreshToken({
  database,
  refreshTokenHash,
  now,
}: {
  database: Db
  refreshTokenHash: string
  now: Date
}): Promise<never> {
  const authSession = await findAuthSessionByRefreshTokenHash(database, refreshTokenHash)
  if (authSession?.revocationReason === 'rotated') {
    await revokeAllAuthSessionsOfUser(database, { userId: authSession.userId, now })
  }
  if (authSession?.revokedAt) {
    throw new ApiError('REFRESH_TOKEN_REVOKED', HTTP_STATUS_UNAUTHORIZED)
  }
  // Unknown or expired: nothing was stolen, the client just has to sign in again.
  throw new ApiError('UNAUTHENTICATED', HTTP_STATUS_UNAUTHORIZED)
}
