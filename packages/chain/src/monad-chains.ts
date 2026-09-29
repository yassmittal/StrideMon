import { defineChain } from 'viem'
import { monadTestnet as viemMonadTestnet } from 'viem/chains'

/**
 * Monad testnet (chain id 10143). viem's built-in definition carries the id,
 * public RPC and Multicall3; only the explorer is overridden, because viem's
 * `testnet.monadexplorer.com` now redirects to MonadVision (D-016).
 */
export const monadTestnet = defineChain({
  ...viemMonadTestnet,
  blockExplorers: {
    default: { name: 'MonadVision', url: 'https://testnet.monadvision.com' },
  },
})

/** Chains StrideMon is deployed to. */
export const SUPPORTED_CHAINS = [monadTestnet] as const

export type SupportedChainId = (typeof SUPPORTED_CHAINS)[number]['id']
