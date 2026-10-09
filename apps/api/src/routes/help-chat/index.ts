import type { FastifyPluginAsyncZod } from 'fastify-type-provider-zod'
import { askHelpChat } from '../../handlers/help-chat/ask-help-chat'
import { askHelpChatRouteSchema } from './schemas'

// A public route that spends money (D-048): a person's worth of questions per IP, no more.
const HELP_CHAT_ROUTE_RATE_LIMIT = { max: 30, timeWindow: '1 hour' }

// plugins/cors.ts opens this route to the website's origin.

export const helpChatRoutes: FastifyPluginAsyncZod = async (fastify) => {
  fastify.post(
    '/help/chat',
    { schema: askHelpChatRouteSchema, config: { rateLimit: HELP_CHAT_ROUTE_RATE_LIMIT } },
    (request) =>
      askHelpChat({
        database: fastify.mongo.database,
        helpChatModel: fastify.helpChatModel,
        monthlyCapUsd: fastify.config.helpChatMonthlyCapUsd,
        body: request.body,
        logger: request.log,
        now: new Date(),
      }),
  )
}
