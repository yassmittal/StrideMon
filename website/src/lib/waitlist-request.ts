// The browser side of `POST /v1/waitlist` (D-037). The site never imports `@stridemon/shared`
// (D-035), so this mirrors the API's contract by hand.

export type WaitlistPhonePlatform = 'android' | 'ios'

export type WaitlistSignupRequest = {
  email: string
  phonePlatform: WaitlistPhonePlatform | null
  source: string | null
  /** The hidden honeypot field's value. A person leaves it empty. */
  honeypotValue: string
}

export type WaitlistSignupOutcome = 'joined' | 'invalidEmail' | 'requestFailed'

// The same rule the API applies; anything else is dropped, not sent.
const WAITLIST_SOURCE_PATTERN = /^[a-z0-9-]{1,32}$/

// A loose check for a quick, friendly error. The API's check is the real one.
const LIKELY_EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

const REQUEST_TIMEOUT_MILLISECONDS = 15_000

export function isLikelyEmail(emailText: string): boolean {
  return LIKELY_EMAIL_PATTERN.test(emailText.trim())
}

/** The page's `?source=` (for example `x-stridemon`), or null when it's missing or malformed. */
export function readWaitlistSource(searchText: string): string | null {
  const source = new URLSearchParams(searchText).get('source')
  return source !== null && WAITLIST_SOURCE_PATTERN.test(source) ? source : null
}

export async function sendWaitlistSignup(
  apiUrl: string,
  request: WaitlistSignupRequest,
): Promise<WaitlistSignupOutcome> {
  try {
    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({
        email: request.email.trim(),
        ...(request.phonePlatform === null ? {} : { phonePlatform: request.phonePlatform }),
        ...(request.source === null ? {} : { source: request.source }),
        ...(request.honeypotValue === '' ? {} : { website: request.honeypotValue }),
      }),
      signal: AbortSignal.timeout(REQUEST_TIMEOUT_MILLISECONDS),
    })
    if (response.ok) return 'joined'
    return response.status === 400 ? 'invalidEmail' : 'requestFailed'
  } catch {
    // Offline, timed out, or blocked by CORS.
    return 'requestFailed'
  }
}
