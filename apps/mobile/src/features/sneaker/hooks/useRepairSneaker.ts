import { sneakerGameAbi } from '@stridemon/chain'
import { useReadContract } from 'wagmi'
import { contractAddresses } from '../../../lib/chain/contract-addresses'
import { monadChain } from '../../../lib/chain/monad-chain'
import { toSneakerActionCost } from '../sneaker-action-cost'
import { useSneakerGameTransaction } from './useSneakerGameTransaction'

/** Restores durability to full. The cost is the on-chain `quoteRepairCost` (0 when full). */
export function useRepairSneaker(sneakerTokenId: bigint) {
  const repairCostQuery = useReadContract({
    address: contractAddresses.sneakerGame,
    abi: sneakerGameAbi,
    functionName: 'quoteRepairCost',
    args: [sneakerTokenId],
    chainId: monadChain.id,
  })
  const { transactionState, submit, reset } = useSneakerGameTransaction()

  return {
    repairCost: toSneakerActionCost(repairCostQuery),
    transactionState,
    submitRepair: () => submit({ functionName: 'repair', sneakerTokenId }),
    resetRepair: reset,
  }
}
