/** apps/mobile/src/lib/format/format-duration.ts: `26:30`, rounded up to the whole second. */
export function formatDurationForApp(durationSeconds: number): string {
  const wholeSeconds = Math.max(0, Math.ceil(durationSeconds))
  const minutes = Math.floor(wholeSeconds / 60)
  const seconds = wholeSeconds % 60
  return `${minutes}:${String(seconds).padStart(2, '0')}`
}
