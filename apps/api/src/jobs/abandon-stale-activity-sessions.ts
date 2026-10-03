import type { FastifyBaseLogger } from 'fastify'
import type { Db } from 'mongodb'
import { abandonActivitySessionsIdleSince } from '../repositories/activity-sessions-repository'

export const ABANDON_STALE_ACTIVITY_SESSIONS_JOB_NAME = 'abandonStaleActivitySessions'

// An active session with no sample upload for this long was never finished (Phase 4 spec).
const STALE_ACTIVITY_SESSION_MILLISECONDS = 30 * 60 * 1000

/**
 * Closes sessions the app never finished, so they stop blocking a new start (one
 * active session per wallet and per Sneaker). Every upload refreshes `updatedAt`,
 * so a long locked-phone run that keeps uploading is never abandoned.
 */
export async function abandonStaleActivitySessions({
  database,
  now,
  log,
}: {
  database: Db
  now: Date
  log: FastifyBaseLogger
}): Promise<void> {
  const abandonedCount = await abandonActivitySessionsIdleSince(database, {
    staleBefore: new Date(now.getTime() - STALE_ACTIVITY_SESSION_MILLISECONDS),
    now,
  })
  if (abandonedCount > 0) log.info({ abandonedCount }, 'Abandoned stale activity sessions')
}
