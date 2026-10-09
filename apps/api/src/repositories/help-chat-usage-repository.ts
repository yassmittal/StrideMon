import type { Collection, Db } from 'mongodb'
import type { HelpChatTokenCounts } from '../lib/help-chat/help-chat-cost'

/**
 * The help chatbot's spend for one UTC month (data-model.md → helpChatUsage, D-048). Counts only:
 * never a question, an answer or an IP address.
 */
export type HelpChatUsageDocument = {
  /** The month, `2026-10`. */
  _id: string
  inputTokenCount: number
  outputTokenCount: number
  /** Answers that used the model. */
  answerCount: number
  updatedAt: Date
}

export function getHelpChatUsageCollection(database: Db): Collection<HelpChatUsageDocument> {
  return database.collection<HelpChatUsageDocument>('helpChatUsage')
}

/** The month's token counts so far: zero for a month with no answers yet. */
export async function readHelpChatMonthTokenCounts(
  database: Db,
  usageMonth: string,
): Promise<HelpChatTokenCounts> {
  const usage = await getHelpChatUsageCollection(database).findOne({ _id: usageMonth })
  return {
    inputTokenCount: usage?.inputTokenCount ?? 0,
    outputTokenCount: usage?.outputTokenCount ?? 0,
  }
}

/** Adds one answer's tokens to its month. */
export async function addHelpChatAnswerUsage(
  database: Db,
  {
    usageMonth,
    tokenCounts,
    now,
  }: { usageMonth: string; tokenCounts: HelpChatTokenCounts; now: Date },
): Promise<void> {
  await getHelpChatUsageCollection(database).updateOne(
    { _id: usageMonth },
    {
      $inc: {
        inputTokenCount: tokenCounts.inputTokenCount,
        outputTokenCount: tokenCounts.outputTokenCount,
        answerCount: 1,
      },
      $set: { updatedAt: now },
    },
    { upsert: true },
  )
}
