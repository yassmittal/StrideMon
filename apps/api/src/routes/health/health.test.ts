import { afterEach, beforeEach, describe, expect, it } from 'bun:test'
import { apiErrorResponseSchema, healthResponseSchema } from '@stridemon/shared/api-contracts'
import type { FastifyInstance } from 'fastify'
import { buildServer } from '../../build-server'

// Requires the project-local mongod: `bun run db:start`.
const TEST_MONGODB_SERVER_URI = 'mongodb://127.0.0.1:27019'

describe('GET /health', () => {
  let server: FastifyInstance

  beforeEach(async () => {
    server = await buildServer({
      environmentVariables: {
        NODE_ENV: 'test',
        API_PORT: '3000',
        MONGODB_URI: `${TEST_MONGODB_SERVER_URI}/stridemon_test_${crypto.randomUUID()}`,
      },
    })
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
