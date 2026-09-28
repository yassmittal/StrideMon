import { describe, expect, it } from 'bun:test'
import { getErrorMessage } from './get-error-message'

describe('getErrorMessage', () => {
  it('returns the message of an Error', () => {
    expect(getErrorMessage(new Error('Mongo is down'))).toBe('Mongo is down')
  })

  it('returns a thrown string as-is', () => {
    expect(getErrorMessage('plain string')).toBe('plain string')
  })

  it('falls back for values that carry no message', () => {
    expect(getErrorMessage({ unexpected: true })).toBe('Unknown error')
  })
})
