const SECONDS_PER_MINUTE = 60
const SECONDS_PER_HOUR = 3600

/**
 * `4:05` under an hour, `1:04:05` from an hour up. For the energy countdown and a
 * run's elapsed time. A partial second rounds up, so a countdown never shows 0:00
 * early; pass whole seconds for elapsed time.
 */
export function formatDuration(durationSeconds: number): string {
  const wholeSeconds = Math.max(0, Math.ceil(durationSeconds))
  const hours = Math.floor(wholeSeconds / SECONDS_PER_HOUR)
  const minutes = Math.floor((wholeSeconds % SECONDS_PER_HOUR) / SECONDS_PER_MINUTE)
  const seconds = wholeSeconds % SECONDS_PER_MINUTE
  const paddedSeconds = String(seconds).padStart(2, '0')
  if (hours === 0) return `${minutes}:${paddedSeconds}`
  return `${hours}:${String(minutes).padStart(2, '0')}:${paddedSeconds}`
}
