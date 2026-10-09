import type { StrideMonContractAddresses } from '@stridemon/chain'
import type { FastifyInstance } from 'fastify'
import { MongoNotConnectedError } from 'mongodb'
import { buildServer } from '../build-server'
import type { PassServicesPluginOptions } from '../plugins/pass-services'
import type { HelpChatModel } from '../services/help-chat-model'
import { ANVIL_GAME_SERVER_PRIVATE_KEY } from './deploy-test-contracts'
import { createCapturingEmailSender, createTestTurnstileVerifier } from './fake-pass-services'

// Requires the project-local mongod: `bun run db:start`.
const TEST_MONGODB_SERVER_URI = 'mongodb://127.0.0.1:27019'

// Nothing listens here. Tests that never touch the chain use it; the client connects lazily.
const UNUSED_RPC_URL = 'http://127.0.0.1:9'

export const TEST_SIWE_DOMAIN = 'stridemon.test'

export const TEST_GAS_DRIP_AMOUNT_WEI = 100_000_000_000_000_000n

export const TEST_WAITLIST_ALLOWED_ORIGIN = 'https://stridemon.test'

export const TEST_EMAIL_PROOF_SECRET = 'test-email-proof-secret-long-enough-for-hs256-'.repeat(2)

/**
 * The tests' schedule: the waitlist window ran in January, so minting is in its open mint until
 * the backup opening date, far away. Tests that need another phase move these times.
 */
export const TEST_PASS_SCHEDULE_VARIABLES = {
  PASS_WAITLIST_WINDOW_STARTS_AT: '2026-01-01T14:30:00Z',
  PASS_WAITLIST_WINDOW_HOURS: '48',
  PASS_BACKUP_OPENING_AT: '2099-01-01T14:30:00Z',
}

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
  WAITLIST_ALLOWED_ORIGINS: TEST_WAITLIST_ALLOWED_ORIGIN,
  EARLY_ACCESS_REQUIRED: 'false',
  ...TEST_PASS_SCHEDULE_VARIABLES,
  TURNSTILE_SECRET_KEY: '1x0000000000000000000000000000000AA',
  EMAIL_PROOF_SECRET: TEST_EMAIL_PROOF_SECRET,
  EMAIL_SENDER_ADDRESS: 'hello@stridemon.test',
  HELP_CHAT_MONTHLY_CAP_USD: '5',
}

/**
 * A server on its own throwaway database, so tests never see each other's data.
 * Pass the RPC URL of a `startTestChain()` Anvil when the test touches the chain,
 * and the addresses from `deployTestContracts()` when it uses the contracts.
 * Emails are captured, never sent, and Turnstile passes only `TEST_TURNSTILE_TOKEN`.
 */
export async function buildTestServer({
  monadRpcUrl = UNUSED_RPC_URL,
  contractAddresses,
  environmentOverrides = {},
  passServices = {},
  helpChatModel,
}: {
  monadRpcUrl?: string
  contractAddresses?: StrideMonContractAddresses
  /** For example a schedule moved into the past or the future, or the gate switched on. */
  environmentOverrides?: Record<string, string>
  passServices?: PassServicesPluginOptions
  /** A fake model for the help chatbot; without one, every question is unavailable. */
  helpChatModel?: HelpChatModel
} = {}): Promise<FastifyInstance> {
  const server = await buildServer({
    environmentVariables: {
      ...TEST_ENVIRONMENT_VARIABLES,
      MONGODB_URI: `${TEST_MONGODB_SERVER_URI}/stridemon_test_${crypto.randomUUID()}`,
      MONAD_RPC_URL: monadRpcUrl,
      ...environmentOverrides,
    },
    ...(contractAddresses === undefined ? {} : { contractAddresses }),
    passServices: {
      emailSender: passServices.emailSender ?? createCapturingEmailSender().emailSender,
      turnstileVerifier: passServices.turnstileVerifier ?? createTestTurnstileVerifier(),
    },
    ...(helpChatModel === undefined ? {} : { helpChatModel }),
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
