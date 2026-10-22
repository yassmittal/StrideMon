// The Founding Pass schedule (D-041, D-043), copied by hand from the website's
// `src/lib/founding-pass/pass-schedule.ts` (there's no shared package, brief §7.3): keep the two
// the same. The card's button and the counter's screen follow it, from the API's times, or the
// planned ones while the API hasn't answered.

export const PASS_SCHEDULE_PHASES = [
  'preview',
  'waitlistWindow',
  'openMint',
  'allMinted',
  'openToAll',
] as const
export type PassSchedulePhase = (typeof PASS_SCHEDULE_PHASES)[number]

/** ISO timestamps. The open mint starts when the 48-hour waitlist window ends. */
export type PassScheduleTimes = {
  waitlistWindowStartsAt: string
  openMintStartsAt: string
  backupOpeningAt: string
}

/** The website's `plannedPassScheduleTimes` (`src/content/founding-pass.ts`): change them together. */
export const plannedPassScheduleTimes: PassScheduleTimes = {
  waitlistWindowStartsAt: '2026-11-28T14:30:00.000Z',
  openMintStartsAt: '2026-11-30T14:30:00.000Z',
  backupOpeningAt: '2026-12-14T14:30:00.000Z',
}

const PASS_DESIGN_COUNT = 1000

/** The same answer as the API's: all 1,000 minted wins over every date. */
export function calculatePassSchedulePhase({
  scheduleTimes,
  mintedCount,
  now,
}: {
  scheduleTimes: PassScheduleTimes
  /** `null` while the minted count is unknown. */
  mintedCount: number | null
  now: Date
}): PassSchedulePhase {
  if (mintedCount !== null && mintedCount >= PASS_DESIGN_COUNT) return 'allMinted'
  const nowMilliseconds = now.getTime()
  if (nowMilliseconds < Date.parse(scheduleTimes.waitlistWindowStartsAt)) return 'preview'
  if (nowMilliseconds < Date.parse(scheduleTimes.openMintStartsAt)) return 'waitlistWindow'
  if (nowMilliseconds < Date.parse(scheduleTimes.backupOpeningAt)) return 'openMint'
  return 'openToAll'
}

/** Minting happens in the window and the open mint only (D-041). */
export function isMintingPhase(phase: PassSchedulePhase): boolean {
  return phase === 'waitlistWindow' || phase === 'openMint'
}
