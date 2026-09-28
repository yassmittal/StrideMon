import type { Address } from 'viem'
import type { SupportedChainId } from './monad-chains'

export type StrideMonContractAddresses = {
  sneakerNft: Address
  soleToken: Address
  sneakerGame: Address
}

/** Written by `bun run chain:export-abis` from Foundry's deployment output. Empty until Phase 1 deploys. */
export const CONTRACT_ADDRESSES_BY_CHAIN_ID: Partial<
  Record<SupportedChainId, StrideMonContractAddresses>
> = {}
