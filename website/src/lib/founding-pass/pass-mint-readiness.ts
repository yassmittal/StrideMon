'use client'

import { useSyncExternalStore } from 'react'
import { isRecord, readStoredValue, removeStoredValue, writeStoredValue } from '../browser-storage'
import {
  type EmailProof,
  type PassApiResult,
  readProblemCode,
  refreshSignInTokens,
  type SignInTokens,
} from './pass-api'

// "Get ready" (D-045): the checked email and the app's sign-in, kept in this browser so a mint
// later is one tap with no wallet prompt, plus the pass the signed-in wallet already holds.

export type HeldFoundingPass = {
  walletAddress: `0x${string}`
  designNumber: number
  founderNumber: number
  hasGoldFrame: boolean
  isLaced: boolean
}

export type HeldPassState =
  | { status: 'unknown' }
  | { status: 'checking' }
  | { status: 'none' }
  | { status: 'held'; heldPass: HeldFoundingPass }

export type PassMintReadiness = {
  /** A live email proof, or null (none, or it ran out). */
  emailCheck: EmailProof | null
  signIn: SignInTokens | null
  /** What the chain says the signed-in wallet holds. */
  heldPassState: HeldPassState
}

const EMAIL_CHECK_STORAGE_KEY = 'stridemon:pass-email-check'
const SIGN_IN_STORAGE_KEY = 'stridemon:pass-sign-in'
/** An access token this close to its end is refreshed first, so a mint never trips on it. */
const ACCESS_TOKEN_REFRESH_MARGIN_MILLISECONDS = 60_000

const serverReadiness: PassMintReadiness = {
  emailCheck: null,
  signIn: null,
  heldPassState: { status: 'unknown' },
}

let readiness: PassMintReadiness | null = null
let refreshInFlight: Promise<PassApiResult<SignInTokens>> | null = null
const listeners = new Set<() => void>()

function readReadinessSnapshot(): PassMintReadiness {
  readiness ??= {
    emailCheck: readLiveEmailCheck(),
    signIn: readStoredValue(SIGN_IN_STORAGE_KEY, isSignInTokens),
    heldPassState: { status: 'unknown' },
  }
  return readiness
}

function setReadiness(nextReadiness: PassMintReadiness): void {
  readiness = nextReadiness
  for (const listener of listeners) listener()
}

function subscribeToReadiness(listener: () => void): () => void {
  listeners.add(listener)
  // Another tab checked an email or signed in.
  const readOtherTab = (event: StorageEvent) => {
    if (event.key !== EMAIL_CHECK_STORAGE_KEY && event.key !== SIGN_IN_STORAGE_KEY) return
    const current = readReadinessSnapshot()
    const signIn = readStoredValue(SIGN_IN_STORAGE_KEY, isSignInTokens)
    setReadiness({
      emailCheck: readLiveEmailCheck(),
      signIn,
      heldPassState:
        signIn?.walletAddress === current.signIn?.walletAddress
          ? current.heldPassState
          : { status: 'unknown' },
    })
  }
  window.addEventListener('storage', readOtherTab)
  return () => {
    listeners.delete(listener)
    window.removeEventListener('storage', readOtherTab)
  }
}

export function usePassMintReadiness(): PassMintReadiness {
  return useSyncExternalStore(subscribeToReadiness, readReadinessSnapshot, () => serverReadiness)
}

export function readPassMintReadiness(): PassMintReadiness {
  return readReadinessSnapshot()
}

export function saveEmailCheck(emailCheck: EmailProof): void {
  writeStoredValue(EMAIL_CHECK_STORAGE_KEY, emailCheck)
  setReadiness({ ...readReadinessSnapshot(), emailCheck })
}

export function forgetEmailCheck(): void {
  removeStoredValue(EMAIL_CHECK_STORAGE_KEY)
  setReadiness({ ...readReadinessSnapshot(), emailCheck: null })
}

export function saveSignIn(signIn: SignInTokens): void {
  writeStoredValue(SIGN_IN_STORAGE_KEY, signIn)
  const current = readReadinessSnapshot()
  setReadiness({
    ...current,
    signIn,
    heldPassState:
      current.signIn?.walletAddress === signIn.walletAddress
        ? current.heldPassState
        : { status: 'unknown' },
  })
}

/** Forgets the sign-in here. Its refresh token simply runs out on the server (D-045). */
export function forgetSignIn(): void {
  removeStoredValue(SIGN_IN_STORAGE_KEY)
  setReadiness({ ...readReadinessSnapshot(), signIn: null, heldPassState: { status: 'unknown' } })
}

export function setHeldFoundingPass(heldPass: HeldFoundingPass): void {
  setReadiness({ ...readReadinessSnapshot(), heldPassState: { status: 'held', heldPass } })
}

