import { describe, expect, it } from 'bun:test'
import { generateEmailCode, hashEmailCode, isEmailCodeHashMatch } from './email-code'
import { EMAIL_PROOF_TTL_SECONDS, signEmailProof, verifyEmailProof } from './email-proof'

const EMAIL_PROOF_SECRET = 'email-proof-secret-that-is-long-enough-for-hs256-'.repeat(2)
const ISSUED_AT = new Date('2026-11-28T14:00:00Z')

describe('email codes', () => {
  it('are always six digits', () => {
    for (let attempt = 0; attempt < 200; attempt++) {
      expect(generateEmailCode()).toMatch(/^\d{6}$/)
    }
  })

  it('hash the same only for the same email, code and secret', () => {
    const codeHash = hashEmailCode({
      email: 'runner@example.com',
      emailCode: '004817',
      emailProofSecret: EMAIL_PROOF_SECRET,
    })

    expect(
      isEmailCodeHashMatch(
        codeHash,
        hashEmailCode({
          email: 'runner@example.com',
          emailCode: '004817',
          emailProofSecret: EMAIL_PROOF_SECRET,
        }),
      ),
    ).toBe(true)
    expect(
      isEmailCodeHashMatch(
        codeHash,
        hashEmailCode({
          email: 'other@example.com',
          emailCode: '004817',
          emailProofSecret: EMAIL_PROOF_SECRET,
        }),
      ),
    ).toBe(false)
    expect(codeHash).not.toContain('004817')
  })
})

describe('email proofs', () => {
  it('give back the email they were signed for while they last', async () => {
    const { emailProof, emailProofExpiresAt } = await signEmailProof({
      email: 'runner@example.com',
      emailProofSecret: EMAIL_PROOF_SECRET,
      issuedAt: ISSUED_AT,
    })

    expect(emailProofExpiresAt.getTime() - ISSUED_AT.getTime()).toBe(EMAIL_PROOF_TTL_SECONDS * 1000)
    expect(
      await verifyEmailProof({
        emailProof,
        emailProofSecret: EMAIL_PROOF_SECRET,
        now: new Date(ISSUED_AT.getTime() + 60_000),
      }),
    ).toBe('runner@example.com')
  })

  it('refuse an expired proof, or one signed with another secret', async () => {
    const { emailProof, emailProofExpiresAt } = await signEmailProof({
      email: 'runner@example.com',
      emailProofSecret: EMAIL_PROOF_SECRET,
      issuedAt: ISSUED_AT,
    })

    expect(
      await verifyEmailProof({
        emailProof,
        emailProofSecret: EMAIL_PROOF_SECRET,
        now: new Date(emailProofExpiresAt.getTime() + 1000),
      }),
    ).toBeNull()
    expect(
      await verifyEmailProof({
        emailProof,
        emailProofSecret: `${EMAIL_PROOF_SECRET}-another`,
        now: ISSUED_AT,
      }),
    ).toBeNull()
  })
})
