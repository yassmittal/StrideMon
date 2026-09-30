import { type Hex, keccak256 } from 'viem'

/**
 * The `sessionId` Phase 5 sends to `SneakerGame.settleSession`: `keccak256` of the
 * activity session's 12-byte id. The contract settles each id once, and the hash
 * says nothing about the player.
 */
export function buildOnChainSessionId(activitySessionIdHex: string): Hex {
  return keccak256(`0x${activitySessionIdHex}`)
}
