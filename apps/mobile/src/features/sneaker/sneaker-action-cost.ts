/** A repair or upgrade quote as the panels show it. */
export type SneakerActionCost =
  | { status: 'loading' }
  | { status: 'error'; onRetryPress: () => void }
  /** `costWei` is `undefined` when there is nothing to buy, such as at max level. */
  | { status: 'ready'; costWei: bigint | undefined }

/** Turns a wagmi quote read (`quoteRepairCost`, `quoteUpgradeCost`) into a panel cost. */
export function toSneakerActionCost(quoteQuery: {
  data: bigint | undefined
  isError: boolean
  refetch: () => unknown
}): SneakerActionCost {
  if (quoteQuery.isError) return { status: 'error', onRetryPress: () => void quoteQuery.refetch() }
  if (quoteQuery.data === undefined) return { status: 'loading' }
  return { status: 'ready', costWei: quoteQuery.data }
}
