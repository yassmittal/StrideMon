import type { FastifyInstance } from 'fastify'
import { MongoNotConnectedError } from 'mongodb'
import { buildServer } from '../build-server'

// Requires the project-local mongod: `bun run db:start`.
const TEST_MONGODB_SERVER_URI = 'mongodb://127.0.0.1:27019'

// Nothing listens here. Tests that never touch the chain use it; the client connects lazily.
const UNUSED_RPC_URL = 'http://127.0.0.1:9'

export const TEST_SIWE_DOMAIN = 'stridemon.test'

/** Environment variables every test server starts from. */
export const TEST_ENVIRONMENT_VARIABLES = {
  NODE_ENV: 'test',
  API_PORT: '3000',
  JWT_ACCESS_TOKEN_SECRET: 'test-secret-that-is-long-enough-for-hs256-'.repeat(2),
  ACCESS_TOKEN_TTL_SECONDS: '900',
  REFRESH_TOKEN_TTL_DAYS: '30',
  SIWE_DOMAIN: TEST_SIWE_DOMAIN,
  MONAD_CHAIN_ID: '10143',
}

/**
 * A server on its own throwaway database, so tests never see each other's data.
 * Pass the RPC URL of a `startTestChain()` Anvil when the test verifies signatures.
 */
export async function buildTestServer({
  monadRpcUrl = UNUSED_RPC_URL,
}: {
  monadRpcUrl?: string
} = {}): Promise<FastifyInstance> {
  const server = await buildServer({
    environmentVariables: {
      ...TEST_ENVIRONMENT_VARIABLES,
      MONGODB_URI: `${TEST_MONGODB_SERVER_URI}/stridemon_test_${crypto.randomUUID()}`,
      MONAD_RPC_URL: monadRpcUrl,
    },
  })
  server.addHook('onClose', async () => {
    try {
      await server.mongo.database.dropDatabase()
    } catch (error) {
      // A test that closed the client itself (to simulate an outage) can't drop; that's fine.
      if (!(error instanceof MongoNotConnectedError)) throw error
    }
  })
  return server
}
