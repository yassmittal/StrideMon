import type { FastifyPluginAsyncZod } from 'fastify-type-provider-zod'
import { finishActivitySession } from '../../handlers/activity-sessions/finish-activity-session'
import { readActivitySession } from '../../handlers/activity-sessions/read-activity-session'
import { startActivitySession } from '../../handlers/activity-sessions/start-activity-session'
import { uploadLocationSamples } from '../../handlers/activity-sessions/upload-location-samples'
import { readAuthenticatedUser } from '../../plugins/authentication'
import {
  finishActivitySessionRouteSchema,
  readActivitySessionRouteSchema,
  startActivitySessionRouteSchema,
  uploadLocationSamplesRouteSchema,
} from './schemas'

// security.md → API hardening: sample uploads get their own budget. The app sends one
// every ~15 s, and a backlog after a dead zone drains in batches of 500.
const LOCATION_SAMPLES_RATE_LIMIT = {
  max: 60,
  timeWindow: '1 minute',
  groupId: 'location-samples',
}

export const activitySessionRoutes: FastifyPluginAsyncZod = async (fastify) => {
  fastify.post(
    '/activity-sessions',
    { schema: startActivitySessionRouteSchema, preHandler: fastify.authenticate },
    async (request, reply) => {
      const activitySessionResponse = await startActivitySession({
        database: fastify.mongo.database,
        publicClient: fastify.chain.publicClient,
        contractAddresses: fastify.config.contractAddresses,
        authenticatedUser: readAuthenticatedUser(request),
        sneakerTokenId: BigInt(request.body.sneakerTokenId),
        now: new Date(),
      })
      return reply.status(201).send(activitySessionResponse)
    },
  )

  fastify.post(
    '/activity-sessions/:activitySessionId/location-samples',
    {
      schema: uploadLocationSamplesRouteSchema,
      preHandler: fastify.authenticate,
      config: { rateLimit: LOCATION_SAMPLES_RATE_LIMIT },
    },
    (request) =>
      uploadLocationSamples({
        database: fastify.mongo.database,
        authenticatedUser: readAuthenticatedUser(request),
        activitySessionId: request.params.activitySessionId,
        samples: request.body.samples,
        now: new Date(),
      }),
  )

  fastify.post(
    '/activity-sessions/:activitySessionId/finish',
    { schema: finishActivitySessionRouteSchema, preHandler: fastify.authenticate },
    (request) =>
      finishActivitySession({
        database: fastify.mongo.database,
        authenticatedUser: readAuthenticatedUser(request),
        activitySessionId: request.params.activitySessionId,
        now: new Date(),
      }),
  )

  fastify.get(
    '/activity-sessions/:activitySessionId',
    { schema: readActivitySessionRouteSchema, preHandler: fastify.authenticate },
    (request) =>
      readActivitySession({
        database: fastify.mongo.database,
        authenticatedUser: readAuthenticatedUser(request),
        activitySessionId: request.params.activitySessionId,
      }),
  )
}
