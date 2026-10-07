// The Founding Pass line's numbers (D-041, founding-pass-plan.md §4.5).

export const VERIFICATION_CODE_TTL_SECONDS = 600

/** Every try counts, the right one included, so a code allows at most this many guesses. */
export const VERIFICATION_CODE_MAX_ATTEMPTS = 5

/** A new code is emailed at most this often per address. */
export const VERIFICATION_CODE_RESEND_INTERVAL_SECONDS = 60

/** How far up the line each verified friend moves the referrer. */
export const PLACES_PER_REFERRAL = 10

/** Referrals past this many don't count, so a pile of throwaway inboxes can't buy the front. */
export const MAX_CREDITED_REFERRALS = 20
