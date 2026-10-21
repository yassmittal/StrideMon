import { afterEach, beforeEach, describe, expect, it } from 'bun:test'
import {
  apiErrorResponseSchema,
  joinWaitlistResponseSchema,
  waitlistCountResponseSchema,
  waitlistInvitesResponseSchema,
  waitlistInvitesSessionResponseSchema,
} from '@stridemon/shared/api-contracts'
import type { ApiErrorCode } from '@stridemon/shared/domain'
import type { FastifyInstance, LightMyRequestResponse } from 'fastify'
import { formatUtcDay } from '../../lib/email/email-day'
import { signEmailProof } from '../../lib/founding-pass/email-proof'
import { buildInviteUrl } from '../../lib/waitlist/invite-code'
import { readDailyEmailCount } from '../../repositories/email-daily-counts-repository'
import { getWaitlistSignupsCollection } from '../../repositories/waitlist-signups-repository'
import { EmailRefusedError, type OutgoingEmail } from '../../services/email-sender'
import {
  buildTestServer,
  TEST_EMAIL_PROOF_SECRET,
  TEST_WAITLIST_ALLOWED_ORIGIN,
} from '../../test-support/build-test-server'
import {
  buildTestRemoteAddress,
  createCapturingEmailSender,
  TEST_TURNSTILE_TOKEN,
} from '../../test-support/fake-pass-services'
import {
  buildTestInviteCode,
  insertTestWaitlistSignup,
} from '../../test-support/insert-test-waitlist-signup'

// The window far ahead, so the early hour hasn't started and confirmations made now count.
const WINDOW_STARTS_AT = '2099-01-01T14:30:00Z'
const EARLY_HOUR_STARTS_AT = new Date('2099-01-01T13:30:00Z')

let server: FastifyInstance
let sentEmails: OutgoingEmail[]

beforeEach(async () => {
  server = await buildServerWithEmailSender(createCapturingEmailSender())
})

async function buildServerWithEmailSender(
  capturingEmailSender: ReturnType<typeof createCapturingEmailSender>,
  environmentOverrides: Record<string, string> = {},
) {
  sentEmails = capturingEmailSender.sentEmails
  return buildTestServer({
    environmentOverrides: {
      PASS_WAITLIST_WINDOW_STARTS_AT: WINDOW_STARTS_AT,
      PASS_BACKUP_OPENING_AT: '2099-02-01T14:30:00Z',
      ...environmentOverrides,
    },
    passServices: { emailSender: capturingEmailSender.emailSender },
  })
}

afterEach(async () => {
  await server.close()
})

