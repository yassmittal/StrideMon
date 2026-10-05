import { soleTokenAbi } from '@stridemon/chain'
import { getAddress } from 'viem'
import { useReadContract } from 'wagmi'
import { contractAddresses } from '../../../lib/chain/contract-addresses'
import { monadChain } from '../../../lib/chain/monad-chain'

/** The wallet's SOLE balance in wei, read from `SoleToken` (never from the API). */
export function useRewardBalance(walletAddress: string | undefined) {
  const ownerAddress = walletAddress === undefined ? undefined : getAddress(walletAddress)
  return useReadContract({
    address: contractAddresses.soleToken,
    abi: soleTokenAbi,
    functionName: 'balanceOf',
    args: ownerAddress === undefined ? undefined : [ownerAddress],
    chainId: monadChain.id,
    query: { enabled: ownerAddress !== undefined },
  })
}
