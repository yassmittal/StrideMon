import fastifyPlugin from 'fastify-plugin'
import { z } from 'zod'

const environmentVariablesSchema = z.object({
  NODE_ENV: z.enum(['development', 'test', 'production']),
  API_PORT: z.string().regex(/^\d+$/, 'must be a port number').transform(Number),
  MONGODB_URI: z
    .string()
    .regex(/^mongodb(\+srv)?:\/\/.+\/[^/?]+/, 'must be a mongodb:// URI that names a database'),
})

export type ApiConfig = {
  nodeEnvironment: 'development' | 'test' | 'production'
  apiPort: number
  mongodbUri: string
}

/**
 * Validates the environment once at boot. Throws a single error naming every
 * missing or invalid variable, so a misconfigured deploy fails immediately.
 */
export function parseApiConfig(
  environmentVariables: Record<string, string | undefined>,
): ApiConfig {
  const parseResult = environmentVariablesSchema.safeParse(environmentVariables)
  if (!parseResult.success) {
    const problems = parseResult.error.issues.map(
      (issue) => `  ${issue.path.join('.')}: ${issue.message}`,
    )
    throw new Error(
      `Invalid environment variables (see apps/api/.env.example):\n${problems.join('\n')}`,
    )
  }

  const variables = parseResult.data
  return {
    nodeEnvironment: variables.NODE_ENV,
    apiPort: variables.API_PORT,
    mongodbUri: variables.MONGODB_URI,
  }
}

type EnvPluginOptions = { apiConfig: ApiConfig }

export const envPlugin = fastifyPlugin<EnvPluginOptions>(
  async (fastify, options) => {
    fastify.decorate('config', options.apiConfig)
  },
  { name: 'env' },
)
