import { afterEach, beforeEach, describe, expect, it } from 'bun:test'
import type { FastifyInstance } from 'fastify'
import { ObjectId } from 'mongodb'
import {
  getActivitySessionsCollection,
  insertActiveActivitySession,
  touchActiveActivitySession,
} from '../repositories/activity-sessions-repository'
import { buildTestServer } from '../test-support/build-test-server'
import { abandonStaleActivitySessions } from './abandon-stale-activity-sessions'

const STARTED_AT = new Date('2026-09-29T06:00:00Z')
const MINUTE_MILLISECONDS = 60_000

let server: FastifyInstance

beforeEach(async () => {
  server = await buildTestServer()
})

afterEach(async () => {
  await server.close()
})

describe('abandonStaleActivitySessions', () => {
  it('abandons an active session with no samples for more than 30 minutes', async () => {
    const activitySessionId = await insertSession()

    await runJob(minutesAfterStart(31))

    expect(await readStatus(activitySessionId)).toBe('abandoned')
  })

  it('leaves an active session alone for the first 30 minutes', async () => {
    const activitySessionId = await insertSession()

    await runJob(minutesAfterStart(29))

    expect(await readStatus(activitySessionId)).toBe('active')
  })

  it('counts from the latest upload, so a long run that keeps uploading stays active', async () => {
    const activitySessionId = await insertSession()
    await touchActiveActivitySession(server.mongo.database, {
      activitySessionId,
      now: minutesAfterStart(40),
    })

    await runJob(minutesAfterStart(60))

    expect(await readStatus(activitySessionId)).toBe('active')
  })

  it('never touches a session that has already finished', async () => {
    const activitySessionId = await insertSession()
    await getActivitySessionsCollection(server.mongo.database).updateOne(
      { _id: activitySessionId },
      { $set: { status: 'settling' } },
    )

    await runJob(minutesAfterStart(120))

    expect(await readStatus(activitySessionId)).toBe('settling')
  })
})

async function insertSession(): Promise<ObjectId> {
  const activitySessionId = new ObjectId()
  await insertActiveActivitySession(server.mongo.database, {
    activitySessionId,
    userId: new ObjectId(),
    walletAddress: `0x${'ab'.repeat(20)}`,
    sneakerTokenId: '1',
    onChainSessionId: `0x${'00'.repeat(32)}`,
    energyAtStart: 10,
    now: STARTED_AT,
  })
  return activitySessionId
}

function runJob(now: Date): Promise<void> {
  return abandonStaleActivitySessions({ database: server.mongo.database, now, log: server.log })
}

async function readStatus(activitySessionId: ObjectId) {
  const activitySession = await getActivitySessionsCollection(server.mongo.database).findOne({
    _id: activitySessionId,
  })
  return activitySession?.status
}

function minutesAfterStart(minutes: number): Date {
  return new Date(STARTED_AT.getTime() + minutes * MINUTE_MILLISECONDS)
}
