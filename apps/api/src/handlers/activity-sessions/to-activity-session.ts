import type { ActivitySession } from '@stridemon/shared/api-contracts'
import type {
  ActivitySessionDocument,
  ActivitySessionSettlementRecord,
} from '../../repositories/activity-sessions-repository'

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
    // Sessions stored before Phase 5 have no `settlement` field at all.
    settlement: toSettlement(activitySessionDocument.settlement ?? null),
  }
}

function toSettlement(
  settlement: ActivitySessionSettlementRecord | null,
): ActivitySession['settlement'] {
  if (settlement === null) return null
  return {
    transactionHash: settlement.transactionHash,
    rewardAmountWei: settlement.rewardAmountWei,
    durabilityLoss: settlement.durabilityLoss,
    rewardedMinutes: settlement.rewardedMinutes,
    settledAt: settlement.settledAt.toISOString(),
  }
}
