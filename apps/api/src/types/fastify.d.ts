import type { Db, MongoClient } from 'mongodb'
import type { AuthenticatedUser } from '../plugins/authentication'
import type { ChainClients } from '../plugins/chain-clients'
import type { ApiConfig } from '../plugins/env'

declare module 'fastify' {
  interface FastifyInstance {
    config: ApiConfig
    mongo: { client: MongoClient; database: Db }
    chain: ChainClients
    authenticate: (request: FastifyRequest) => Promise<void>
  }

  interface FastifyRequest {
    /** Set by `fastify.authenticate`; `null` on routes without it. */
    authenticatedUser: AuthenticatedUser | null
  }
}
