// The browser side of the waitlist routes (D-037, D-041). The site never imports
// `@stridemon/shared` (D-035), so this mirrors the API's contracts by hand.

export type WaitlistPhonePlatform = 'android' | 'ios'

export type WaitlistSignupRequest = {
  email: string
  phonePlatform: WaitlistPhonePlatform | null
  source: string | null
  referralCode: string | null
  /** The hidden honeypot field's value. A person leaves it empty. */
  honeypotValue: string
}

export type WaitlistSignupOutcome = 'codeSent' | 'invalidEmail' | 'requestFailed'

/** A verified sign-up's place in the Founding Pass line. */
export type WaitlistPlace = {
  placeInLine: number
  referralCode: string
  referralCount: number
}

export type WaitlistVerificationOutcome =
  | { kind: 'verified'; place: WaitlistPlace }
  | { kind: 'invalidCode' }
  | { kind: 'requestFailed' }

// The same rules the API applies; anything else is dropped, not sent.
const WAITLIST_SOURCE_PATTERN = /^[a-z0-9-]{1,32}$/
const REFERRAL_CODE_PATTERN = /^[ABCDEFGHJKMNPQRSTUVWXYZ23456789]{8}$/
const VERIFICATION_CODE_PATTERN = /^\d{6}$/

// A loose check for a quick, friendly error. The API's check is the real one.
const LIKELY_EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

const REQUEST_TIMEOUT_MILLISECONDS = 15_000

export function isLikelyEmail(emailText: string): boolean {
  return LIKELY_EMAIL_PATTERN.test(emailText.trim())
}

export function isCompleteVerificationCode(codeText: string): boolean {
  return VERIFICATION_CODE_PATTERN.test(codeText.trim())
}

/** The page's `?source=` (for example `x-stridemon`), or null when it's missing or malformed. */
export function readWaitlistSource(searchText: string): string | null {
  const source = new URLSearchParams(searchText).get('source')
  return source !== null && WAITLIST_SOURCE_PATTERN.test(source) ? source : null
}

/** The page's `?ref=`, the code of whoever shared the link, or null. */
export function readReferralCode(searchText: string): string | null {
  const referralCode = new URLSearchParams(searchText).get('ref')?.trim().toUpperCase()
  return referralCode !== undefined && REFERRAL_CODE_PATTERN.test(referralCode)
    ? referralCode
    : null
}

export async function sendWaitlistSignup(
  waitlistApiUrl: string,
  request: WaitlistSignupRequest,
): Promise<WaitlistSignupOutcome> {
  const response = await postJson(waitlistApiUrl, {
    email: request.email.trim(),
    ...(request.phonePlatform === null ? {} : { phonePlatform: request.phonePlatform }),
    ...(request.source === null ? {} : { source: request.source }),
    ...(request.referralCode === null ? {} : { referralCode: request.referralCode }),
    ...(request.honeypotValue === '' ? {} : { website: request.honeypotValue }),
  })
  if (response === null) return 'requestFailed'
  if (response.ok) return 'codeSent'
  return response.status === 400 ? 'invalidEmail' : 'requestFailed'
}

export async function sendWaitlistVerification(
  waitlistApiUrl: string,
  { email, verificationCode }: { email: string; verificationCode: string },
): Promise<WaitlistVerificationOutcome> {
  const response = await postJson(`${waitlistApiUrl}/verify`, {
    email: email.trim(),
    verificationCode: verificationCode.trim(),
  })
  if (response === null) return { kind: 'requestFailed' }
  if (response.status === 400) return { kind: 'invalidCode' }
  const place = response.ok ? await readWaitlistPlace(response) : null
  return place === null ? { kind: 'requestFailed' } : { kind: 'verified', place }
}

/** A returning visitor's place, by the referral code this browser kept. Null if it can't be read. */
export async function fetchWaitlistPlace(
  waitlistApiUrl: string,
  referralCode: string,
): Promise<WaitlistPlace | null> {
  try {
    const response = await fetch(
      `${waitlistApiUrl}/place?referralCode=${encodeURIComponent(referralCode)}`,
      { signal: AbortSignal.timeout(REQUEST_TIMEOUT_MILLISECONDS) },
    )
    return response.ok ? await readWaitlistPlace(response) : null
  } catch {
    return null
  }
}

async function postJson(url: string, body: Record<string, string>): Promise<Response | null> {
  try {
    return await fetch(url, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify(body),
      signal: AbortSignal.timeout(REQUEST_TIMEOUT_MILLISECONDS),
    })
  } catch {
    // Offline, timed out, or blocked by CORS.
    return null
  }
}

async function readWaitlistPlace(response: Response): Promise<WaitlistPlace | null> {
  try {
    const body: unknown = await response.json()
    return isWaitlistPlace(body) ? body : null
  } catch {
    return null
  }
}

function isWaitlistPlace(value: unknown): value is WaitlistPlace {
  if (typeof value !== 'object' || value === null) return false
  const { placeInLine, referralCode, referralCount } = value as Record<string, unknown>
  return (
    typeof placeInLine === 'number' &&
    typeof referralCode === 'string' &&
    REFERRAL_CODE_PATTERN.test(referralCode) &&
    typeof referralCount === 'number'
  )
}
