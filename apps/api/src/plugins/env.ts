import {
  CONTRACT_ADDRESSES_BY_CHAIN_ID,
  type StrideMonContractAddresses,
  SUPPORTED_CHAINS,
} from '@stridemon/chain'
import fastifyPlugin from 'fastify-plugin'
import type { Hex } from 'viem'
import { z } from 'zod'

// 64 random bytes as hex is 128 characters; anything under 64 is too weak for HS256.
const MINIMUM_JWT_SECRET_LENGTH = 64

const positiveIntegerStringSchema = z
  .string()
  .regex(/^[1-9]\d*$/, 'must be a positive whole number')
  .transform(Number)

const weiAmountStringSchema = z
  .string()
  .regex(/^[1-9]\d*$/, 'must be a positive whole number of wei')
  .transform(BigInt)

// Comma-separated origins (`https://host` or `http://host:port`, no path), D-037.
const originListSchema = z
  .string()
  .transform((originListText) =>
    originListText
      .split(',')
      .map((originText) => originText.trim())
      .filter((originText) => originText !== ''),
  )
  .pipe(
    z
      .array(
        z.url().refine((originText) => new URL(originText).origin === originText, {
          message: 'must be a bare origin such as https://stridemon.xyz (no path or /)',
        }),
      )
      .min(1, 'must name at least one origin'),
  )

const environmentVariablesSchema = z.object({
  NODE_ENV: z.enum(['development', 'test', 'production']),
  API_PORT: z.string().regex(/^\d+$/, 'must be a port number').transform(Number),
  MONGODB_URI: z
    .string()
    .regex(/^mongodb(\+srv)?:\/\/.+\/[^/?]+/, 'must be a mongodb:// URI that names a database'),
  JWT_ACCESS_TOKEN_SECRET: z
    .string()
    .min(
      MINIMUM_JWT_SECRET_LENGTH,
      `must be at least ${MINIMUM_JWT_SECRET_LENGTH} characters (use 64 random bytes as hex)`,
    ),
  ACCESS_TOKEN_TTL_SECONDS: positiveIntegerStringSchema,
  REFRESH_TOKEN_TTL_DAYS: positiveIntegerStringSchema,
  SIWE_DOMAIN: z
    .string()
    .regex(/^[a-z0-9.-]+(:\d+)?$/, 'must be a bare host such as stridemon.xyz (no scheme or path)'),
  MONAD_RPC_URL: z.url(),
  MONAD_CHAIN_ID: z
    .string()
    .regex(/^\d+$/, 'must be a chain id')
    .transform((chainIdText, context) => {
      const supportedChain = SUPPORTED_CHAINS.find((chain) => chain.id === Number(chainIdText))
      if (supportedChain === undefined) {
        context.addIssue({
          code: 'custom',
          message: `must be one of: ${SUPPORTED_CHAINS.map((chain) => chain.id).join(', ')}`,
        })
        return z.NEVER
      }
      return supportedChain
    }),
  GAME_SERVER_PRIVATE_KEY: z
    .string()
    .regex(/^0x[0-9a-fA-F]{64}$/, 'must be a 0x-prefixed 32-byte hex private key')
    .transform((privateKey) => privateKey as Hex),
  GAS_DRIP_AMOUNT_WEI: weiAmountStringSchema,
  WAITLIST_ALLOWED_ORIGINS: originListSchema,
  // Empty means "no key": allowed outside production, where codes are logged instead (D-041).
  BREVO_API_KEY: z.string().optional().default(''),
  EMAIL_SENDER_ADDRESS: z.email(),
})

type SupportedChain = (typeof SUPPORTED_CHAINS)[number]

export type ApiConfig = {
  nodeEnvironment: 'development' | 'test' | 'production'
  apiPort: number
  mongodbUri: string
  jwtAccessTokenSecret: string
  accessTokenTtlSeconds: number
  refreshTokenTtlDays: number
  siweDomain: string
  monadRpcUrl: string
  monadChain: SupportedChain
  /** Never logged. Signs every outbox transaction. */
  gameServerPrivateKey: Hex
  gasDripAmountWei: bigint
  /** The only browser origins that may call the `/v1/waitlist` routes (D-037). */
  waitlistAllowedOrigins: string[]
  /** Never logged. `null` outside production means waitlist emails are logged, not sent (D-041). */
  brevoApiKey: string | null
  /** The From address of the waitlist's emails, on a domain authenticated in Brevo. */
  emailSenderAddress: string
  contractAddresses: StrideMonContractAddresses
}

/**
 * Validates the environment once at boot. Throws a single error naming every
 * missing or invalid variable, so a misconfigured deploy fails immediately.
 */
export function parseApiConfig(
  environmentVariables: Record<string, string | undefined>,
  contractAddressesOverride?: StrideMonContractAddresses,
): ApiConfig {
  const parseResult = environmentVariablesSchema.safeParse(environmentVariables)
  if (!parseResult.success) {
    const problems = parseResult.error.issues.map(
      (issue) => `  ${issue.path.join('.')}: ${issue.message}`,
    )
    throw new Error(
      `Invalid environment variables (see apps/api/.env.example):\n${problems.join('\n')}`,
    )
  }

  const variables = parseResult.data
  if (variables.NODE_ENV === 'production' && variables.BREVO_API_KEY === '') {
    throw new Error(
      'Invalid environment variables (see apps/api/.env.example):\n  BREVO_API_KEY: is required in production',
    )
  }
  const contractAddresses =
    contractAddressesOverride ?? CONTRACT_ADDRESSES_BY_CHAIN_ID[variables.MONAD_CHAIN_ID.id]
  if (contractAddresses === undefined) {
    throw new Error(
      `No contract addresses for chain ${variables.MONAD_CHAIN_ID.id} in @stridemon/chain. Deploy, then run \`bun run chain:export-abis\`.`,
    )
  }

  return {
    nodeEnvironment: variables.NODE_ENV,
    apiPort: variables.API_PORT,
    mongodbUri: variables.MONGODB_URI,
    jwtAccessTokenSecret: variables.JWT_ACCESS_TOKEN_SECRET,
    accessTokenTtlSeconds: variables.ACCESS_TOKEN_TTL_SECONDS,
    refreshTokenTtlDays: variables.REFRESH_TOKEN_TTL_DAYS,
    siweDomain: variables.SIWE_DOMAIN,
    monadRpcUrl: variables.MONAD_RPC_URL,
    monadChain: variables.MONAD_CHAIN_ID,
    gameServerPrivateKey: variables.GAME_SERVER_PRIVATE_KEY,
    gasDripAmountWei: variables.GAS_DRIP_AMOUNT_WEI,
    waitlistAllowedOrigins: variables.WAITLIST_ALLOWED_ORIGINS,
    brevoApiKey: variables.BREVO_API_KEY === '' ? null : variables.BREVO_API_KEY,
    emailSenderAddress: variables.EMAIL_SENDER_ADDRESS,
    contractAddresses,
  }
}

type EnvPluginOptions = { apiConfig: ApiConfig }

export const envPlugin = fastifyPlugin<EnvPluginOptions>(
  async (fastify, options) => {
    fastify.decorate('config', options.apiConfig)
  },
  { name: 'env' },
)
