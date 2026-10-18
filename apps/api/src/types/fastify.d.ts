import type { Db, MongoClient } from 'mongodb'
import type { AuthenticatedUser } from '../plugins/authentication'
import type { ChainClients } from '../plugins/chain-clients'
import type { ApiConfig } from '../plugins/env'
import type { CachedFoundingPassCollectionReader } from '../services/cached-founding-pass-collection-reader'
import type { EmailSender } from '../services/email-sender'
import type { GoogleIdTokenVerifier } from '../services/google-id-token-verifier'
import type { HelpChatModel } from '../services/help-chat-model'
import type { TurnstileVerifier } from '../services/turnstile-verifier'

declare module 'fastify' {
  interface FastifyInstance {
    config: ApiConfig
    mongo: { client: MongoClient; database: Db }
    chain: ChainClients
    authenticate: (request: FastifyRequest) => Promise<void>
    emailSender: EmailSender
    turnstileVerifier: TurnstileVerifier
    /** `null` without `GOOGLE_CLIENT_ID` (D-057). */
    googleIdTokenVerifier: GoogleIdTokenVerifier | null
    foundingPassCollectionReader: CachedFoundingPassCollectionReader
    helpChatModel: HelpChatModel
  }

  interface FastifyRequest {
    /** Set by `fastify.authenticate`; `null` on routes without it. */
    authenticatedUser: AuthenticatedUser | null
  }
}
