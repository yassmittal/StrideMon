import type { Hash } from 'viem'

/** A player transaction on `SneakerGame`, signed by the player's own wallet. */
export type SneakerGameCall = {
  functionName: 'repair' | 'upgrade'
  sneakerTokenId: bigint
}

export type SneakerGameTransactionErrorCode =
  | 'WALLET_REJECTED'
  | 'WALLET_NOT_CONNECTED'
  | 'NOT_ENOUGH_GAS'
  | 'CHAIN_REJECTED'
  | 'TRANSACTION_FAILED'

/** Each step has its own state, so the player knows whether to look at their wallet or wait. */
export type SneakerGameTransactionState =
  | { phase: 'idle' }
  | { phase: 'awaitingSignature' }
  | { phase: 'confirming'; transactionHash: Hash }
  | { phase: 'succeeded'; transactionHash: Hash }
  | { phase: 'failed'; errorCode: SneakerGameTransactionErrorCode }

/** True while the wallet or the chain still owes us an answer. */
export function isSneakerGameTransactionPending(
  transactionState: SneakerGameTransactionState,
): boolean {
  return transactionState.phase === 'awaitingSignature' || transactionState.phase === 'confirming'
}

/** What went wrong, in words, and what to do next. Nothing was spent in any of these cases. */
export function describeSneakerGameTransactionError(
  errorCode: SneakerGameTransactionErrorCode,
): string {
  switch (errorCode) {
    case 'WALLET_REJECTED':
      return 'Nothing was spent. Try again whenever you’re ready.'
    case 'WALLET_NOT_CONNECTED':
      return 'Your wallet isn’t connected. Sign out from Profile and connect it again.'
    case 'NOT_ENOUGH_GAS':
      return 'Your wallet doesn’t have enough MON to pay the network fee. Top it up from the Monad testnet faucet, then try again.'
    case 'CHAIN_REJECTED':
      return 'Monad refused this transaction, usually because your balance or Sneaker just changed. Check the numbers and try again.'
    case 'TRANSACTION_FAILED':
      return 'Something went wrong talking to your wallet or Monad. Check your connection and try again.'
    default: {
      const unhandledErrorCode: never = errorCode
      throw new Error(`Unhandled transaction error: ${String(unhandledErrorCode)}`)
    }
  }
}
