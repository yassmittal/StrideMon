import { describe, expect, it } from 'bun:test'
import {
  generateReferralCode,
  generateVerificationCode,
  hashVerificationCode,
} from './waitlist-codes'

describe('generateVerificationCode', () => {
  it('is always six digits', () => {
    for (let attempt = 0; attempt < 200; attempt += 1) {
      expect(generateVerificationCode()).toMatch(/^\d{6}$/)
    }
  })
})

describe('hashVerificationCode', () => {
  it('binds the code to its email', () => {
    const verificationCode = '004271'

    const codeHash = hashVerificationCode({ email: 'a@example.com', verificationCode })

    expect(codeHash).toMatch(/^[0-9a-f]{64}$/)
    expect(codeHash).not.toBe(hashVerificationCode({ email: 'b@example.com', verificationCode }))
  })
})

describe('generateReferralCode', () => {
  it('uses only the unambiguous alphabet', () => {
    for (let attempt = 0; attempt < 200; attempt += 1) {
      expect(generateReferralCode()).toMatch(/^[ABCDEFGHJKMNPQRSTUVWXYZ23456789]{8}$/)
    }
  })
})
