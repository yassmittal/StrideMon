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
export function formatTokenAmount({
  amountWei,
  decimals,
  symbol,
  maximumFractionDigits = DEFAULT_MAXIMUM_FRACTION_DIGITS,
}: FormatTokenAmountOptions): string {
  const [wholePart = '0', fractionPart = ''] = formatUnits(amountWei, decimals).split('.')
  const truncatedFraction = fractionPart.slice(0, maximumFractionDigits).replace(/0+$/, '')
  const amountText = truncatedFraction === '' ? wholePart : `${wholePart}.${truncatedFraction}`
  return `${amountText} ${symbol}`
}
