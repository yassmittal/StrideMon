import { afterEach, beforeEach, describe, expect, it } from 'bun:test'
import type { FastifyInstance } from 'fastify'
import { buildTestServer } from '../test-support/build-test-server'
import { acquireJobLease, releaseJobLease } from './job-leases-repository'

const JOB_NAME = 'processChainTransactions'
const LEASE_DURATION_MILLISECONDS = 60_000
const LEASE_START = new Date('2026-09-29T10:00:00Z')

let server: FastifyInstance

beforeEach(async () => {
  server = await buildTestServer()
})

afterEach(async () => {
  await server.close()
})

describe('job leases', () => {
  it('gives a free lease to the first process that asks', async () => {
    expect(await acquireFor('process-a', LEASE_START)).toBe(true)
  })

  it('refuses a second process while the lease is live', async () => {
    await acquireFor('process-a', LEASE_START)

    expect(await acquireFor('process-b', new Date(LEASE_START.getTime() + 1_000))).toBe(false)
  })

  it('lets the holder renew its own lease', async () => {
    await acquireFor('process-a', LEASE_START)

    expect(await acquireFor('process-a', new Date(LEASE_START.getTime() + 1_000))).toBe(true)
  })

  it('lets another process take the lease once it has expired', async () => {
    await acquireFor('process-a', LEASE_START)

    const afterExpiry = new Date(LEASE_START.getTime() + LEASE_DURATION_MILLISECONDS + 1)
    expect(await acquireFor('process-b', afterExpiry)).toBe(true)
  })

  it('frees the lease at once when the holder releases it', async () => {
    await acquireFor('process-a', LEASE_START)

    await releaseJobLease(server.mongo.database, { jobName: JOB_NAME, holderId: 'process-a' })

    expect(await acquireFor('process-b', new Date(LEASE_START.getTime() + 1_000))).toBe(true)
  })

  it('never gives the lease to two processes asking at the same moment', async () => {
    const holderIds = ['process-a', 'process-b', 'process-c', 'process-d']

    const acquisitions = await Promise.all(
      holderIds.map((holderId) => acquireFor(holderId, LEASE_START)),
    )

    expect(acquisitions.filter(Boolean)).toHaveLength(1)
  })
})

function acquireFor(holderId: string, now: Date): Promise<boolean> {
  return acquireJobLease(server.mongo.database, {
    jobName: JOB_NAME,
    holderId,
    leaseDurationMilliseconds: LEASE_DURATION_MILLISECONDS,
    now,
  })
}
