import type { StrideMonContractAddresses } from '@stridemon/chain'
import type { FastifyInstance } from 'fastify'
import { MongoNotConnectedError } from 'mongodb'
import { buildServer } from '../build-server'
import { ANVIL_GAME_SERVER_PRIVATE_KEY } from './deploy-test-contracts'

// Requires the project-local mongod: `bun run db:start`.
const TEST_MONGODB_SERVER_URI = 'mongodb://127.0.0.1:27019'

// Nothing listens here. Tests that never touch the chain use it; the client connects lazily.
const UNUSED_RPC_URL = 'http://127.0.0.1:9'

export const TEST_SIWE_DOMAIN = 'stridemon.test'

export const TEST_GAS_DRIP_AMOUNT_WEI = 100_000_000_000_000_000n

/** Environment variables every test server starts from. */
export const TEST_ENVIRONMENT_VARIABLES = {
  NODE_ENV: 'test',
  API_PORT: '3000',
  JWT_ACCESS_TOKEN_SECRET: 'test-secret-that-is-long-enough-for-hs256-'.repeat(2),
  ACCESS_TOKEN_TTL_SECONDS: '900',
  REFRESH_TOKEN_TTL_DAYS: '30',
  SIWE_DOMAIN: TEST_SIWE_DOMAIN,
  MONAD_CHAIN_ID: '10143',
  GAME_SERVER_PRIVATE_KEY: ANVIL_GAME_SERVER_PRIVATE_KEY,
  GAS_DRIP_AMOUNT_WEI: TEST_GAS_DRIP_AMOUNT_WEI.toString(),
}

/**
 * A server on its own throwaway database, so tests never see each other's data.
 * Pass the RPC URL of a `startTestChain()` Anvil when the test touches the chain,
 * and the addresses from `deployTestContracts()` when it uses the contracts.
 */
export async function buildTestServer({
  monadRpcUrl = UNUSED_RPC_URL,
  contractAddresses,
}: {
  monadRpcUrl?: string
  contractAddresses?: StrideMonContractAddresses
} = {}): Promise<FastifyInstance> {
  const server = await buildServer({
    environmentVariables: {
      ...TEST_ENVIRONMENT_VARIABLES,
      MONGODB_URI: `${TEST_MONGODB_SERVER_URI}/stridemon_test_${crypto.randomUUID()}`,
      MONAD_RPC_URL: monadRpcUrl,
    },
    ...(contractAddresses === undefined ? {} : { contractAddresses }),
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
