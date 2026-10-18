import { describe, expect, it } from 'bun:test'
import { foldEmailAddress } from './canonical-email'

describe('foldEmailAddress', () => {
  it('trims and lowercases', () => {
    expect(foldEmailAddress('  Runner@Example.COM ')).toBe('runner@example.com')
  })

  it('drops dots for gmail.com', () => {
    expect(foldEmailAddress('j.o.hn@gmail.com')).toBe('john@gmail.com')
  })

  it('reads googlemail.com as gmail.com', () => {
    expect(foldEmailAddress('J.Ohn@GoogleMail.com')).toBe('john@gmail.com')
  })

  it('drops a +tag on every domain', () => {
    expect(foldEmailAddress('john+pass@gmail.com')).toBe('john@gmail.com')
    expect(foldEmailAddress('runner+stridemon+x@example.com')).toBe('runner@example.com')
  })

  it('keeps dots on other domains', () => {
    expect(foldEmailAddress('j.ohn@example.com')).toBe('j.ohn@example.com')
  })

  it('keeps a + at the start of the address, with nothing before it to keep', () => {
    expect(foldEmailAddress('+runner@example.com')).toBe('+runner@example.com')
  })
})
