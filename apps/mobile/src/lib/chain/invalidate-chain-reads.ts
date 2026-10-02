import type { QueryClient } from '@tanstack/react-query'

// wagmi keys every `useReadContract` query as ['readContract', {…}].
const WAGMI_READ_CONTRACT_QUERY_KEY = ['readContract'] as const

/**
 * Re-reads every contract value on screen (Sneaker stats, energy, SOLE balance)
 * after something changed them on-chain, such as a settlement.
 */
export function invalidateChainReads(queryClient: QueryClient): Promise<void> {
  return queryClient.invalidateQueries({ queryKey: WAGMI_READ_CONTRACT_QUERY_KEY })
}
