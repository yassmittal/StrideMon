import type { ActivitySession } from '@stridemon/shared/api-contracts'
import type { ActivitySessionDocument } from '../../repositories/activity-sessions-repository'

export function toActivitySession(
  activitySessionDocument: ActivitySessionDocument,
): ActivitySession {
  return {
    activitySessionId: activitySessionDocument._id.toHexString(),
    sneakerTokenId: activitySessionDocument.sneakerTokenId,
    status: activitySessionDocument.status,
    startedAt: activitySessionDocument.startedAt.toISOString(),
    finishedAt: activitySessionDocument.finishedAt?.toISOString() ?? null,
    energyAtStart: activitySessionDocument.energyAtStart,
    validationResult: activitySessionDocument.validationResult,
    rejectionReason: activitySessionDocument.rejectionReason,
  }
}
