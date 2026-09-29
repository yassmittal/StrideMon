import type { Db, MongoClient } from 'mongodb'
import type { PublicClient } from 'viem'
import type { AuthenticatedUser } from '../plugins/authentication'
import type { ApiConfig } from '../plugins/env'

declare module 'fastify' {
  interface FastifyInstance {
    config: ApiConfig
    mongo: { client: MongoClient; database: Db }
    chain: { publicClient: PublicClient }
    authenticate: (request: FastifyRequest) => Promise<void>
  }

  interface FastifyRequest {
    /** Set by `fastify.authenticate`; `null` on routes without it. */
    authenticatedUser: AuthenticatedUser | null
  }
}
