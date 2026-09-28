import fastifySwagger from '@fastify/swagger'
import fastifySwaggerUi from '@fastify/swagger-ui'
import fastifyPlugin from 'fastify-plugin'
import { jsonSchemaTransform } from 'fastify-type-provider-zod'

/** OpenAPI generated from the zod route schemas, served at /docs. Development only. */
export const apiDocsPlugin = fastifyPlugin(
  async (fastify) => {
    await fastify.register(fastifySwagger, {
      openapi: {
        info: { title: 'StrideMon API', version: '1.0.0' },
      },
      transform: jsonSchemaTransform,
    })
    await fastify.register(fastifySwaggerUi, { routePrefix: '/docs' })
  },
  { name: 'api-docs' },
)
