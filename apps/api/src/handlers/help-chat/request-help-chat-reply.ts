import type { HelpChatMessage } from '@stridemon/shared/api-contracts'
import { buildHelpChatModelMessages } from '../../lib/help-chat/build-help-chat-prompt'
import type { HelpChatTokenCounts } from '../../lib/help-chat/help-chat-cost'
import { type HelpChatReply, parseHelpChatReply } from '../../lib/help-chat/parse-help-chat-reply'
import { containsWalletSecret, WALLET_SECRET_REPLY } from '../../lib/help-chat/wallet-secret'
import type { HelpChatModel } from '../../services/help-chat-model'

export type HelpChatReplyOutcome = {
  reply: HelpChatReply
  /** What the model used, to count toward the monthly cap. `null` when it wasn't asked. */
  tokenCounts: HelpChatTokenCounts | null
}

/**
 * Answers the visitor's last question (D-048). A question holding a wallet secret gets the fixed
 * safety answer and never reaches the model. Throws if the model can't be reached or says nothing
 * usable. The route and `bun run help:check-answers` both answer through here.
 */
export async function requestHelpChatReply({
  conversation,
  helpChatModel,
}: {
  conversation: readonly HelpChatMessage[]
  helpChatModel: HelpChatModel
}): Promise<HelpChatReplyOutcome> {
  const question = conversation.at(-1)
  if (question !== undefined && containsWalletSecret(question.text)) {
    return {
      reply: {
        answerText: WALLET_SECRET_REPLY.answerText,
        helpTopicIds: [...WALLET_SECRET_REPLY.helpTopicIds],
      },
      tokenCounts: null,
    }
  }

  const completion = await helpChatModel.completeHelpChat(buildHelpChatModelMessages(conversation))
  const reply = parseHelpChatReply(completion.modelText)
  if (reply === null) throw new Error('The help chat model answered with no text')
  return {
    reply,
    tokenCounts: {
      inputTokenCount: completion.inputTokenCount,
      outputTokenCount: completion.outputTokenCount,
    },
  }
}
