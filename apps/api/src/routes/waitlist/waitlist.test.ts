import { afterEach, beforeEach, describe, expect, it } from 'bun:test'
import { apiErrorResponseSchema, joinWaitlistResponseSchema } from '@stridemon/shared/api-contracts'
import type { FastifyInstance } from 'fastify'
import { getWaitlistSignupsCollection } from '../../repositories/waitlist-signups-repository'
import { buildTestServer, TEST_WAITLIST_ALLOWED_ORIGIN } from '../../test-support/build-test-server'

describe('POST /v1/waitlist', () => {
  let server: FastifyInstance

  beforeEach(async () => {
    server = await buildTestServer()
  })

  afterEach(async () => {
    await server.close()
  })

  function joinWaitlist(body: Record<string, unknown>) {
    return server.inject({ method: 'POST', url: '/v1/waitlist', payload: body })
  }

  function readSignups() {
    return getWaitlistSignupsCollection(server.mongo.database).find().toArray()
  }

  it('stores one sign-up, with the email trimmed and lowercased', async () => {
    const response = await joinWaitlist({
      email: '  Runner@Example.COM ',
      phonePlatform: 'android',
      source: 'x-stridemon',
    })

    expect(response.statusCode).toBe(200)
    expect(joinWaitlistResponseSchema.parse(response.json())).toEqual({ status: 'joined' })
    const signups = await readSignups()
    expect(signups).toHaveLength(1)
    expect(signups[0]).toMatchObject({
      email: 'runner@example.com',
      phonePlatform: 'android',
      source: 'x-stridemon',
    })
  })

  it('stores the same email once and answers the same both times', async () => {
    const firstResponse = await joinWaitlist({ email: 'runner@example.com', source: 'x-yash' })
    const secondResponse = await joinWaitlist({ email: 'RUNNER@example.com', phonePlatform: 'ios' })

    expect(secondResponse.statusCode).toBe(200)
    expect(secondResponse.json()).toEqual(firstResponse.json())
    const signups = await readSignups()
    expect(signups).toHaveLength(1)
    expect(signups[0]).toMatchObject({ phonePlatform: null, source: 'x-yash' })
  })

  it('refuses an email that is not an email', async () => {
    const response = await joinWaitlist({ email: 'not-an-email' })

    expect(response.statusCode).toBe(400)
    expect(apiErrorResponseSchema.parse(response.json()).error.code).toBe('VALIDATION_FAILED')
    expect(await readSignups()).toHaveLength(0)
  })

  it('answers a filled-in honeypot as joined and stores nothing', async () => {
    const response = await joinWaitlist({
      email: 'bot@example.com',
      website: 'https://spam.example',
    })

    expect(response.statusCode).toBe(200)
    expect(joinWaitlistResponseSchema.parse(response.json())).toEqual({ status: 'joined' })
    expect(await readSignups()).toHaveLength(0)
  })

  it('sends CORS headers to the landing page origin only', async () => {
    const preflight = (origin: string) =>
      server.inject({
        method: 'OPTIONS',
        url: '/v1/waitlist',
        headers: { origin, 'access-control-request-method': 'POST' },
      })

    const allowedResponse = await preflight(TEST_WAITLIST_ALLOWED_ORIGIN)
    const disallowedResponse = await preflight('https://evil.example')
    const otherRouteResponse = await server.inject({
      method: 'GET',
      url: '/health',
      headers: { origin: TEST_WAITLIST_ALLOWED_ORIGIN },
    })

    expect(allowedResponse.headers['access-control-allow-origin']).toBe(
      TEST_WAITLIST_ALLOWED_ORIGIN,
    )
    expect(disallowedResponse.headers['access-control-allow-origin']).toBeUndefined()
    expect(otherRouteResponse.headers['access-control-allow-origin']).toBeUndefined()
  })
})
