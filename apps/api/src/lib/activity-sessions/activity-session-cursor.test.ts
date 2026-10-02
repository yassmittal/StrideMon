import { describe, expect, it } from 'bun:test'
import { ObjectId } from 'mongodb'
import { decodeActivitySessionCursor, encodeActivitySessionCursor } from './activity-session-cursor'

describe('activity session cursor', () => {
  it('decodes what it encoded', () => {
    const cursor = {
      createdAt: new Date('2026-09-30T10:00:00.123Z'),
      activitySessionId: new ObjectId(),
    }

    expect(decodeActivitySessionCursor(encodeActivitySessionCursor(cursor))).toEqual(cursor)
  })

  it('refuses a cursor it didn’t produce', () => {
    expect(decodeActivitySessionCursor('not-a-cursor')).toBeNull()
  })
})
