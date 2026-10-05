import { describe, expect, it } from 'bun:test'
import { walletAddressSchema } from './wallet-address'

describe('walletAddressSchema', () => {
  it('accepts a checksummed and a lowercase address', () => {
    expect(
      walletAddressSchema.safeParse('0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266').success,
    ).toBe(true)
    expect(
      walletAddressSchema.safeParse('0xf39fd6e51aad88f6f4ce6ab8827279cfffb92266').success,
    ).toBe(true)
  })

  it('rejects an address that is too short or missing the 0x prefix', () => {
    expect(walletAddressSchema.safeParse('0xf39Fd6e51aad88F6F4ce6aB8827279cffFb922').success).toBe(
      false,
    )
    expect(walletAddressSchema.safeParse('f39Fd6e51aad88F6F4ce6aB8827279cffFb92266').success).toBe(
      false,
    )
  })
})
