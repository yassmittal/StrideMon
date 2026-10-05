import type { FastifyPluginAsyncZod } from 'fastify-type-provider-zod'
import { readCurrentUser } from '../../handlers/me/read-current-user'
import { readAuthenticatedUser } from '../../plugins/authentication'
import { readCurrentUserRouteSchema } from './schemas'

export const meRoutes: FastifyPluginAsyncZod = async (fastify) => {
  fastify.get(
    '/me',
    { schema: readCurrentUserRouteSchema, preHandler: fastify.authenticate },
    (request) =>
      readCurrentUser({
        database: fastify.mongo.database,
        authenticatedUser: readAuthenticatedUser(request),
      }),
  )
}
