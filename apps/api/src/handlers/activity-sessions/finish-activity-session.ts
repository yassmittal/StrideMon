import type { ActivitySessionResponse } from '@stridemon/shared/api-contracts'
import type { Db } from 'mongodb'
import { ApiError } from '../../common/api-error'
import { validateActivity } from '../../lib/activity-validation/validate-activity'
import type { AuthenticatedUser } from '../../plugins/authentication'
import {
  type ActivitySessionDocument,
  markActivitySessionRejected,
  markActivitySessionSettling,
  markActivitySessionValidating,
} from '../../repositories/activity-sessions-repository'
import { listLocationSamplesOfActivitySession } from '../../repositories/location-samples-repository'
import { getOwnActivitySession } from './get-own-activity-session'
import { toActivitySession } from './to-activity-session'

const HTTP_STATUS_CONFLICT = 409

/**
 * Ends a session and validates it: `settling` with the validated numbers, or
 * `rejected` with a reason (D-021). Safe to call again: a finished session comes
 * back unchanged, and one a crash left in `validating` is validated again.
 */
export async function finishActivitySession({
  database,
  authenticatedUser,
  activitySessionId,
  now,
}: {
  database: Db
  authenticatedUser: AuthenticatedUser
  activitySessionId: string
  now: Date
}): Promise<ActivitySessionResponse> {
  const readActivitySession = () =>
    getOwnActivitySession({ database, authenticatedUser, activitySessionId })

  const activitySession = await readActivitySession()
  if (activitySession.status === 'abandoned') {
    throw new ApiError('ACTIVITY_SESSION_NOT_ACTIVE', HTTP_STATUS_CONFLICT, {
      activitySessionId,
      status: activitySession.status,
    })
  }
  if (activitySession.status === 'active') {
    await markActivitySessionValidating(database, { activitySessionId: activitySession._id, now })
  }

  const finishedActivitySession = await readActivitySession()
  if (finishedActivitySession.status === 'validating') {
    await validateAndRecord({ database, activitySession: finishedActivitySession, now })
    return { activitySession: toActivitySession(await readActivitySession()) }
  }
  return { activitySession: toActivitySession(finishedActivitySession) }
}

async function validateAndRecord({
  database,
  activitySession,
  now,
}: {
  database: Db
  activitySession: ActivitySessionDocument
  now: Date
}): Promise<void> {
  if (activitySession.finishedAt === null) {
    throw new Error('A validating activity session has no finishedAt')
  }
  const samples = await listLocationSamplesOfActivitySession(database, activitySession._id)
  const validationOutcome = validateActivity({
    samples,
    startedAt: activitySession.startedAt,
    finishedAt: activitySession.finishedAt,
  })

  switch (validationOutcome.outcome) {
    case 'accepted':
      await markActivitySessionSettling(database, {
        activitySessionId: activitySession._id,
        validationResult: validationOutcome.validationResult,
        now,
      })
      return
    case 'rejected':
      await markActivitySessionRejected(database, {
        activitySessionId: activitySession._id,
        rejectionReason: validationOutcome.rejectionReason,
        now,
      })
      return
    default: {
      const unhandledOutcome: never = validationOutcome
      throw new Error(`Unhandled validation outcome: ${JSON.stringify(unhandledOutcome)}`)
    }
  }
}
