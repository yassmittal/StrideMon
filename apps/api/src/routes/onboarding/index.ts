import type { FastifyPluginAsyncZod } from 'fastify-type-provider-zod'
import { readOnboardingStatus } from '../../handlers/onboarding/read-onboarding-status'
import { requestStarterSneaker } from '../../handlers/onboarding/request-starter-sneaker'
import { readAuthenticatedUser } from '../../plugins/authentication'
import { readOnboardingStatusRouteSchema, requestStarterSneakerRouteSchema } from './schemas'

export const onboardingRoutes: FastifyPluginAsyncZod = async (fastify) => {
  fastify.post(
    '/onboarding/starter-sneaker',
    { schema: requestStarterSneakerRouteSchema, preHandler: fastify.authenticate },
    (request) =>
      requestStarterSneaker({
        database: fastify.mongo.database,
        apiConfig: fastify.config,
        authenticatedUser: readAuthenticatedUser(request),
        now: new Date(),
      }),
  )

  fastify.get(
    '/onboarding/status',
    { schema: readOnboardingStatusRouteSchema, preHandler: fastify.authenticate },
    (request) =>
      readOnboardingStatus({
        database: fastify.mongo.database,
        authenticatedUser: readAuthenticatedUser(request),
      }),
  )
}
