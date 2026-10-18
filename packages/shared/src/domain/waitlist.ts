/** The phone a waitlist sign-up says they use (data-model.md → waitlistSignups, D-037). */
export const WAITLIST_PHONE_PLATFORMS = ['android', 'ios'] as const

export type WaitlistPhonePlatform = (typeof WAITLIST_PHONE_PLATFORMS)[number]

/** How an email was checked: a 6-digit code, or Sign in with Google (D-057). */
export const EMAIL_CHECK_METHODS = ['code', 'google'] as const

export type EmailCheckMethod = (typeof EMAIL_CHECK_METHODS)[number]

/** What a code email is for. It picks the email's words and the Turnstile action (D-057). */
export const EMAIL_CODE_PURPOSES = ['mint', 'waitlist'] as const

export type EmailCodePurpose = (typeof EMAIL_CODE_PURPOSES)[number]

/** Confirmed friends that give a sign-up the early hour (D-056, D-058). */
export const REQUIRED_CONFIRMED_FRIEND_COUNT = 3

/** An invite code's length, in Crockford base32 characters (D-056). */
export const INVITE_CODE_LENGTH = 8

const CROCKFORD_BASE32_PATTERN = new RegExp(`^[0-9A-HJKMNP-TV-Z]{${INVITE_CODE_LENGTH}}$`)

/**
 * The invite code in a `?ref=` value, or `null` when it isn't one (D-056). Case doesn't matter,
 * and Crockford's look-alikes are read as the digits they stand for: I and L as 1, O as 0.
 */
export function readInviteCode(value: string): string | null {
  const inviteCode = value.trim().toUpperCase().replaceAll(/[IL]/g, '1').replaceAll('O', '0')
  return CROCKFORD_BASE32_PATTERN.test(inviteCode) ? inviteCode : null
}
