import { z } from 'zod'

export const onboardingStepStatusSchema = z.enum(['notStarted', 'pending', 'confirmed', 'failed'])
export type OnboardingStepStatus = z.infer<typeof onboardingStepStatusSchema>

export const transactionHashSchema = z
  .string()
  .regex(/^0x[0-9a-fA-F]{64}$/, 'must be a 0x-prefixed 32-byte transaction hash')

export const onboardingStepSchema = z.object({
  status: onboardingStepStatusSchema,
  /** Set once the transaction is signed, so the app can link to the explorer while it waits. */
  transactionHash: transactionHashSchema.nullable(),
})
export type OnboardingStep = z.infer<typeof onboardingStepSchema>

/** Returned by `POST /v1/onboarding/starter-sneaker` and `GET /v1/onboarding/status`. */
export const onboardingStatusResponseSchema = z.object({
  starterSneaker: onboardingStepSchema,
  gasDrip: onboardingStepSchema,
})
export type OnboardingStatusResponse = z.infer<typeof onboardingStatusResponseSchema>
