import { FOUNDING_PASS_DESIGN_COUNT, type PassSchedulePhase } from '@stridemon/shared/domain'

/** The schedule's fixed times, from config (D-043). The open mint starts when the window ends. */
export type PassScheduleTimes = {
  waitlistWindowStartsAt: Date
  openMintStartsAt: Date
  backupOpeningAt: Date
}

export type PassSchedulePosition = {
  phase: PassSchedulePhase
  /** When the clock moves the phase on next. `null` once nothing more happens by the clock. */
  nextPhaseAt: Date | null
}

/**
 * Where the Founding Pass schedule is (backend-api.md → The Founding Pass). Every route and both
 * clients go by this one answer. All 1,000 minted wins over every date.
 */
export function calculatePassSchedulePosition({
  scheduleTimes,
  mintedCount,
  now,
}: {
  scheduleTimes: PassScheduleTimes
  mintedCount: number
  now: Date
}): PassSchedulePosition {
  if (mintedCount >= FOUNDING_PASS_DESIGN_COUNT) return { phase: 'allMinted', nextPhaseAt: null }
  const nowMilliseconds = now.getTime()
  if (nowMilliseconds < scheduleTimes.waitlistWindowStartsAt.getTime()) {
    return { phase: 'preview', nextPhaseAt: scheduleTimes.waitlistWindowStartsAt }
  }
  if (nowMilliseconds < scheduleTimes.openMintStartsAt.getTime()) {
    return { phase: 'waitlistWindow', nextPhaseAt: scheduleTimes.openMintStartsAt }
  }
  if (nowMilliseconds < scheduleTimes.backupOpeningAt.getTime()) {
    return { phase: 'openMint', nextPhaseAt: scheduleTimes.backupOpeningAt }
  }
  return { phase: 'openToAll', nextPhaseAt: null }
}

/**
 * Whether only pass holders get a Sneaker right now (D-041). The switch turns it on; all 1,000
 * minted or the backup opening date turns it off by itself.
 */
export function isEarlyAccessGateOn({
  isEarlyAccessRequired,
  phase,
}: {
  isEarlyAccessRequired: boolean
  phase: PassSchedulePhase
}): boolean {
  if (!isEarlyAccessRequired) return false
  switch (phase) {
    case 'preview':
    case 'waitlistWindow':
    case 'openMint':
      return true
    case 'allMinted':
    case 'openToAll':
      return false
    default: {
      const unhandledPhase: never = phase
      throw new Error(`Unhandled pass schedule phase: ${String(unhandledPhase)}`)
    }
  }
}
