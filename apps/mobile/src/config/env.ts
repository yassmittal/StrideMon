import { z } from 'zod'

const publicEnvironmentSchema = z.object({
  EXPO_PUBLIC_API_BASE_URL: z.url(),
  EXPO_PUBLIC_MONAD_CHAIN_ID: z.string().regex(/^\d+$/, 'must be a chain id').transform(Number),
  EXPO_PUBLIC_MONAD_RPC_URL: z.url(),
  EXPO_PUBLIC_REOWN_PROJECT_ID: z
    .string()
    .regex(/^[0-9a-f]{32}$/, 'must be the 32-character project ID from cloud.reown.com'),
})

// Expo inlines EXPO_PUBLIC_* at build time only when each one is read by its
// full static name, so they're listed one by one rather than passing process.env.
const parseResult = publicEnvironmentSchema.safeParse({
  EXPO_PUBLIC_API_BASE_URL: process.env.EXPO_PUBLIC_API_BASE_URL,
  EXPO_PUBLIC_MONAD_CHAIN_ID: process.env.EXPO_PUBLIC_MONAD_CHAIN_ID,
  EXPO_PUBLIC_MONAD_RPC_URL: process.env.EXPO_PUBLIC_MONAD_RPC_URL,
  EXPO_PUBLIC_REOWN_PROJECT_ID: process.env.EXPO_PUBLIC_REOWN_PROJECT_ID,
})

if (!parseResult.success) {
  const problems = parseResult.error.issues.map(
    (issue) => `${issue.path.join('.')}: ${issue.message}`,
  )
  throw new Error(`Invalid app environment (see apps/mobile/.env.example): ${problems.join('; ')}`)
}

export const appEnvironment = {
  apiBaseUrl: parseResult.data.EXPO_PUBLIC_API_BASE_URL.replace(/\/+$/, ''),
  monadChainId: parseResult.data.EXPO_PUBLIC_MONAD_CHAIN_ID,
  monadRpcUrl: parseResult.data.EXPO_PUBLIC_MONAD_RPC_URL,
  reownProjectId: parseResult.data.EXPO_PUBLIC_REOWN_PROJECT_ID,
}
