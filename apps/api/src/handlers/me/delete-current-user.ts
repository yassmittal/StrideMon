import { type Db, ObjectId } from 'mongodb'
import type { AuthenticatedUser } from '../../plugins/authentication'
import {
  deleteActivitySessionsOfUser,
  listActivitySessionIdsOfUser,
} from '../../repositories/activity-sessions-repository'
import { deleteAuthSessionsOfUser } from '../../repositories/auth-sessions-repository'
import { deleteLocationSamplesOfActivitySessions } from '../../repositories/location-samples-repository'
import { deleteUserById } from '../../repositories/users-repository'

/**
 * Deletes the player's off-chain data (D-039). Location samples go first, so a retry after a
 * failure still finds the activity sessions they belong to. `chainTransactions` stay: they
 * record public transactions, and their per-wallet keys stop a second starter Sneaker.
 * Idempotent: deleting an already deleted player does nothing.
 */
export async function deleteCurrentUser({
  database,
  authenticatedUser,
}: {
  database: Db
  authenticatedUser: AuthenticatedUser
}): Promise<void> {
  const userId = new ObjectId(authenticatedUser.userId)
  const activitySessionIds = await listActivitySessionIdsOfUser(database, userId)
  await deleteLocationSamplesOfActivitySessions(database, activitySessionIds)
  await deleteActivitySessionsOfUser(database, userId)
  await deleteAuthSessionsOfUser(database, userId)
  await deleteUserById(database, userId)
}
