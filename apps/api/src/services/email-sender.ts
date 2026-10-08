import type { FastifyBaseLogger } from 'fastify'

const BREVO_SEND_EMAIL_URL = 'https://api.brevo.com/v3/smtp/email'
const SENDER_NAME = 'StrideMon'
const EMAIL_SEND_TIMEOUT_MILLISECONDS = 10_000

/** One email, in both plain text and HTML. */
export type OutgoingEmail = {
  toEmailAddress: string
  subject: string
  textBody: string
  htmlBody: string
}

export type EmailSender = {
  /**
   * Resolves once the provider accepted it. Throws `EmailRefusedError` when the provider answered
   * no (so nothing went out), and anything else when it's unknown (a timeout, the network).
   */
  sendEmail: (outgoingEmail: OutgoingEmail) => Promise<void>
}

/** The provider answered and refused the email: it certainly wasn't sent. */
export class EmailRefusedError extends Error {
  constructor(message: string) {
    super(message)
    this.name = 'EmailRefusedError'
  }
}

/** Sends through Brevo's transactional API (production, and the deliverability check). */
export function createBrevoEmailSender({
  brevoApiKey,
  senderAddress,
}: {
  brevoApiKey: string
  senderAddress: string
}): EmailSender {
  return {
    sendEmail: async ({ toEmailAddress, subject, textBody, htmlBody }) => {
      const response = await fetch(BREVO_SEND_EMAIL_URL, {
        method: 'POST',
        headers: {
          'api-key': brevoApiKey,
          'content-type': 'application/json',
          accept: 'application/json',
        },
        body: JSON.stringify({
          sender: { email: senderAddress, name: SENDER_NAME },
          to: [{ email: toEmailAddress }],
          subject,
          textContent: textBody,
          htmlContent: htmlBody,
        }),
        signal: AbortSignal.timeout(EMAIL_SEND_TIMEOUT_MILLISECONDS),
      })
      if (!response.ok) {
        // Brevo's body names the problem (a bad key, the daily limit); it never echoes the key.
        throw new EmailRefusedError(
          `Brevo refused the email: ${response.status} ${await response.text()}`,
        )
      }
    },
  }
}

/**
 * Development only: writes the email to the log instead of sending it, so a local API never
 * spends Brevo's daily emails and the code is right there in the terminal (D-043).
 */
export function createLoggingEmailSender(log: FastifyBaseLogger): EmailSender {
  return {
    sendEmail: async ({ toEmailAddress, subject, textBody }) => {
      log.info({ toEmailAddress, subject }, `Email not sent (development):\n${textBody}`)
    },
  }
}
