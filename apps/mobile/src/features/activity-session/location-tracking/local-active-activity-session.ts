import type { LocalDatabase } from './activity-session-database'

/** The run in progress on this device. Everything the location task and live screen need. */
export type LocalActiveActivitySession = {
  activitySessionId: string
  sneakerTokenId: bigint
  /** Server time, ISO-8601. */
  startedAt: string
  energyAtStart: number
  /** From the chain at start, for the estimated reward. */
  efficiency: number
}

type LocalActiveActivitySessionRow = {
  activity_session_id: string
  sneaker_token_id: string
  started_at: string
  energy_at_start: number
  efficiency: number
}

/** Remembers the run in progress. There is at most one, so this replaces any other. */
export async function saveLocalActiveActivitySession(
  database: LocalDatabase,
  localActiveActivitySession: LocalActiveActivitySession,
): Promise<void> {
  await database.runAsync(
    `INSERT OR REPLACE INTO local_active_activity_session
       (singleton_key, activity_session_id, sneaker_token_id, started_at, energy_at_start, efficiency)
     VALUES (1, ?, ?, ?, ?, ?)`,
    [
      localActiveActivitySession.activitySessionId,
      localActiveActivitySession.sneakerTokenId.toString(),
      localActiveActivitySession.startedAt,
      localActiveActivitySession.energyAtStart,
      localActiveActivitySession.efficiency,
    ],
  )
}

export async function findLocalActiveActivitySession(
  database: LocalDatabase,
): Promise<LocalActiveActivitySession | null> {
  const sessionRow = await database.getFirstAsync<LocalActiveActivitySessionRow>(
    'SELECT * FROM local_active_activity_session WHERE singleton_key = 1',
    [],
  )
  if (sessionRow === null) return null
  return {
    activitySessionId: sessionRow.activity_session_id,
    sneakerTokenId: BigInt(sessionRow.sneaker_token_id),
    startedAt: sessionRow.started_at,
    energyAtStart: sessionRow.energy_at_start,
    efficiency: sessionRow.efficiency,
  }
}

/** Forgets the run and its buffered samples, once the API has it (finished or closed). */
export async function clearLocalActiveActivitySession(
  database: LocalDatabase,
  activitySessionId: string,
): Promise<void> {
  await database.runAsync('DELETE FROM location_samples WHERE activity_session_id = ?', [
    activitySessionId,
  ])
  await database.runAsync(
    'DELETE FROM local_active_activity_session WHERE activity_session_id = ?',
    [activitySessionId],
  )
}
