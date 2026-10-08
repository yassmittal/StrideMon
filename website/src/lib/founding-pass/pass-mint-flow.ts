'use client'

import { useSyncExternalStore } from 'react'
import type { MintProblemKey } from '@/content/founding-pass-mint'
import { isRecord, readStoredValue, removeStoredValue, writeStoredValue } from '../browser-storage'
import {
  type PassApiProblem,
  type PassMint,
  readPassMint,
  readProblemCode,
  requestPassMint,
} from './pass-api'
import { listTakenDesignNumbers } from './pass-collection'
import { findSimilarPassDesigns } from './pass-design'
import {
  checkHeldFoundingPass,
  forgetEmailCheck,
  readPassMintReadiness,
  runSignedInRequest,
  setHeldFoundingPass,
} from './pass-mint-readiness'
import { readLatestPassCollection, retryPassCollection } from './use-pass-collection'

// The mint (D-045): one tap posts it with a fresh Turnstile token, the page polls it until the
// chain confirms, then the reveal. A mint in progress is kept in this browser, so a reload picks
// it up again. Every refusal becomes a problem with a plain next step.

export type MintProblem =
  | {
      key: Exclude<
        MintProblemKey,
        'alreadyMinted' | 'rateLimited' | 'notOpen' | 'waitlistOnly' | 'codeIncorrect'
      >
    }
  | { key: 'alreadyMinted'; similarDesignNumbers: readonly number[] }
  | { key: 'rateLimited'; retryAfterSeconds: number | null }
  | { key: 'notOpen'; opensAt: string | null }
  | { key: 'waitlistOnly'; openMintStartsAt: string | null }

export type FounderRefusal = {
  /** How the API knew: this email, or this wallet, already has a pass. */
  reason: 'email' | 'wallet'
  designNumber: number | null
}

export type MintStage =
  | { kind: 'ready' }
  | { kind: 'requesting' }
  | { kind: 'minting'; mint: PassMint; isSlow: boolean; hasLostContact: boolean }
  | { kind: 'revealed'; mint: PassMint }
  | { kind: 'problem'; problem: MintProblem }
  | { kind: 'founder'; founderRefusal: FounderRefusal }

export type PassMintFlowState = {
  /** The pass in the mint dialog, or null when it's closed. */
  designNumber: number | null
  /** The pass the stage is about (it can differ while a mint is still going). */
  stageDesignNumber: number | null
  stage: MintStage
  /** Tapped Mint and waiting for Turnstile's token. */
  isWaitingForTurnstile: boolean
  turnstileToken: string | null
  /** Bumped after each use: every token works once. */
  turnstileResetKey: number
  hasTurnstileProblem: boolean
}

type StoredMintInProgress = { mintId: string; designNumber: number; walletAddress: string }

const MINT_IN_PROGRESS_STORAGE_KEY = 'stridemon:pass-mint-in-progress'
const SIMILAR_PASS_COUNT = 3
/** A mint usually confirms in 2 to 4 seconds (the outbox polls every 2, Monad takes about 1). */
const SLOW_MINT_MILLISECONDS = 12_000
const GIVE_UP_POLLING_MILLISECONDS = 5 * 60_000
const FAST_POLL_MILLISECONDS = 1000
const SLOW_POLL_MILLISECONDS = 3000
const FAST_POLL_FOR_MILLISECONDS = 30_000
const MAX_FAILED_POLLS_IN_A_ROW = 10

const initialState: PassMintFlowState = {
  designNumber: null,
  stageDesignNumber: null,
  stage: { kind: 'ready' },
  isWaitingForTurnstile: false,
  turnstileToken: null,
  turnstileResetKey: 0,
  hasTurnstileProblem: false,
}

let state = initialState
let pollGeneration = 0
const listeners = new Set<() => void>()

function setState(nextState: PassMintFlowState): void {
  state = nextState
  for (const listener of listeners) listener()
}

function subscribeToMintFlow(listener: () => void): () => void {
  listeners.add(listener)
  return () => listeners.delete(listener)
}

export function usePassMintFlow(): PassMintFlowState {
  return useSyncExternalStore(
    subscribeToMintFlow,
    () => state,
    () => initialState,
  )
}

function isMintGoing(stage: MintStage): boolean {
  return stage.kind === 'requesting' || stage.kind === 'minting'
}

/**
 * Opens the mint dialog on a pass. With `startNow`, a visitor who is ready mints at once: the one
 * tap on mint day. A mint still going keeps the dialog on it.
 */
