import type { QueryClient } from '@tanstack/react-query'

// wagmi keys every `useReadContract` query as ['readContract', {…}], every `useReadContracts`
// as ['readContracts', {…}] and every `useBalance` as ['balance', {…}].
const WAGMI_CHAIN_READ_QUERY_KEY_PREFIXES: ReadonlySet<unknown> = new Set([
  'readContract',
  'readContracts',
  'balance',
])

/**
 * Re-reads every chain value on screen (Sneaker stats and ownership, energy, STRIDE and MON
 * balances, quotes) after something changed them on-chain, such as a settlement or a repair.
 */
export function invalidateChainReads(queryClient: QueryClient): Promise<void> {
  return queryClient.invalidateQueries({
    predicate: (query) => WAGMI_CHAIN_READ_QUERY_KEY_PREFIXES.has(query.queryKey[0]),
  })
}
