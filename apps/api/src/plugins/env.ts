import { SUPPORTED_CHAINS } from '@stridemon/chain'
import fastifyPlugin from 'fastify-plugin'
import { z } from 'zod'

// 64 random bytes as hex is 128 characters; anything under 64 is too weak for HS256.
const MINIMUM_JWT_SECRET_LENGTH = 64

const positiveIntegerStringSchema = z
  .string()
  .regex(/^[1-9]\d*$/, 'must be a positive whole number')
  .transform(Number)

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
    .regex(/^[a-z0-9.-]+(:\d+)?$/, 'must be a bare host such as stridemon.com (no scheme or path)'),
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
}

/**
 * Validates the environment once at boot. Throws a single error naming every
 * missing or invalid variable, so a misconfigured deploy fails immediately.
 */
export function parseApiConfig(
  environmentVariables: Record<string, string | undefined>,
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
  }
}

type EnvPluginOptions = { apiConfig: ApiConfig }

export const envPlugin = fastifyPlugin<EnvPluginOptions>(
  async (fastify, options) => {
    fastify.decorate('config', options.apiConfig)
  },
  { name: 'env' },
)