export function openPassMint(designNumber: number, { startNow }: { startNow: boolean }): void {
  if (isMintGoing(state.stage) || state.stage.kind === 'revealed') {
    setState({ ...state, designNumber: state.stageDesignNumber ?? designNumber })
    return
  }
  setState({
    ...state,
    designNumber,
    stageDesignNumber: designNumber,
    stage: { kind: 'ready' },
    isWaitingForTurnstile: false,
  })
  // A wallet that already holds a pass sees it instead: one pass per wallet.
  const isFounder = readPassMintReadiness().heldPassState.status === 'held'
  if (startNow && isReadyToMint() && !isFounder) requestMint()
}

/** Closes the dialog. A mint still going carries on, and opening the dialog shows it again. */
export function closePassMint(): void {
  const isFinished = state.stage.kind === 'revealed'
  setState({
    ...state,
    designNumber: null,
    isWaitingForTurnstile: false,
    ...(isFinished || state.stage.kind === 'problem' || state.stage.kind === 'founder'
      ? { stage: { kind: 'ready' as const }, stageDesignNumber: null }
      : {}),
  })
}

/** Shows the reveal again (from "See your pass"), when this visit has one. */
export function reopenPassReveal(): void {
  if (state.stage.kind === 'revealed' || isMintGoing(state.stage)) {
    setState({ ...state, designNumber: state.stageDesignNumber })
  }
}

export function isReadyToMint(): boolean {
  const { emailCheck, signIn } = readPassMintReadiness()
  return emailCheck !== null && signIn !== null
}

/** The Mint button: posts as soon as Turnstile has a token. */
export function requestMint(): void {
  if (state.stageDesignNumber === null || isMintGoing(state.stage) || !isReadyToMint()) return
  // The check can't run (blocked or offline): its note already says what to do.
  if (state.turnstileToken === null && state.hasTurnstileProblem) return
  setState({ ...state, stage: { kind: 'ready' }, isWaitingForTurnstile: true })
  if (state.turnstileToken !== null) void submitMint(state.turnstileToken)
}

/** One of the similar passes, after a lost race: mints it with the same tap. */
export function mintSimilarDesign(designNumber: number): void {
  if (isMintGoing(state.stage)) return
  setState({
    ...state,
    designNumber,
    stageDesignNumber: designNumber,
    stage: { kind: 'ready' },
  })
  requestMint()
}

export function setMintTurnstileToken(turnstileToken: string | null): void {
  setState({ ...state, turnstileToken, hasTurnstileProblem: false })
  if (turnstileToken !== null && state.isWaitingForTurnstile && !isMintGoing(state.stage)) {
    void submitMint(turnstileToken)
  }
}

export function reportMintTurnstileProblem(): void {
  setState({ ...state, hasTurnstileProblem: true, isWaitingForTurnstile: false })
}

async function submitMint(turnstileToken: string): Promise<void> {
  const designNumber = state.stageDesignNumber
  const { emailCheck } = readPassMintReadiness()
  if (designNumber === null || emailCheck === null) {
    setState({ ...state, isWaitingForTurnstile: false })
    return
  }
  setState({
    ...state,
    stage: { kind: 'requesting' },
    isWaitingForTurnstile: false,
    // The token is spent: ask Turnstile for the next one.
    turnstileToken: null,
    turnstileResetKey: state.turnstileResetKey + 1,
  })
  const mintResult = await runSignedInRequest((accessToken) =>
    requestPassMint(
      { designNumber, emailProof: emailCheck.emailProof, turnstileToken },
      accessToken,
    ),
  )
  if (state.stageDesignNumber !== designNumber) return
  if (mintResult.isOk) {
    startFollowingMint(mintResult.data)
    return
  }
  handleMintRefusal(mintResult.problem)
}

function handleMintRefusal(problem: PassApiProblem): void {
  const code = readProblemCode(problem)
  const details = problem.kind === 'apiError' ? problem.details : {}
  switch (code) {
    case 'PASS_WALLET_ALREADY_USED': {
      // Our own mint for this wallet, maybe still in the queue: follow it to its reveal.
      if (typeof details.mintId === 'string') {
        void followExistingMint(details.mintId, readDesignNumber(details.designNumber))
        return
      }
      void checkHeldFoundingPass()
      showFounder({ reason: 'wallet', designNumber: readDesignNumber(details.designNumber) })
      return
    }
    case 'PASS_EMAIL_ALREADY_USED':
      showFounder({ reason: 'email', designNumber: readDesignNumber(details.designNumber) })
      return
    case 'PASS_ALREADY_MINTED':
      retryPassCollection()
      showProblem({
        key: 'alreadyMinted',
        similarDesignNumbers: readDesignNumbers(details.similarAvailableDesignNumbers),
      })
      return
    case 'EMAIL_PROOF_INVALID':
      forgetEmailCheck()
      showProblem({ key: 'emailProofInvalid' })
      return
    default:
      showProblem(toMintProblem(problem))
  }
}

