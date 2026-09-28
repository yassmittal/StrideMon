import { monadTestnet } from 'viem/chains'

/**
 * Chains StrideMon is deployed to. viem's built-in definition carries the chain
 * id (10143), public RPC and block explorer, so they are not repeated here.
 */
export const SUPPORTED_CHAINS = [monadTestnet] as const

export type SupportedChainId = (typeof SUPPORTED_CHAINS)[number]['id']

export { monadTestnet }
