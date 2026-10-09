// The browser side of `POST /v1/help/chat` (D-048). The site never imports `@stridemon/shared`
// (D-035), so this mirrors the API's contract by hand.

import type { HelpChatProblemKey } from '@/content/help-chat'

/** The API's limits: 500 characters a message, the last 8 messages. */
export const MAX_HELP_CHAT_MESSAGE_LENGTH = 500
const MAX_HELP_CHAT_CONVERSATION_MESSAGE_COUNT = 8

const REQUEST_TIMEOUT_MILLISECONDS = 40_000
const HTTP_STATUS_TOO_MANY_REQUESTS = 429

export type HelpChatMessage = {
  role: 'visitor' | 'assistant'
  text: string
  /** Anchors on /help, for an answer. */
  helpTopicIds?: readonly string[]
}

export type HelpChatOutcome =
  | { kind: 'answered'; answerText: string; helpTopicIds: string[] }
  | { kind: 'problem'; problemKey: HelpChatProblemKey }

/** Sends the conversation, which must end with the visitor's question, and reads the answer. */
export async function askHelpChat(
  apiUrl: string,
  conversation: readonly HelpChatMessage[],
): Promise<HelpChatOutcome> {
  try {
    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({
        messages: conversation
          .slice(-MAX_HELP_CHAT_CONVERSATION_MESSAGE_COUNT)
          .map((message) => ({ role: message.role, text: message.text })),
      }),
      signal: AbortSignal.timeout(REQUEST_TIMEOUT_MILLISECONDS),
    })
    if (response.status === HTTP_STATUS_TOO_MANY_REQUESTS) {
      return { kind: 'problem', problemKey: 'tooManyQuestions' }
    }
    if (!response.ok) return { kind: 'problem', problemKey: 'unavailable' }
    return toHelpChatOutcome(await response.json())
  } catch {
    // Offline, timed out, or blocked by CORS.
    return { kind: 'problem', problemKey: 'unreachable' }
  }
}

function toHelpChatOutcome(responseBody: unknown): HelpChatOutcome {
  if (!isRecord(responseBody)) return { kind: 'problem', problemKey: 'unavailable' }
  if (responseBody.status === 'monthlyCapReached') {
    return { kind: 'problem', problemKey: 'monthlyCapReached' }
  }
  if (responseBody.status !== 'answered' || typeof responseBody.answerText !== 'string') {
    return { kind: 'problem', problemKey: 'unavailable' }
  }
  const helpTopicIds = Array.isArray(responseBody.helpTopicIds)
    ? responseBody.helpTopicIds.filter((topicId): topicId is string => typeof topicId === 'string')
    : []
  return { kind: 'answered', answerText: responseBody.answerText, helpTopicIds }
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null
}