/** The problem for a refusal that needs no more than its message (and maybe a time). */
function toMintProblem(problem: PassApiProblem): MintProblem {
  if (problem.kind === 'unreachable') return { key: 'unreachable' }
  const { code, details } = problem
  switch (code) {
    case 'TURNSTILE_FAILED':
      return { key: 'turnstileFailed' }
    case 'UNAUTHENTICATED':
    case 'REFRESH_TOKEN_REVOKED':
      return { key: 'signInEnded' }
    case 'PASS_MINT_NOT_OPEN':
      return { key: 'notOpen', opensAt: readTimestamp(details.opensAt) }
    case 'PASS_WAITLIST_WINDOW_ONLY':
      return { key: 'waitlistOnly', openMintStartsAt: readTimestamp(details.openMintStartsAt) }
    case 'PASS_ALL_MINTED':
      return { key: 'allMinted' }
    case 'PASS_MINT_CLOSED':
      return { key: 'mintClosed' }
    case 'PASS_MINT_FAILED':
      return { key: 'mintFailed' }
    case 'RATE_LIMITED':
      return {
        key: 'rateLimited',
        retryAfterSeconds:
          typeof details.retryAfterSeconds === 'number' ? details.retryAfterSeconds : null,
      }
    default:
      return { key: 'unexpected' }
  }
}

function showProblem(problem: MintProblem): void {
  setState({ ...state, stage: { kind: 'problem', problem }, isWaitingForTurnstile: false })
}

function showFounder(founderRefusal: FounderRefusal): void {
  setState({ ...state, stage: { kind: 'founder', founderRefusal }, isWaitingForTurnstile: false })
}

function startFollowingMint(mint: PassMint): void {
  const { signIn } = readPassMintReadiness()
  if (signIn !== null) {
    writeStoredValue(MINT_IN_PROGRESS_STORAGE_KEY, {
      mintId: mint.mintId,
      designNumber: mint.designNumber,
      walletAddress: signIn.walletAddress,
    } satisfies StoredMintInProgress)
  }
  applyMintAnswer(mint, Date.now())
  if (mint.status === 'queued') void pollMint(mint.mintId, Date.now())
}

async function followExistingMint(mintId: string, designNumber: number | null): Promise<void> {
  const result = await runSignedInRequest((accessToken) => readPassMint(mintId, accessToken))
  if (!result.isOk) {
    showFounder({ reason: 'wallet', designNumber })
    return
  }
  const mint = result.data
  setState({
    ...state,
    stageDesignNumber: mint.designNumber,
    designNumber: state.designNumber === null ? null : mint.designNumber,
  })
  startFollowingMint(mint)
}

/**
 * Picks up a mint this browser started (after a reload), if the same wallet is still signed in.
 * Opens the dialog on it, so the reveal isn't missed.
 */
export function resumePassMintInProgress(): void {
  const stored = readStoredValue(MINT_IN_PROGRESS_STORAGE_KEY, isStoredMintInProgress)
  if (stored === null || isMintGoing(state.stage)) return
  const { signIn } = readPassMintReadiness()
  if (
    signIn === null ||
    signIn.walletAddress.toLowerCase() !== stored.walletAddress.toLowerCase()
  ) {
    return
  }
  setState({
    ...state,
    designNumber: stored.designNumber,
    stageDesignNumber: stored.designNumber,
    stage: {
      kind: 'minting',
      mint: {
        mintId: stored.mintId,
        designNumber: stored.designNumber,
        status: 'queued',
        transactionHash: null,
        founderNumber: null,
        hasGoldFrame: null,
        failureCode: null,
      },
      isSlow: false,
      hasLostContact: false,
    },
  })
  void pollMint(stored.mintId, Date.now(), { shouldAskAtOnce: true })
}

/** "Check again" on a slow or out-of-touch mint. */
export function checkMintAgain(): void {
  const stored = readStoredValue(MINT_IN_PROGRESS_STORAGE_KEY, isStoredMintInProgress)
  if (stored === null) {
    setState({ ...state, stage: { kind: 'ready' } })
    return
  }
  resumePassMintInProgress()
}

