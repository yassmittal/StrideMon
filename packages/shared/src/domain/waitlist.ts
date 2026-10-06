/** The phone a waitlist sign-up says they use (data-model.md → waitlistSignups, D-037). */
export const WAITLIST_PHONE_PLATFORMS = ['android', 'ios'] as const

export type WaitlistPhonePlatform = (typeof WAITLIST_PHONE_PLATFORMS)[number]
