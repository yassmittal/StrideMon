import { describe, expect, it } from 'bun:test'
import { calculateSecondsUntilNextUtcDay, formatUtcDay } from './email-day'

describe('formatUtcDay', () => {
  it('names the UTC day, not the local one', () => {
    expect(formatUtcDay(new Date('2026-11-28T23:59:59Z'))).toBe('2026-11-28')
    expect(formatUtcDay(new Date('2026-11-28T20:00:00-05:00'))).toBe('2026-11-29')
  })
})

describe('calculateSecondsUntilNextUtcDay', () => {
  it('counts to 00:00 UTC', () => {
    expect(calculateSecondsUntilNextUtcDay(new Date('2026-11-28T23:00:00Z'))).toBe(3600)
    expect(calculateSecondsUntilNextUtcDay(new Date('2026-12-31T23:59:59.500Z'))).toBe(1)
  })
})
