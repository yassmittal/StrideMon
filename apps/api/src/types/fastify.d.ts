import type { Db, MongoClient } from 'mongodb'
import type { ApiConfig } from '../plugins/env'

declare module 'fastify' {
  interface FastifyInstance {
    config: ApiConfig
    mongo: { client: MongoClient; database: Db }
  }
}
