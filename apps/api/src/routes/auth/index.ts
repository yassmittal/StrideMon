import type { FastifyPluginAsyncZod } from 'fastify-type-provider-zod'
import type { Hex } from 'viem'
import { refreshAuthTokens } from '../../handlers/auth/refresh-auth-tokens'
import { requestAuthNonce } from '../../handlers/auth/request-auth-nonce'
import { signOut } from '../../handlers/auth/sign-out'
import { verifyAuthSignature } from '../../handlers/auth/verify-auth-signature'
import { readAuthenticatedUser } from '../../plugins/authentication'
import {
  refreshAuthTokensRouteSchema,
  requestAuthNonceRouteSchema,
  signOutRouteSchema,
  verifyAuthSignatureRouteSchema,
} from './schemas'

// security.md: strict limits on /v1/auth/*. One budget shared by every auth route.
const AUTH_ROUTE_RATE_LIMIT = { max: 10, timeWindow: '1 minute', groupId: 'auth' }

export const authRoutes: FastifyPluginAsyncZod = async (fastify) => {
  fastify.post(
    '/auth/nonce',
    { schema: requestAuthNonceRouteSchema, config: { rateLimit: AUTH_ROUTE_RATE_LIMIT } },
    (request) =>
      requestAuthNonce({
        database: fastify.mongo.database,
        apiConfig: fastify.config,
        walletAddress: request.body.walletAddress,
        now: new Date(),
      }),
  )

  fastify.post(
    '/auth/verify',
    { schema: verifyAuthSignatureRouteSchema, config: { rateLimit: AUTH_ROUTE_RATE_LIMIT } },
    (request) =>
      verifyAuthSignature({
        database: fastify.mongo.database,
        publicClient: fastify.chain.publicClient,
        apiConfig: fastify.config,
        message: request.body.message,
        // The body schema has already checked it's 0x-prefixed hex.
        signature: request.body.signature as Hex,
        now: new Date(),
      }),
  )

  fastify.post(
    '/auth/refresh',
    { schema: refreshAuthTokensRouteSchema, config: { rateLimit: AUTH_ROUTE_RATE_LIMIT } },
    (request) =>
      refreshAuthTokens({
        database: fastify.mongo.database,
        apiConfig: fastify.config,
        refreshToken: request.body.refreshToken,
        now: new Date(),
      }),
  )

  fastify.post(
    '/auth/sign-out',
    {
      schema: signOutRouteSchema,
      preHandler: fastify.authenticate,
      config: { rateLimit: AUTH_ROUTE_RATE_LIMIT },
    },
    async (request, reply) => {
      await signOut({
        database: fastify.mongo.database,
        authenticatedUser: readAuthenticatedUser(request),
        refreshToken: request.body.refreshToken,
        now: new Date(),
      })
      return reply.status(204).send(null)
    },
  )
}
