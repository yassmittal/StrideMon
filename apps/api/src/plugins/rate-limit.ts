import fastifyRateLimit from '@fastify/rate-limit'
import fastifyPlugin from 'fastify-plugin'
import { ApiError } from '../common/api-error'

// Global default. Routes that need a stricter budget (auth, sample uploads)
// override it in their own route config.
const DEFAULT_REQUESTS_PER_MINUTE = 120

export const rateLimitPlugin = fastifyPlugin(
  async (fastify) => {
    await fastify.register(fastifyRateLimit, {
      global: true,
      max: DEFAULT_REQUESTS_PER_MINUTE,
      timeWindow: '1 minute',
      errorResponseBuilder: (_request, context) =>
        new ApiError('RATE_LIMITED', context.statusCode, {
          retryAfterSeconds: Math.ceil(context.ttl / 1000),
        }),
    })
  },
  { name: 'rate-limit', dependencies: ['error-handler'] },
)
