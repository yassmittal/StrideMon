const TURNSTILE_SITEVERIFY_URL = 'https://challenges.cloudflare.com/turnstile/v0/siteverify'
const TURNSTILE_TIMEOUT_MILLISECONDS = 10_000

/** What the website's widget says each token is for (`turnstile-check.tsx`). */
export type TurnstileAction = 'send-code' | 'mint'

export type TurnstileVerifier = {
  /**
   * Whether Cloudflare says the token came from a real visitor on our site, for this action, and
   * hasn't been used. Throws only if Cloudflare can't be reached.
   */
  isTurnstileTokenValid: (check: {
    turnstileToken: string
    remoteIpAddress: string
    expectedAction: TurnstileAction
  }) => Promise<boolean>
}

/**
 * Checks tokens with Cloudflare's siteverify, server-side (security.md → The Founding Pass): the
 * answer must be a success for the expected action, from one of the site's own hostnames (D-045).
 * Cloudflare's test keys answer with no action and `example.com`, so their answers count on
 * success alone; production refuses test keys at boot.
 */
export function createTurnstileVerifier({
  turnstileSecretKey,
  allowedHostnames,
}: {
  turnstileSecretKey: string
  allowedHostnames: ReadonlySet<string>
}): TurnstileVerifier {
  return {
    isTurnstileTokenValid: async ({ turnstileToken, remoteIpAddress, expectedAction }) => {
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
      if (!isRecord(verification) || verification.success !== true) return false
      if (
        isRecord(verification.metadata) &&
        verification.metadata.result_with_testing_key === true
      ) {
        return true
      }
      return (
        verification.action === expectedAction &&
        typeof verification.hostname === 'string' &&
        allowedHostnames.has(verification.hostname)
      )
    },
  }
}

/** The hostnames Turnstile reports for the site: those of the browser origins the API allows. */
export function readTurnstileHostnames(allowedOrigins: readonly string[]): ReadonlySet<string> {
  return new Set(allowedOrigins.map((origin) => new URL(origin).hostname))
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null
}
