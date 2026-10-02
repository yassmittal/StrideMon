import { sneakerGameAbi } from '@stridemon/chain'
import { type Log, parseEventLogs } from 'viem'

export type SessionSettledEvent = {
  rewardAmountWei: bigint
  durabilityLoss: number
  rewardedMinutes: number
}

/**
 * The numbers `SneakerGame.settleSession` emitted for this session: what the player
 * really earned, never our estimate. `null` if the logs don't contain it.
 */
export function readSessionSettledEvent(
  logs: readonly Log[],
  onChainSessionId: string,
): SessionSettledEvent | null {
  const sessionSettledLog = parseEventLogs({
    abi: sneakerGameAbi,
    eventName: 'SessionSettled',
    logs: [...logs],
  }).find((log) => log.args.sessionId.toLowerCase() === onChainSessionId.toLowerCase())
  if (sessionSettledLog === undefined) return null
  return {
    rewardAmountWei: sessionSettledLog.args.rewardAmountWei,
    durabilityLoss: sessionSettledLog.args.durabilityLoss,
    rewardedMinutes: sessionSettledLog.args.rewardedMinutes,
  }
}
