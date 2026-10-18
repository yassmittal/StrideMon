import { afterEach, beforeEach, describe, expect, it } from 'bun:test'
import {
  apiErrorResponseSchema,
  sendPassEmailCodeResponseSchema,
  verifyPassEmailCodeResponseSchema,
} from '@stridemon/shared/api-contracts'
import type { ApiErrorCode, EmailCodePurpose } from '@stridemon/shared/domain'
import type { FastifyInstance, LightMyRequestResponse } from 'fastify'
import { formatUtcDay } from '../../lib/email/email-day'
import { verifyEmailProof } from '../../lib/founding-pass/email-proof'
import {
  getEmailDailyCountsCollection,
  readDailyEmailCount,
} from '../../repositories/email-daily-counts-repository'
import { getPassEmailCodesCollection } from '../../repositories/pass-email-codes-repository'
import { EmailRefusedError, type OutgoingEmail } from '../../services/email-sender'
import { GoogleSignInUnavailableError } from '../../services/google-id-token-verifier'
import { buildTestServer, TEST_EMAIL_PROOF_SECRET } from '../../test-support/build-test-server'
import { signTestGoogleIdToken } from '../../test-support/fake-google-sign-in'
import {
  buildTestRemoteAddress,
  createCapturingEmailSender,
  TEST_TURNSTILE_TOKEN,
} from '../../test-support/fake-pass-services'
import { insertTestWaitlistSignup } from '../../test-support/insert-test-waitlist-signup'

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
    await insertTestWaitlistSignup(server.mongo.database, { email: EMAIL })

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

describe('the daily email budget (D-057)', () => {
  it('words a waitlist code for the waitlist and counts it for the day', async () => {
    const response = await requestEmailCode(EMAIL, TEST_TURNSTILE_TOKEN, 'waitlist')

    expect(response.statusCode).toBe(200)
    expect(sentEmails[0]?.textBody).toContain('to confirm your email for the StrideMon waitlist')
    expect(await readDailyEmailCount(server.mongo.database, formatUtcDay(new Date()))).toBe(1)
  })

  it('refuses waitlist codes once the day reaches the limit, while mint codes still go', async () => {
    // The test limit is 250: one place is left.
    await setTodaysEmailCount(249)

    const lastWaitlistCode = await requestEmailCode(EMAIL, TEST_TURNSTILE_TOKEN, 'waitlist')
    const refusedWaitlistCode = await requestEmailCode(
      'friend@example.com',
      TEST_TURNSTILE_TOKEN,
      'waitlist',
    )
    const mintCode = await requestEmailCode('minter@example.com')

    expect(lastWaitlistCode.statusCode).toBe(200)
    const errorBody = expectApiError(refusedWaitlistCode, 429, 'EMAIL_DAILY_LIMIT_REACHED')
    expect(errorBody.error.details?.retryAfterSeconds).toBeGreaterThan(0)
    expect(errorBody.error.details?.retryAfterSeconds).toBeLessThanOrEqual(86_400)
    expect(mintCode.statusCode).toBe(200)
    expect(sentEmails.map((sentEmail) => sentEmail.toEmailAddress)).toEqual([
      EMAIL,
      'minter@example.com',
    ])
    expect(await readDailyEmailCount(server.mongo.database, formatUtcDay(new Date()))).toBe(251)
    // The refused code left nothing behind, so it can be asked for again tomorrow.
    expect(
      await getPassEmailCodesCollection(server.mongo.database).countDocuments({
        email: 'friend@example.com',
      }),
    ).toBe(0)
  })

  it('gives the place back when the provider refuses the email', async () => {
    await server.close()
    server = await buildTestServer({
      passServices: {
        emailSender: {
          sendEmail: async () => {
            throw new EmailRefusedError('Brevo refused the email: 402')
          },
        },
      },
    })

    const response = await requestEmailCode(EMAIL, TEST_TURNSTILE_TOKEN, 'waitlist')

    expectApiError(response, 503, 'EMAIL_SEND_FAILED')
    expect(await readDailyEmailCount(server.mongo.database, formatUtcDay(new Date()))).toBe(0)
  })
})

