import { findErrorInChain } from './error-chain'

// EIP-1193's "user rejected" code, and WalletConnect's.
const USER_REJECTED_ERROR_CODES: ReadonlySet<unknown> = new Set([4001, 5000])

/**
 * True when the player said no in their wallet app. viem maps both codes to
 * `UserRejectedRequestError` and wagmi wraps it, so the error chain is walked.
 * The raw provider error's code is checked too, in case a wallet's error isn't mapped.
 */
export function isWalletRejection(error: unknown): boolean {
  return (
    findErrorInChain(
      error,
      (errorLink) =>
        errorLink.name === 'UserRejectedRequestError' ||
        USER_REJECTED_ERROR_CODES.has(errorLink.code),
    ) !== null
  )
}
