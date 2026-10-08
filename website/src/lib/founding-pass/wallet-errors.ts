// What a wallet's error means. Matched by `name` and `code` along the `cause` chain, never
// `instanceof` (the app learned that viem's copies can differ: CLAUDE.md).

// EIP-1193's "user rejected" code, and WalletConnect's.
const USER_REJECTED_ERROR_CODES: ReadonlySet<unknown> = new Set([4001, 5000])

/** True when the person said no in their wallet. */
export function isWalletRejection(error: unknown): boolean {
  let errorLink: unknown = error
  while (typeof errorLink === 'object' && errorLink !== null) {
    if (
      ('name' in errorLink && errorLink.name === 'UserRejectedRequestError') ||
      ('code' in errorLink && USER_REJECTED_ERROR_CODES.has(errorLink.code))
    ) {
      return true
    }
    errorLink = 'cause' in errorLink ? errorLink.cause : undefined
  }
  return false
}
