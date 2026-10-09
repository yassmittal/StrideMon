// The help chatbot's model and what it costs (Part 8, D-048). The price is Amazon Bedrock's list
// price in us-east-1: change both together, and check AWS's pricing page when you do.
export const HELP_CHAT_MODEL = {
  modelId: 'deepseek.v3.2',
  inputUsdPerMillionTokens: 0.62,
  outputUsdPerMillionTokens: 1.85,
} as const

const TOKENS_PER_MILLION = 1_000_000

export type HelpChatTokenCounts = {
  inputTokenCount: number
  outputTokenCount: number
}

/** What these tokens cost at the model's list price, in US dollars. */
export function calculateHelpChatCostUsd({
  inputTokenCount,
  outputTokenCount,
}: HelpChatTokenCounts): number {
  return (
    (inputTokenCount * HELP_CHAT_MODEL.inputUsdPerMillionTokens +
      outputTokenCount * HELP_CHAT_MODEL.outputUsdPerMillionTokens) /
    TOKENS_PER_MILLION
  )
}

/** The calendar month a reply counts toward, in UTC (`2026-10`), as AWS bills. */
export function toHelpChatUsageMonth(now: Date): string {
  return now.toISOString().slice(0, 7)
}
