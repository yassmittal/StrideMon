import { afterEach, beforeEach, describe, expect, it } from 'bun:test'
import { apiErrorResponseSchema, healthResponseSchema } from '@stridemon/shared/api-contracts'
import type { FastifyInstance } from 'fastify'
import { buildTestServer } from '../../test-support/build-test-server'

describe('GET /health', () => {
  let server: FastifyInstance

  beforeEach(async () => {
    server = await buildTestServer()
  })

  afterEach(async () => {
    await server.close()
  })

  it('reports ok with Mongo connected', async () => {
    const response = await server.inject({ method: 'GET', url: '/health' })

    expect(response.statusCode).toBe(200)
    expect(healthResponseSchema.parse(response.json())).toEqual({
      status: 'ok',
      mongo: 'connected',
    })
  })

  it('reports Mongo unreachable instead of failing when the connection drops', async () => {
    await server.mongo.client.close()

    const response = await server.inject({ method: 'GET', url: '/health' })

    expect(response.statusCode).toBe(200)
    expect(healthResponseSchema.parse(response.json()).mongo).toBe('unreachable')
  })

  it('answers unknown routes with the NOT_FOUND error shape', async () => {
    const response = await server.inject({ method: 'GET', url: '/no-such-route' })

    expect(response.statusCode).toBe(404)
    expect(apiErrorResponseSchema.parse(response.json()).error.code).toBe('NOT_FOUND')
  })
})
