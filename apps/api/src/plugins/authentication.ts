import type { FastifyRequest } from 'fastify'
import fastifyPlugin from 'fastify-plugin'
import { ApiError } from '../common/api-error'
import { type AccessTokenClaims, verifyAccessToken } from '../lib/auth/access-token'

const HTTP_STATUS_UNAUTHORIZED = 401
const BEARER_PREFIX = 'Bearer '

export type AuthenticatedUser = AccessTokenClaims

/**
 * Adds `fastify.authenticate`, the preHandler every 🔒 route uses. It verifies the
 * access token and sets `request.authenticatedUser`, or answers 401 UNAUTHENTICATED.
 */
export const authenticationPlugin = fastifyPlugin(
  async (fastify) => {
    fastify.decorateRequest('authenticatedUser', null)

    fastify.decorate('authenticate', async (request: FastifyRequest) => {
      const accessToken = readBearerToken(request.headers.authorization)
      if (accessToken === null) throw new ApiError('UNAUTHENTICATED', HTTP_STATUS_UNAUTHORIZED)

      const accessTokenClaims = await verifyAccessToken({
        accessToken,
        jwtAccessTokenSecret: fastify.config.jwtAccessTokenSecret,
        now: new Date(),
      })
      if (accessTokenClaims === null) {
        throw new ApiError('UNAUTHENTICATED', HTTP_STATUS_UNAUTHORIZED)
      }
      request.authenticatedUser = accessTokenClaims
    })
  },
  { name: 'authentication', dependencies: ['env', 'error-handler'] },
)

/**
 * The user `fastify.authenticate` put on the request. Throws if a route forgot
 * the preHandler, so that mistake fails loudly instead of acting anonymously.
 */
export function readAuthenticatedUser(request: FastifyRequest): AuthenticatedUser {
  if (request.authenticatedUser === null) {
    throw new Error('readAuthenticatedUser called on a route without fastify.authenticate')
  }
  return request.authenticatedUser
}

function readBearerToken(authorizationHeader: string | undefined): string | null {
  if (authorizationHeader === undefined || !authorizationHeader.startsWith(BEARER_PREFIX)) {
    return null
  }
  const token = authorizationHeader.slice(BEARER_PREFIX.length).trim()
  return token === '' ? null : token
}
