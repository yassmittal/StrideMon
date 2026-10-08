import { afterEach, beforeEach, describe, expect, it } from 'bun:test'
import {
  apiErrorResponseSchema,
  sendPassEmailCodeResponseSchema,
  verifyPassEmailCodeResponseSchema,
} from '@stridemon/shared/api-contracts'
import type { ApiErrorCode } from '@stridemon/shared/domain'
import type { FastifyInstance, LightMyRequestResponse } from 'fastify'
import { verifyEmailProof } from '../../lib/founding-pass/email-proof'
import { getPassEmailCodesCollection } from '../../repositories/pass-email-codes-repository'
import { insertWaitlistSignupIfNew } from '../../repositories/waitlist-signups-repository'
import type { OutgoingEmail } from '../../services/email-sender'
import { buildTestServer, TEST_EMAIL_PROOF_SECRET } from '../../test-support/build-test-server'
import {
  buildTestRemoteAddress,
  createCapturingEmailSender,
  TEST_TURNSTILE_TOKEN,
} from '../../test-support/fake-pass-services'

const EMAIL = 'runner@example.com'

let server: FastifyInstance
let sentEmails: OutgoingEmail[]

beforeEach(async () => {
  const capturingEmailSender = createCapturingEmailSender()
  sentEmails = capturingEmailSender.sentEmails
  server = await buildTestServer({
    passServices: { emailSender: capturingEmailSender.emailSender },
  })
})

afterEach(async () => {
  await server.close()
})

describe('POST /v1/pass/email-code', () => {
  it('emails a 6-digit code and stores only its hash', async () => {
    const response = await requestEmailCode(' Runner@Example.com ')

    expect(response.statusCode).toBe(200)
    expect(sendPassEmailCodeResponseSchema.parse(response.json())).toEqual({ status: 'sent' })
    expect(sentEmails).toHaveLength(1)
    expect(sentEmails[0]?.toEmailAddress).toBe(EMAIL)
    const emailCode = readLastEmailCode()
    const storedCode = await getPassEmailCodesCollection(server.mongo.database).findOne({
      email: EMAIL,
    })
    expect(storedCode?.codeHash).toMatch(/^[0-9a-f]{64}$/)
    expect(JSON.stringify(storedCode)).not.toContain(emailCode)
  })

  it('answers the same for an email on the waitlist and one nobody has seen', async () => {
    await insertWaitlistSignupIfNew(server.mongo.database, {
      email: EMAIL,
      phonePlatform: null,
      source: null,
      createdAt: new Date(),
    })

    const knownResponse = await requestEmailCode(EMAIL)
    const newResponse = await requestEmailCode('stranger@example.com')

    expect(newResponse.statusCode).toBe(knownResponse.statusCode)
    expect(newResponse.json()).toEqual(knownResponse.json())
  })

  it('refuses a failed robot check and sends nothing (TURNSTILE_FAILED)', async () => {
    const response = await requestEmailCode(EMAIL, 'a-bot-token')

    expectApiError(response, 403, 'TURNSTILE_FAILED')
    expect(sentEmails).toHaveLength(0)
  })

  it('sends one code a minute per email (EMAIL_CODE_RECENTLY_SENT)', async () => {
    await requestEmailCode(EMAIL)

    const response = await requestEmailCode(EMAIL)

    const errorBody = expectApiError(response, 429, 'EMAIL_CODE_RECENTLY_SENT')
    expect(errorBody.error.details?.retryAfterSeconds).toBeGreaterThan(0)
    expect(sentEmails).toHaveLength(1)
  })

  it('sends a new code once the minute has passed, and only the new one works', async () => {
    await requestEmailCode(EMAIL)
    const firstCode = readLastEmailCode()
    await moveEmailCodeSentAtBack(61_000)

    await requestEmailCode(EMAIL)

    expect(sentEmails).toHaveLength(2)
    const secondCode = readLastEmailCode()
    if (firstCode !== secondCode) {
      expectApiError(await requestEmailVerify(firstCode), 400, 'EMAIL_CODE_INCORRECT')
    }
    expect((await requestEmailVerify(secondCode)).statusCode).toBe(200)
  })
})

