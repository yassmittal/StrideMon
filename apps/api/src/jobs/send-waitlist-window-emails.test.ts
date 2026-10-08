import { afterEach, beforeEach, describe, expect, it } from 'bun:test'
import type { FastifyInstance } from 'fastify'
import {
  getWaitlistSignupsCollection,
  insertWaitlistSignupIfNew,
} from '../repositories/waitlist-signups-repository'
import { EmailRefusedError, type EmailSender, type OutgoingEmail } from '../services/email-sender'
import { buildTestServer } from '../test-support/build-test-server'
import { createCapturingEmailSender } from '../test-support/fake-pass-services'
import { sendWaitlistWindowEmails } from './send-waitlist-window-emails'

const WINDOW_STARTS_AT = new Date('2026-11-28T14:30:00Z')
const SCHEDULE_TIMES = {
  waitlistWindowStartsAt: WINDOW_STARTS_AT,
  openMintStartsAt: new Date('2026-11-30T14:30:00Z'),
  backupOpeningAt: new Date('2026-12-14T14:30:00Z'),
}
const MINUTE_MILLISECONDS = 60_000

let server: FastifyInstance
let sentEmails: OutgoingEmail[]
let emailSender: EmailSender

beforeEach(async () => {
  server = await buildTestServer()
  ;({ emailSender, sentEmails } = createCapturingEmailSender())
  // Three before the window, oldest first, and one after it opened.
  await joinWaitlist('first@example.com', -30)
  await joinWaitlist('second@example.com', -20)
  await joinWaitlist('third@example.com', -10)
  await joinWaitlist('late@example.com', 10)
})

afterEach(async () => {
  await server.close()
})

describe('sendWaitlistWindowEmails', () => {
  it('emails the oldest sign-ups from before the window, up to the limit', async () => {
    const report = await runSender({ limit: 2 })

    expect(report).toEqual({
      awaitingCount: 3,
      sentEmailAddresses: ['first@example.com', 'second@example.com'],
      failure: null,
      remainingCount: 1,
    })
    expect(sentEmails[0]?.subject).toBe('Your 48 hours start now')
  })

  it('never emails an address twice, however many runs', async () => {
    await runSender({ limit: 2 })

    const secondReport = await runSender({ limit: 10 })
    const thirdReport = await runSender({ limit: 10 })

    expect(secondReport.sentEmailAddresses).toEqual(['third@example.com'])
    expect(thirdReport.sentEmailAddresses).toEqual([])
    expect(sentEmails.map((sentEmail) => sentEmail.toEmailAddress).sort()).toEqual([
      'first@example.com',
      'second@example.com',
      'third@example.com',
    ])
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
  })
})

function runSender({ limit, shouldSend = true }: { limit: number; shouldSend?: boolean }) {
  return sendWaitlistWindowEmails({
    database: server.mongo.database,
    emailSender,
    scheduleTimes: SCHEDULE_TIMES,
    limit,
    shouldSend,
    now: new Date(WINDOW_STARTS_AT.getTime() + MINUTE_MILLISECONDS),
  })
}

async function joinWaitlist(email: string, minutesFromWindowStart: number): Promise<void> {
  await insertWaitlistSignupIfNew(server.mongo.database, {
    email,
    phonePlatform: null,
    source: null,
    createdAt: new Date(WINDOW_STARTS_AT.getTime() + minutesFromWindowStart * MINUTE_MILLISECONDS),
  })
  expect(await getWaitlistSignupsCollection(server.mongo.database).countDocuments({ email })).toBe(
    1,
  )
}
