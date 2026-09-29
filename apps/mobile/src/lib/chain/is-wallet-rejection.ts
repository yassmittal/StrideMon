import { BaseError, UserRejectedRequestError } from 'viem'

/**
 * True when the player said no in their wallet app. viem maps both the EIP-1193
 * code (4001) and WalletConnect's (5000) to `UserRejectedRequestError`, and wagmi
 * wraps it, so the error chain is walked.
 */
export function isWalletRejection(error: unknown): boolean {
  if (!(error instanceof BaseError)) return false
  return error.walk((cause) => cause instanceof UserRejectedRequestError) !== null
}
