import type { StrideMonContractAddresses } from '@stridemon/chain'
import type { PassSchedulePhase } from '@stridemon/shared/domain'
import type { Address, PublicClient } from 'viem'
import {
  calculatePassSchedulePosition,
  isEarlyAccessGateOn,
} from '../../lib/founding-pass/pass-schedule'
import type { ApiConfig } from '../../plugins/env'
import type { CachedFoundingPassCollectionReader } from '../../services/cached-founding-pass-collection-reader'
import {
  findFounderSneakerTokenId,
  findFoundingPassTokenIdHeldBy,
} from '../../services/founding-pass-chain-reader'

/** Which free Sneaker a wallet gets, read from the chain (D-041, D-043). */
export type StarterSneakerPlan =
  | { kind: 'founder'; foundingPassTokenId: bigint; founderSneakerTokenId: bigint | null }
  | { kind: 'normal'; isFoundingPassRequired: boolean; phase: PassSchedulePhase | null }

/**
 * A pass holder gets its Founder Sneaker, gate or not. Anyone else gets a normal starter, unless
 * the early-access gate is on.
 */
export async function readStarterSneakerPlan({
  publicClient,
  contractAddresses,
  apiConfig,
  collectionReader,
  walletAddress,
  now,
}: {
  publicClient: PublicClient
  contractAddresses: StrideMonContractAddresses
  apiConfig: ApiConfig
  collectionReader: CachedFoundingPassCollectionReader
  walletAddress: Address
  now: Date
}): Promise<StarterSneakerPlan> {
  const chainReaderContext = { publicClient, contractAddresses }
  const foundingPassTokenId = await findFoundingPassTokenIdHeldBy(chainReaderContext, walletAddress)
  if (foundingPassTokenId !== null) {
    return {
      kind: 'founder',
      foundingPassTokenId,
      founderSneakerTokenId: await findFounderSneakerTokenId(
        chainReaderContext,
        foundingPassTokenId,
      ),
    }
  }
  // With the switch off, the schedule can't turn the gate on: no need to read the minted count.
  if (!apiConfig.isEarlyAccessRequired) {
    return { kind: 'normal', isFoundingPassRequired: false, phase: null }
  }
  const { mintedCount } = await collectionReader.read(now)
  const { phase } = calculatePassSchedulePosition({
    scheduleTimes: apiConfig.passScheduleTimes,
    mintedCount,
    now,
  })
  return {
    kind: 'normal',
    isFoundingPassRequired: isEarlyAccessGateOn({ isEarlyAccessRequired: true, phase }),
    phase,
  }
}
