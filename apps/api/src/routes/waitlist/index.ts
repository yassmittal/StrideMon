import type { FastifyPluginAsyncZod } from 'fastify-type-provider-zod'
import { joinWaitlist } from '../../handlers/waitlist/join-waitlist'
import { createWaitlistCountReader } from '../../handlers/waitlist/read-waitlist-count'
import { readWaitlistInvites } from '../../handlers/waitlist/read-waitlist-invites'
import { startWaitlistInvitesSession } from '../../handlers/waitlist/start-waitlist-invites-session'
import {
  joinWaitlistRouteSchema,
  readWaitlistCountRouteSchema,
  readWaitlistInvitesRouteSchema,
  startWaitlistInvitesSessionRouteSchema,
} from './schemas'

// Public routes from a web page, each with its own budget per IP. Joining was 5 a minute before
// Turnstile; now Turnstile does the bot work, and many mobile users share one IP (D-056).
const JOIN_WAITLIST_RATE_LIMIT = { max: 30, timeWindow: '1 minute' }
const START_INVITES_SESSION_RATE_LIMIT = { max: 10, timeWindow: '1 minute' }
const READ_INVITES_RATE_LIMIT = { max: 30, timeWindow: '1 minute' }
const READ_COUNT_RATE_LIMIT = { max: 60, timeWindow: '1 minute' }
const WAITLIST_COUNT_CACHE_MILLISECONDS = 60_000

// plugins/cors.ts opens /v1/waitlist and every /v1/waitlist/* route to the website's origins.

export const waitlistRoutes: FastifyPluginAsyncZod = async (fastify) => {
  const waitlistCountReader = createWaitlistCountReader({
    database: fastify.mongo.database,
    cacheMilliseconds: WAITLIST_COUNT_CACHE_MILLISECONDS,
  })

  fastify.post(
    '/waitlist',
    { schema: joinWaitlistRouteSchema, config: { rateLimit: JOIN_WAITLIST_RATE_LIMIT } },
    (request) =>
      joinWaitlist({
        database: fastify.mongo.database,
        inviteCodeSecret: fastify.config.waitlistInviteCodeSecret,
        emailProofSecret: fastify.config.emailProofSecret,
        turnstileVerifier: fastify.turnstileVerifier,
        body: request.body,
        remoteIpAddress: request.ip,
        now: new Date(),
      }),
  )

  fastify.post(
    '/waitlist/invites-session',
    {
      schema: startWaitlistInvitesSessionRouteSchema,
      config: { rateLimit: START_INVITES_SESSION_RATE_LIMIT },
    },
    (request) =>
      startWaitlistInvitesSession({
        database: fastify.mongo.database,
        emailProofSecret: fastify.config.emailProofSecret,
        inviteCodeSecret: fastify.config.waitlistInviteCodeSecret,
        earlyHourStartsAt: fastify.config.earlyHourStartsAt,
        body: request.body,
        now: new Date(),
      }),
  )

  fastify.get(
    '/waitlist/invites',
    { schema: readWaitlistInvitesRouteSchema, config: { rateLimit: READ_INVITES_RATE_LIMIT } },
    (request) =>
      readWaitlistInvites({
        database: fastify.mongo.database,
        emailProofSecret: fastify.config.emailProofSecret,
        inviteCodeSecret: fastify.config.waitlistInviteCodeSecret,
        earlyHourStartsAt: fastify.config.earlyHourStartsAt,
        authorizationHeader: request.headers.authorization,
        now: new Date(),
      }),
  )

  fastify.get(
    '/waitlist/count',
    { schema: readWaitlistCountRouteSchema, config: { rateLimit: READ_COUNT_RATE_LIMIT } },
    () => waitlistCountReader.read(new Date()),
  )
}
