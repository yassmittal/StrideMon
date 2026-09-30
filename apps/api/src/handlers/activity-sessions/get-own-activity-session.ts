import { type Db, ObjectId } from 'mongodb'
import { ApiError } from '../../common/api-error'
import type { AuthenticatedUser } from '../../plugins/authentication'
import {
  type ActivitySessionDocument,
  findActivitySessionOfUser,
} from '../../repositories/activity-sessions-repository'

/** The caller's session, or 404. Someone else's session is a 404 too, so ids can't be probed. */
export async function getOwnActivitySession({
  database,
  authenticatedUser,
  activitySessionId,
}: {
  database: Db
  authenticatedUser: AuthenticatedUser
  activitySessionId: string
}): Promise<ActivitySessionDocument> {
  const activitySession = await findActivitySessionOfUser(database, {
    activitySessionId: new ObjectId(activitySessionId),
    userId: new ObjectId(authenticatedUser.userId),
  })
  if (activitySession === null) throw new ApiError('NOT_FOUND', 404, { activitySessionId })
  return activitySession
}
