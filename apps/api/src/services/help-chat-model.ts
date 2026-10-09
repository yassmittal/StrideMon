import type { HelpChatModelMessage } from '../lib/help-chat/build-help-chat-prompt'
import { HELP_CHAT_MODEL } from '../lib/help-chat/help-chat-cost'

// Amazon Bedrock's OpenAI-compatible endpoint in us-east-1 (D-048). A Bedrock API key is its
// bearer token, so no AWS SDK is needed.
const BEDROCK_CHAT_COMPLETIONS_URL = 'https://bedrock-mantle.us-east-1.api.aws/v1/chat/completions'
const BEDROCK_TIMEOUT_MILLISECONDS = 30_000

// Room for three sentences or five short steps, plus the TOPICS line. It also caps each reply's cost.
const MAX_OUTPUT_TOKEN_COUNT = 400
// Low, so the same question gets much the same answer.
const SAMPLING_TEMPERATURE = 0.2

export type HelpChatCompletion = {
  modelText: string
  inputTokenCount: number
  outputTokenCount: number
}

export type HelpChatModel = {
  /** Asks the model. Throws if Bedrock can't be reached or answers with an error. */
  completeHelpChat: (messages: readonly HelpChatModelMessage[]) => Promise<HelpChatCompletion>
}

export function createBedrockHelpChatModel({
  bedrockApiKey,
  modelId = HELP_CHAT_MODEL.modelId,
}: {
  bedrockApiKey: string
  /** `bun run help:check-answers --model` tries another; the API always uses HELP_CHAT_MODEL's. */
  modelId?: string
}): HelpChatModel {
  return {
    completeHelpChat: async (messages) => {
      const response = await fetch(BEDROCK_CHAT_COMPLETIONS_URL, {
        method: 'POST',
        headers: {
          authorization: `Bearer ${bedrockApiKey}`,
          'content-type': 'application/json',
        },
        body: JSON.stringify({
          model: modelId,
          messages,
          max_tokens: MAX_OUTPUT_TOKEN_COUNT,
          temperature: SAMPLING_TEMPERATURE,
        }),
        signal: AbortSignal.timeout(BEDROCK_TIMEOUT_MILLISECONDS),
      })
      if (!response.ok) {
        // The body names the problem (a bad key, a throttle) and never echoes the key.
        const errorText = (await response.text()).slice(0, 500)
        throw new Error(`Bedrock answered ${response.status}: ${errorText}`)
      }
      return toHelpChatCompletion(await response.json())
    },
  }
}

/** For development and tests without a key: every question is "unavailable". */
export function createUnavailableHelpChatModel(): HelpChatModel {
  return {
    completeHelpChat: async () => {
      throw new Error('BEDROCK_API_KEY is not set, so the help chatbot has no model')
    },
  }
}

function toHelpChatCompletion(completionBody: unknown): HelpChatCompletion {
  if (!isRecord(completionBody)) throw new Error('Bedrock answered with no completion')
  const firstChoice = Array.isArray(completionBody.choices) ? completionBody.choices[0] : undefined
  const message = isRecord(firstChoice) ? firstChoice.message : undefined
  const modelText = isRecord(message) ? message.content : undefined
  const usage = completionBody.usage
  if (typeof modelText !== 'string' || !isRecord(usage)) {
    throw new Error('Bedrock answered without a message or its usage')
  }
  return {
    modelText,
    inputTokenCount: readTokenCount(usage.prompt_tokens),
    outputTokenCount: readTokenCount(usage.completion_tokens),
  }
}

function readTokenCount(tokenCount: unknown): number {
  return typeof tokenCount === 'number' && Number.isFinite(tokenCount) && tokenCount > 0
    ? tokenCount
    : 0
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null
}