/** Asks the chain which pass the signed-in wallet holds. A failed read leaves it unknown. */
export async function checkHeldFoundingPass(): Promise<void> {
  const { signIn, heldPassState } = readReadinessSnapshot()
  if (signIn === null || heldPassState.status === 'checking') return
  setReadiness({ ...readReadinessSnapshot(), heldPassState: { status: 'checking' } })
  let nextState: HeldPassState
  try {
    const { readHeldFoundingPass } = await import('./pass-chain-reads')
    const heldPass = await readHeldFoundingPass(signIn.walletAddress)
    nextState = heldPass === null ? { status: 'none' } : { status: 'held', heldPass }
  } catch {
    nextState = { status: 'unknown' }
  }
  // Only if the same wallet is still signed in.
  if (readReadinessSnapshot().signIn?.walletAddress === signIn.walletAddress) {
    setReadiness({ ...readReadinessSnapshot(), heldPassState: nextState })
  }
}

/**
 * Runs a request that needs the sign-in. A token near its end is refreshed first, and a request
 * the API refuses as signed out is refreshed and tried once more. A sign-in the API has ended is
 * forgotten here, and the request answers `REFRESH_TOKEN_REVOKED`.
 */
export async function runSignedInRequest<Data>(
  sendRequest: (accessToken: string) => Promise<PassApiResult<Data>>,
): Promise<PassApiResult<Data>> {
  const { signIn } = readReadinessSnapshot()
  if (signIn === null) {
    return { isOk: false, problem: { kind: 'apiError', code: 'UNAUTHENTICATED', details: {} } }
  }
  let accessToken = signIn.accessToken
  if (isAccessTokenEnding(accessToken)) {
    const refreshResult = await refreshSignIn(signIn.refreshToken)
    if (!refreshResult.isOk) return refreshResult
    accessToken = refreshResult.data.accessToken
  }
  const result = await sendRequest(accessToken)
  if (result.isOk || readProblemCode(result.problem) !== 'UNAUTHENTICATED') return result
  const refreshResult = await refreshSignIn(readReadinessSnapshot().signIn?.refreshToken ?? '')
  if (!refreshResult.isOk) return refreshResult
  return sendRequest(refreshResult.data.accessToken)
}

/**
 * One refresh at a time: refresh tokens are single-use, and the API ends the whole sign-in when
 * one is used twice.
 */
function refreshSignIn(refreshToken: string): Promise<PassApiResult<SignInTokens>> {
  refreshInFlight ??= refreshSignInTokens(refreshToken)
    .then((refreshResult) => {
      if (refreshResult.isOk) {
        saveSignIn(refreshResult.data)
        return refreshResult
      }
      if (refreshResult.problem.kind === 'unreachable') return refreshResult
      // Revoked, expired or unknown: the wallet has to sign in again.
      forgetSignIn()
      return {
        isOk: false as const,
        problem: { kind: 'apiError' as const, code: 'REFRESH_TOKEN_REVOKED', details: {} },
      }
    })
    .finally(() => {
      refreshInFlight = null
    })
  return refreshInFlight
}

function isAccessTokenEnding(accessToken: string): boolean {
  const expiresAtMilliseconds = readAccessTokenExpiry(accessToken)
  return (
    expiresAtMilliseconds === null ||
    expiresAtMilliseconds - Date.now() < ACCESS_TOKEN_REFRESH_MARGIN_MILLISECONDS
  )
}

/** The JWT's `exp`, read without checking the signature: the API checks it. */
function readAccessTokenExpiry(accessToken: string): number | null {
  try {
    const payloadText = accessToken.split('.')[1]
    if (payloadText === undefined) return null
    const payload: unknown = JSON.parse(atob(payloadText.replace(/-/g, '+').replace(/_/g, '/')))
    return isRecord(payload) && typeof payload.exp === 'number' ? payload.exp * 1000 : null
  } catch {
    return null
  }
}

function readLiveEmailCheck(): EmailProof | null {
  const emailCheck = readStoredValue(EMAIL_CHECK_STORAGE_KEY, isEmailProof)
  if (emailCheck === null) return null
  if (!isEmailCheckLive(emailCheck, new Date())) {
    removeStoredValue(EMAIL_CHECK_STORAGE_KEY)
    return null
  }
  return emailCheck
}

export function isEmailCheckLive(emailCheck: EmailProof, now: Date): boolean {
  return Date.parse(emailCheck.emailProofExpiresAt) > now.getTime()
}

function isEmailProof(value: unknown): value is EmailProof {
  return (
    isRecord(value) &&
    typeof value.email === 'string' &&
    typeof value.emailProof === 'string' &&
    typeof value.emailProofExpiresAt === 'string' &&
    !Number.isNaN(Date.parse(value.emailProofExpiresAt))
  )
}

function isSignInTokens(value: unknown): value is SignInTokens {
  return (
    isRecord(value) &&
    typeof value.accessToken === 'string' &&
    typeof value.refreshToken === 'string' &&
    typeof value.walletAddress === 'string' &&
    /^0x[0-9a-fA-F]{40}$/.test(value.walletAddress)
  )
}
