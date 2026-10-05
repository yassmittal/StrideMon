import type { LocationSample, UploadLocationSamplesResponse } from '@stridemon/shared/api-contracts'
import type { Db } from 'mongodb'
import { ApiError } from '../../common/api-error'
import type { AuthenticatedUser } from '../../plugins/authentication'
import { touchActiveActivitySession } from '../../repositories/activity-sessions-repository'
import { insertLocationSamples } from '../../repositories/location-samples-repository'
import { getOwnActivitySession } from './get-own-activity-session'

const HTTP_STATUS_CONFLICT = 409

/** Stores a batch of GPS samples for an active session. Idempotent by sequence number. */
export async function uploadLocationSamples({
  database,
  authenticatedUser,
  activitySessionId,
  samples,
  now,
}: {
  database: Db
  authenticatedUser: AuthenticatedUser
  activitySessionId: string
  samples: readonly LocationSample[]
  now: Date
}): Promise<UploadLocationSamplesResponse> {
  const activitySession = await getOwnActivitySession({
    database,
    authenticatedUser,
    activitySessionId,
  })
  if (activitySession.status !== 'active') {
    throw new ApiError('ACTIVITY_SESSION_NOT_ACTIVE', HTTP_STATUS_CONFLICT, {
      activitySessionId,
      status: activitySession.status,
    })
  }

  const uploadCounts = await insertLocationSamples(database, {
    activitySessionId: activitySession._id,
    samples: samples.map((sample) => ({ ...sample, recordedAt: new Date(sample.recordedAt) })),
    receivedAt: now,
  })
  await touchActiveActivitySession(database, { activitySessionId: activitySession._id, now })
  return uploadCounts
}
