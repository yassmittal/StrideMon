import { CONTRACT_ADDRESSES_BY_CHAIN_ID, type StrideMonContractAddresses } from '@stridemon/chain'
import { appEnvironment } from '../../config/env'
import { monadChain } from './monad-chain'

/**
 * SneakerNft, StrideToken, SneakerGame and FoundingPass on the chain the app is built for, or the
 * local Founding Pass stack's when its `EXPO_PUBLIC_*_ADDRESS` values are set (D-046).
 */
export const contractAddresses = resolveContractAddresses()

function resolveContractAddresses(): StrideMonContractAddresses {
  if (appEnvironment.contractAddressOverrides !== null) {
    return appEnvironment.contractAddressOverrides
  }
  const addresses = CONTRACT_ADDRESSES_BY_CHAIN_ID[monadChain.id]
  if (addresses === undefined) {
    throw new Error(`No StrideMon contracts are deployed on chain ${monadChain.id}`)
  }
  return addresses
}
