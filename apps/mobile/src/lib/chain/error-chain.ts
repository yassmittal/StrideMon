/**
 * Walks an error and its `cause` chain, returning the first link that matches.
 *
 * Matches by `name` and `code`, never `instanceof`: viem ships separate ESM and CJS
 * builds, and Metro can load both (wagmi and AppKit import one, the app the other),
 * so an error thrown by one copy isn't an instance of the other copy's class.
 */
export function findErrorInChain(
  error: unknown,
  isMatch: (errorLink: { name?: unknown; code?: unknown }) => boolean,
): object | null {
  let errorLink: unknown = error
  while (typeof errorLink === 'object' && errorLink !== null) {
    if (isMatch(errorLink)) return errorLink
    errorLink = 'cause' in errorLink ? errorLink.cause : undefined
  }
  return null
}

/** True when the error, or anything that caused it, is the viem error with this class name. */
export function hasViemErrorNamed(error: unknown, errorName: string): boolean {
  return findErrorInChain(error, (errorLink) => errorLink.name === errorName) !== null
}
