import { afterEach, beforeEach, describe, expect, it } from 'bun:test'
import type { FastifyInstance } from 'fastify'
import { formatUtcDay } from '../lib/email/email-day'
import { readDailyEmailCount } from '../repositories/email-daily-counts-repository'
import { EmailRefusedError, type EmailSender, type OutgoingEmail } from '../services/email-sender'
import { buildTestServer } from '../test-support/build-test-server'
import { createCapturingEmailSender } from '../test-support/fake-pass-services'
import {
  buildTestInviteCode,
  insertTestWaitlistSignup,
} from '../test-support/insert-test-waitlist-signup'
import { sendExistingWaitlistInviteEmails } from './send-existing-waitlist-invite-emails'

// The moment new joins started getting the email themselves.
const JOINED_BEFORE = new Date('2026-10-22T12:00:00Z')
const EARLY_HOUR_STARTS_AT = new Date('2026-11-28T13:30:00Z')
const MINUTE_MILLISECONDS = 60_000

let server: FastifyInstance
let sentEmails: OutgoingEmail[]
let emailSender: EmailSender

beforeEach(async () => {
  server = await buildTestServer()
  ;({ emailSender, sentEmails } = createCapturingEmailSender())
  // Three from before, oldest first, and one who joined after (and got it on joining).
  await joinWaitlist('first@example.com', -30)
  await joinWaitlist('second@example.com', -20)
  await joinWaitlist('third@example.com', -10)
  await joinWaitlist('late@example.com', 10)
})

afterEach(async () => {
  await server.close()
})

describe('sendExistingWaitlistInviteEmails (D-062)', () => {
  it('emails the oldest sign-ups from before, up to the limit, worded as one extra email', async () => {
    const report = await runSender({ limit: 2 })

    expect(report).toEqual({
      awaitingCount: 3,
      sentEmailAddresses: ['first@example.com', 'second@example.com'],
      failure: null,
      remainingCount: 1,
    })
    expect(sentEmails[0]?.textBody).toContain('so this is one extra email.')
  })

  it('never emails an address twice, however many runs', async () => {
    await runSender({ limit: 2 })

    const secondReport = await runSender({ limit: 10 })
    const thirdReport = await runSender({ limit: 10 })

    expect(secondReport.sentEmailAddresses).toEqual(['third@example.com'])
    expect(thirdReport.sentEmailAddresses).toEqual([])
    expect(sentEmails).toHaveLength(3)
  })

  it('shows how many friends have joined with their link so far', async () => {
    const firstInviteCode = buildTestInviteCode('first@example.com')
    for (const friendEmail of ['friend-one@example.com', 'friend-two@example.com']) {
      await insertTestWaitlistSignup(server.mongo.database, {
        email: friendEmail,
        createdAt: new Date(JOINED_BEFORE.getTime() + MINUTE_MILLISECONDS),
        invitedByInviteCode: firstInviteCode,
        emailConfirmedAt: new Date(JOINED_BEFORE.getTime() + MINUTE_MILLISECONDS),
      })
    }

    await runSender({ limit: 1 })

    expect(sentEmails[0]?.textBody).toContain('So far, 2 of your 3 friends have joined.')
  })

  it('only counts without --send', async () => {
    const report = await runSender({ limit: 10, shouldSend: false })

    expect(report).toMatchObject({ awaitingCount: 3, sentEmailAddresses: [], remainingCount: 3 })
    expect(sentEmails).toHaveLength(0)
  })

  it('stops at a refusal and gives that address back for the next run', async () => {
    let sendCount = 0
    emailSender = {
      sendEmail: async () => {
        sendCount += 1
        if (sendCount === 2) throw new EmailRefusedError('Brevo refused the email: 402')
      },
    }

    const report = await runSender({ limit: 10 })

    expect(report.sentEmailAddresses).toEqual(['first@example.com'])
    expect(report.failure).toMatchObject({ emailAddress: 'second@example.com', willRetry: true })
    expect(report.remainingCount).toBe(2)
    expect(await readDailyEmailCount(server.mongo.database, formatUtcDay(new Date()))).toBe(1)
  })
})

function runSender({ limit, shouldSend = true }: { limit: number; shouldSend?: boolean }) {
  return sendExistingWaitlistInviteEmails({
    database: server.mongo.database,
    emailSender,
    joinedBefore: JOINED_BEFORE,
    waitlistWindowStartsAt: new Date('2026-11-28T14:30:00Z'),
    earlyHourStartsAt: EARLY_HOUR_STARTS_AT,
    limit,
    shouldSend,
  })
}

async function joinWaitlist(email: string, minutesFromJoinedBefore: number): Promise<void> {
  await insertTestWaitlistSignup(server.mongo.database, {
    email,
    createdAt: new Date(JOINED_BEFORE.getTime() + minutesFromJoinedBefore * MINUTE_MILLISECONDS),
  })
}
