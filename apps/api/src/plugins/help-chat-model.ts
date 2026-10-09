import fastifyPlugin from 'fastify-plugin'
import {
  createBedrockHelpChatModel,
  createUnavailableHelpChatModel,
  type HelpChatModel,
} from '../services/help-chat-model'

export type HelpChatModelPluginOptions = {
  /** Tests only: answers without calling Bedrock. */
  helpChatModel?: HelpChatModel
}

/** The help chatbot's model (D-048): Bedrock when the key is set, otherwise always unavailable. */
export const helpChatModelPlugin = fastifyPlugin<HelpChatModelPluginOptions>(
  async (fastify, options) => {
    const { bedrockApiKey } = fastify.config
    fastify.decorate(
      'helpChatModel',
      options.helpChatModel ??
        (bedrockApiKey === null
          ? createUnavailableHelpChatModel()
          : createBedrockHelpChatModel({ bedrockApiKey })),
    )
  },
  { name: 'help-chat-model', dependencies: ['env'] },
)