describe('POST /v1/pass/email-google', () => {
  it('turns a valid Google ID token into an email proof checked by Google', async () => {
    const response = await requestEmailGoogle(
      await signTestGoogleIdToken({ email: 'Runner@Example.com' }),
    )

    expect(response.statusCode).toBe(200)
    const { email, emailProof } = verifyPassEmailCodeResponseSchema.parse(response.json())
    expect(email).toBe(EMAIL)
    expect(
      await verifyEmailProof({
        emailProof,
        emailProofSecret: TEST_EMAIL_PROOF_SECRET,
        now: new Date(),
      }),
    ).toEqual({ email: EMAIL, emailCheckMethod: 'google' })
    expect(sentEmails).toHaveLength(0)
  })

  it('refuses an email Google has not verified (GOOGLE_SIGN_IN_FAILED)', async () => {
    const response = await requestEmailGoogle(
      await signTestGoogleIdToken({ email: EMAIL, isEmailVerified: false }),
    )

    expectApiError(response, 401, 'GOOGLE_SIGN_IN_FAILED')
  })

  it('refuses a token made for another site (GOOGLE_SIGN_IN_FAILED)', async () => {
    const response = await requestEmailGoogle(
      await signTestGoogleIdToken({
        email: EMAIL,
        audience: '999999999999-anotherclient.apps.googleusercontent.com',
      }),
    )

    expectApiError(response, 401, 'GOOGLE_SIGN_IN_FAILED')
  })

  it('refuses an expired token, another issuer, or something that is not a token', async () => {
    const expiredToken = await signTestGoogleIdToken({
      email: EMAIL,
      issuedAt: new Date(Date.now() - 2 * 3_600_000),
    })
    const otherIssuerToken = await signTestGoogleIdToken({
      email: EMAIL,
      issuer: 'https://evil.example',
    })

    expectApiError(await requestEmailGoogle(expiredToken), 401, 'GOOGLE_SIGN_IN_FAILED')
    expectApiError(await requestEmailGoogle(otherIssuerToken), 401, 'GOOGLE_SIGN_IN_FAILED')
    expectApiError(await requestEmailGoogle('not-a-token'), 401, 'GOOGLE_SIGN_IN_FAILED')
  })

  it('says Google is unavailable without a client id, or when its keys cannot be read', async () => {
    const serverWithoutGoogle = await buildTestServer({
      environmentOverrides: { GOOGLE_CLIENT_ID: undefined },
    })
    const serverWithGoogleDown = await buildTestServer({
      passServices: {
        googleIdTokenVerifier: {
          checkGoogleIdToken: async () => {
            throw new GoogleSignInUnavailableError(new Error('timeout'))
          },
        },
      },
    })
    const googleIdToken = await signTestGoogleIdToken({ email: EMAIL })

    try {
      expectApiError(
        await requestEmailGoogle(googleIdToken, serverWithoutGoogle),
        503,
        'GOOGLE_SIGN_IN_UNAVAILABLE',
      )
      expectApiError(
        await requestEmailGoogle(googleIdToken, serverWithGoogleDown),
        503,
        'GOOGLE_SIGN_IN_UNAVAILABLE',
      )
    } finally {
      await serverWithoutGoogle.close()
      await serverWithGoogleDown.close()
    }
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
    ).toEqual({ email: EMAIL, emailCheckMethod: 'code' })
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

function requestEmailCode(
  email: string,
  turnstileToken = TEST_TURNSTILE_TOKEN,
  purpose?: EmailCodePurpose,
) {
  return server.inject({
    method: 'POST',
    url: '/v1/pass/email-code',
    payload: { email, turnstileToken, ...(purpose === undefined ? {} : { purpose }) },
    remoteAddress: buildTestRemoteAddress(),
  })
}

function requestEmailGoogle(googleIdToken: string, targetServer = server) {
  return targetServer.inject({
    method: 'POST',
    url: '/v1/pass/email-google',
    payload: { googleIdToken },
    remoteAddress: buildTestRemoteAddress(),
  })
}

async function setTodaysEmailCount(sentEmailCount: number): Promise<void> {
  const now = new Date()
  await getEmailDailyCountsCollection(server.mongo.database).updateOne(
    { _id: formatUtcDay(now) },
    { $set: { sentEmailCount, updatedAt: now, expiresAt: new Date(now.getTime() + 86_400_000) } },
    { upsert: true },
  )
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
