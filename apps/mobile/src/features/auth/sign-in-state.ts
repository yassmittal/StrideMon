import type { HelpTopicId } from '../../config/website-urls'
import type { ApiClientErrorCode } from '../../lib/api-client'

/** Failures that happen on the device, before or instead of an API error. */
type DeviceSignInErrorCode = 'WALLET_REJECTED' | 'WALLET_NOT_CONNECTED' | 'SIGN_IN_FAILED'

export type SignInErrorCode = ApiClientErrorCode | DeviceSignInErrorCode

/** Each step has its own state, so the player knows whether to look at their wallet or wait. */
export type SignInState =
  | { phase: 'idle' }
  | { phase: 'requestingMessage' }
  | { phase: 'awaitingSignature' }
  | { phase: 'verifying' }
  | { phase: 'failed'; errorCode: SignInErrorCode }

/** What went wrong, in words, and what to do next. Every message ends in a way forward. */
export function describeSignInError(errorCode: SignInErrorCode): string {
  switch (errorCode) {
    case 'WALLET_REJECTED':
      return 'You declined the request in your wallet, so nothing was signed. Tap “Sign to verify” when you’re ready.'
    case 'WALLET_NOT_CONNECTED':
      return 'Connect a wallet first, then sign.'
    case 'NONCE_EXPIRED':
      return 'The sign-in request expired before it was signed. Tap “Sign to verify” to get a new one.'
    case 'INVALID_SIGNATURE':
      return 'The signature didn’t match this wallet. Try again, or disconnect and reconnect your wallet.'
    case 'NETWORK_UNREACHABLE':
      return 'Can’t reach the StrideMon server. Check your connection and try again.'
    case 'RATE_LIMITED':
      return 'Too many sign-in attempts. Wait a minute, then try again.'
    default:
      return 'Signing in didn’t work. Please try again.'
  }
}

/** The help answer for each failure (D-047). */
export function findSignInHelpTopicId(errorCode: SignInErrorCode): HelpTopicId {
  switch (errorCode) {
    case 'WALLET_NOT_CONNECTED':
      return 'app-cant-connect'
    case 'NETWORK_UNREACHABLE':
      return 'cant-reach-stridemon'
    case 'RATE_LIMITED':
      return 'too-many-tries'
    default:
      return 'sign-in-failed'
  }
}
