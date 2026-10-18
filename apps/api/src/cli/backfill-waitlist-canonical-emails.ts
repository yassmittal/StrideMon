/**
 * Fills the folded email and invite codes on sign-ups from before the invite loop (D-056), once,
 * on the server, right after the API that adds them is deployed (deployment.md §14.2):
 *
 *   cd apps/api && ~/.bun-1.4.2/bin/bun run waitlist:backfill-canonical-emails
 *
 * Reads the API's `.env`. Safe to run again. If two sign-ups fold to one inbox it writes nothing
 * and prints them: delete the one to drop by hand, then run it again.
 */
import { MongoClient } from 'mongodb'
import { backfillWaitlistCanonicalEmails } from '../jobs/backfill-waitlist-canonical-emails'
import { parseApiConfig } from '../plugins/env'

const apiConfig = parseApiConfig(process.env)
const mongoClient = new MongoClient(apiConfig.mongodbUri)
try {
  await mongoClient.connect()
  const report = await backfillWaitlistCanonicalEmails({
    database: mongoClient.db(),
    inviteCodeSecret: apiConfig.waitlistInviteCodeSecret,
  })
  if (report.status === 'clash') {
    const lines = [
      'Nothing was written: these sign-ups fold to one inbox. Keep one of each, delete the others',
      "(db.waitlistSignups.deleteOne({ email: '<email>' })), then run this again.",
      ...report.clashes.map(
        ({ canonicalEmail, emails }) => `  ${canonicalEmail}: ${emails.join(', ')}`,
      ),
    ]
    process.stdout.write(`${lines.join('\n')}\n`)
    process.exitCode = 1
  } else {
    process.stdout.write(
      `Filled ${report.filledCount} sign-ups. ${report.alreadyFilledCount} already had it.\n`,
    )
  }
} finally {
  await mongoClient.close()
}
