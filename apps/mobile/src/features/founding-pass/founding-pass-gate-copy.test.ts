import type { PassSchedule } from '@stridemon/shared/api-contracts'
import { describeMintPhase, describeOpeningDay } from './founding-pass-gate-copy'

const SCHEDULE_TIMES = {
  nextPhaseAt: '2026-11-28T14:30:00.000Z',
  waitlistWindowStartsAt: '2026-11-28T14:30:00.000Z',
  openMintStartsAt: '2026-11-30T14:30:00.000Z',
  backupOpeningAt: '2026-12-14T14:30:00.000Z',
} as const

function describePhase(phase: PassSchedule['phase']): string {
  return describeMintPhase({
    schedule: { ...SCHEDULE_TIMES, phase },
    mintedCount: 0,
    designCount: 1000,
  })
}

describe('describeMintPhase', () => {
  it('gives both opening times during the preview week', () => {
    expect(describePhase('preview')).toMatch(
      /^Minting opens .+ for people on the waitlist, and .+ for everyone\./,
    )
  })

  it('tells someone off the waitlist when they can mint during the window', () => {
    expect(describePhase('waitlistWindow')).toMatch(/Everyone else can mint from .+\.$/)
  })

  it('says the app is opening once the gate goes away', () => {
    expect(describePhase('allMinted')).toBe(
      'The app is open to everyone now. Getting your free Sneaker…',
    )
    expect(describePhase('openToAll')).toBe(describePhase('allMinted'))
  })
})

describe('describeOpeningDay', () => {
  it('names both ways the app opens to everyone', () => {
    expect(
      describeOpeningDay({ schedule: { ...SCHEDULE_TIMES, phase: 'openMint' }, designCount: 1000 }),
    ).toMatch(/^The app opens to everyone when all 1,000 are minted, or on .+ at the latest\./)
  })
})
