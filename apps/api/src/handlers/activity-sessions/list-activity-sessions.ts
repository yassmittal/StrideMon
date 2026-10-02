import type { ActivitySessionPage } from '@stridemon/shared/api-contracts'
import { type Db, ObjectId } from 'mongodb'
import { ApiError } from '../../common/api-error'
import {
  decodeActivitySessionCursor,
  encodeActivitySessionCursor,
} from '../../lib/activity-sessions/activity-session-cursor'
import type { AuthenticatedUser } from '../../plugins/authentication'
import { listActivitySessionsOfUser } from '../../repositories/activity-sessions-repository'
import { toActivitySession } from './to-activity-session'

const HTTP_STATUS_BAD_REQUEST = 400

/** The player's history, newest first, one page at a time. */
export async function listActivitySessions({
  database,
  authenticatedUser,
  cursor,
  limit,
}: {
  database: Db
  authenticatedUser: AuthenticatedUser
  cursor: string | undefined
  limit: number
}): Promise<ActivitySessionPage> {
  const after = cursor === undefined ? null : decodeActivitySessionCursor(cursor)
  if (after === null && cursor !== undefined) {
    throw new ApiError('VALIDATION_FAILED', HTTP_STATUS_BAD_REQUEST, { cursor })
  }

  // One extra tells us whether there's another page, without a count query.
  const activitySessions = await listActivitySessionsOfUser(database, {
    userId: new ObjectId(authenticatedUser.userId),
    after,
    limit: limit + 1,
  })
  const pageActivitySessions = activitySessions.slice(0, limit)
  const lastActivitySession = pageActivitySessions.at(-1)
  const hasNextPage = activitySessions.length > limit && lastActivitySession !== undefined

  return {
    items: pageActivitySessions.map(toActivitySession),
    nextCursor: hasNextPage
      ? encodeActivitySessionCursor({
          createdAt: lastActivitySession.createdAt,
          activitySessionId: lastActivitySession._id,
        })
      : null,
  }
}
