import fastifyPlugin from 'fastify-plugin'
import { createCachedFoundingPassCollectionReader } from '../services/cached-founding-pass-collection-reader'
import {
  createBrevoEmailSender,
  createLoggingEmailSender,
  type EmailSender,
} from '../services/email-sender'
import { readFoundingPassCollectionState } from '../services/founding-pass-chain-reader'
import {
  createGoogleIdTokenVerifier,
  type GoogleIdTokenVerifier,
} from '../services/google-id-token-verifier'
import {
  createTurnstileVerifier,
  readTurnstileHostnames,
  type TurnstileVerifier,
} from '../services/turnstile-verifier'

// "Cached a few seconds" (brief §10.2): the gallery polls, and mint day is a rush.
const COLLECTION_CACHE_MILLISECONDS = 3_000

export type PassServicesPluginOptions = {
  /** Tests only: captures emails instead of sending or logging them. */
  emailSender?: EmailSender
  /** Tests only: answers Turnstile checks without calling Cloudflare. */
  turnstileVerifier?: TurnstileVerifier
  /** Tests only: checks Google ID tokens against the tests' own signing key. */
  googleIdTokenVerifier?: GoogleIdTokenVerifier
}

/**
 * The Founding Pass's outside services (D-043): the email sender (Brevo in production, the log in
 * development), the Turnstile check, the Google ID-token check (D-057; `null` without
 * `GOOGLE_CLIENT_ID`), and the collection's cached chain read.
 */
export const passServicesPlugin = fastifyPlugin<PassServicesPluginOptions>(
  async (fastify, options) => {
    const { nodeEnvironment, brevoApiKey, emailSenderAddress, turnstileSecretKey, googleClientId } =
      fastify.config
    const productionEmailSender =
      nodeEnvironment === 'production' && brevoApiKey !== null
        ? createBrevoEmailSender({ brevoApiKey, senderAddress: emailSenderAddress })
        : null

    fastify.decorate(
      'emailSender',
      options.emailSender ?? productionEmailSender ?? createLoggingEmailSender(fastify.log),
    )
    fastify.decorate(
      'turnstileVerifier',
      options.turnstileVerifier ??
        createTurnstileVerifier({
          turnstileSecretKey,
          allowedHostnames: readTurnstileHostnames(fastify.config.waitlistAllowedOrigins),
        }),
    )
    fastify.decorate(
      'googleIdTokenVerifier',
      googleClientId === null
        ? null
        : (options.googleIdTokenVerifier ?? createGoogleIdTokenVerifier({ googleClientId })),
    )
    fastify.decorate(
      'foundingPassCollectionReader',
      createCachedFoundingPassCollectionReader({
        readCollectionState: () =>
          readFoundingPassCollectionState({
            publicClient: fastify.chain.publicClient,
            contractAddresses: fastify.config.contractAddresses,
          }),
        cacheMilliseconds: COLLECTION_CACHE_MILLISECONDS,
      }),
    )
  },
  { name: 'pass-services', dependencies: ['env', 'chain-clients'] },
)
