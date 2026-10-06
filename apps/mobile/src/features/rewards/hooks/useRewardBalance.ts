import { strideTokenAbi } from '@stridemon/chain'
import { getAddress } from 'viem'
import { useReadContract } from 'wagmi'
import { contractAddresses } from '../../../lib/chain/contract-addresses'
import { monadChain } from '../../../lib/chain/monad-chain'

/** The wallet's STRIDE balance in wei, read from `StrideToken` (never from the API). */
export function useRewardBalance(walletAddress: string | undefined) {
  const ownerAddress = walletAddress === undefined ? undefined : getAddress(walletAddress)
  return useReadContract({
    address: contractAddresses.strideToken,
    abi: strideTokenAbi,
    functionName: 'balanceOf',
    args: ownerAddress === undefined ? undefined : [ownerAddress],
    chainId: monadChain.id,
    query: { enabled: ownerAddress !== undefined },
  })
}
