import { sneakerGameAbi } from '@stridemon/chain'
import { useReadContract } from 'wagmi'
import { contractAddresses } from '../../../lib/chain/contract-addresses'
import { monadChain } from '../../../lib/chain/monad-chain'
import { type SneakerActionCost, toSneakerActionCost } from '../sneaker-action-cost'
import { useGameConfig } from './useGameConfig'
import { useSneakerAttributes } from './useSneakerAttributes'
import { useSneakerGameTransaction } from './useSneakerGameTransaction'

/** Raises the Sneaker one level. The cost is the on-chain `quoteUpgradeCost`. */
export function useUpgradeSneaker(sneakerTokenId: bigint) {
  // Both reads are already cached by the Sneaker screen; they only gate the quote.
  const attributesQuery = useSneakerAttributes(sneakerTokenId)
  const gameConfigQuery = useGameConfig()
  const level = attributesQuery.data?.level
  const maxLevel = gameConfigQuery.data?.maxLevel
  // `quoteUpgradeCost` reverts at max level, so it isn't asked then: there's nothing to buy.
  const canUpgrade = level !== undefined && maxLevel !== undefined && level < maxLevel

  const upgradeCostQuery = useReadContract({
    address: contractAddresses.sneakerGame,
    abi: sneakerGameAbi,
    functionName: 'quoteUpgradeCost',
    args: [sneakerTokenId],
    chainId: monadChain.id,
    query: { enabled: canUpgrade },
  })
  const { transactionState, submit, reset } = useSneakerGameTransaction()
  const upgradeCost: SneakerActionCost = canUpgrade
    ? toSneakerActionCost(upgradeCostQuery)
    : { status: 'ready', costWei: undefined }

  return {
    upgradeCost,
    transactionState,
    submitUpgrade: () => submit({ functionName: 'upgrade', sneakerTokenId }),
    resetUpgrade: reset,
  }
}
