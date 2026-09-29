import type { OnboardingStatusResponse } from '@stridemon/shared/api-contracts'
import { type ApiClientErrorCode, ApiError } from '../../lib/api-client'

export type StarterSneakerRequestErrorCode = ApiClientErrorCode | 'UNKNOWN_ERROR'

/** What the "Minting your Sneaker…" screen shows. One phase per thing the player could be waiting on. */
export type StarterSneakerMintingState =
  | { phase: 'requesting' }
  | { phase: 'requestFailed'; errorCode: StarterSneakerRequestErrorCode }
  | { phase: 'minting'; onboardingStatus: OnboardingStatusResponse }
  /** Minted on-chain; waiting for the app's own chain read to see it (an RPC node can lag a block). */
  | { phase: 'arriving'; onboardingStatus: OnboardingStatusResponse }
  | { phase: 'mintFailed'; onboardingStatus: OnboardingStatusResponse }

export function toStarterSneakerMintingState({
  requestError,
  onboardingStatus,
}: {
  requestError: unknown
  onboardingStatus: OnboardingStatusResponse | undefined
}): StarterSneakerMintingState {
  if (onboardingStatus === undefined) {
    if (requestError === null || requestError === undefined) return { phase: 'requesting' }
    return { phase: 'requestFailed', errorCode: toRequestErrorCode(requestError) }
  }

  switch (onboardingStatus.starterSneaker.status) {
    case 'notStarted':
    case 'pending':
      return { phase: 'minting', onboardingStatus }
    case 'confirmed':
      return { phase: 'arriving', onboardingStatus }
    case 'failed':
      return { phase: 'mintFailed', onboardingStatus }
    default: {
      const unhandledStatus: never = onboardingStatus.starterSneaker.status
      throw new Error(`Unhandled onboarding step status: ${String(unhandledStatus)}`)
    }
  }
}

/** Whether either transaction could still change, so the status is worth polling. */
export function isOnboardingInProgress(
  onboardingStatus: OnboardingStatusResponse | undefined,
): boolean {
  if (onboardingStatus === undefined) return true
  const stepStatuses = [onboardingStatus.starterSneaker.status, onboardingStatus.gasDrip.status]
  return stepStatuses.some((status) => status === 'notStarted' || status === 'pending')
}

/** Every message ends in a way forward. */
export function describeStarterSneakerRequestError(
  errorCode: StarterSneakerRequestErrorCode,
): string {
  switch (errorCode) {
    case 'NETWORK_UNREACHABLE':
      return 'Can’t reach the StrideMon server, so your Sneaker hasn’t been requested yet. Check your connection and try again.'
    case 'RATE_LIMITED':
      return 'Too many requests just now. Wait a moment, then try again.'
    case 'UNAUTHENTICATED':
    case 'REFRESH_TOKEN_REVOKED':
      return 'Your sign-in has expired. Sign out from Profile and sign in again.'
    default:
      return 'Requesting your Sneaker didn’t work. Please try again.'
  }
}

function toRequestErrorCode(error: unknown): StarterSneakerRequestErrorCode {
  return error instanceof ApiError ? error.code : 'UNKNOWN_ERROR'
}
