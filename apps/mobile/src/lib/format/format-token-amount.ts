import { formatUnits } from 'viem'

const DEFAULT_MAXIMUM_FRACTION_DIGITS = 4

type FormatTokenAmountOptions = {
  amountWei: bigint
  decimals: number
  symbol: string
  maximumFractionDigits?: number
}

/**
 * `1.2345 MON`. Rounds down, so the app never shows more than the wallet holds,
 * and works on the decimal string so large amounts keep their precision.
 */
export function formatTokenAmount({ symbol, ...amount }: FormatTokenAmountOptions): string {
  return `${formatTokenAmountNumber(amount)} ${symbol}`
}

/** `1.2345`: the amount alone, for a big counter with the symbol set beside it. */
export function formatTokenAmountNumber({
  amountWei,
  decimals,
  maximumFractionDigits = DEFAULT_MAXIMUM_FRACTION_DIGITS,
}: Omit<FormatTokenAmountOptions, 'symbol'>): string {
  const [wholePart = '0', fractionPart = ''] = formatUnits(amountWei, decimals).split('.')
  const truncatedFraction = fractionPart.slice(0, maximumFractionDigits).replace(/0+$/, '')
  return truncatedFraction === '' ? wholePart : `${wholePart}.${truncatedFraction}`
}
