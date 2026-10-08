import { afterEach, describe, expect, it, spyOn } from 'bun:test'
import { createTurnstileVerifier, readTurnstileHostnames } from './turnstile-verifier'

const SITE_HOSTNAMES = readTurnstileHostnames(['https://stridemon.xyz', 'http://localhost:3000'])
const CHECK = {
  turnstileToken: 'token-from-the-widget',
  remoteIpAddress: '203.0.113.7',
  expectedAction: 'mint',
} as const

let fetchSpy: ReturnType<typeof spyOn> | null = null

/** Makes Cloudflare's siteverify answer `answer` to the next request. */
function answerSiteverify(answer: Record<string, unknown>) {
  fetchSpy = spyOn(globalThis, 'fetch').mockResolvedValue(Response.json(answer))
}

function verifyWithRealKey() {
  return createTurnstileVerifier({
    turnstileSecretKey: 'real-secret',
    allowedHostnames: SITE_HOSTNAMES,
  }).isTurnstileTokenValid(CHECK)
}

describe('the Turnstile check (D-045)', () => {
  afterEach(() => {
    // Back to the real fetch for every other test.
    fetchSpy?.mockRestore()
    fetchSpy = null
  })

  it('accepts a success for this action from one of the site’s hostnames', async () => {
    answerSiteverify({ success: true, action: 'mint', hostname: 'stridemon.xyz' })
    expect(await verifyWithRealKey()).toBe(true)
  })

  it('refuses a token made for another action', async () => {
    answerSiteverify({ success: true, action: 'send-code', hostname: 'stridemon.xyz' })
    expect(await verifyWithRealKey()).toBe(false)
  })

  it('refuses a token from another hostname', async () => {
    answerSiteverify({ success: true, action: 'mint', hostname: 'evil.example' })
    expect(await verifyWithRealKey()).toBe(false)
  })

  it('refuses a failed check', async () => {
    answerSiteverify({ success: false, 'error-codes': ['timeout-or-duplicate'] })
    expect(await verifyWithRealKey()).toBe(false)
  })

  it('takes a test key’s answer on success alone, since it names no action or real hostname', async () => {
    answerSiteverify({
      success: true,
      hostname: 'example.com',
      metadata: { result_with_testing_key: true },
    })
    expect(await verifyWithRealKey()).toBe(true)
  })

  it('reads the hostnames from the allowed origins, without ports', () => {
    expect([...SITE_HOSTNAMES]).toEqual(['stridemon.xyz', 'localhost'])
  })
})
