import { type Address, getAddress, isAddress, isAddressEqual } from 'viem'

/** What the recipient field holds. Only `valid` can be sent to. */
type TransferRecipient =
  | { status: 'empty' }
  | { status: 'invalid' }
  | { status: 'ownWallet' }
  | { status: 'valid'; recipientWalletAddress: Address }

/**
 * Checks the typed recipient: a real address (a mixed-case one must have a correct
 * checksum), and not the player's own wallet. A valid one comes back checksummed.
 */
export function toTransferRecipient({
  recipientInput,
  walletAddress,
}: {
  recipientInput: string
  walletAddress: Address
}): TransferRecipient {
  const trimmedRecipientInput = recipientInput.trim()
  if (trimmedRecipientInput === '') return { status: 'empty' }
  if (!isAddress(trimmedRecipientInput)) return { status: 'invalid' }
  if (isAddressEqual(trimmedRecipientInput, walletAddress)) return { status: 'ownWallet' }
  return { status: 'valid', recipientWalletAddress: getAddress(trimmedRecipientInput) }
}

/** Why the recipient can't be used, or `null` when it can (or nothing is typed yet). */
export function describeTransferRecipientProblem(
  transferRecipient: TransferRecipient,
): string | null {
  switch (transferRecipient.status) {
    case 'empty':
    case 'valid':
      return null
    case 'invalid':
      return 'That isn’t a wallet address. It starts with 0x and is 42 characters long.'
    case 'ownWallet':
      return 'That’s your own wallet. Enter the address you want to send it to.'
    default: {
      const unhandledRecipient: never = transferRecipient
      throw new Error(`Unhandled recipient: ${JSON.stringify(unhandledRecipient)}`)
    }
  }
}
