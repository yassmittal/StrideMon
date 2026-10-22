import { describe, expect, test } from 'bun:test'
import {
  findRecentPassMint,
  listTakenDesignNumbers,
  parsePassCollection,
  readPassAvailability,
  readPassSchedulePhase,
} from './pass-collection'

// The collection route as the showroom reads it (D-066): what it trusts, and what the card says.

const RESPONSE = {
  designCount: 1000,
  mintedCount: 2,
  mintedDesignNumbers: [999, 1000],
  pendingDesignNumbers: [137],
  recentMints: [
    {
      designNumber: 999,
      walletAddress: `0x${'3fa1'.repeat(10)}`,
      founderNumber: 2,
      mintedAt: '2026-11-28T15:00:00.000Z',
    },
    { designNumber: 1000, walletAddress: 'not an address', founderNumber: 1, mintedAt: 'x' },
  ],
  schedule: {
    phase: 'waitlistWindow',
    nextPhaseAt: '2026-11-30T14:30:00.000Z',
    waitlistWindowStartsAt: '2026-11-28T14:30:00.000Z',
    openMintStartsAt: '2026-11-30T14:30:00.000Z',
    backupOpeningAt: '2026-12-14T14:30:00.000Z',
  },
  isEarlyAccessGateOn: false,
}

describe('parsePassCollection', () => {
  test('reads the route, keeping only well-formed recent mints', () => {
    const collection = parsePassCollection(RESPONSE)
    expect(collection?.recentMints.map((mint) => mint.founderNumber)).toEqual([2])
    expect(readPassAvailability(collection, 1000)).toBe('minted')
    expect(readPassAvailability(collection, 137)).toBe('pending')
    expect(readPassAvailability(collection, 1)).toBe('available')
    expect(findRecentPassMint(collection, 999)?.founderNumber).toBe(2)
    expect(findRecentPassMint(collection, 1000)).toBeNull()
    expect([...listTakenDesignNumbers(collection)].sort()).toEqual([1000, 137, 999].sort())
  })

  test('refuses an answer it does not understand', () => {
    expect(parsePassCollection(null)).toBeNull()
    expect(parsePassCollection({ ...RESPONSE, mintedDesignNumbers: ['1'] })).toBeNull()
    expect(
      parsePassCollection({ ...RESPONSE, schedule: { ...RESPONSE.schedule, phase: 'soon' } }),
    ).toBeNull()
  })

  test('without an answer, nothing is known and the planned schedule stands', () => {
    expect(readPassAvailability(null, 1)).toBeNull()
    expect(listTakenDesignNumbers(null).size).toBe(0)
    expect(readPassSchedulePhase(null, new Date('2026-10-22T00:00:00Z'))).toBe('preview')
    expect(readPassSchedulePhase(null, new Date('2026-11-29T00:00:00Z'))).toBe('waitlistWindow')
  })
})
