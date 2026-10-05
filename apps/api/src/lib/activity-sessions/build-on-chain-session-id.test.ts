import { describe, expect, it } from 'bun:test'
import { keccak256 } from 'viem'
import { buildOnChainSessionId } from './build-on-chain-session-id'

describe('buildOnChainSessionId', () => {
  it('hashes the 12 bytes of the id, not its hex text', () => {
    const activitySessionIdHex = '66f9c0ffee00000000000001'

    expect(buildOnChainSessionId(activitySessionIdHex)).toBe(keccak256(`0x${activitySessionIdHex}`))
    expect(buildOnChainSessionId(activitySessionIdHex)).toMatch(/^0x[0-9a-f]{64}$/)
  })

  it('gives different sessions different ids', () => {
    expect(buildOnChainSessionId('66f9c0ffee00000000000001')).not.toBe(
      buildOnChainSessionId('66f9c0ffee00000000000002'),
    )
  })
})
