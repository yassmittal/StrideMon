import type { FastifyPluginAsyncZod } from 'fastify-type-provider-zod'
import { joinWaitlist } from '../../handlers/waitlist/join-waitlist'
import { joinWaitlistRouteSchema } from './schemas'

// A public write from a web page (D-037): a tighter budget than the global default.
const WAITLIST_ROUTE_RATE_LIMIT = { max: 5, timeWindow: '1 minute' }

// plugins/cors.ts opens this route, and only this one, to the landing page's origin.

export const waitlistRoutes: FastifyPluginAsyncZod = async (fastify) => {
  fastify.post(
    '/waitlist',
    { schema: joinWaitlistRouteSchema, config: { rateLimit: WAITLIST_ROUTE_RATE_LIMIT } },
    (request) =>
      joinWaitlist({ database: fastify.mongo.database, body: request.body, now: new Date() }),
  )
}
