import { STRIDE_TOKEN_DECIMALS, STRIDE_TOKEN_SYMBOL } from '@stridemon/chain'
import { formatTokenAmount, formatTokenAmountNumber } from './format-token-amount'

/** `50 STRIDE`, `19.6 STRIDE`. Rounds down, like every token amount in the app. */
export function formatStrideAmount(amountWei: bigint): string {
  return formatTokenAmount({
    amountWei,
    decimals: STRIDE_TOKEN_DECIMALS,
    symbol: STRIDE_TOKEN_SYMBOL,
  })
}

/** `19.6`: STRIDE without its symbol, for the balance counter. */
export function formatStrideAmountNumber(amountWei: bigint): string {
  return formatTokenAmountNumber({ amountWei, decimals: STRIDE_TOKEN_DECIMALS })
}
