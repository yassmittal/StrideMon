import type { FastifyPluginAsyncZod } from 'fastify-type-provider-zod'
import { deleteCurrentUser } from '../../handlers/me/delete-current-user'
import { readCurrentUser } from '../../handlers/me/read-current-user'
import { readAuthenticatedUser } from '../../plugins/authentication'
import { deleteCurrentUserRouteSchema, readCurrentUserRouteSchema } from './schemas'

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

  fastify.delete(
    '/me',
    { schema: deleteCurrentUserRouteSchema, preHandler: fastify.authenticate },
    async (request, reply) => {
      await deleteCurrentUser({
        database: fastify.mongo.database,
        authenticatedUser: readAuthenticatedUser(request),
      })
      return reply.status(204).send(null)
    },
  )
}