describe('POST /v1/pass/email-verify', () => {
  it('turns the right code into an email proof for that email', async () => {
    await requestEmailCode(EMAIL)

    const response = await requestEmailVerify(readLastEmailCode())

    expect(response.statusCode).toBe(200)
    const { emailProof } = verifyPassEmailCodeResponseSchema.parse(response.json())
    expect(
      await verifyEmailProof({
        emailProof,
        emailProofSecret: TEST_EMAIL_PROOF_SECRET,
        now: new Date(),
      }),
    ).toBe(EMAIL)
  })

  it('counts wrong tries down, then refuses the code after 5 (the limits)', async () => {
    await requestEmailCode(EMAIL)
    const wrongCode = readLastEmailCode() === '000000' ? '111111' : '000000'

    const firstTry = await requestEmailVerify(wrongCode)
    for (let attempt = 2; attempt <= 4; attempt++) await requestEmailVerify(wrongCode)
    const fifthTry = await requestEmailVerify(wrongCode)
    const rightCodeAfterwards = await requestEmailVerify(readLastEmailCode())

    expect(expectApiError(firstTry, 400, 'EMAIL_CODE_INCORRECT').error.details).toEqual({
      attemptsLeft: 4,
    })
    expectApiError(fifthTry, 429, 'EMAIL_CODE_TOO_MANY_ATTEMPTS')
    expectApiError(rightCodeAfterwards, 429, 'EMAIL_CODE_TOO_MANY_ATTEMPTS')
  })

  it('lets a code work once (EMAIL_CODE_EXPIRED after)', async () => {
    await requestEmailCode(EMAIL)
    const emailCode = readLastEmailCode()
    await requestEmailVerify(emailCode)

    expectApiError(await requestEmailVerify(emailCode), 400, 'EMAIL_CODE_EXPIRED')
  })

  it('refuses a code after its 10 minutes (EMAIL_CODE_EXPIRED)', async () => {
    await requestEmailCode(EMAIL)
    await getPassEmailCodesCollection(server.mongo.database).updateOne(
      { email: EMAIL },
      { $set: { expiresAt: new Date(Date.now() - 1000) } },
    )

    expectApiError(await requestEmailVerify(readLastEmailCode()), 400, 'EMAIL_CODE_EXPIRED')
  })
})

function requestEmailCode(email: string, turnstileToken = TEST_TURNSTILE_TOKEN) {
  return server.inject({
    method: 'POST',
    url: '/v1/pass/email-code',
    payload: { email, turnstileToken },
    remoteAddress: buildTestRemoteAddress(),
  })
}

function requestEmailVerify(code: string) {
  return server.inject({
    method: 'POST',
    url: '/v1/pass/email-verify',
    payload: { email: EMAIL, code },
    remoteAddress: buildTestRemoteAddress(),
  })
}

function readLastEmailCode(): string {
  const emailCode = /Your code is (\d{6})\./.exec(sentEmails.at(-1)?.textBody ?? '')?.[1]
  if (emailCode === undefined) throw new Error('No code email was sent')
  return emailCode
}

async function moveEmailCodeSentAtBack(milliseconds: number): Promise<void> {
  await getPassEmailCodesCollection(server.mongo.database).updateOne(
    { email: EMAIL },
    { $set: { sentAt: new Date(Date.now() - milliseconds) } },
  )
}

function expectApiError(response: LightMyRequestResponse, statusCode: number, code: ApiErrorCode) {
  expect(response.statusCode).toBe(statusCode)
  const errorBody = apiErrorResponseSchema.parse(response.json())
  expect(errorBody.error.code).toBe(code)
  return errorBody
}
