import {
  type OnboardingStatusResponse,
  onboardingStatusResponseSchema,
} from '@stridemon/shared/api-contracts'
import { requestJson } from '../../../lib/api-client'

/** Asks the API to mint the starter Sneaker and drip gas. Idempotent: safe on every launch. */
export function requestStarterSneaker(): Promise<OnboardingStatusResponse> {
  return requestJson({
    method: 'POST',
    path: '/v1/onboarding/starter-sneaker',
    responseSchema: onboardingStatusResponseSchema,
    requiresAuthentication: true,
  })
}

export function fetchOnboardingStatus(): Promise<OnboardingStatusResponse> {
  return requestJson({
    method: 'GET',
    path: '/v1/onboarding/status',
    responseSchema: onboardingStatusResponseSchema,
    requiresAuthentication: true,
  })
}
