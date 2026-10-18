import { describe, expect, it } from 'bun:test'
import { readInviteCode } from './waitlist'

describe('readInviteCode', () => {
  it('reads a code in any case, trimmed', () => {
    expect(readInviteCode('K7M2QX9P')).toBe('K7M2QX9P')
    expect(readInviteCode(' k7m2qx9p ')).toBe('K7M2QX9P')
  })

  it('reads the look-alikes as digits: I and L as 1, O as 0', () => {
    expect(readInviteCode('i1lOo0AB')).toBe('111000AB')
  })

  it('answers null for anything that is not a code', () => {
    expect(readInviteCode('')).toBeNull()
    expect(readInviteCode('K7M2QX9')).toBeNull()
    expect(readInviteCode('K7M2QX9PQ')).toBeNull()
    expect(readInviteCode('K7M2QX9U')).toBeNull()
    expect(readInviteCode('K7M2-X9P')).toBeNull()
  })
})
