import fastifyPlugin from 'fastify-plugin'
import {
  createBrevoEmailSender,
  createLoggingEmailSender,
  type EmailSender,
} from '../services/email-sender'

type EmailSenderPluginOptions = {
  /** Tests only: a sender that records emails instead of sending them. */
  emailSenderOverride?: EmailSender
}

/** Decorates `fastify.emailSender`: Brevo when there's a key, else the console (D-041). */
export const emailSenderPlugin = fastifyPlugin<EmailSenderPluginOptions>(
  async (fastify, options) => {
    const { brevoApiKey, emailSenderAddress } = fastify.config
    const emailSender =
      options.emailSenderOverride ??
      (brevoApiKey === null
        ? createLoggingEmailSender(fastify.log)
        : createBrevoEmailSender({ apiKey: brevoApiKey, senderAddress: emailSenderAddress }))
    fastify.decorate('emailSender', emailSender)
  },
  { name: 'email-sender', dependencies: ['env'] },
)
