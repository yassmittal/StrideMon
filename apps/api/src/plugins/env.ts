import {
  CONTRACT_ADDRESSES_BY_CHAIN_ID,
  type StrideMonContractAddresses,
  SUPPORTED_CHAINS,
} from '@stridemon/chain'
import fastifyPlugin from 'fastify-plugin'
import type { Hex } from 'viem'
import { z } from 'zod'
import type { PassScheduleTimes } from '../lib/founding-pass/pass-schedule'

// 64 random bytes as hex is 128 characters; anything under 64 is too weak for HS256.
const MINIMUM_JWT_SECRET_LENGTH = 64
// Cloudflare's published Turnstile test secrets (always pass, always fail, already spent) all
// start like this. Fine for development and tests; production refuses them (D-043).
const TURNSTILE_TEST_SECRET_PATTERN = /^[123]x0{20,}/

const MILLISECONDS_PER_HOUR = 3_600_000
const MILLISECONDS_PER_MINUTE = 60_000
// A Sign in with Google client id (public, not a secret), D-057.
const GOOGLE_CLIENT_ID_PATTERN = /^[0-9]+-[a-z0-9]+\.apps\.googleusercontent\.com$/

const booleanStringSchema = z.enum(['true', 'false']).transform((text) => text === 'true')

// An ISO 8601 time with its offset (`2026-11-28T14:30:00Z`), so the schedule never depends on
// the server's time zone.
const isoDateTimeSchema = z.iso.datetime({ offset: true }).transform((text) => new Date(text))

const positiveIntegerStringSchema = z
  .string()
  .regex(/^[1-9]\d*$/, 'must be a positive whole number')
  .transform(Number)

// A dollar amount such as `5` or `2.50`.
const positiveUsdAmountStringSchema = z
  .string()
  .regex(/^\d+(\.\d{1,2})?$/, 'must be a dollar amount such as 5 or 2.50')
  .transform(Number)
  .refine((usdAmount) => usdAmount > 0, 'must be more than 0')

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

/** The same list, but optional and possibly empty: a missing or empty value opens nothing. */
const optionalOriginListSchema = z
  .string()
  .optional()
  .transform((originListText) =>
    (originListText ?? '')
      .split(',')
      .map((originText) => originText.trim())
      .filter((originText) => originText !== ''),
  )
  .pipe(
    z.array(
      z.url().refine((originText) => new URL(originText).origin === originText, {
        message: 'must be a bare origin such as https://showroom.stridemon.xyz (no path or /)',
      }),
    ),
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
  SHOWROOM_ALLOWED_ORIGINS: optionalOriginListSchema,
  EARLY_ACCESS_REQUIRED: booleanStringSchema,
  PASS_WAITLIST_WINDOW_STARTS_AT: isoDateTimeSchema,
  PASS_WAITLIST_WINDOW_HOURS: positiveIntegerStringSchema,
  PASS_BACKUP_OPENING_AT: isoDateTimeSchema,
  TURNSTILE_SECRET_KEY: z.string().min(1, 'must be the Turnstile secret key'),
  EMAIL_PROOF_SECRET: z
    .string()
    .min(
      MINIMUM_JWT_SECRET_LENGTH,
      `must be at least ${MINIMUM_JWT_SECRET_LENGTH} characters (use 64 random bytes as hex)`,
    ),
  EMAIL_SENDER_ADDRESS: z.email(),
  WAITLIST_INVITE_CODE_SECRET: z
    .string()
    .min(
      MINIMUM_JWT_SECRET_LENGTH,
      `must be at least ${MINIMUM_JWT_SECRET_LENGTH} characters (use openssl rand -hex 32)`,
    ),
  WAITLIST_CODE_DAILY_EMAIL_LIMIT: positiveIntegerStringSchema,
  // Optional: without it Continue with Google answers GOOGLE_SIGN_IN_UNAVAILABLE (D-057).
  GOOGLE_CLIENT_ID: z
    .string()
    .regex(GOOGLE_CLIENT_ID_PATTERN, 'must be a client id ending in .apps.googleusercontent.com')
    .optional(),
  PASS_EARLY_HOUR_MINUTES: positiveIntegerStringSchema,
  // Optional outside production: development logs codes instead of sending them (D-043).
  BREVO_API_KEY: z.string().min(1).optional(),
  // Optional: without it the help chatbot answers HELP_CHAT_UNAVAILABLE (D-048).
  BEDROCK_API_KEY: z.string().min(1).optional(),
  HELP_CHAT_MONTHLY_CAP_USD: positiveUsdAmountStringSchema,
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
  /** The only browser origins that may call the website's routes (D-037, D-043). */
  waitlistAllowedOrigins: string[]
  /** The 3D showroom's origins: they may read `GET /v1/pass/collection` and nothing else (D-063). */
  showroomAllowedOrigins: string[]
  /** The early-access gate's switch (D-041). The schedule turns it off by itself. */
  isEarlyAccessRequired: boolean
  passScheduleTimes: PassScheduleTimes
  /** When the early hour starts; invited friends count until then (D-056, D-058). */
  earlyHourStartsAt: Date
  /** Never logged. Checks Turnstile tokens with Cloudflare. */
  turnstileSecretKey: string
  /** Never logged. Signs email proofs and keys the email-code hashes (D-043). */
  emailProofSecret: string
  emailSenderAddress: string
  /** Never logged. Keys the waitlist's invite codes; changing it changes every link (D-056). */
  waitlistInviteCodeSecret: string
  /** Waitlist codes go only while the UTC day's email count is under this (D-057). */
  waitlistCodeDailyEmailLimit: number
  /** The Sign in with Google client; `null` turns Continue with Google off (D-057). */
  googleClientId: string | null
  /** Never logged. `null` outside production, where codes are logged instead of sent. */
  brevoApiKey: string | null
  /** Never logged. The help chatbot's model on Amazon Bedrock; `null` turns the chatbot off. */
  bedrockApiKey: string | null
  /** The help chatbot's monthly budget at the model's list price (D-048). */
  helpChatMonthlyCapUsd: number
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
  const passScheduleTimes = buildPassScheduleTimes(variables)
  assertProductionSecrets(variables)
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
    showroomAllowedOrigins: variables.SHOWROOM_ALLOWED_ORIGINS,
    isEarlyAccessRequired: variables.EARLY_ACCESS_REQUIRED,
    passScheduleTimes,
    earlyHourStartsAt: new Date(
      passScheduleTimes.waitlistWindowStartsAt.getTime() -
        variables.PASS_EARLY_HOUR_MINUTES * MILLISECONDS_PER_MINUTE,
    ),
    turnstileSecretKey: variables.TURNSTILE_SECRET_KEY,
    emailProofSecret: variables.EMAIL_PROOF_SECRET,
    emailSenderAddress: variables.EMAIL_SENDER_ADDRESS,
    waitlistInviteCodeSecret: variables.WAITLIST_INVITE_CODE_SECRET,
    waitlistCodeDailyEmailLimit: variables.WAITLIST_CODE_DAILY_EMAIL_LIMIT,
    googleClientId: variables.GOOGLE_CLIENT_ID ?? null,
    brevoApiKey: variables.BREVO_API_KEY ?? null,
    bedrockApiKey: variables.BEDROCK_API_KEY ?? null,
    helpChatMonthlyCapUsd: variables.HELP_CHAT_MONTHLY_CAP_USD,
    contractAddresses,
  }
}

