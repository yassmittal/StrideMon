import type { EmailSender, OutgoingEmail } from '../services/email-sender'

/** A sender that keeps every email in `sentEmails` instead of sending it. */
export function createRecordingEmailSender(): {
  emailSender: EmailSender
  sentEmails: OutgoingEmail[]
} {
  const sentEmails: OutgoingEmail[] = []
  return {
    emailSender: {
      async sendEmail(email) {
        sentEmails.push(email)
      },
    },
    sentEmails,
  }
}
