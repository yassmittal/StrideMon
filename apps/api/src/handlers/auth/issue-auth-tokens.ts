import type { AuthTokensResponse } from '@stridemon/shared/api-contracts'
import type { Db } from 'mongodb'
import { getAddress } from 'viem'
import { signAccessToken } from '../../lib/auth/access-token'
import { generateRefreshToken } from '../../lib/auth/generate-refresh-token'
import { hashRefreshToken } from '../../lib/auth/hash-refresh-token'
import type { ApiConfig } from '../../plugins/env'
import { insertAuthSession } from '../../repositories/auth-sessions-repository'
import type { UserDocument } from '../../repositories/users-repository'
import { toCurrentUser } from '../me/to-current-user'

const MILLISECONDS_PER_DAY = 24 * 60 * 60 * 1000

type IssueAuthTokensOptions = {
  database: Db
  apiConfig: ApiConfig
  userDocument: UserDocument
  now: Date
}

/** Starts a new auth session for the user and returns its tokens. Used by verify and refresh. */
export async function issueAuthTokens({
  database,
  apiConfig,
  userDocument,
  now,
}: IssueAuthTokensOptions): Promise<AuthTokensResponse> {
  const refreshToken = generateRefreshToken()
  await insertAuthSession(database, {
    userId: userDocument._id,
    refreshTokenHash: hashRefreshToken(refreshToken),
    deviceLabel: null,
    expiresAt: new Date(now.getTime() + apiConfig.refreshTokenTtlDays * MILLISECONDS_PER_DAY),
    revokedAt: null,
    revocationReason: null,
    createdAt: now,
    updatedAt: now,
  })

  const accessToken = await signAccessToken({
    userId: userDocument._id.toHexString(),
    walletAddress: getAddress(userDocument.walletAddress),
    jwtAccessTokenSecret: apiConfig.jwtAccessTokenSecret,
    issuedAt: now,
    accessTokenTtlSeconds: apiConfig.accessTokenTtlSeconds,
  })

  return { accessToken, refreshToken, user: toCurrentUser(userDocument) }
}
