const MILLISECONDS_PER_SECOND = 1000

/** The UTC day a moment falls on, `2026-11-28`: the key of the daily email count (D-057). */
export function formatUtcDay(now: Date): string {
  return now.toISOString().slice(0, 10)
}

/** Seconds until the next 00:00 UTC, when the daily email count starts again. At least 1. */
export function calculateSecondsUntilNextUtcDay(now: Date): number {
  const nextUtcDay = Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate() + 1)
  return Math.max(1, Math.ceil((nextUtcDay - now.getTime()) / MILLISECONDS_PER_SECOND))
}
