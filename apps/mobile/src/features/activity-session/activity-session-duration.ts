import type { ActivitySession } from '@stridemon/shared/api-contracts'

const MILLISECONDS_PER_SECOND = 1000

/** From START to STOP in whole seconds, or `null` while the session is still running. */
export function calculateActivitySessionDurationSeconds({
  startedAt,
  finishedAt,
}: Pick<ActivitySession, 'startedAt' | 'finishedAt'>): number | null {
  if (finishedAt === null) return null
  const durationMilliseconds = Date.parse(finishedAt) - Date.parse(startedAt)
  return Math.max(0, Math.round(durationMilliseconds / MILLISECONDS_PER_SECOND))
}
