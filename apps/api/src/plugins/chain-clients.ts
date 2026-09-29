import fastifyPlugin from 'fastify-plugin'
import { createPublicClient, http } from 'viem'

/**
 * Decorates `fastify.chain` with a viem public client for Monad. The game-server
 * wallet client joins it in Phase 3.
 */
export const chainClientsPlugin = fastifyPlugin(
  async (fastify) => {
    const publicClient = createPublicClient({
      chain: fastify.config.monadChain,
      transport: http(fastify.config.monadRpcUrl),
    })
    fastify.decorate('chain', { publicClient })
  },
  { name: 'chain-clients', dependencies: ['env'] },
)
