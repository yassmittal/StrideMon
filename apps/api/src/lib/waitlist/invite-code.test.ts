import { describe, expect, it } from 'bun:test'
import { INVITE_CODE_LENGTH, readInviteCode } from '@stridemon/shared/domain'
import { buildInviteCode, buildInviteUrl } from './invite-code'

const INVITE_CODE_SECRET = 'test-invite-code-secret-'.repeat(3)

describe('buildInviteCode', () => {
  it('gives the same email the same code every time', () => {
    const firstCode = buildInviteCode({
      canonicalEmail: 'runner@example.com',
      inviteCodeSecret: INVITE_CODE_SECRET,
    })
    const secondCode = buildInviteCode({
      canonicalEmail: 'runner@example.com',
      inviteCodeSecret: INVITE_CODE_SECRET,
    })

    expect(firstCode).toBe(secondCode)
    expect(firstCode).toHaveLength(INVITE_CODE_LENGTH)
    expect(readInviteCode(firstCode)).toBe(firstCode)
  })

  it('gives another email, or another secret, another code', () => {
    const code = buildInviteCode({
      canonicalEmail: 'runner@example.com',
      inviteCodeSecret: INVITE_CODE_SECRET,
    })

    expect(
      buildInviteCode({
        canonicalEmail: 'walker@example.com',
        inviteCodeSecret: INVITE_CODE_SECRET,
      }),
    ).not.toBe(code)
    expect(
      buildInviteCode({ canonicalEmail: 'runner@example.com', inviteCodeSecret: 'another-secret' }),
    ).not.toBe(code)
  })

  it('only uses Crockford base32 characters', () => {
    for (let emailNumber = 0; emailNumber < 200; emailNumber += 1) {
      const code = buildInviteCode({
        canonicalEmail: `runner${emailNumber}@example.com`,
        inviteCodeSecret: INVITE_CODE_SECRET,
      })
      expect(code).toMatch(/^[0-9A-HJKMNP-TV-Z]{8}$/)
    }
  })
})

describe('buildInviteUrl', () => {
  it('links the waitlist page with the code', () => {
    expect(buildInviteUrl('K7M2QX9P')).toBe('https://stridemon.xyz/waitlist?ref=K7M2QX9P')
  })
})
