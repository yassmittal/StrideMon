import { afterEach, beforeEach, describe, expect, it } from 'bun:test'
import type { FastifyInstance } from 'fastify'
import { getWaitlistSignupsCollection } from '../repositories/waitlist-signups-repository'
import {
  buildTestServer,
  TEST_WAITLIST_INVITE_CODE_SECRET,
} from '../test-support/build-test-server'
import {
  buildTestInviteCode,
  insertTestWaitlistSignup,
} from '../test-support/insert-test-waitlist-signup'
import { backfillWaitlistCanonicalEmails } from './backfill-waitlist-canonical-emails'

let server: FastifyInstance

beforeEach(async () => {
  server = await buildTestServer()
})

afterEach(async () => {
  await server.close()
})

describe('backfillWaitlistCanonicalEmails', () => {
  it('fills old sign-ups once, and leaves new ones alone', async () => {
    await insertOldSignups(['j.ohn@gmail.com', 'walker@example.com'])
    await insertTestWaitlistSignup(server.mongo.database, { email: 'new@example.com' })

    const firstReport = await runBackfill()
    const secondReport = await runBackfill()

    expect(firstReport).toEqual({ status: 'filled', filledCount: 2, alreadyFilledCount: 1 })
    expect(secondReport).toEqual({ status: 'filled', filledCount: 0, alreadyFilledCount: 3 })
    const oldSignup = await getWaitlistSignupsCollection(server.mongo.database).findOne({
      email: 'j.ohn@gmail.com',
    })
    expect(oldSignup).toMatchObject({
      canonicalEmail: 'john@gmail.com',
      inviteCode: buildTestInviteCode('john@gmail.com'),
      invitedByInviteCode: null,
    })
  })

  it('stops and names both when two sign-ups fold to one inbox, writing nothing', async () => {
    await insertOldSignups(['j.ohn@gmail.com', 'walker@example.com'])
    await insertTestWaitlistSignup(server.mongo.database, { email: 'john@gmail.com' })

    const report = await runBackfill()

    expect(report).toEqual({
      status: 'clash',
      clashes: [
        { canonicalEmail: 'john@gmail.com', emails: ['j.ohn@gmail.com', 'john@gmail.com'] },
      ],
    })
    expect(
      await getWaitlistSignupsCollection(server.mongo.database).countDocuments({
        canonicalEmail: { $exists: true },
      }),
    ).toBe(1)
  })
})

function runBackfill() {
  return backfillWaitlistCanonicalEmails({
    database: server.mongo.database,
    inviteCodeSecret: TEST_WAITLIST_INVITE_CODE_SECRET,
  })
}

/** Sign-ups as D-037 wrote them: no folded email, no codes. */
async function insertOldSignups(emails: string[]): Promise<void> {
  await server.mongo.database.collection('waitlistSignups').insertMany(
    emails.map((email, emailIndex) => ({
      email,
      phonePlatform: null,
      source: null,
      createdAt: new Date(Date.UTC(2026, 9, 1 + emailIndex)),
    })),
  )
}
