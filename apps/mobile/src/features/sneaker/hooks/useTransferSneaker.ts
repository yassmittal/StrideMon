import type { Address } from 'viem'
import { useSneakerGameTransaction } from './useSneakerGameTransaction'

/** Sends the Sneaker to another wallet with `SneakerNft.safeTransferFrom` (D-027). */
export function useTransferSneaker(sneakerTokenId: bigint) {
  const { transactionState, submit, reset } = useSneakerGameTransaction()

  return {
    transactionState,
    submitTransfer: (recipientWalletAddress: Address) =>
      submit({ functionName: 'transfer', sneakerTokenId, recipientWalletAddress }),
    resetTransfer: reset,
  }
}
