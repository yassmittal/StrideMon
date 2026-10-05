import { getAddress } from 'viem'
import { useBalance } from 'wagmi'
import { monadChain } from '../../../lib/chain/monad-chain'

/** The wallet's native MON balance, read from the chain (not from the API). */
export function useMonBalance(walletAddress: string | undefined) {
  return useBalance({
    address: walletAddress === undefined ? undefined : getAddress(walletAddress),
    chainId: monadChain.id,
    query: { enabled: walletAddress !== undefined },
  })
}