describe('POST /v1/waitlist', () => {
  it('stores one sign-up, folded, with its own code, and answers its invite link', async () => {
    const response = await joinWaitlist({
      email: '  J.Ohn+Pass@GoogleMail.COM ',
      phonePlatform: 'android',
      source: 'x-stridemon',
    })

    expect(response.statusCode).toBe(200)
    const inviteCode = buildTestInviteCode('john@gmail.com')
    expect(joinWaitlistResponseSchema.parse(response.json())).toEqual({
      status: 'joined',
      inviteUrl: `https://stridemon.xyz/waitlist?ref=${inviteCode}`,
    })
    const signups = await readSignups()
    expect(signups).toHaveLength(1)
    expect(signups[0]).toMatchObject({
      email: 'j.ohn+pass@googlemail.com',
      canonicalEmail: 'john@gmail.com',
      inviteCode,
      invitedByInviteCode: null,
      phonePlatform: 'android',
      source: 'x-stridemon',
    })
    expect(signups[0]?.emailConfirmedAt).toBeUndefined()
  })

  it('answers a new, a repeat and a dot-variant email the same, with one sign-up', async () => {
    const newResponse = await joinWaitlist({ email: 'john@gmail.com', source: 'x-yash' })
    const repeatResponse = await joinWaitlist({ email: 'JOHN@gmail.com', phonePlatform: 'ios' })
    const dotVariantResponse = await joinWaitlist({ email: 'j.o.h.n@gmail.com' })

    expect(repeatResponse.json()).toEqual(newResponse.json())
    expect(dotVariantResponse.json()).toEqual(newResponse.json())
    const signups = await readSignups()
    expect(signups).toHaveLength(1)
    expect(signups[0]).toMatchObject({
      email: 'john@gmail.com',
      phonePlatform: null,
      source: 'x-yash',
    })
  })

  it('keeps the first invite: joining again through another link changes nothing', async () => {
    const firstInviteCode = buildTestInviteCode('first-inviter@example.com')
    const secondInviteCode = buildTestInviteCode('second-inviter@example.com')

    await joinWaitlist({ email: 'friend@example.com', inviteCode: firstInviteCode.toLowerCase() })
    await joinWaitlist({ email: 'friend@example.com', inviteCode: secondInviteCode })

    expect((await readSignup('friend@example.com'))?.invitedByInviteCode).toBe(firstInviteCode)
  })

  it('ignores your own code, and drops a ?ref= that is not a code', async () => {
    await joinWaitlist({
      email: 'runner@example.com',
      inviteCode: buildTestInviteCode('runner@example.com'),
    })
    const malformedResponse = await joinWaitlist({
      email: 'walker@example.com',
      inviteCode: 'not a code!',
    })

    expect(malformedResponse.statusCode).toBe(200)
    expect((await readSignup('runner@example.com'))?.invitedByInviteCode).toBeNull()
    expect((await readSignup('walker@example.com'))?.invitedByInviteCode).toBeNull()
  })

  it('refuses a missing or failed robot check and stores nothing (TURNSTILE_FAILED)', async () => {
    const missingResponse = await joinWaitlist({
      email: 'runner@example.com',
      turnstileToken: undefined,
    })
    const failedResponse = await joinWaitlist({
      email: 'runner@example.com',
      turnstileToken: 'a-bot',
    })

    expectApiError(missingResponse, 403, 'TURNSTILE_FAILED')
    expectApiError(failedResponse, 403, 'TURNSTILE_FAILED')
    expect(await readSignups()).toHaveLength(0)
  })

  it('refuses a temporary inbox and stores nothing (EMAIL_DOMAIN_DISPOSABLE)', async () => {
    const response = await joinWaitlist({ email: 'someone@mailinator.com' })

    expectApiError(response, 400, 'EMAIL_DOMAIN_DISPOSABLE')
    expect(await readSignups()).toHaveLength(0)
  })

  it('refuses an email that is not an email', async () => {
    expectApiError(await joinWaitlist({ email: 'not-an-email' }), 400, 'VALIDATION_FAILED')
    expect(await readSignups()).toHaveLength(0)
  })

  it('answers a filled-in honeypot as joined, with the link, and stores nothing', async () => {
    const response = await joinWaitlist({
      email: 'bot@example.com',
      turnstileToken: undefined,
      website: 'https://spam.example',
    })

    expect(response.statusCode).toBe(200)
    expect(joinWaitlistResponseSchema.parse(response.json()).inviteUrl).toBe(
      buildInviteUrl(buildTestInviteCode('bot@example.com')),
    )
    expect(await readSignups()).toHaveLength(0)
  })

  it('confirms the sign-up with a proof for the same inbox, and ignores any other proof', async () => {
    await joinWaitlist({
      email: 'j.ohn@gmail.com',
      emailProof: await signTestEmailProof('john@gmail.com', 'google'),
    })
    await joinWaitlist({
      email: 'walker@example.com',
      emailProof: await signTestEmailProof('someone-else@example.com', 'code'),
    })

    expect(await readSignup('j.ohn@gmail.com')).toMatchObject({ emailConfirmedBy: 'google' })
    expect((await readSignup('j.ohn@gmail.com'))?.emailConfirmedAt).toBeInstanceOf(Date)
    expect((await readSignup('walker@example.com'))?.emailConfirmedAt).toBeUndefined()
  })

  it('sends CORS headers to the website origin only, on every waitlist route', async () => {
    const preflight = (url: string, origin: string) =>
      server.inject({
        method: 'OPTIONS',
        url,
        headers: { origin, 'access-control-request-method': 'POST' },
      })

    for (const url of ['/v1/waitlist', '/v1/waitlist/invites-session', '/v1/waitlist/count']) {
      expect(
        (await preflight(url, TEST_WAITLIST_ALLOWED_ORIGIN)).headers['access-control-allow-origin'],
      ).toBe(TEST_WAITLIST_ALLOWED_ORIGIN)
      expect(
        (await preflight(url, 'https://evil.example')).headers['access-control-allow-origin'],
      ).toBeUndefined()
    }
    const otherRouteResponse = await server.inject({
      method: 'GET',
      url: '/health',
      headers: { origin: TEST_WAITLIST_ALLOWED_ORIGIN },
    })
    expect(otherRouteResponse.headers['access-control-allow-origin']).toBeUndefined()
  })
})

