import type { FastifyPluginAsyncZod } from 'fastify-type-provider-zod'
import { joinWaitlist } from '../../handlers/waitlist/join-waitlist'
import { readWaitlistPlace } from '../../handlers/waitlist/read-waitlist-place'
import { verifyWaitlistEmail } from '../../handlers/waitlist/verify-waitlist-email'
import {
  joinWaitlistRouteSchema,
  readWaitlistPlaceRouteSchema,
  verifyWaitlistEmailRouteSchema,
} from './schemas'

// Public routes called from a web page (D-037, D-041): a tighter budget than the global default.
const WAITLIST_ROUTE_RATE_LIMIT = { max: 5, timeWindow: '1 minute' }

// plugins/cors.ts opens these routes, and only these, to the landing page's origin.

export const waitlistRoutes: FastifyPluginAsyncZod = async (fastify) => {
  fastify.post(
    '/waitlist',
    { schema: joinWaitlistRouteSchema, config: { rateLimit: WAITLIST_ROUTE_RATE_LIMIT } },
    (request) =>
      joinWaitlist({
        database: fastify.mongo.database,
        emailSender: fastify.emailSender,
        body: request.body,
        now: new Date(),
      }),
  )

  fastify.post(
    '/waitlist/verify',
    { schema: verifyWaitlistEmailRouteSchema, config: { rateLimit: WAITLIST_ROUTE_RATE_LIMIT } },
    (request) =>
      verifyWaitlistEmail({
        database: fastify.mongo.database,
        body: request.body,
        now: new Date(),
      }),
  )

  fastify.get(
    '/waitlist/place',
    { schema: readWaitlistPlaceRouteSchema, config: { rateLimit: WAITLIST_ROUTE_RATE_LIMIT } },
    (request) => readWaitlistPlace({ database: fastify.mongo.database, query: request.query }),
  )
}
