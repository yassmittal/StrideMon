import { describe, expect, it } from 'bun:test'
import { generateRefreshToken } from './generate-refresh-token'
import { generateSiweNonce } from './generate-siwe-nonce'
import { hashRefreshToken } from './hash-refresh-token'

describe('generateRefreshToken', () => {
  it('encodes 32 random bytes as base64url', () => {
    const refreshToken = generateRefreshToken()

    expect(refreshToken).toMatch(/^[A-Za-z0-9_-]{43}$/)
    expect(Buffer.from(refreshToken, 'base64url')).toHaveLength(32)
  })

  it('never repeats', () => {
    expect(generateRefreshToken()).not.toBe(generateRefreshToken())
  })
})

describe('hashRefreshToken', () => {
  it('is a stable SHA-256 hex digest that does not contain the token', () => {
    const refreshToken = generateRefreshToken()

    const refreshTokenHash = hashRefreshToken(refreshToken)

    expect(refreshTokenHash).toMatch(/^[0-9a-f]{64}$/)
    expect(hashRefreshToken(refreshToken)).toBe(refreshTokenHash)
    expect(refreshTokenHash).not.toContain(refreshToken)
  })
})

describe('generateSiweNonce', () => {
  it('is alphanumeric and at least 8 characters, as EIP-4361 requires', () => {
    expect(generateSiweNonce()).toMatch(/^[a-zA-Z0-9]{8,}$/)
  })

  it('never repeats', () => {
    expect(generateSiweNonce()).not.toBe(generateSiweNonce())
  })
})
