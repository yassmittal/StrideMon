import { foundingPassAbi } from '@stridemon/chain'
import { type Log, parseEventLogs } from 'viem'

type FoundingPassMintedEvent = {
  founderNumber: number
  hasGoldFrame: boolean
}

/** What `FoundingPass.mint` recorded for this design, from its receipt. `null` if it isn't there. */
export function readFoundingPassMintedEvent(
  logs: readonly Log[],
  designNumber: number,
): FoundingPassMintedEvent | null {
  const mintedLog = parseEventLogs({
    abi: foundingPassAbi,
    eventName: 'FoundingPassMinted',
    logs: [...logs],
  }).find((log) => log.args.tokenId === BigInt(designNumber))
  if (mintedLog === undefined) return null
  // At most 1,000 founders, so the number always fits.
  return {
    founderNumber: Number(mintedLog.args.founderNumber),
    hasGoldFrame: mintedLog.args.hasGoldFrame,
  }
}
