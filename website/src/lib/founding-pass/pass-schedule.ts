// The Founding Pass schedule (D-041, D-043), mirrored from the API's `pass-schedule.ts` so the
// countdown works before the API answers, or when it can't (D-044).

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

export type PassSchedulePosition = {
  phase: PassSchedulePhase
  /** When the clock moves the phase on next. `null` once nothing more happens by the clock. */
  nextPhaseAt: Date | null
}

const PASS_DESIGN_COUNT = 1000

/** The same answer as the API's: all 1,000 minted wins over every date. */
export function calculatePassSchedulePosition({
  scheduleTimes,
  mintedCount,
  now,
}: {
  scheduleTimes: PassScheduleTimes
  /** `null` while the minted count is unknown. */
  mintedCount: number | null
  now: Date
}): PassSchedulePosition {
  if (mintedCount !== null && mintedCount >= PASS_DESIGN_COUNT) {
    return { phase: 'allMinted', nextPhaseAt: null }
  }
  const nowMilliseconds = now.getTime()
  const waitlistWindowStartsAt = new Date(scheduleTimes.waitlistWindowStartsAt)
  const openMintStartsAt = new Date(scheduleTimes.openMintStartsAt)
  const backupOpeningAt = new Date(scheduleTimes.backupOpeningAt)
  if (nowMilliseconds < waitlistWindowStartsAt.getTime()) {
    return { phase: 'preview', nextPhaseAt: waitlistWindowStartsAt }
  }
  if (nowMilliseconds < openMintStartsAt.getTime()) {
    return { phase: 'waitlistWindow', nextPhaseAt: openMintStartsAt }
  }
  if (nowMilliseconds < backupOpeningAt.getTime()) {
    return { phase: 'openMint', nextPhaseAt: backupOpeningAt }
  }
  return { phase: 'openToAll', nextPhaseAt: null }
}

/** Minting happens in the window and the open mint only (D-041). */
export function isMintingPhase(phase: PassSchedulePhase): boolean {
  return phase === 'waitlistWindow' || phase === 'openMint'
}

export type CountdownParts = {
  days: number
  hours: number
  minutes: number
  seconds: number
}

export function splitCountdown(untilDate: Date, now: Date): CountdownParts {
  const totalSeconds = Math.max(0, Math.floor((untilDate.getTime() - now.getTime()) / 1000))
  return {
    days: Math.floor(totalSeconds / 86_400),
    hours: Math.floor((totalSeconds % 86_400) / 3600),
    minutes: Math.floor((totalSeconds % 3600) / 60),
    seconds: totalSeconds % 60,
  }
}
