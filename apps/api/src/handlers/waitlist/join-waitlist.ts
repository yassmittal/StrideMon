import type { JoinWaitlistBody, JoinWaitlistResponse } from '@stridemon/shared/api-contracts'
import type { Db } from 'mongodb'
import { buildVerificationEmail } from '../../lib/waitlist/build-verification-email'
import { generateVerificationCode, hashVerificationCode } from '../../lib/waitlist/waitlist-codes'
import { insertWaitlistSignupIfNew } from '../../repositories/waitlist-signups-repository'
import {
  deleteWaitlistVerificationCode,
  replaceWaitlistVerificationCodeUnlessRecent,
} from '../../repositories/waitlist-verification-codes-repository'
import type { EmailSender } from '../../services/email-sender'

/**
 * Stores a waitlist sign-up (D-037) and emails it a verification code (D-041). Always answers
 * `codeSent`, for a repeat email, a verified one and a filled-in honeypot too, so the response
 * tells neither a visitor nor a bot anything. A code sent under a minute ago isn't sent again.
 */
export async function joinWaitlist({
  database,
  emailSender,
  body,
  now,
}: {
  database: Db
  emailSender: EmailSender
  body: JoinWaitlistBody
  now: Date
}): Promise<JoinWaitlistResponse> {
  const isHoneypotFilled = body.website !== undefined && body.website !== ''
  if (isHoneypotFilled) return { status: 'codeSent' }

  await insertWaitlistSignupIfNew(database, {
    email: body.email,
    phonePlatform: body.phonePlatform ?? null,
    source: body.source ?? null,
    referredByCode: body.referralCode ?? null,
    createdAt: now,
  })

  const verificationCode = generateVerificationCode()
  const isCodeStored = await replaceWaitlistVerificationCodeUnlessRecent(database, {
    email: body.email,
    codeHash: hashVerificationCode({ email: body.email, verificationCode }),
    now,
  })
  if (!isCodeStored) return { status: 'codeSent' }

  try {
    await emailSender.sendEmail(buildVerificationEmail({ toAddress: body.email, verificationCode }))
  } catch (error) {
    // Unsent, so drop it: otherwise the once-a-minute limit would block an immediate retry.
    await deleteWaitlistVerificationCode(database, body.email)
    throw error
  }
  return { status: 'codeSent' }
}
