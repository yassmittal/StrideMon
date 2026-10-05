import { SOLE_TOKEN_DECIMALS, SOLE_TOKEN_SYMBOL } from '@stridemon/chain'
import { formatTokenAmount, formatTokenAmountNumber } from './format-token-amount'

/** `50 SOLE`, `19.6 SOLE`. Rounds down, like every token amount in the app. */
export function formatSoleAmount(amountWei: bigint): string {
  return formatTokenAmount({
    amountWei,
    decimals: SOLE_TOKEN_DECIMALS,
    symbol: SOLE_TOKEN_SYMBOL,
  })
}

/** `19.6`: SOLE without its symbol, for the balance counter. */
export function formatSoleAmountNumber(amountWei: bigint): string {
  return formatTokenAmountNumber({ amountWei, decimals: SOLE_TOKEN_DECIMALS })
}
