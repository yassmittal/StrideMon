import { z } from 'zod'
import { readInviteCode, WAITLIST_PHONE_PLATFORMS } from '../domain/waitlist'
import { emailAddressSchema } from './email-address'
import { emailProofSchema, turnstileTokenSchema } from './founding-pass'

/** The landing page's `?source=`: which link brought the sign-up (D-037). */
const WAITLIST_SOURCE_PATTERN = /^[a-z0-9-]{1,32}$/
// Far longer than any code, so a pasted link can't make the API read a huge string.
const MAX_INVITE_CODE_INPUT_LENGTH = 64

/** A `?ref=` value read as an invite code (D-056): look-alikes fixed, anything else refused. */
const inviteCodeSchema = z
  .string()
  .max(MAX_INVITE_CODE_INPUT_LENGTH)
  .transform((value, context) => {
    const inviteCode = readInviteCode(value)
    if (inviteCode === null) {
      context.addIssue({ code: 'custom', message: 'must be an invite code' })
      return z.NEVER
    }
    return inviteCode
  })

export const joinWaitlistBodySchema = z.object({
  email: emailAddressSchema,
  /**
   * Turnstile with the `join-waitlist` action (D-056). Optional here so a page from before
   * Turnstile gets TURNSTILE_FAILED ("try again") rather than a validation error.
   */
  turnstileToken: turnstileTokenSchema.optional(),
  phonePlatform: z.enum(WAITLIST_PHONE_PLATFORMS).optional(),
  /** Dropped, not refused, when it isn't 1–32 characters of `[a-z0-9-]`. */
  source: z.string().regex(WAITLIST_SOURCE_PATTERN).optional().catch(undefined),
  /** The `?ref=` the visitor arrived with. Dropped, not refused, when it isn't a code (D-056). */
  inviteCode: inviteCodeSchema.optional().catch(undefined),
  /** A proof for the same email confirms the sign-up at once (Google, or a code). */
  emailProof: emailProofSchema.optional(),
  /** Honeypot: hidden on the page, so only a bot fills it in. A filled one stores nothing. */
  website: z.string().optional(),
})
export type JoinWaitlistBody = z.infer<typeof joinWaitlistBodySchema>

/**
 * The same answer for a new email and a repeat one, so the form never reveals who signed up. The
 * link is computed from the email, so it's the same either way (D-056).
 */
export const joinWaitlistResponseSchema = z.object({
  status: z.literal('joined'),
  inviteUrl: z.url(),
})
export type JoinWaitlistResponse = z.infer<typeof joinWaitlistResponseSchema>

/** A sign-up's own invites, shown only after its email is checked (D-056). */
export const waitlistInvitesSchema = z.object({
  /** `false`: the email isn't on the list, so the page shows the form. */
  isOnWaitlist: z.boolean(),
  inviteUrl: z.url(),
  /** Friends who joined through the link and confirmed their email before `countsUntil`. */
  confirmedFriendCount: z.int().nonnegative(),
  requiredFriendCount: z.int().positive(),
  hasEarlyHour: z.boolean(),
  isEmailConfirmed: z.boolean(),
  /** When the early hour starts: confirmations after it don't count (D-058). */
  countsUntil: z.iso.datetime(),
})
export type WaitlistInvites = z.infer<typeof waitlistInvitesSchema>

export const startWaitlistInvitesSessionBodySchema = z.object({
  emailProof: emailProofSchema,
})
export type StartWaitlistInvitesSessionBody = z.infer<typeof startWaitlistInvitesSessionBodySchema>

export const waitlistInvitesSessionResponseSchema = z.object({
  /** Sent back as `Authorization: Bearer …` to read the invites again, for 30 days. */
  invitesToken: z.string(),
  invitesTokenExpiresAt: z.iso.datetime(),
  invites: waitlistInvitesSchema,
})
export type WaitlistInvitesSessionResponse = z.infer<typeof waitlistInvitesSessionResponseSchema>

export const waitlistInvitesResponseSchema = z.object({
  invites: waitlistInvitesSchema,
})
export type WaitlistInvitesResponse = z.infer<typeof waitlistInvitesResponseSchema>

/** The one public number: how many have joined (D-056). */
export const waitlistCountResponseSchema = z.object({
  signupCount: z.int().nonnegative(),
})
export type WaitlistCountResponse = z.infer<typeof waitlistCountResponseSchema>
