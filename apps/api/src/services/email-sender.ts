import type { FastifyBaseLogger } from 'fastify'

const BREVO_SEND_EMAIL_URL = 'https://api.brevo.com/v3/smtp/email'

const EMAIL_SENDER_NAME = 'StrideMon'

const BREVO_REQUEST_TIMEOUT_MILLISECONDS = 10_000

export type OutgoingEmail = {
  toAddress: string
  subject: string
  textBody: string
  htmlBody: string
}

/** Sends one email, or throws. `plugins/email-sender.ts` picks the implementation (D-041). */
export type EmailSender = {
  sendEmail: (email: OutgoingEmail) => Promise<void>
}

/** Brevo's transactional email API (free plan: 300 a day). */
export function createBrevoEmailSender({
  apiKey,
  senderAddress,
}: {
  apiKey: string
  senderAddress: string
}): EmailSender {
  return {
    async sendEmail({ toAddress, subject, textBody, htmlBody }) {
      const response = await fetch(BREVO_SEND_EMAIL_URL, {
        method: 'POST',
        headers: {
          'api-key': apiKey,
          'content-type': 'application/json',
          accept: 'application/json',
        },
        body: JSON.stringify({
          sender: { name: EMAIL_SENDER_NAME, email: senderAddress },
          to: [{ email: toAddress }],
          subject,
          textContent: textBody,
          htmlContent: htmlBody,
        }),
        signal: AbortSignal.timeout(BREVO_REQUEST_TIMEOUT_MILLISECONDS),
      })
      if (!response.ok) {
        throw new Error(
          `Brevo refused the email (HTTP ${response.status}): ${await response.text()}`,
        )
      }
    },
  }
}

/** Development without a Brevo key: the email, code included, goes to the console instead. */
export function createLoggingEmailSender(log: FastifyBaseLogger): EmailSender {
  return {
    async sendEmail({ toAddress, subject, textBody }) {
      log.info(
        { toAddress, subject, textBody },
        'Email not sent (no BREVO_API_KEY): logged instead',
      )
    },
  }
}