describe('the invite email (D-062)', () => {
  it('emails a new sign-up whose inbox the join checked: the link, the early hour, the limit', async () => {
    const response = await joinWaitlist({
      email: 'john@gmail.com',
      emailProof: await signTestEmailProof('john@gmail.com', 'google'),
    })

    expect(response.statusCode).toBe(200)
    expect(sentEmails).toHaveLength(1)
    const inviteEmail = sentEmails[0]
    expect(inviteEmail?.toEmailAddress).toBe('john@gmail.com')
    expect(inviteEmail?.senderName).toBe('Yash from StrideMon')
    expect(inviteEmail?.subject).toBe('Your StrideMon invite link')
    expect(inviteEmail?.textBody).toContain(buildInviteUrl(buildTestInviteCode('john@gmail.com')))
    expect(inviteEmail?.textBody).toContain('Only 250 passes go in that hour.')
    expect(inviteEmail?.textBody).toContain('The next email from us is when your window opens.')
    expect((await readSignup('john@gmail.com'))?.inviteEmailSentAt).toBeInstanceOf(Date)
    expect(await readDailyEmailCount(server.mongo.database, formatUtcDay(new Date()))).toBe(1)
  })

  it('emails nobody for a join without a proof, a proof for another inbox, or a repeat', async () => {
    await joinWaitlist({ email: 'no-proof@example.com' })
    await joinWaitlist({
      email: 'other-proof@example.com',
      emailProof: await signTestEmailProof('someone-else@example.com', 'code'),
    })
    await joinWaitlist({
      email: 'john@gmail.com',
      emailProof: await signTestEmailProof('john@gmail.com', 'code'),
    })
    await joinWaitlist({
      email: 'j.o.h.n@gmail.com',
      emailProof: await signTestEmailProof('j.o.h.n@gmail.com', 'code'),
    })

    expect(sentEmails.map((sentEmail) => sentEmail.toEmailAddress)).toEqual(['john@gmail.com'])
  })

  it('still joins, and sends nothing, when the day’s waitlist emails are used up', async () => {
    await server.close()
    server = await buildServerWithEmailSender(createCapturingEmailSender(), {
      WAITLIST_CODE_DAILY_EMAIL_LIMIT: '1',
    })
    await joinWaitlist({
      email: 'first@example.com',
      emailProof: await signTestEmailProof('first@example.com', 'code'),
    })

    const response = await joinWaitlist({
      email: 'second@example.com',
      emailProof: await signTestEmailProof('second@example.com', 'code'),
    })

    expect(response.statusCode).toBe(200)
    expect(sentEmails.map((sentEmail) => sentEmail.toEmailAddress)).toEqual(['first@example.com'])
    expect((await readSignup('second@example.com'))?.inviteEmailSentAt).toBeUndefined()
  })

  it('still joins when Brevo refuses, and gives the stamp back', async () => {
    await server.close()
    server = await buildServerWithEmailSender({
      emailSender: {
        sendEmail: async () => {
          throw new EmailRefusedError('Brevo refused the email: 400')
        },
      },
      sentEmails: [],
    })

    const response = await joinWaitlist({
      email: 'john@gmail.com',
      emailProof: await signTestEmailProof('john@gmail.com', 'code'),
    })

    expect(response.statusCode).toBe(200)
    expect((await readSignup('john@gmail.com'))?.inviteEmailSentAt).toBeUndefined()
    expect(await readDailyEmailCount(server.mongo.database, formatUtcDay(new Date()))).toBe(0)
  })
})

