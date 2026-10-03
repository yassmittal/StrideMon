import fastifyPlugin from 'fastify-plugin'
import {
  type Account,
  type Chain,
  createPublicClient,
  createWalletClient,
  http,
  type PublicClient,
  type Transport,
  type WalletClient,
} from 'viem'
import { privateKeyToAccount } from 'viem/accounts'

/** The game server's signer: the account holding `GAME_SERVER_ROLE`. */
type GameServerWalletClient = WalletClient<Transport, Chain, Account>

export type ChainClients = {
  publicClient: PublicClient
  gameServerWalletClient: GameServerWalletClient
}

/**
 * Decorates `fastify.chain` with a viem public client for Monad reads and the
 * game-server wallet client that signs outbox transactions.
 */
export const chainClientsPlugin = fastifyPlugin(
  async (fastify) => {
    const { monadChain, monadRpcUrl, gameServerPrivateKey } = fastify.config
    const publicClient = createPublicClient({ chain: monadChain, transport: http(monadRpcUrl) })
    const gameServerWalletClient = createWalletClient({
      account: privateKeyToAccount(gameServerPrivateKey),
      chain: monadChain,
      transport: http(monadRpcUrl),
    })
    fastify.decorate('chain', { publicClient, gameServerWalletClient })
  },
  { name: 'chain-clients', dependencies: ['env'] },
)
