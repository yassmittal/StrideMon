import { afterEach, beforeEach, describe, expect, it } from 'bun:test'
import type { FastifyInstance } from 'fastify'
import { buildTestServer, TEST_WAITLIST_ALLOWED_ORIGIN } from '../test-support/build-test-server'

const TEST_SHOWROOM_ORIGIN = 'https://showroom.stridemon.test'

let server: FastifyInstance

beforeEach(async () => {
  server = await buildTestServer({
    environmentOverrides: { SHOWROOM_ALLOWED_ORIGINS: TEST_SHOWROOM_ORIGIN },
  })
})

afterEach(async () => {
  await server.close()
})

function readAllowedOrigin(url: string, origin: string, method = 'GET') {
  return server
    .inject({
      method: 'OPTIONS',
      url,
      headers: { origin, 'access-control-request-method': method },
    })
    .then((response) => response.headers['access-control-allow-origin'])
}

describe('the showroom origin (D-063)', () => {
  it('gets CORS on GET /v1/pass/collection, as the website does', async () => {
    expect(await readAllowedOrigin('/v1/pass/collection', TEST_SHOWROOM_ORIGIN)).toBe(
      TEST_SHOWROOM_ORIGIN,
    )
    expect(await readAllowedOrigin('/v1/pass/collection?fresh=1', TEST_SHOWROOM_ORIGIN)).toBe(
      TEST_SHOWROOM_ORIGIN,
    )
    expect(await readAllowedOrigin('/v1/pass/collection', TEST_WAITLIST_ALLOWED_ORIGIN)).toBe(
      TEST_WAITLIST_ALLOWED_ORIGIN,
    )
  })

  it('gets CORS on no other route', async () => {
    for (const url of [
      '/v1/pass/mints',
      '/v1/pass/email-code',
      '/v1/pass/collectionx',
      '/v1/waitlist',
      '/v1/waitlist/count',
      '/v1/auth/nonce',
      '/v1/help/chat',
      '/v1/me',
      '/health',
    ]) {
      expect(await readAllowedOrigin(url, TEST_SHOWROOM_ORIGIN, 'POST')).toBeUndefined()
      expect(await readAllowedOrigin(url, TEST_SHOWROOM_ORIGIN)).toBeUndefined()
    }
  })
})
