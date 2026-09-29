import Fastify, { type FastifyInstance, type FastifyServerOptions } from 'fastify'
import {
  serializerCompiler,
  validatorCompiler,
  type ZodTypeProvider,
} from 'fastify-type-provider-zod'
import { apiDocsPlugin } from './plugins/api-docs'
import { authenticationPlugin } from './plugins/authentication'
import { chainClientsPlugin } from './plugins/chain-clients'
import { type ApiConfig, envPlugin, parseApiConfig } from './plugins/env'
import { errorHandlerPlugin } from './plugins/error-handler'
import { mongoPlugin } from './plugins/mongo'
import { mongoIndexesPlugin } from './plugins/mongo-indexes'
import { rateLimitPlugin } from './plugins/rate-limit'
import { authRoutes } from './routes/auth'
import { healthRoutes } from './routes/health'
import { meRoutes } from './routes/me'

type BuildServerOptions = {
  environmentVariables: Record<string, string | undefined>
}

/**
 * Creates the Fastify instance with every plugin and route, in dependency order.
 * Plugins are registered by hand, not autoloaded, so the order is explicit.
 */
export async function buildServer({
  environmentVariables,
}: BuildServerOptions): Promise<FastifyInstance> {
  const apiConfig = parseApiConfig(environmentVariables)

  const fastify = Fastify({
    logger: buildLoggerOptions(apiConfig),
  }).withTypeProvider<ZodTypeProvider>()
  fastify.setValidatorCompiler(validatorCompiler)
  fastify.setSerializerCompiler(serializerCompiler)

  await fastify.register(envPlugin, { apiConfig })
  await fastify.register(errorHandlerPlugin)
  await fastify.register(rateLimitPlugin)
  await fastify.register(mongoPlugin)
  await fastify.register(mongoIndexesPlugin)
  await fastify.register(chainClientsPlugin)
  await fastify.register(authenticationPlugin)
  if (apiConfig.nodeEnvironment === 'development') {
    await fastify.register(apiDocsPlugin)
  }

  await fastify.register(healthRoutes)
  await fastify.register(authRoutes, { prefix: '/v1' })
  await fastify.register(meRoutes, { prefix: '/v1' })

  return fastify
}

function buildLoggerOptions(apiConfig: ApiConfig): NonNullable<FastifyServerOptions['logger']> {
  switch (apiConfig.nodeEnvironment) {
    case 'development':
      return { transport: { target: 'pino-pretty' } }
    case 'test':
      return false
    case 'production':
      return true
    default: {
      const unhandledEnvironment: never = apiConfig.nodeEnvironment
      throw new Error(`Unhandled NODE_ENV: ${String(unhandledEnvironment)}`)
    }
  }
}