async function pollMint(
  mintId: string,
  startedAtMilliseconds: number,
  { shouldAskAtOnce = false }: { shouldAskAtOnce?: boolean } = {},
): Promise<void> {
  pollGeneration += 1
  const generation = pollGeneration
  let failedPollsInARow = 0
  let isFirstPoll = true
  while (generation === pollGeneration) {
    const elapsedMilliseconds = Date.now() - startedAtMilliseconds
    if (!(isFirstPoll && shouldAskAtOnce)) {
      await sleep(
        elapsedMilliseconds < FAST_POLL_FOR_MILLISECONDS
          ? FAST_POLL_MILLISECONDS
          : SLOW_POLL_MILLISECONDS,
      )
    }
    isFirstPoll = false
    if (generation !== pollGeneration) return
    if (Date.now() - startedAtMilliseconds > GIVE_UP_POLLING_MILLISECONDS) {
      showProblem({ key: 'mintStillQueued' })
      return
    }
    const result = await runSignedInRequest((accessToken) => readPassMint(mintId, accessToken))
    if (generation !== pollGeneration) return
    if (result.isOk) {
      failedPollsInARow = 0
      applyMintAnswer(result.data, startedAtMilliseconds)
      if (result.data.status !== 'queued') return
      continue
    }
    const code = readProblemCode(result.problem)
    if (code === 'REFRESH_TOKEN_REVOKED' || code === 'UNAUTHENTICATED') {
      // The mint is still stored: signing in again picks it up.
      showProblem({ key: 'signInEnded' })
      return
    }
    if (code === 'NOT_FOUND') {
      removeStoredValue(MINT_IN_PROGRESS_STORAGE_KEY)
      showProblem({ key: 'unexpected' })
      return
    }
    failedPollsInARow += 1
    if (failedPollsInARow >= MAX_FAILED_POLLS_IN_A_ROW) {
      showProblem({ key: 'mintLostContact' })
      return
    }
    if (state.stage.kind === 'minting') {
      setState({ ...state, stage: { ...state.stage, hasLostContact: true } })
    }
  }
}

function applyMintAnswer(mint: PassMint, startedAtMilliseconds: number): void {
  if (mint.status === 'queued') {
    setState({
      ...state,
      stageDesignNumber: mint.designNumber,
      stage: {
        kind: 'minting',
        mint,
        isSlow: Date.now() - startedAtMilliseconds > SLOW_MINT_MILLISECONDS,
        hasLostContact: false,
      },
    })
    return
  }
  removeStoredValue(MINT_IN_PROGRESS_STORAGE_KEY)
  retryPassCollection()
  if (mint.status === 'confirmed') {
    const { signIn } = readPassMintReadiness()
    if (signIn !== null && mint.founderNumber !== null) {
      setHeldFoundingPass({
        walletAddress: signIn.walletAddress,
        designNumber: mint.designNumber,
        founderNumber: mint.founderNumber,
        hasGoldFrame: mint.hasGoldFrame === true,
        isLaced: false,
      })
    }
    setState({ ...state, stageDesignNumber: mint.designNumber, stage: { kind: 'revealed', mint } })
    return
  }
  // Failed on the way: nothing was minted.
  switch (mint.failureCode) {
    case 'PASS_ALREADY_MINTED':
      showProblem({
        key: 'alreadyMinted',
        similarDesignNumbers: findSimilarPassDesigns({
          designNumber: mint.designNumber,
          takenDesignNumbers: new Set([
            ...listTakenDesignNumbers(readLatestPassCollection()),
            mint.designNumber,
          ]),
          count: SIMILAR_PASS_COUNT,
        }).map((design) => design.designNumber),
      })
      return
    case 'PASS_WALLET_ALREADY_USED':
      void checkHeldFoundingPass()
      showFounder({ reason: 'wallet', designNumber: null })
      return
    default:
      showProblem({ key: 'mintFailed' })
  }
}

function readDesignNumber(value: unknown): number | null {
  return Number.isInteger(value) ? (value as number) : null
}

function readDesignNumbers(value: unknown): readonly number[] {
  return Array.isArray(value)
    ? value.filter((entry): entry is number => Number.isInteger(entry))
    : []
}

function readTimestamp(value: unknown): string | null {
  return typeof value === 'string' && !Number.isNaN(Date.parse(value)) ? value : null
}

function isStoredMintInProgress(value: unknown): value is StoredMintInProgress {
  return (
    isRecord(value) &&
    typeof value.mintId === 'string' &&
    Number.isInteger(value.designNumber) &&
    typeof value.walletAddress === 'string'
  )
}

function sleep(milliseconds: number): Promise<void> {
  return new Promise((resolve) => window.setTimeout(resolve, milliseconds))
}
