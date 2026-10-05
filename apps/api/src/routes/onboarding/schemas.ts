import { onboardingStatusResponseSchema } from '@stridemon/shared/api-contracts'

export const requestStarterSneakerRouteSchema = {
  tags: ['onboarding'],
  summary: 'Queue the starter Sneaker mint and the gas drip (idempotent)',
  security: [{ bearerAuth: [] }],
  response: { 200: onboardingStatusResponseSchema },
}

export const readOnboardingStatusRouteSchema = {
  tags: ['onboarding'],
  summary: 'Where the starter Sneaker mint and the gas drip are',
  security: [{ bearerAuth: [] }],
  response: { 200: onboardingStatusResponseSchema },
}
