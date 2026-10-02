import {
  type ActivitySession,
  type ActivitySessionPage,
  activitySessionPageSchema,
  activitySessionResponseSchema,
  type LocationSample,
  type UploadLocationSamplesResponse,
  uploadLocationSamplesResponseSchema,
} from '@stridemon/shared/api-contracts'
import { requestJson } from '../../../lib/api-client'

export async function startActivitySession(sneakerTokenId: bigint): Promise<ActivitySession> {
  const activitySessionResponse = await requestJson({
    method: 'POST',
    path: '/v1/activity-sessions',
    body: { sneakerTokenId: sneakerTokenId.toString() },
    responseSchema: activitySessionResponseSchema,
    requiresAuthentication: true,
  })
  return activitySessionResponse.activitySession
}

/** Idempotent by sequence number: re-sending a batch after a network error is harmless. */
export function uploadLocationSamples(
  activitySessionId: string,
  samples: readonly LocationSample[],
): Promise<UploadLocationSamplesResponse> {
  return requestJson({
    method: 'POST',
    path: `/v1/activity-sessions/${activitySessionId}/location-samples`,
    body: { samples },
    responseSchema: uploadLocationSamplesResponseSchema,
    requiresAuthentication: true,
  })
}

/** Ends and validates the session. Idempotent: calling it again returns the same result. */
export async function finishActivitySession(activitySessionId: string): Promise<ActivitySession> {
  const activitySessionResponse = await requestJson({
    method: 'POST',
    path: `/v1/activity-sessions/${activitySessionId}/finish`,
    responseSchema: activitySessionResponseSchema,
    requiresAuthentication: true,
  })
  return activitySessionResponse.activitySession
}

export async function fetchActivitySession(activitySessionId: string): Promise<ActivitySession> {
  const activitySessionResponse = await requestJson({
    method: 'GET',
    path: `/v1/activity-sessions/${activitySessionId}`,
    responseSchema: activitySessionResponseSchema,
    requiresAuthentication: true,
  })
  return activitySessionResponse.activitySession
}

/** One page of history, newest first. `cursor` is the previous page's `nextCursor`. */
export function fetchActivitySessionPage(cursor: string | null): Promise<ActivitySessionPage> {
  return requestJson({
    method: 'GET',
    path:
      cursor === null
        ? '/v1/activity-sessions'
        : `/v1/activity-sessions?cursor=${encodeURIComponent(cursor)}`,
    responseSchema: activitySessionPageSchema,
    requiresAuthentication: true,
  })
}