type EnvironmentVariables = z.infer<typeof environmentVariablesSchema>

function buildPassScheduleTimes(variables: EnvironmentVariables): PassScheduleTimes {
  const waitlistWindowStartsAt = variables.PASS_WAITLIST_WINDOW_STARTS_AT
  const openMintStartsAt = new Date(
    waitlistWindowStartsAt.getTime() + variables.PASS_WAITLIST_WINDOW_HOURS * MILLISECONDS_PER_HOUR,
  )
  const backupOpeningAt = variables.PASS_BACKUP_OPENING_AT
  if (backupOpeningAt.getTime() <= openMintStartsAt.getTime()) {
    throw new Error(
      `Invalid environment variables (see apps/api/.env.example):\n  PASS_BACKUP_OPENING_AT: must be after the waitlist window ends (${openMintStartsAt.toISOString()})`,
    )
  }
  return { waitlistWindowStartsAt, openMintStartsAt, backupOpeningAt }
}

/** Production must send real email and check real Turnstile tokens, with its own proof secret. */
function assertProductionSecrets(variables: EnvironmentVariables): void {
  if (variables.NODE_ENV !== 'production') return
  const problems = [
    variables.BREVO_API_KEY === undefined
      ? '  BREVO_API_KEY: required in production (codes are only logged without it)'
      : null,
    TURNSTILE_TEST_SECRET_PATTERN.test(variables.TURNSTILE_SECRET_KEY)
      ? "  TURNSTILE_SECRET_KEY: is one of Cloudflare's test secrets; use the site's real one"
      : null,
    variables.EMAIL_PROOF_SECRET === variables.JWT_ACCESS_TOKEN_SECRET
      ? '  EMAIL_PROOF_SECRET: must differ from JWT_ACCESS_TOKEN_SECRET'
      : null,
    variables.WAITLIST_INVITE_CODE_SECRET === variables.EMAIL_PROOF_SECRET ||
    variables.WAITLIST_INVITE_CODE_SECRET === variables.JWT_ACCESS_TOKEN_SECRET
      ? '  WAITLIST_INVITE_CODE_SECRET: must be its own secret'
      : null,
  ].filter((problem) => problem !== null)
  if (problems.length > 0) {
    throw new Error(
      `Invalid environment variables (see apps/api/.env.example):\n${problems.join('\n')}`,
    )
  }
}

type EnvPluginOptions = { apiConfig: ApiConfig }

export const envPlugin = fastifyPlugin<EnvPluginOptions>(
  async (fastify, options) => {
    fastify.decorate('config', options.apiConfig)
  },
  { name: 'env' },
)
