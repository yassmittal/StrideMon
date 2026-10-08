/**
 * The waitlist's one email (D-043), run by hand on the server in Part 10:
 *
 *   cd apps/api && bun run pass:send-waitlist-emails --limit 280          (counts only)
 *   cd apps/api && bun run pass:send-waitlist-emails --limit 280 --send   (sends)
 *
 * Reads the API's `.env`. Sends only with NODE_ENV=production (Brevo), never from a laptop.
 */
import { parseArgs } from 'node:util'
import { MongoClient } from 'mongodb'
import { sendWaitlistWindowEmails } from '../jobs/send-waitlist-window-emails'
import { parseApiConfig } from '../plugins/env'
import { createBrevoEmailSender } from '../services/email-sender'

// Under Brevo's free 300 a day, leaving room for email codes.
const DEFAULT_LIMIT = 250

const { values: options } = parseArgs({
  options: {
    limit: { type: 'string', default: String(DEFAULT_LIMIT) },
    send: { type: 'boolean', default: false },
  },
})
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
  const report = await sendWaitlistWindowEmails({
    database: mongoClient.db(),
    emailSender: createBrevoEmailSender({
      brevoApiKey: apiConfig.brevoApiKey ?? '',
      senderAddress: apiConfig.emailSenderAddress,
    }),
    scheduleTimes: apiConfig.passScheduleTimes,
    limit,
    shouldSend: options.send,
    now: new Date(),
  })
  const lines = [
    `Waiting for their email when the run started: ${report.awaitingCount}`,
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
