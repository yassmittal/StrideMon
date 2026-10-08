import type { FastifyRequest } from 'fastify'
import type { FastifyPluginAsyncZod } from 'fastify-type-provider-zod'
import {
  type OnboardingContext,
  readOnboardingStatus,
} from '../../handlers/onboarding/read-onboarding-status'
import { requestStarterSneaker } from '../../handlers/onboarding/request-starter-sneaker'
import { readAuthenticatedUser } from '../../plugins/authentication'
import { readOnboardingStatusRouteSchema, requestStarterSneakerRouteSchema } from './schemas'

export const onboardingRoutes: FastifyPluginAsyncZod = async (fastify) => {
  fastify.post(
    '/onboarding/starter-sneaker',
    { schema: requestStarterSneakerRouteSchema, preHandler: fastify.authenticate },
    (request) => requestStarterSneaker(readOnboardingContext(request)),
  )

  fastify.get(
    '/onboarding/status',
    { schema: readOnboardingStatusRouteSchema, preHandler: fastify.authenticate },
    (request) => readOnboardingStatus(readOnboardingContext(request)),
  )

  function readOnboardingContext(request: FastifyRequest): OnboardingContext {
    return {
      database: fastify.mongo.database,
      publicClient: fastify.chain.publicClient,
      contractAddresses: fastify.config.contractAddresses,
      apiConfig: fastify.config,
      collectionReader: fastify.foundingPassCollectionReader,
      authenticatedUser: readAuthenticatedUser(request),
      now: new Date(),
    }
  }
}
