import type { ActivitySessionResponse } from '@stridemon/shared/api-contracts'
import type { Db } from 'mongodb'
import type { AuthenticatedUser } from '../../plugins/authentication'
import { getOwnActivitySession } from './get-own-activity-session'
import { toActivitySession } from './to-activity-session'

export async function readActivitySession({
  database,
  authenticatedUser,
  activitySessionId,
}: {
  database: Db
  authenticatedUser: AuthenticatedUser
  activitySessionId: string
}): Promise<ActivitySessionResponse> {
  const activitySession = await getOwnActivitySession({
    database,
    authenticatedUser,
    activitySessionId,
  })
  return { activitySession: toActivitySession(activitySession) }
}
