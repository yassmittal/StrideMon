import type { FastifyPluginAsyncZod } from 'fastify-type-provider-zod'
import { readHealth } from '../../handlers/health/read-health'
import { readHealthRouteSchema } from './schemas'

export const healthRoutes: FastifyPluginAsyncZod = async (fastify) => {
  fastify.get('/health', { schema: readHealthRouteSchema }, () =>
    readHealth({ database: fastify.mongo.database }),
  )
}
