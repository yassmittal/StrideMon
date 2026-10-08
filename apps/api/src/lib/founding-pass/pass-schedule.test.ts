import { describe, expect, it } from 'bun:test'
import { calculatePassSchedulePosition, isEarlyAccessGateOn } from './pass-schedule'

const SCHEDULE_TIMES = {
  waitlistWindowStartsAt: new Date('2026-11-28T14:30:00Z'),
  openMintStartsAt: new Date('2026-11-30T14:30:00Z'),
  backupOpeningAt: new Date('2026-12-14T14:30:00Z'),
}

function positionAt(nowText: string, mintedCount = 0) {
  return calculatePassSchedulePosition({
    scheduleTimes: SCHEDULE_TIMES,
    mintedCount,
    now: new Date(nowText),
  })
}

describe('calculatePassSchedulePosition', () => {
  it('is the preview before the waitlist window, counting down to it', () => {
    expect(positionAt('2026-11-21T10:00:00Z')).toEqual({
      phase: 'preview',
      nextPhaseAt: SCHEDULE_TIMES.waitlistWindowStartsAt,
    })
  })

  it('opens the waitlist window at its exact start', () => {
    expect(positionAt('2026-11-28T14:30:00Z')).toEqual({
      phase: 'waitlistWindow',
      nextPhaseAt: SCHEDULE_TIMES.openMintStartsAt,
    })
  })

  it('moves to the open mint when the window ends', () => {
    expect(positionAt('2026-11-30T14:30:00Z')).toEqual({
      phase: 'openMint',
      nextPhaseAt: SCHEDULE_TIMES.backupOpeningAt,
    })
  })

  it('opens to all on the backup opening date when passes are left', () => {
    expect(positionAt('2026-12-14T14:30:00Z', 612)).toEqual({
      phase: 'openToAll',
      nextPhaseAt: null,
    })
  })

  it('is all minted once the 1,000th pass is on-chain, whatever the date', () => {
    expect(positionAt('2026-11-29T00:00:00Z', 1000)).toEqual({
      phase: 'allMinted',
      nextPhaseAt: null,
    })
    expect(positionAt('2026-12-20T00:00:00Z', 1000).phase).toBe('allMinted')
  })
})

describe('isEarlyAccessGateOn', () => {
  it('is on from the preview to the open mint while the switch is on', () => {
    for (const phase of ['preview', 'waitlistWindow', 'openMint'] as const) {
      expect(isEarlyAccessGateOn({ isEarlyAccessRequired: true, phase })).toBe(true)
    }
  })

  it('switches off by itself when all are minted or the backup date passes', () => {
    expect(isEarlyAccessGateOn({ isEarlyAccessRequired: true, phase: 'allMinted' })).toBe(false)
    expect(isEarlyAccessGateOn({ isEarlyAccessRequired: true, phase: 'openToAll' })).toBe(false)
  })

  it('is off in every phase while the switch is off', () => {
    expect(isEarlyAccessGateOn({ isEarlyAccessRequired: false, phase: 'openMint' })).toBe(false)
  })
})
