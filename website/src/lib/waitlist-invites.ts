'use client'

import { useSyncExternalStore } from 'react'
import { siteUrl } from '@/content/site'
import {
  isRecord,
  readSessionString,
  readStoredValue,
  removeStoredValue,
  writeSessionString,
  writeStoredValue,
} from './browser-storage'

// The invite loop in this browser (D-056): the friend's code a visitor arrived with (for this
// visit), the visitor's own code once they've joined (for their share links), and their invites
// token (for coming back to /waitlist/invites without an email, 30 days).

/** Where a shared link was shared to: each is its own `source` (Part 2). */
export type InviteShareTarget = 'whatsapp' | 'telegram' | 'x' | 'share' | 'copy'

export type StoredInvitesSession = {
  email: string
  invitesToken: string
  invitesTokenExpiresAt: string
}

const ARRIVAL_INVITE_CODE_STORAGE_KEY = 'stridemon:waitlist-arrival-invite-code'
const OWN_INVITE_CODE_STORAGE_KEY = 'stridemon:waitlist-own-invite-code'
const INVITES_SESSION_STORAGE_KEY = 'stridemon:waitlist-invites'
const INVITE_CODE_LENGTH = 8
const CROCKFORD_BASE32_PATTERN = new RegExp(`^[0-9A-HJKMNP-TV-Z]{${INVITE_CODE_LENGTH}}$`)

/**
 * The invite code in a `?ref=` value, or null when it isn't one. The same rule as the API's
 * `readInviteCode`: any case, and Crockford's look-alikes read as digits (I and L as 1, O as 0).
 */
export function readInviteCode(value: string): string | null {
  const inviteCode = value.trim().toUpperCase().replaceAll(/[IL]/g, '1').replaceAll('O', '0')
  return CROCKFORD_BASE32_PATTERN.test(inviteCode) ? inviteCode : null
}

/** The code in an invite link from the API (`…/waitlist?ref=K7M2QX9P`). */
export function readInviteCodeFromUrl(inviteUrl: string): string | null {
  try {
    const refValue = new URL(inviteUrl).searchParams.get('ref')
    return refValue === null ? null : readInviteCode(refValue)
  } catch {
    return null
  }
}

/** A site link carrying the sharer's code and where it was shared to. */
export function buildInviteShareUrl({
  path,
  inviteCode,
  shareTarget,
}: {
  /** A site path, `/waitlist` or `/pass/137`. */
  path: string
  inviteCode: string | null
  shareTarget: InviteShareTarget
}): string {
  const searchParams = new URLSearchParams()
  if (inviteCode !== null) searchParams.set('ref', inviteCode)
  searchParams.set('source', `invite-${shareTarget}`)
  return `${siteUrl}${path}?${searchParams.toString()}`
}

/**
 * Keeps the `?ref=` a visitor arrived with for the whole visit, so a friend who browses /pass first
 * still joins with it. The first code of the visit stays.
 */
export function rememberArrivalInviteCode(searchText: string): void {
  const refValue = new URLSearchParams(searchText).get('ref')
  const inviteCode = refValue === null ? null : readInviteCode(refValue)
  if (inviteCode === null || readSessionString(ARRIVAL_INVITE_CODE_STORAGE_KEY) !== null) return
  writeSessionString(ARRIVAL_INVITE_CODE_STORAGE_KEY, inviteCode)
}

/** The friend's code this visitor arrived with, or null. */
export function readArrivalInviteCode(): string | null {
  const storedCode = readSessionString(ARRIVAL_INVITE_CODE_STORAGE_KEY)
  return storedCode === null ? null : readInviteCode(storedCode)
}

let ownInviteCode: string | null | undefined
const ownInviteCodeListeners = new Set<() => void>()

function readOwnInviteCodeSnapshot(): string | null {
  ownInviteCode ??= readStoredValue(
    OWN_INVITE_CODE_STORAGE_KEY,
    (value): value is string => typeof value === 'string' && readInviteCode(value) === value,
  )
  return ownInviteCode
}

function subscribeToOwnInviteCode(listener: () => void): () => void {
  ownInviteCodeListeners.add(listener)
  return () => ownInviteCodeListeners.delete(listener)
}

/** This visitor's own code, once they've joined in this browser: share links carry it. */
export function useOwnInviteCode(): string | null {
  return useSyncExternalStore(subscribeToOwnInviteCode, readOwnInviteCodeSnapshot, () => null)
}

/** Remembers the visitor's own code. It never replaces the friend's code they arrived with. */
export function saveOwnInviteCode(inviteCode: string): void {
  writeStoredValue(OWN_INVITE_CODE_STORAGE_KEY, inviteCode)
  ownInviteCode = inviteCode
  for (const listener of ownInviteCodeListeners) listener()
}

/** The invites token for /waitlist/invites, while it lasts. */
export function readStoredInvitesSession(now: Date): StoredInvitesSession | null {
  const storedSession = readStoredValue(INVITES_SESSION_STORAGE_KEY, isStoredInvitesSession)
  if (storedSession === null) return null
  return new Date(storedSession.invitesTokenExpiresAt).getTime() > now.getTime()
    ? storedSession
    : null
}

export function saveInvitesSession(storedSession: StoredInvitesSession): void {
  writeStoredValue(INVITES_SESSION_STORAGE_KEY, storedSession)
}

/** "Use a different email", or a token the API no longer takes. */
export function forgetInvitesSession(): void {
  removeStoredValue(INVITES_SESSION_STORAGE_KEY)
}

function isStoredInvitesSession(value: unknown): value is StoredInvitesSession {
  return (
    isRecord(value) &&
    typeof value.email === 'string' &&
    typeof value.invitesToken === 'string' &&
    typeof value.invitesTokenExpiresAt === 'string'
  )
}
