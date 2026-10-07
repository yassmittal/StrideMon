import { describe, expect, it } from 'bun:test'
import { parseSiweMessage } from 'viem/siwe'
import { buildSiweMessage } from './build-siwe-message'

describe('buildSiweMessage', () => {
  it('writes every field verify later checks', () => {
    const issuedAt = new Date('2026-09-29T10:00:00Z')
    const expiresAt = new Date('2026-09-29T10:05:00Z')

    const message = buildSiweMessage({
      siweDomain: 'stridemon.xyz',
      walletAddress: '0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266',
      chainId: 10143,
      nonce: 'a1b2c3d4e5f60718',
      issuedAt,
      expiresAt,
    })

    expect(parseSiweMessage(message)).toMatchObject({
      domain: 'stridemon.xyz',
      uri: 'https://stridemon.xyz',
      address: '0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266',
      chainId: 10143,
      nonce: 'a1b2c3d4e5f60718',
      issuedAt,
      expirationTime: expiresAt,
    })
  })
})
