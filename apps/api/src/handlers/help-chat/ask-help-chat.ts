import type { AskHelpChatBody, AskHelpChatResponse } from '@stridemon/shared/api-contracts'
import type { FastifyBaseLogger } from 'fastify'
import type { Db } from 'mongodb'
import { ApiError } from '../../common/api-error'
import { calculateHelpChatCostUsd, toHelpChatUsageMonth } from '../../lib/help-chat/help-chat-cost'
import {
  addHelpChatAnswerUsage,
  readHelpChatMonthTokenCounts,
} from '../../repositories/help-chat-usage-repository'
import type { HelpChatModel } from '../../services/help-chat-model'
import { type HelpChatReplyOutcome, requestHelpChatReply } from './request-help-chat-reply'

/**
 * Answers a question on the website from the help page's text (Part 8, D-048). Past this month's
 * cap it answers `monthlyCapReached` without asking the model. Nothing of the conversation is
 * kept or logged: only the month's token counts.
 */
export async function askHelpChat({
  database,
  helpChatModel,
  monthlyCapUsd,
  body,
  logger,
  now,
}: {
  database: Db
  helpChatModel: HelpChatModel
  monthlyCapUsd: number
  body: AskHelpChatBody
  logger: FastifyBaseLogger
  now: Date
}): Promise<AskHelpChatResponse> {
  const usageMonth = toHelpChatUsageMonth(now)
  const monthTokenCounts = await readHelpChatMonthTokenCounts(database, usageMonth)
  if (calculateHelpChatCostUsd(monthTokenCounts) >= monthlyCapUsd) {
    return { status: 'monthlyCapReached' }
  }

  let outcome: HelpChatReplyOutcome
  try {
    outcome = await requestHelpChatReply({ conversation: body.messages, helpChatModel })
  } catch (error) {
    // Only the error: the conversation never reaches the log.
    logger.error(
      { error: error instanceof Error ? error.message : String(error) },
      'help chat failed',
    )
    throw new ApiError('HELP_CHAT_UNAVAILABLE', 503)
  }

  if (outcome.tokenCounts !== null) {
    await addHelpChatAnswerUsage(database, { usageMonth, tokenCounts: outcome.tokenCounts, now })
  }
  return { status: 'answered', ...outcome.reply }
}
