/** The phone a waitlist sign-up says they use (data-model.md → waitlistSignups, D-037). */
export const WAITLIST_PHONE_PLATFORMS = ['android', 'ios'] as const

export type WaitlistPhonePlatform = (typeof WAITLIST_PHONE_PLATFORMS)[number]

/**
 * A verified sign-up's referral code is 8 of these characters (D-041). No 0, O, 1, I or L, so a
 * code read aloud or copied by hand can't be mistyped into another one.
 */
export const REFERRAL_CODE_ALPHABET = 'ABCDEFGHJKMNPQRSTUVWXYZ23456789'

export const REFERRAL_CODE_LENGTH = 8

export const VERIFICATION_CODE_DIGIT_COUNT = 6
