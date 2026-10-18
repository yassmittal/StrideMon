import { describe, expect, it } from 'bun:test'
import { isDisposableEmailDomain } from './disposable-email-domain'

describe('isDisposableEmailDomain', () => {
  it('refuses a listed temporary inbox, and its subdomains', () => {
    expect(isDisposableEmailDomain('someone@mailinator.com')).toBe(true)
    expect(isDisposableEmailDomain('someone@x.mailinator.com')).toBe(true)
  })

  it('lets real inboxes through', () => {
    expect(isDisposableEmailDomain('someone@gmail.com')).toBe(false)
    expect(isDisposableEmailDomain('someone@stridemon.xyz')).toBe(false)
  })

  it('never matches a bare top-level domain', () => {
    expect(isDisposableEmailDomain('someone@com')).toBe(false)
  })
})
