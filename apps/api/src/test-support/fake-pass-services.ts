import type { EmailSender, OutgoingEmail } from '../services/email-sender'
import type { TurnstileVerifier } from '../services/turnstile-verifier'

/** The one Turnstile token tests' fake check accepts. */
export const TEST_TURNSTILE_TOKEN = 'test-turnstile-token-that-passes'

/** Keeps every email a test server "sends", so the test can read the code. */
export function createCapturingEmailSender(): {
  emailSender: EmailSender
  sentEmails: OutgoingEmail[]
} {
  const sentEmails: OutgoingEmail[] = []
  return {
    emailSender: {
      sendEmail: async (outgoingEmail) => {
        sentEmails.push(outgoingEmail)
      },
    },
    sentEmails,
  }
}

/** Turnstile without Cloudflare: `TEST_TURNSTILE_TOKEN` passes, anything else fails. */
export function createTestTurnstileVerifier(): TurnstileVerifier {
  return {
    isTurnstileTokenValid: async ({ turnstileToken }) => turnstileToken === TEST_TURNSTILE_TOKEN,
  }
}

let remoteAddressCount = 0

/**
 * A fresh client IP for one injected request, so the per-IP rate limits never trip mid-test
 * (brief §15). Each call gives another address in 10.0.0.0/8.
 */
export function buildTestRemoteAddress(): string {
  remoteAddressCount += 1
  const addressNumber = remoteAddressCount
  return `10.${(addressNumber >> 16) & 255}.${(addressNumber >> 8) & 255}.${addressNumber & 255}`
}
