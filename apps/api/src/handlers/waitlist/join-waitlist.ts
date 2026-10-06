import type { JoinWaitlistBody, JoinWaitlistResponse } from '@stridemon/shared/api-contracts'
import type { Db } from 'mongodb'
import { insertWaitlistSignupIfNew } from '../../repositories/waitlist-signups-repository'

/**
 * Stores a waitlist sign-up (D-037). Always answers `joined`, for a repeat email and a filled-in
 * honeypot too, so the response tells neither a visitor nor a bot anything.
 */
export async function joinWaitlist({
  database,
  body,
  now,
}: {
  database: Db
  body: JoinWaitlistBody
  now: Date
}): Promise<JoinWaitlistResponse> {
  const isHoneypotFilled = body.website !== undefined && body.website !== ''
  if (!isHoneypotFilled) {
    await insertWaitlistSignupIfNew(database, {
      email: body.email,
      phonePlatform: body.phonePlatform ?? null,
      source: body.source ?? null,
      createdAt: now,
    })
  }
  return { status: 'joined' }
}
