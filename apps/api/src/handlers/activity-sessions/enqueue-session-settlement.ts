import type { Db } from 'mongodb'
import {
  buildSessionSettlementIdempotencyKey,
  type SettleSessionPayload,
} from '../../lib/chain-transactions/chain-transaction-payloads'
import type { ActivitySessionDocument } from '../../repositories/activity-sessions-repository'
import { enqueueChainTransaction } from '../../repositories/chain-transactions-repository'

/**
 * Queues `SneakerGame.settleSession` for a validated session. Idempotent by session,
 * so calling it on every finish retry never settles twice (D-026).
 */
export async function enqueueSessionSettlement({
  database,
  activitySession,
  now,
}: {
  database: Db
  activitySession: ActivitySessionDocument
  now: Date
}): Promise<void> {
  if (activitySession.validationResult === null) {
    throw new Error('Only a validated activity session can be settled')
  }
  const activitySessionId = activitySession._id.toHexString()
  const payload: SettleSessionPayload = {
    activitySessionId,
    onChainSessionId: activitySession.onChainSessionId,
    sneakerTokenId: activitySession.sneakerTokenId,
    walletAddress: activitySession.walletAddress,
    activeMinutes: activitySession.validationResult.activeMinutes,
    distanceMeters: activitySession.validationResult.distanceMeters,
  }
  await enqueueChainTransaction(database, {
    kind: 'settleSession',
    idempotencyKey: buildSessionSettlementIdempotencyKey(activitySessionId),
    payload,
    now,
  })
}
