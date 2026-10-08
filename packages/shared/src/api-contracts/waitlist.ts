import { z } from 'zod'
import { WAITLIST_PHONE_PLATFORMS } from '../domain/waitlist'
import { emailAddressSchema } from './email-address'

/** The landing page's `?source=`: which link brought the sign-up (D-037). */
const WAITLIST_SOURCE_PATTERN = /^[a-z0-9-]{1,32}$/

export const joinWaitlistBodySchema = z.object({
  email: emailAddressSchema,
  phonePlatform: z.enum(WAITLIST_PHONE_PLATFORMS).optional(),
  /** Dropped, not refused, when it isn't 1–32 characters of `[a-z0-9-]`. */
  source: z.string().regex(WAITLIST_SOURCE_PATTERN).optional().catch(undefined),
  /** Honeypot: hidden on the page, so only a bot fills it in. A filled one stores nothing. */
  website: z.string().optional(),
})
export type JoinWaitlistBody = z.infer<typeof joinWaitlistBodySchema>

/** The same answer for a new email and a repeat one, so the form never reveals who signed up. */
export const joinWaitlistResponseSchema = z.object({
  status: z.literal('joined'),
})
export type JoinWaitlistResponse = z.infer<typeof joinWaitlistResponseSchema>
