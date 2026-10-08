import { z } from 'zod'
import { STARTER_SNEAKER_KINDS } from '../domain/founding-pass'

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
  /** The wallet's free Sneaker: its Founder Sneaker if it holds a Founding Pass (D-043). */
  starterSneaker: onboardingStepSchema,
  gasDrip: onboardingStepSchema,
  starterSneakerKind: z.enum(STARTER_SNEAKER_KINDS),
  /** The early-access gate is on and this wallet holds no pass, so it gets no Sneaker yet. */
  isFoundingPassRequired: z.boolean(),
})
export type OnboardingStatusResponse = z.infer<typeof onboardingStatusResponseSchema>
