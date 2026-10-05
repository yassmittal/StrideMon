import { type Db, ObjectId } from 'mongodb'
import { hashRefreshToken } from '../../lib/auth/hash-refresh-token'
import type { AuthenticatedUser } from '../../plugins/authentication'
import { revokeAuthSessionOfUser } from '../../repositories/auth-sessions-repository'

type SignOutOptions = {
  database: Db
  authenticatedUser: AuthenticatedUser
  refreshToken: string
  now: Date
}

/**
 * Revokes the auth session behind this refresh token. Idempotent, and silent when
 * the token belongs to someone else, so it can't be used to probe tokens.
 */
export async function signOut({
  database,
  authenticatedUser,
  refreshToken,
  now,
}: SignOutOptions): Promise<void> {
  await revokeAuthSessionOfUser(database, {
    userId: new ObjectId(authenticatedUser.userId),
    refreshTokenHash: hashRefreshToken(refreshToken),
    now,
  })
}
