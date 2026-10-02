import { SOLE_TOKEN_DECIMALS, SOLE_TOKEN_SYMBOL } from '@stridemon/chain'
import { formatTokenAmount } from './format-token-amount'

/** `50 SOLE`, `19.6 SOLE`. Rounds down, like every token amount in the app. */
export function formatSoleAmount(amountWei: bigint): string {
  return formatTokenAmount({
    amountWei,
    decimals: SOLE_TOKEN_DECIMALS,
    symbol: SOLE_TOKEN_SYMBOL,
  })
}
