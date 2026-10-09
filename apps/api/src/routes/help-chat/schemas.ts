import { askHelpChatBodySchema, askHelpChatResponseSchema } from '@stridemon/shared/api-contracts'

export const askHelpChatRouteSchema = {
  tags: ['help-chat'],
  summary: 'Answer a question from the help page’s text (D-048)',
  body: askHelpChatBodySchema,
  response: { 200: askHelpChatResponseSchema },
}
