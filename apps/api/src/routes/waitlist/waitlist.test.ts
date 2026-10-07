import { afterEach, beforeEach, describe, expect, it } from 'bun:test'
import {
  apiErrorResponseSchema,
  joinWaitlistResponseSchema,
  waitlistPlaceResponseSchema,
} from '@stridemon/shared/api-contracts'
import type { FastifyInstance } from 'fastify'
import { getWaitlistSignupsCollection } from '../../repositories/waitlist-signups-repository'
import { getWaitlistVerificationCodesCollection } from '../../repositories/waitlist-verification-codes-repository'
import type { OutgoingEmail } from '../../services/email-sender'
import { buildTestServer, TEST_WAITLIST_ALLOWED_ORIGIN } from '../../test-support/build-test-server'
import { createRecordingEmailSender } from '../../test-support/create-recording-email-sender'

const MILLISECONDS_PER_MINUTE = 60_000

describe('the waitlist routes', () => {
  let server: FastifyInstance
  let sentEmails: OutgoingEmail[]
  // Each request comes from its own address, so the 5-a-minute per-IP limit never trips here.
  let requestCount = 0

  beforeEach(async () => {
    const recordingEmailSender = createRecordingEmailSender()
    sentEmails = recordingEmailSender.sentEmails
    server = await buildTestServer({ emailSender: recordingEmailSender.emailSender })
  })

  afterEach(async () => {
    await server.close()
  })

  function nextRemoteAddress() {
    requestCount += 1
    return `10.0.${Math.floor(requestCount / 250)}.${requestCount % 250}`
  }

  function joinWaitlist(body: Record<string, unknown>) {
    return server.inject({
      method: 'POST',
      url: '/v1/waitlist',
      payload: body,
      remoteAddress: nextRemoteAddress(),
    })
  }

  function verifyEmail(email: string, verificationCode: string) {
    return server.inject({
      method: 'POST',
      url: '/v1/waitlist/verify',
      payload: { email, verificationCode },
      remoteAddress: nextRemoteAddress(),
    })
  }

  function readPlace(referralCode: string) {
    return server.inject({
      method: 'GET',
      url: `/v1/waitlist/place?referralCode=${referralCode}`,
      remoteAddress: nextRemoteAddress(),
    })
  }

  function readSignups() {
    return getWaitlistSignupsCollection(server.mongo.database).find().toArray()
  }

  function readLastCodeSentTo(email: string): string {
    const lastEmail = sentEmails.filter((sentEmail) => sentEmail.toAddress === email).at(-1)
    const verificationCode = lastEmail?.subject.match(/(\d{6})$/)?.[1]
    if (verificationCode === undefined) throw new Error(`No code was sent to ${email}`)
    return verificationCode
  }

  /** Signs up and verifies, and answers the place the verification returned. */
  async function joinLine(email: string, referralCode?: string) {
    await joinWaitlist(referralCode === undefined ? { email } : { email, referralCode })
    const response = await verifyEmail(email, readLastCodeSentTo(email))
    expect(response.statusCode).toBe(200)
    return waitlistPlaceResponseSchema.parse(response.json())
  }

  describe('POST /v1/waitlist', () => {
    it('stores one sign-up and emails it a 6-digit code', async () => {
      const response = await joinWaitlist({
        email: '  Runner@Example.COM ',
        phonePlatform: 'android',
        source: 'x-stridemon',
      })

      expect(response.statusCode).toBe(200)
      expect(joinWaitlistResponseSchema.parse(response.json())).toEqual({ status: 'codeSent' })
      const signups = await readSignups()
      expect(signups).toHaveLength(1)
      expect(signups[0]).toMatchObject({
        email: 'runner@example.com',
        phonePlatform: 'android',
        source: 'x-stridemon',
        verifiedAt: null,
      })
      expect(sentEmails).toHaveLength(1)
      expect(sentEmails[0]?.toAddress).toBe('runner@example.com')
      expect(sentEmails[0]?.textBody).toContain(readLastCodeSentTo('runner@example.com'))
    })

    it('stores the same email once, and sends a new code at most once a minute', async () => {
      await joinWaitlist({ email: 'runner@example.com', source: 'x-yash' })
      const firstCode = readLastCodeSentTo('runner@example.com')
      const repeatResponse = await joinWaitlist({
        email: 'RUNNER@example.com',
        phonePlatform: 'ios',
      })

      expect(joinWaitlistResponseSchema.parse(repeatResponse.json())).toEqual({
        status: 'codeSent',
      })
      expect(sentEmails).toHaveLength(1)
      const signups = await readSignups()
      expect(signups).toHaveLength(1)
      expect(signups[0]).toMatchObject({ phonePlatform: null, source: 'x-yash' })

      await getWaitlistVerificationCodesCollection(server.mongo.database).updateOne(
        { email: 'runner@example.com' },
        { $set: { sentAt: new Date(Date.now() - 2 * MILLISECONDS_PER_MINUTE) } },
      )
      await joinWaitlist({ email: 'runner@example.com' })

      expect(sentEmails).toHaveLength(2)
      const secondCode = readLastCodeSentTo('runner@example.com')
      if (secondCode !== firstCode) {
        expect((await verifyEmail('runner@example.com', firstCode)).statusCode).toBe(400)
      }
      expect((await verifyEmail('runner@example.com', secondCode)).statusCode).toBe(200)
    })

    it('refuses an email that is not an email', async () => {
      const response = await joinWaitlist({ email: 'not-an-email' })

      expect(response.statusCode).toBe(400)
      expect(apiErrorResponseSchema.parse(response.json()).error.code).toBe('VALIDATION_FAILED')
      expect(await readSignups()).toHaveLength(0)
      expect(sentEmails).toHaveLength(0)
    })

    it('answers a filled-in honeypot as sent, and stores and sends nothing', async () => {
      const response = await joinWaitlist({
        email: 'bot@example.com',
        website: 'https://spam.example',
      })

      expect(response.statusCode).toBe(200)
      expect(joinWaitlistResponseSchema.parse(response.json())).toEqual({ status: 'codeSent' })
      expect(await readSignups()).toHaveLength(0)
      expect(sentEmails).toHaveLength(0)
    })
  })

  describe('POST /v1/waitlist/verify', () => {
    it('puts the email in the line once, with a referral code', async () => {
      await joinWaitlist({ email: 'first@example.com' })
      const verificationCode = readLastCodeSentTo('first@example.com')

      const response = await verifyEmail('first@example.com', verificationCode)

      expect(response.statusCode).toBe(200)
      const place = waitlistPlaceResponseSchema.parse(response.json())
      expect(place).toMatchObject({ placeInLine: 1, referralCount: 0 })
      expect(place.referralCode).toMatch(/^[ABCDEFGHJKMNPQRSTUVWXYZ23456789]{8}$/)
      // The code is spent: the same one doesn't work twice.
      expect((await verifyEmail('first@example.com', verificationCode)).statusCode).toBe(400)
    })

    it('answers the same place to a returning visitor who verifies again', async () => {
      const firstPlace = await joinLine('first@example.com')
      await joinLine('second@example.com')

      const returningPlace = await joinLine('first@example.com')

      expect(returningPlace).toEqual(firstPlace)
    })

    it('refuses a wrong code, and stops after 5 tries even for the right one', async () => {
      await joinWaitlist({ email: 'runner@example.com' })
      const verificationCode = readLastCodeSentTo('runner@example.com')
      const wrongCode = verificationCode === '000000' ? '111111' : '000000'

      for (let attempt = 1; attempt <= 5; attempt += 1) {
        const response = await verifyEmail('runner@example.com', wrongCode)
        expect(apiErrorResponseSchema.parse(response.json()).error.code).toBe(
          'VERIFICATION_CODE_INVALID',
        )
      }

      expect((await verifyEmail('runner@example.com', verificationCode)).statusCode).toBe(400)
    })

    it('refuses an expired code', async () => {
      await joinWaitlist({ email: 'runner@example.com' })
      await getWaitlistVerificationCodesCollection(server.mongo.database).updateOne(
        { email: 'runner@example.com' },
        { $set: { expiresAt: new Date(Date.now() - 1) } },
      )

      const response = await verifyEmail(
        'runner@example.com',
        readLastCodeSentTo('runner@example.com'),
      )

      expect(response.statusCode).toBe(400)
    })
  })

  describe('referrals', () => {
    it('moves the referrer up 10 places for a verified friend, once', async () => {
      await joinLine('a@example.com')
      await joinLine('b@example.com')
      const referrer = await joinLine('c@example.com')
      expect(referrer.placeInLine).toBe(3)

      const friend = await joinLine('d@example.com', referrer.referralCode)
      await joinLine('d@example.com')

      expect(friend.placeInLine).toBe(4)
      const referrerPlace = waitlistPlaceResponseSchema.parse(
        (await readPlace(referrer.referralCode)).json(),
      )
      expect(referrerPlace).toEqual({ ...referrer, placeInLine: 1, referralCount: 1 })
    })

    it('stops crediting a referrer at 20 friends', async () => {
      const referrer = await joinLine('referrer@example.com')
      await getWaitlistSignupsCollection(server.mongo.database).updateOne(
        { email: 'referrer@example.com' },
        { $set: { referralCount: 20 } },
      )

      await joinLine('friend@example.com', referrer.referralCode)

      const referrerPlace = waitlistPlaceResponseSchema.parse(
        (await readPlace(referrer.referralCode)).json(),
      )
      expect(referrerPlace.referralCount).toBe(20)
    })
  })

  describe('GET /v1/waitlist/place', () => {
    it('answers NOT_FOUND for a code nobody has', async () => {
      const response = await readPlace('ABCDEFGH')

      expect(response.statusCode).toBe(404)
      expect(apiErrorResponseSchema.parse(response.json()).error.code).toBe('NOT_FOUND')
    })
  })

  it('sends CORS headers to the landing page origin, on the waitlist routes only', async () => {
    const preflight = (url: string, origin: string, method: 'GET' | 'POST') =>
      server.inject({
        method: 'OPTIONS',
        url,
        headers: { origin, 'access-control-request-method': method },
      })

    const allowedResponses = await Promise.all([
      preflight('/v1/waitlist', TEST_WAITLIST_ALLOWED_ORIGIN, 'POST'),
      preflight('/v1/waitlist/verify', TEST_WAITLIST_ALLOWED_ORIGIN, 'POST'),
      preflight('/v1/waitlist/place', TEST_WAITLIST_ALLOWED_ORIGIN, 'GET'),
    ])
    const disallowedResponse = await preflight('/v1/waitlist', 'https://evil.example', 'POST')
    const otherRouteResponse = await server.inject({
      method: 'GET',
      url: '/health',
      headers: { origin: TEST_WAITLIST_ALLOWED_ORIGIN },
    })

    for (const allowedResponse of allowedResponses) {
      expect(allowedResponse.headers['access-control-allow-origin']).toBe(
        TEST_WAITLIST_ALLOWED_ORIGIN,
      )
    }
    expect(disallowedResponse.headers['access-control-allow-origin']).toBeUndefined()
    expect(otherRouteResponse.headers['access-control-allow-origin']).toBeUndefined()
  })
})
