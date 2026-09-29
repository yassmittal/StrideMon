import { SUPPORTED_CHAINS } from '@stridemon/chain'
import { defineChain } from 'viem'
import { appEnvironment } from '../../config/env'

/**
 * The Monad chain the app talks to, picked by EXPO_PUBLIC_MONAD_CHAIN_ID, with
 * its RPC replaced by EXPO_PUBLIC_MONAD_RPC_URL. The URL has to live on the chain
 * object: the AppKit wagmi adapter builds its transports from `rpcUrls.default`
 * for chains Reown doesn't host (D-018).
 */
export const monadChain = resolveMonadChain()

function resolveMonadChain() {
  const supportedChain = SUPPORTED_CHAINS.find((chain) => chain.id === appEnvironment.monadChainId)
  if (supportedChain === undefined) {
    const supportedChainIds = SUPPORTED_CHAINS.map((chain) => chain.id).join(', ')
    throw new Error(
      `EXPO_PUBLIC_MONAD_CHAIN_ID ${appEnvironment.monadChainId} is not one of: ${supportedChainIds}`,
    )
  }
  return defineChain({
    ...supportedChain,
    rpcUrls: { default: { http: [appEnvironment.monadRpcUrl] } },
  })
}
