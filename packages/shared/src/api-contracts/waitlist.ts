import { z } from 'zod'
import {
  REFERRAL_CODE_ALPHABET,
  REFERRAL_CODE_LENGTH,
  VERIFICATION_CODE_DIGIT_COUNT,
  WAITLIST_PHONE_PLATFORMS,
} from '../domain/waitlist'

// RFC 5321's limit on a whole address.
const MAX_EMAIL_LENGTH = 254

/** The landing page's `?source=`: which link brought the sign-up (D-037). */
const WAITLIST_SOURCE_PATTERN = /^[a-z0-9-]{1,32}$/

const REFERRAL_CODE_PATTERN = new RegExp(`^[${REFERRAL_CODE_ALPHABET}]{${REFERRAL_CODE_LENGTH}}$`)

const VERIFICATION_CODE_PATTERN = new RegExp(`^\\d{${VERIFICATION_CODE_DIGIT_COUNT}}$`)

const waitlistEmailSchema = z.string().trim().toLowerCase().pipe(z.email().max(MAX_EMAIL_LENGTH))

export const referralCodeSchema = z.string().regex(REFERRAL_CODE_PATTERN)

export const joinWaitlistBodySchema = z.object({
  email: waitlistEmailSchema,
  phonePlatform: z.enum(WAITLIST_PHONE_PLATFORMS).optional(),
  /** Dropped, not refused, when it isn't 1–32 characters of `[a-z0-9-]`. */
  source: z.string().regex(WAITLIST_SOURCE_PATTERN).optional().catch(undefined),
  /** The page's `?ref=`, the referrer's code (D-041). Dropped, not refused, when malformed. */
  referralCode: referralCodeSchema.optional().catch(undefined),
  /** Honeypot: hidden on the page, so only a bot fills it in. A filled one stores nothing. */
  website: z.string().optional(),
})
export type JoinWaitlistBody = z.infer<typeof joinWaitlistBodySchema>

/** The same answer for a new, repeat and verified email, so the form never reveals who signed up. */
export const joinWaitlistResponseSchema = z.object({
  status: z.literal('codeSent'),
})
export type JoinWaitlistResponse = z.infer<typeof joinWaitlistResponseSchema>

export const verifyWaitlistEmailBodySchema = z.object({
  email: waitlistEmailSchema,
  verificationCode: z.string().trim().regex(VERIFICATION_CODE_PATTERN),
})
export type VerifyWaitlistEmailBody = z.infer<typeof verifyWaitlistEmailBodySchema>

export const readWaitlistPlaceQuerySchema = z.object({
  referralCode: referralCodeSchema,
})
export type ReadWaitlistPlaceQuery = z.infer<typeof readWaitlistPlaceQuerySchema>

/** A verified sign-up's place in the Founding Pass line (D-041). */
export const waitlistPlaceResponseSchema = z.object({
  placeInLine: z.number().int().positive(),
  referralCode: referralCodeSchema,
  referralCount: z.number().int().nonnegative(),
})
export type WaitlistPlaceResponse = z.infer<typeof waitlistPlaceResponseSchema>
