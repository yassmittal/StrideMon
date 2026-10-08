const TURNSTILE_SITEVERIFY_URL = 'https://challenges.cloudflare.com/turnstile/v0/siteverify'
const TURNSTILE_TIMEOUT_MILLISECONDS = 10_000

export type TurnstileVerifier = {
  /**
   * Whether Cloudflare says the token came from a real visitor and hasn't been used. Throws only
   * if Cloudflare can't be reached.
   */
  isTurnstileTokenValid: (check: {
    turnstileToken: string
    remoteIpAddress: string
  }) => Promise<boolean>
}

/** Checks tokens with Cloudflare's siteverify, server-side (security.md → The Founding Pass). */
export function createTurnstileVerifier(turnstileSecretKey: string): TurnstileVerifier {
  return {
    isTurnstileTokenValid: async ({ turnstileToken, remoteIpAddress }) => {
      const response = await fetch(TURNSTILE_SITEVERIFY_URL, {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({
          secret: turnstileSecretKey,
          response: turnstileToken,
          remoteip: remoteIpAddress,
        }),
        signal: AbortSignal.timeout(TURNSTILE_TIMEOUT_MILLISECONDS),
      })
      if (!response.ok) throw new Error(`Turnstile siteverify answered ${response.status}`)
      const verification: unknown = await response.json()
      return (
        typeof verification === 'object' &&
        verification !== null &&
        'success' in verification &&
        verification.success === true
      )
    },
  }
}
