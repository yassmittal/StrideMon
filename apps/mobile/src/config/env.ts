import type { StrideMonContractAddresses } from '@stridemon/chain'
import { getAddress } from 'viem'
import { z } from 'zod'

const contractAddressSchema = z
  .string()
  .regex(/^0x[0-9a-fA-F]{40}$/, 'must be a 0x-prefixed contract address')
  .optional()

const publicEnvironmentSchema = z.object({
  EXPO_PUBLIC_API_BASE_URL: z.url(),
  EXPO_PUBLIC_MONAD_CHAIN_ID: z.string().regex(/^\d+$/, 'must be a chain id').transform(Number),
  EXPO_PUBLIC_MONAD_RPC_URL: z.url(),
  EXPO_PUBLIC_REOWN_PROJECT_ID: z
    .string()
    .regex(/^[0-9a-f]{32}$/, 'must be the 32-character project ID from cloud.reown.com'),
  // Only for the local Founding Pass stack (D-046): all four or none. Builds never set them.
  EXPO_PUBLIC_SNEAKER_NFT_ADDRESS: contractAddressSchema,
  EXPO_PUBLIC_STRIDE_TOKEN_ADDRESS: contractAddressSchema,
  EXPO_PUBLIC_SNEAKER_GAME_ADDRESS: contractAddressSchema,
  EXPO_PUBLIC_FOUNDING_PASS_ADDRESS: contractAddressSchema,
})

// Expo inlines EXPO_PUBLIC_* at build time only when each one is read by its
// full static name, so they're listed one by one rather than passing process.env.
const parseResult = publicEnvironmentSchema.safeParse({
  EXPO_PUBLIC_API_BASE_URL: process.env.EXPO_PUBLIC_API_BASE_URL,
  EXPO_PUBLIC_MONAD_CHAIN_ID: process.env.EXPO_PUBLIC_MONAD_CHAIN_ID,
  EXPO_PUBLIC_MONAD_RPC_URL: process.env.EXPO_PUBLIC_MONAD_RPC_URL,
  EXPO_PUBLIC_REOWN_PROJECT_ID: process.env.EXPO_PUBLIC_REOWN_PROJECT_ID,
  EXPO_PUBLIC_SNEAKER_NFT_ADDRESS: process.env.EXPO_PUBLIC_SNEAKER_NFT_ADDRESS,
  EXPO_PUBLIC_STRIDE_TOKEN_ADDRESS: process.env.EXPO_PUBLIC_STRIDE_TOKEN_ADDRESS,
  EXPO_PUBLIC_SNEAKER_GAME_ADDRESS: process.env.EXPO_PUBLIC_SNEAKER_GAME_ADDRESS,
  EXPO_PUBLIC_FOUNDING_PASS_ADDRESS: process.env.EXPO_PUBLIC_FOUNDING_PASS_ADDRESS,
})

if (!parseResult.success) {
  const problems = parseResult.error.issues.map(
    (issue) => `${issue.path.join('.')}: ${issue.message}`,
  )
  throw new Error(`Invalid app environment (see apps/mobile/.env.example): ${problems.join('; ')}`)
}

const contractAddressOverrides = readContractAddressOverrides(parseResult.data)

export const appEnvironment = {
  apiBaseUrl: parseResult.data.EXPO_PUBLIC_API_BASE_URL.replace(/\/+$/, ''),
  monadChainId: parseResult.data.EXPO_PUBLIC_MONAD_CHAIN_ID,
  monadRpcUrl: parseResult.data.EXPO_PUBLIC_MONAD_RPC_URL,
  reownProjectId: parseResult.data.EXPO_PUBLIC_REOWN_PROJECT_ID,
  /** `null` everywhere but a run against the local Founding Pass stack. */
  contractAddressOverrides,
}

function readContractAddressOverrides(
  environment: z.infer<typeof publicEnvironmentSchema>,
): StrideMonContractAddresses | null {
  const overrides = {
    sneakerNft: environment.EXPO_PUBLIC_SNEAKER_NFT_ADDRESS,
    strideToken: environment.EXPO_PUBLIC_STRIDE_TOKEN_ADDRESS,
    sneakerGame: environment.EXPO_PUBLIC_SNEAKER_GAME_ADDRESS,
    foundingPass: environment.EXPO_PUBLIC_FOUNDING_PASS_ADDRESS,
  }
  const { sneakerNft, strideToken, sneakerGame, foundingPass } = overrides
  if (Object.values(overrides).every((address) => address === undefined)) return null
  if (
    sneakerNft === undefined ||
    strideToken === undefined ||
    sneakerGame === undefined ||
    foundingPass === undefined
  ) {
    throw new Error(
      'Invalid app environment: set all four EXPO_PUBLIC_*_ADDRESS values, or none of them',
    )
  }
  return {
    sneakerNft: getAddress(sneakerNft),
    strideToken: getAddress(strideToken),
    sneakerGame: getAddress(sneakerGame),
    foundingPass: getAddress(foundingPass),
  }
}
