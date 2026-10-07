import type { StrideMonContractAddresses } from '@stridemon/chain'
import Fastify, { type FastifyInstance, type FastifyServerOptions } from 'fastify'
import {
  serializerCompiler,
  validatorCompiler,
  type ZodTypeProvider,
} from 'fastify-type-provider-zod'
import { apiDocsPlugin } from './plugins/api-docs'
import { authenticationPlugin } from './plugins/authentication'
import { backgroundJobsPlugin } from './plugins/background-jobs'
import { chainClientsPlugin } from './plugins/chain-clients'
import { corsPlugin } from './plugins/cors'
import { emailSenderPlugin } from './plugins/email-sender'
import { type ApiConfig, envPlugin, parseApiConfig } from './plugins/env'
import { errorHandlerPlugin } from './plugins/error-handler'
import { mongoPlugin } from './plugins/mongo'
import { mongoIndexesPlugin } from './plugins/mongo-indexes'
import { rateLimitPlugin } from './plugins/rate-limit'
import { activitySessionRoutes } from './routes/activity-sessions'
import { authRoutes } from './routes/auth'
import { healthRoutes } from './routes/health'
import { meRoutes } from './routes/me'
import { onboardingRoutes } from './routes/onboarding'
import { waitlistRoutes } from './routes/waitlist'
import type { EmailSender } from './services/email-sender'

type BuildServerOptions = {
  environmentVariables: Record<string, string | undefined>
  /** Tests only: the contracts they deployed to their Anvil (D-019). */
  contractAddresses?: StrideMonContractAddresses
  /** Tests only: records the waitlist's emails instead of sending them. */
  emailSender?: EmailSender
}

/**
 * Creates the Fastify instance with every plugin and route, in dependency order.
 * Plugins are registered by hand, not autoloaded, so the order is explicit.
 */
export async function buildServer({
  environmentVariables,
  contractAddresses,
  emailSender,
}: BuildServerOptions): Promise<FastifyInstance> {
  const apiConfig = parseApiConfig(environmentVariables, contractAddresses)

  const fastify = Fastify({
    logger: buildLoggerOptions(apiConfig),
    // nginx on the same instance forwards each player's IP (D-034). Only loopback is trusted,
    // so a client can't pick its own rate-limit key with a forged header.
    trustProxy: 'loopback',
  }).withTypeProvider<ZodTypeProvider>()
  fastify.setValidatorCompiler(validatorCompiler)
  fastify.setSerializerCompiler(serializerCompiler)

  await fastify.register(envPlugin, { apiConfig })
  await fastify.register(errorHandlerPlugin)
  // Before the rate limit, so a preflight is answered without spending the route's budget.
  await fastify.register(corsPlugin)
  await fastify.register(rateLimitPlugin)
  await fastify.register(mongoPlugin)
  await fastify.register(mongoIndexesPlugin)
  await fastify.register(chainClientsPlugin)
  await fastify.register(
    emailSenderPlugin,
    emailSender === undefined ? {} : { emailSenderOverride: emailSender },
  )
  await fastify.register(authenticationPlugin)
  await fastify.register(backgroundJobsPlugin)
  if (apiConfig.nodeEnvironment === 'development') {
    await fastify.register(apiDocsPlugin)
  }

  await fastify.register(healthRoutes)
  await fastify.register(authRoutes, { prefix: '/v1' })
  await fastify.register(meRoutes, { prefix: '/v1' })
  await fastify.register(onboardingRoutes, { prefix: '/v1' })
  await fastify.register(activitySessionRoutes, { prefix: '/v1' })
  await fastify.register(waitlistRoutes, { prefix: '/v1' })

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
