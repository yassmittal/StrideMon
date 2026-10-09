import { z } from 'zod'

/** The longest message the widget sends, and the API accepts (D-048). */
export const MAX_HELP_CHAT_MESSAGE_LENGTH = 500

/** How much of the conversation the widget sends with each question. The API keeps none of it. */
export const MAX_HELP_CHAT_CONVERSATION_MESSAGE_COUNT = 8

export const helpChatMessageSchema = z.object({
  role: z.enum(['visitor', 'assistant']),
  text: z.string().trim().min(1).max(MAX_HELP_CHAT_MESSAGE_LENGTH),
})
export type HelpChatMessage = z.infer<typeof helpChatMessageSchema>

/** The conversation so far, oldest first, ending with the visitor's new question. */
export const askHelpChatBodySchema = z.object({
  messages: z
    .array(helpChatMessageSchema)
    .min(1)
    .max(MAX_HELP_CHAT_CONVERSATION_MESSAGE_COUNT)
    .refine((messages) => messages.at(-1)?.role === 'visitor', {
      message: 'must end with the visitor’s question',
    }),
})
export type AskHelpChatBody = z.infer<typeof askHelpChatBodySchema>

/**
 * `answered`: the answer and up to two help topic ids (anchors on /help).
 * `monthlyCapReached`: this month's budget is spent, so the widget points at /help instead.
 */
export const askHelpChatResponseSchema = z.discriminatedUnion('status', [
  z.object({
    status: z.literal('answered'),
    answerText: z.string(),
    helpTopicIds: z.array(z.string()),
  }),
  z.object({ status: z.literal('monthlyCapReached') }),
])
export type AskHelpChatResponse = z.infer<typeof askHelpChatResponseSchema>