describe('the invites', () => {
  const INVITER = 'inviter@example.com'

  it('counts only friends who joined through the link and confirmed before the early hour', async () => {
    const inviteCode = buildTestInviteCode(INVITER)
    await insertTestWaitlistSignup(server.mongo.database, { email: INVITER })
    await insertTestWaitlistSignup(server.mongo.database, {
      email: 'confirmed-friend@example.com',
      invitedByInviteCode: inviteCode,
      emailConfirmedAt: new Date(),
    })
    await insertTestWaitlistSignup(server.mongo.database, {
      email: 'unconfirmed-friend@example.com',
      invitedByInviteCode: inviteCode,
    })
    await insertTestWaitlistSignup(server.mongo.database, {
      email: 'late-friend@example.com',
      invitedByInviteCode: inviteCode,
      emailConfirmedAt: new Date(EARLY_HOUR_STARTS_AT.getTime() + 1000),
    })
    await insertTestWaitlistSignup(server.mongo.database, {
      email: 'someone-elses-friend@example.com',
      invitedByInviteCode: buildTestInviteCode('another@example.com'),
      emailConfirmedAt: new Date(),
    })
    // The inviter's own inbox, joining again through their own link, is a repeat: it never counts.
    await joinWaitlist({ email: 'Inviter+again@example.com', inviteCode })

    const { invites } = await startInvitesSession(INVITER)

    expect(invites).toEqual({
      isOnWaitlist: true,
      inviteUrl: buildInviteUrl(inviteCode),
      confirmedFriendCount: 1,
      requiredFriendCount: 3,
      hasEarlyHour: false,
      isEmailConfirmed: true,
      countsUntil: EARLY_HOUR_STARTS_AT.toISOString(),
    })
  })

  it('gives the early hour at 3 confirmed friends, the whole way through the routes', async () => {
    await joinWaitlist({ email: INVITER })
    const inviteCode = buildTestInviteCode(INVITER)
    for (const friendEmail of ['one@example.com', 'two@example.com', 'three@example.com']) {
      await joinWaitlist({ email: friendEmail, inviteCode })
      await startInvitesSession(friendEmail)
    }

    const { invites } = await startInvitesSession(INVITER)

    expect(invites).toMatchObject({ confirmedFriendCount: 3, hasEarlyHour: true })
  })

  it('confirms the email on the first session, by the method of its proof', async () => {
    await joinWaitlist({ email: INVITER })

    await startInvitesSession(INVITER, 'google')
    await startInvitesSession(INVITER, 'code')

    expect(await readSignup(INVITER)).toMatchObject({ emailConfirmedBy: 'google' })
  })

  it('answers an email that is not on the list with its link and no friends', async () => {
    const { invites } = await startInvitesSession('stranger@example.com')

    expect(invites).toMatchObject({
      isOnWaitlist: false,
      inviteUrl: buildInviteUrl(buildTestInviteCode('stranger@example.com')),
      confirmedFriendCount: 0,
      hasEarlyHour: false,
      isEmailConfirmed: false,
    })
    expect(await readSignups()).toHaveLength(0)
  })

  it('refuses a session without a valid email proof (EMAIL_PROOF_INVALID)', async () => {
    const response = await server.inject({
      method: 'POST',
      url: '/v1/waitlist/invites-session',
      payload: { emailProof: 'not-a-proof' },
      remoteAddress: buildTestRemoteAddress(),
    })

    expectApiError(response, 401, 'EMAIL_PROOF_INVALID')
  })

  it('reads the invites again with the invites token, and nothing else', async () => {
    await joinWaitlist({ email: INVITER })
    const session = await startInvitesSession(INVITER)

    const withToken = await readInvites(`Bearer ${session.invitesToken}`)
    const withEmailProof = await readInvites(`Bearer ${await signTestEmailProof(INVITER, 'code')}`)
    const withoutToken = await readInvites(undefined)

    expect(withToken.statusCode).toBe(200)
    expect(waitlistInvitesResponseSchema.parse(withToken.json()).invites).toEqual(session.invites)
    expectApiError(withEmailProof, 401, 'INVITES_TOKEN_INVALID')
    expectApiError(withoutToken, 401, 'INVITES_TOKEN_INVALID')
  })
})

