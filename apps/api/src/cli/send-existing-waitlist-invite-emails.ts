/**
 * The invite email to the sign-ups from before it existed (D-062), run once by hand on the server
 * after the API that sends it on join is deployed. `--joined-before` is that deploy's time:
 *
 *   cd apps/api && bun run waitlist:send-invite-emails --joined-before 2026-10-22T12:00:00Z          (counts only)
 *   cd apps/api && bun run waitlist:send-invite-emails --joined-before 2026-10-22T12:00:00Z --send   (sends)
 *
 * Reads the API's `.env`. Sends only with NODE_ENV=production (Brevo), never from a laptop.
 */
import { parseArgs } from 'node:util'
import { MongoClient } from 'mongodb'
import { sendExistingWaitlistInviteEmails } from '../jobs/send-existing-waitlist-invite-emails'
import { parseApiConfig } from '../plugins/env'
import { createBrevoEmailSender } from '../services/email-sender'

// Under Brevo's free 300 a day, leaving room for email codes.
const DEFAULT_LIMIT = 200

const { values: options } = parseArgs({
  options: {
    'joined-before': { type: 'string' },
    limit: { type: 'string', default: String(DEFAULT_LIMIT) },
    send: { type: 'boolean', default: false },
  },
})
const joinedBefore = new Date(options['joined-before'] ?? '')
if (Number.isNaN(joinedBefore.getTime())) {
  throw new Error('--joined-before needs an ISO time, like 2026-10-22T12:00:00Z')
}
const limit = Number(options.limit)
if (!Number.isInteger(limit) || limit < 1) throw new Error('--limit must be a whole number above 0')

const apiConfig = parseApiConfig(process.env)
if (
  options.send &&
  (apiConfig.nodeEnvironment !== 'production' || apiConfig.brevoApiKey === null)
) {
  throw new Error('--send runs only on the server, with NODE_ENV=production and BREVO_API_KEY set')
}

const mongoClient = new MongoClient(apiConfig.mongodbUri)
try {
  await mongoClient.connect()
  const report = await sendExistingWaitlistInviteEmails({
    database: mongoClient.db(),
    emailSender: createBrevoEmailSender({
      brevoApiKey: apiConfig.brevoApiKey ?? '',
      senderAddress: apiConfig.emailSenderAddress,
    }),
    joinedBefore,
    waitlistWindowStartsAt: apiConfig.passScheduleTimes.waitlistWindowStartsAt,
    earlyHourStartsAt: apiConfig.earlyHourStartsAt,
    limit,
    shouldSend: options.send,
  })
  const lines = [
    `Joined before ${joinedBefore.toISOString()} and waiting for the invite email: ${report.awaitingCount}`,
    ...(options.send
      ? [
          `Sent: ${report.sentEmailAddresses.length}`,
          ...report.sentEmailAddresses.map((email) => `  ${email}`),
        ]
      : ['Nothing sent (counting only). Add --send to send.']),
    ...(report.failure === null
      ? []
      : [
          `Stopped at ${report.failure.emailAddress}: ${report.failure.reason}`,
          report.failure.willRetry
            ? '  Not sent. The next run tries it again.'
            : '  It may have gone out, so it is marked sent and will not be retried. Check Brevo’s log.',
        ]),
    `Still waiting: ${report.remainingCount}`,
  ]
  process.stdout.write(`${lines.join('\n')}\n`)
} finally {
  await mongoClient.close()
}
