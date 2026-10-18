// The browser side of the waitlist's routes (D-037, D-056): joining, the invites and the count. The
// site never imports `@stridemon/shared` (D-035), so this mirrors the API's contracts by hand.

import { waitlistApiUrl, waitlistApiUrls } from '@/content/site'
import { type ApiResult, requestApiJson } from './api-request'
import { isRecord } from './browser-storage'

export type WaitlistPhonePlatform = 'android' | 'ios'

export type WaitlistSignupRequest = {
  email: string
  phonePlatform: WaitlistPhonePlatform | null
  source: string | null
  /** The friend's code this visitor arrived with, if any (`?ref=`). */
  inviteCode: string | null
  /** A proof for this email (Google, or a code) confirms the sign-up at once. */
  emailProof: string | null
  turnstileToken: string
  /** The hidden honeypot field's value. A person leaves it empty. */
  honeypotValue: string
}

/** A sign-up's invites, shown only after its email is checked (D-056). */
export type WaitlistInvites = {
  isOnWaitlist: boolean
  inviteUrl: string
  confirmedFriendCount: number
  requiredFriendCount: number
  hasEarlyHour: boolean
  isEmailConfirmed: boolean
  /** When friends stop counting: the early hour's start. */
  countsUntil: string
}

export type WaitlistInvitesSession = {
  invitesToken: string
  invitesTokenExpiresAt: string
  invites: WaitlistInvites
}

// The same rule the API applies; anything else is dropped, not sent.
const WAITLIST_SOURCE_PATTERN = /^[a-z0-9-]{1,32}$/

// A loose check for a quick, friendly error. The API's check is the real one.
const LIKELY_EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

export function isLikelyEmail(emailText: string): boolean {
  return LIKELY_EMAIL_PATTERN.test(emailText.trim())
}

/** The page's `?source=` (for example `x-stridemon`), or null when it's missing or malformed. */
export function readWaitlistSource(searchText: string): string | null {
  const source = new URLSearchParams(searchText).get('source')
  return source !== null && WAITLIST_SOURCE_PATTERN.test(source) ? source : null
}

/** Joins (D-056). The answer is the same for a new and a repeat email: the email's invite link. */
export function joinWaitlist(request: WaitlistSignupRequest): Promise<ApiResult<string>> {
  return requestApiJson({
    url: waitlistApiUrl,
    method: 'POST',
    body: {
      email: request.email.trim(),
      turnstileToken: request.turnstileToken,
      ...(request.phonePlatform === null ? {} : { phonePlatform: request.phonePlatform }),
      ...(request.source === null ? {} : { source: request.source }),
      ...(request.inviteCode === null ? {} : { inviteCode: request.inviteCode }),
      ...(request.emailProof === null ? {} : { emailProof: request.emailProof }),
      ...(request.honeypotValue === '' ? {} : { website: request.honeypotValue }),
    },
    readData: (body) =>
      isRecord(body) && body.status === 'joined' && typeof body.inviteUrl === 'string'
        ? body.inviteUrl
        : undefined,
  })
}

/** Checks an email proof, confirms the sign-up, and answers its invites with a 30-day token. */
export function startWaitlistInvitesSession(
  emailProof: string,
): Promise<ApiResult<WaitlistInvitesSession>> {
  return requestApiJson({
    url: waitlistApiUrls.invitesSession,
    method: 'POST',
    body: { emailProof },
    readData: (body) => {
      if (
        !isRecord(body) ||
        typeof body.invitesToken !== 'string' ||
        typeof body.invitesTokenExpiresAt !== 'string'
      ) {
        return undefined
      }
      const invites = readInvites(body.invites)
      return invites === undefined
        ? undefined
        : {
            invitesToken: body.invitesToken,
            invitesTokenExpiresAt: body.invitesTokenExpiresAt,
            invites,
          }
    },
  })
}

/** A return visit: the invites again, with the token from the session. */
export function readWaitlistInvites(invitesToken: string): Promise<ApiResult<WaitlistInvites>> {
  return requestApiJson({
    url: waitlistApiUrls.invites,
    method: 'GET',
    accessToken: invitesToken,
    readData: (body) => (isRecord(body) ? readInvites(body.invites) : undefined),
  })
}

/** How many have joined, the one public number (D-056). */
export function readWaitlistCount(): Promise<ApiResult<number>> {
  return requestApiJson({
    url: waitlistApiUrls.count,
    method: 'GET',
    readData: (body) =>
      isRecord(body) && Number.isInteger(body.signupCount)
        ? (body.signupCount as number)
        : undefined,
  })
}

function readInvites(value: unknown): WaitlistInvites | undefined {
  if (
    !isRecord(value) ||
    typeof value.isOnWaitlist !== 'boolean' ||
    typeof value.inviteUrl !== 'string' ||
    !Number.isInteger(value.confirmedFriendCount) ||
    !Number.isInteger(value.requiredFriendCount) ||
    typeof value.hasEarlyHour !== 'boolean' ||
    typeof value.isEmailConfirmed !== 'boolean' ||
    typeof value.countsUntil !== 'string'
  ) {
    return undefined
  }
  return {
    isOnWaitlist: value.isOnWaitlist,
    inviteUrl: value.inviteUrl,
    confirmedFriendCount: value.confirmedFriendCount as number,
    requiredFriendCount: value.requiredFriendCount as number,
    hasEarlyHour: value.hasEarlyHour,
    isEmailConfirmed: value.isEmailConfirmed,
    countsUntil: value.countsUntil,
  }
}
