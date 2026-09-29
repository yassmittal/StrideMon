import type { CurrentUserResponse } from '@stridemon/shared/api-contracts'
import { type Db, ObjectId } from 'mongodb'
import { ApiError } from '../../common/api-error'
import type { AuthenticatedUser } from '../../plugins/authentication'
import { findUserById } from '../../repositories/users-repository'
import { toCurrentUser } from './to-current-user'

export async function readCurrentUser({
  database,
  authenticatedUser,
}: {
  database: Db
  authenticatedUser: AuthenticatedUser
}): Promise<CurrentUserResponse> {
  const userDocument = await findUserById(database, new ObjectId(authenticatedUser.userId))
  // A valid token for a user that no longer exists: treat it as signed out.
  if (userDocument === null) throw new ApiError('UNAUTHENTICATED', 401)
  return { user: toCurrentUser(userDocument) }
}
