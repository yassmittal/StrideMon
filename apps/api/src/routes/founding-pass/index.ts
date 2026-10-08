import type { FastifyPluginAsyncZod } from 'fastify-type-provider-zod'
import { readFoundingPassCollection } from '../../handlers/founding-pass/read-founding-pass-collection'
import { readFoundingPassMint } from '../../handlers/founding-pass/read-founding-pass-mint'
import { requestFoundingPassMint } from '../../handlers/founding-pass/request-founding-pass-mint'
import { sendPassEmailCode } from '../../handlers/founding-pass/send-pass-email-code'
import { verifyPassEmailCode } from '../../handlers/founding-pass/verify-pass-email-code'
import { readAuthenticatedUser } from '../../plugins/authentication'
import {
  readFoundingPassCollectionRouteSchema,
  readFoundingPassMintRouteSchema,
  requestFoundingPassMintRouteSchema,
  sendPassEmailCodeRouteSchema,
  verifyPassEmailCodeRouteSchema,
} from './schemas'

// Public routes from a web page, each with its own budget per IP (D-043). The reveal polls its
// mint about once a second, and the gallery polls the collection every few seconds.
const SEND_EMAIL_CODE_RATE_LIMIT = { max: 5, timeWindow: '1 minute' }
const VERIFY_EMAIL_CODE_RATE_LIMIT = { max: 10, timeWindow: '1 minute' }
const REQUEST_MINT_RATE_LIMIT = { max: 10, timeWindow: '1 minute' }
const READ_MINT_RATE_LIMIT = { max: 60, timeWindow: '1 minute' }
const READ_COLLECTION_RATE_LIMIT = { max: 60, timeWindow: '1 minute' }

// plugins/cors.ts opens every /v1/pass/* route to the website's origins.

export const foundingPassRoutes: FastifyPluginAsyncZod = async (fastify) => {
  fastify.post(
    '/pass/email-code',
    { schema: sendPassEmailCodeRouteSchema, config: { rateLimit: SEND_EMAIL_CODE_RATE_LIMIT } },
    (request) =>
      sendPassEmailCode({
        database: fastify.mongo.database,
        emailProofSecret: fastify.config.emailProofSecret,
        emailSender: fastify.emailSender,
        turnstileVerifier: fastify.turnstileVerifier,
        body: request.body,
        remoteIpAddress: request.ip,
        now: new Date(),
        log: request.log,
      }),
  )

  fastify.post(
    '/pass/email-verify',
    { schema: verifyPassEmailCodeRouteSchema, config: { rateLimit: VERIFY_EMAIL_CODE_RATE_LIMIT } },
    (request) =>
      verifyPassEmailCode({
        database: fastify.mongo.database,
        emailProofSecret: fastify.config.emailProofSecret,
        body: request.body,
        now: new Date(),
      }),
  )

  fastify.post(
    '/pass/mints',
    {
      schema: requestFoundingPassMintRouteSchema,
      preHandler: fastify.authenticate,
      config: { rateLimit: REQUEST_MINT_RATE_LIMIT },
    },
    async (request, reply) => {
      const { isNewMint, ...mintResponse } = await requestFoundingPassMint({
        database: fastify.mongo.database,
        apiConfig: fastify.config,
        publicClient: fastify.chain.publicClient,
        contractAddresses: fastify.config.contractAddresses,
        collectionReader: fastify.foundingPassCollectionReader,
        turnstileVerifier: fastify.turnstileVerifier,
        authenticatedUser: readAuthenticatedUser(request),
        body: request.body,
        remoteIpAddress: request.ip,
        now: new Date(),
      })
      return reply.status(isNewMint ? 201 : 200).send(mintResponse)
    },
  )

  fastify.get(
    '/pass/mints/:mintId',
    {
      schema: readFoundingPassMintRouteSchema,
      preHandler: fastify.authenticate,
      config: { rateLimit: READ_MINT_RATE_LIMIT },
    },
    (request) =>
      readFoundingPassMint({
        database: fastify.mongo.database,
        authenticatedUser: readAuthenticatedUser(request),
        mintId: request.params.mintId,
      }),
  )

  fastify.get(
    '/pass/collection',
    {
      schema: readFoundingPassCollectionRouteSchema,
      config: { rateLimit: READ_COLLECTION_RATE_LIMIT },
    },
    () =>
      readFoundingPassCollection({
        database: fastify.mongo.database,
        apiConfig: fastify.config,
        collectionReader: fastify.foundingPassCollectionReader,
        now: new Date(),
      }),
  )
}
