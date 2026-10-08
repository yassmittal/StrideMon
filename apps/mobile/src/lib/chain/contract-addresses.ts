import { CONTRACT_ADDRESSES_BY_CHAIN_ID, type StrideMonContractAddresses } from '@stridemon/chain'
import { monadChain } from './monad-chain'

/** SneakerNft, StrideToken, SneakerGame and FoundingPass on the chain the app is built for. */
export const contractAddresses = resolveContractAddresses()

function resolveContractAddresses(): StrideMonContractAddresses {
  const addresses = CONTRACT_ADDRESSES_BY_CHAIN_ID[monadChain.id]
  if (addresses === undefined) {
    throw new Error(`No StrideMon contracts are deployed on chain ${monadChain.id}`)
  }
  return addresses
}