describe('GET /v1/waitlist/count', () => {
  it('answers how many have joined, cached for about a minute', async () => {
    await insertTestWaitlistSignup(server.mongo.database, { email: 'one@example.com' })
    await insertTestWaitlistSignup(server.mongo.database, { email: 'two@example.com' })

    const firstCount = await readCount()
    await insertTestWaitlistSignup(server.mongo.database, { email: 'three@example.com' })
    const cachedCount = await readCount()

    expect(firstCount).toEqual({ signupCount: 2 })
    expect(cachedCount).toEqual({ signupCount: 2 })
  })
})

function joinWaitlist(body: Record<string, unknown>) {
  return server.inject({
    method: 'POST',
    url: '/v1/waitlist',
    payload: { turnstileToken: TEST_TURNSTILE_TOKEN, ...body },
    remoteAddress: buildTestRemoteAddress(),
  })
}

async function signTestEmailProof(email: string, emailCheckMethod: 'code' | 'google') {
  const { emailProof } = await signEmailProof({
    email,
    emailCheckMethod,
    emailProofSecret: TEST_EMAIL_PROOF_SECRET,
    issuedAt: new Date(),
  })
  return emailProof
}

async function startInvitesSession(email: string, emailCheckMethod: 'code' | 'google' = 'code') {
  const response = await server.inject({
    method: 'POST',
    url: '/v1/waitlist/invites-session',
    payload: { emailProof: await signTestEmailProof(email, emailCheckMethod) },
    remoteAddress: buildTestRemoteAddress(),
  })
  expect(response.statusCode).toBe(200)
  return waitlistInvitesSessionResponseSchema.parse(response.json())
}

function readInvites(authorizationHeader: string | undefined) {
  return server.inject({
    method: 'GET',
    url: '/v1/waitlist/invites',
    headers: authorizationHeader === undefined ? {} : { authorization: authorizationHeader },
    remoteAddress: buildTestRemoteAddress(),
  })
}

async function readCount() {
  const response = await server.inject({
    method: 'GET',
    url: '/v1/waitlist/count',
    remoteAddress: buildTestRemoteAddress(),
  })
  expect(response.statusCode).toBe(200)
  return waitlistCountResponseSchema.parse(response.json())
}

function readSignups() {
  return getWaitlistSignupsCollection(server.mongo.database).find().toArray()
}

function readSignup(email: string) {
  return getWaitlistSignupsCollection(server.mongo.database).findOne({ email })
}

function expectApiError(response: LightMyRequestResponse, statusCode: number, code: ApiErrorCode) {
  expect(response.statusCode).toBe(statusCode)
  const errorBody = apiErrorResponseSchema.parse(response.json())
  expect(errorBody.error.code).toBe(code)
  return errorBody
}
