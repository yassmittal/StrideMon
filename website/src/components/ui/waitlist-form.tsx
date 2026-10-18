'use client'

import { useEffect, useId, useRef, useState } from 'react'
import { legalPagePaths } from '@/content/site'
import type { WaitlistProblemKey } from '@/content/waitlist'
import { waitlistContent, waitlistInvitesPageContent } from '@/content/waitlist'
import { readProblemCode } from '@/lib/api-request'
import { checkPassEmailWithGoogle, type EmailProof } from '@/lib/founding-pass/pass-api'
import {
  forgetInvitesSession,
  forgetWaitlistSignup,
  readArrivalInviteCode,
  readInviteCodeFromUrl,
  readStoredInvitesSession,
  readStoredWaitlistSignup,
  type StoredWaitlistSignup,
  saveInvitesSession,
  saveOwnInviteCode,
  saveWaitlistSignup,
} from '@/lib/waitlist-invites'
import {
  joinWaitlist,
  readWaitlistInvites,
  readWaitlistSource,
  startWaitlistInvitesSession,
  type WaitlistInvites,
} from '@/lib/waitlist-request'
import { MintTextButton } from '../founding-pass/mint-problem-note'
import { useTurnstileToken } from '../founding-pass/turnstile-check'
import { GoogleSignInButton } from '../waitlist/google-sign-in-button'
import { OrDivider } from '../waitlist/or-divider'
import { WaitlistEmailCodeCheck } from '../waitlist/waitlist-email-code-check'
import { readWaitlistProblemKey, WaitlistProblemNote } from '../waitlist/waitlist-problem-note'
import { WaitlistJoinedCard } from './waitlist-joined-card'

type FormStatus = 'idle' | 'joining' | 'googleJoining'

type JoinedSignup = StoredWaitlistSignup & {
  /** Known at once after joining (D-060); null for a sign-up whose invites token is gone. */
  invites: WaitlistInvites | null
}

// The honeypot's field name in the request body. People never see the field; bots fill it in.
const HONEYPOT_FIELD_NAME = 'website'

// Refusals about the email itself: those need another email, not another try with the same proof.
const EMAIL_PROBLEM_KEYS: readonly WaitlistProblemKey[] = ['emailInvalid', 'emailDisposable']

/**
 * Joining the waitlist (D-037, D-056, D-059, D-060), always with a checked email: Continue with
 * Google, or an email and the 6-digit code that Join the waitlist sends. The join then goes to the
 * StrideMon API with that proof and a Turnstile token that stays out of sight unless it needs a
 * tap. On success the form gives way to the joined card (D-055), the same for a new and a repeat
 * email. This browser remembers the sign-up, so coming back shows the card again, with the count
 * while the invites token lasts.
 */
export function WaitlistForm() {
  const [status, setStatus] = useState<FormStatus>('idle')
  const [problemKey, setProblemKey] = useState<WaitlistProblemKey | null>(null)
  const [joinedSignup, setJoinedSignup] = useState<JoinedSignup | null>(null)
  const [isRestoring, setIsRestoring] = useState(false)
  // A refused join or Change starts the email step again, with the email in the box.
  const [emailStepKey, setEmailStepKey] = useState(0)
  const [emailStepEmail, setEmailStepEmail] = useState('')
  // A checked email whose join didn't go through for a passing reason: Try again reuses it, so
  // nobody spends a second code (proofs last 6 hours).
  const [retryEmailProof, setRetryEmailProof] = useState<EmailProof | null>(null)
  // Turnstile starts only once someone begins to join (D-050: browsing never loads it).
  const { turnstileCheck, takeTurnstileToken, armTurnstile } = useTurnstileToken('join-waitlist', {
    isLazy: true,
  })
  const joinedCardRef = useRef<HTMLDivElement>(null)
  const joinedHeadingRef = useRef<HTMLParagraphElement>(null)
  const honeypotInputRef = useRef<HTMLInputElement>(null)
  const shouldShowJoinedCardRef = useRef(false)
  const fieldId = useId()
  const problemId = `${fieldId}-problem`
  const promiseId = `${fieldId}-promise`

  useEffect(() => {
    let isCancelled = false
    // A sign-up from an earlier visit: the card again, with the count if the token still works.
    async function restoreWaitlistSignup() {
      const storedSignup = readStoredWaitlistSignup()
      const storedSession = readStoredInvitesSession(new Date())
      if (storedSession === null) {
        if (storedSignup !== null) setJoinedSignup({ ...storedSignup, invites: null })
        return
      }
      setIsRestoring(true)
      const result = await readWaitlistInvites(storedSession.invitesToken)
      if (isCancelled) return
      setIsRestoring(false)
      if (result.isOk && result.data.isOnWaitlist) {
        // The token's email was checked, so it wins over a sign-up saved for another email.
        const restoredSignup = { email: storedSession.email, inviteUrl: result.data.inviteUrl }
        saveWaitlistSignup(restoredSignup)
        const ownInviteCode = readInviteCodeFromUrl(result.data.inviteUrl)
        if (ownInviteCode !== null) saveOwnInviteCode(ownInviteCode)
        setJoinedSignup({ ...restoredSignup, invites: result.data })
        return
      }
      if (!result.isOk && readProblemCode(result.problem) === 'INVITES_TOKEN_INVALID') {
        forgetInvitesSession()
      }
      if (storedSignup !== null) setJoinedSignup({ ...storedSignup, invites: null })
    }
    void restoreWaitlistSignup()
    return () => {
      isCancelled = true
    }
  }, [])

  useEffect(() => {
    // The form is gone, so keep keyboard focus on what replaced it. Right after joining, the card
    // comes into view with its link; a card restored on arrival stays put.
    if (joinedSignup === null || !shouldShowJoinedCardRef.current) return
    shouldShowJoinedCardRef.current = false
    joinedHeadingRef.current?.focus({ preventScroll: true })
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    joinedCardRef.current?.scrollIntoView({
      block: 'start',
      behavior: prefersReducedMotion ? 'auto' : 'smooth',
    })
  }, [joinedSignup])

  /** Change: this browser forgets the sign-up, and the email step comes back with the email in it. */
  function changeEmail(joinedEmail: string) {
    forgetWaitlistSignup()
    setEmailStepEmail(joinedEmail)
    setEmailStepKey((key) => key + 1)
    setStatus('idle')
    setJoinedSignup(null)
  }

  /** A join that didn't go through: what went wrong, Try again when it may pass next time. */
  function showRefusedJoin(emailProof: EmailProof, refusedProblemKey: WaitlistProblemKey) {
    setStatus('idle')
    setProblemKey(refusedProblemKey)
    setRetryEmailProof(EMAIL_PROBLEM_KEYS.includes(refusedProblemKey) ? null : emailProof)
    setEmailStepEmail(emailProof.email)
    setEmailStepKey((key) => key + 1)
  }

  /**
   * Joins with a checked email: the proof (from Google or a code) confirms the sign-up at once,
   * so it counts for whoever invited it, and opens its invites with a 30-day token.
   */
  async function joinWithEmailProof(emailProof: EmailProof) {
    const turnstileToken = await takeTurnstileToken()
    if (turnstileToken === null) {
      showRefusedJoin(emailProof, 'turnstileUnavailable')
      return
    }
    const joinResult = await joinWaitlist({
      email: emailProof.email,
      source: readWaitlistSource(window.location.search),
      inviteCode: readArrivalInviteCode(),
      emailProof: emailProof.emailProof,
      turnstileToken,
      honeypotValue: honeypotInputRef.current?.value ?? '',
    })
    if (!joinResult.isOk) {
      showRefusedJoin(
        emailProof,
        readWaitlistProblemKey(readProblemCode(joinResult.problem), joinResult.problem.kind),
      )
      return
    }
    const ownInviteCode = readInviteCodeFromUrl(joinResult.data)
    if (ownInviteCode !== null) saveOwnInviteCode(ownInviteCode)
    const sessionResult = await startWaitlistInvitesSession(emailProof.emailProof)
    if (sessionResult.isOk) {
      saveInvitesSession({
        email: emailProof.email,
        invitesToken: sessionResult.data.invitesToken,
        invitesTokenExpiresAt: sessionResult.data.invitesTokenExpiresAt,
      })
    }
    const signup = { email: emailProof.email, inviteUrl: joinResult.data }
    saveWaitlistSignup(signup)
    shouldShowJoinedCardRef.current = true
    setStatus('idle')
    setJoinedSignup({ ...signup, invites: sessionResult.isOk ? sessionResult.data.invites : null })
  }

  async function joinWithCodeProof(emailProof: EmailProof) {
    if (status !== 'idle') return
    setProblemKey(null)
    setRetryEmailProof(null)
    setStatus('joining')
    await joinWithEmailProof(emailProof)
  }

  /** A new code is on its way: the join's robot check can start, and the old problem goes. */
  function startJoinStep() {
    armTurnstile()
    setProblemKey(null)
    setRetryEmailProof(null)
  }

  async function joinWithGoogle(googleIdToken: string) {
    if (status !== 'idle') return
    setProblemKey(null)
    setRetryEmailProof(null)
    setStatus('googleJoining')
    const googleResult = await checkPassEmailWithGoogle(googleIdToken)
    if (!googleResult.isOk) {
      setStatus('idle')
      setProblemKey(
        readWaitlistProblemKey(readProblemCode(googleResult.problem), googleResult.problem.kind),
      )
      return
    }
    await joinWithEmailProof(googleResult.data)
  }

  if (joinedSignup !== null) {
    return (
      <div ref={joinedCardRef} className="scroll-mt-4">
        <WaitlistJoinedCard
          email={joinedSignup.email}
          inviteUrl={joinedSignup.inviteUrl}
          invites={joinedSignup.invites}
          headingRef={joinedHeadingRef}
          onChangeEmail={() => changeEmail(joinedSignup.email)}
        />
      </div>
    )
  }

  if (isRestoring) {
    return (
      <p aria-live="polite" className="text-base leading-[1.45] text-ink-secondary-small">
        {waitlistContent.restoringLabel}
      </p>
    )
  }

  return (
    <div className="flex flex-col gap-4">
      <GoogleSignInButton onGoogleIdToken={(googleIdToken) => void joinWithGoogle(googleIdToken)} />
      <OrDivider />
      <WaitlistEmailCodeCheck
        key={emailStepKey}
        initialEmail={emailStepEmail}
        sendCodeLabel={waitlistContent.submitLabel}
        sendingLabel={waitlistContent.sendingCodeLabel}
        emailDescriptionId={`${problemId} ${promiseId}`}
        onCodeSent={startJoinStep}
        onEmailProof={(emailProof) => void joinWithCodeProof(emailProof)}
      />

      {/* Honeypot: off-screen and out of the tab order, so only a bot fills it in. */}
      <div aria-hidden="true" className="absolute -left-[9999px] h-px w-px overflow-hidden">
        <label>
          Website
          <input
            ref={honeypotInputRef}
            type="text"
            name={HONEYPOT_FIELD_NAME}
            tabIndex={-1}
            autoComplete="off"
          />
        </label>
      </div>

      <div className="flex flex-col">
        {/* Out of sight unless it needs a tap, so it sits where it takes no gap. */}
        {turnstileCheck}
        <div id={problemId} aria-live="polite" className="not-empty:mb-4">
          {status === 'joining' || status === 'googleJoining' ? (
            <p className="text-sm leading-[1.4] text-ink-secondary-small">
              {status === 'joining'
                ? waitlistContent.joiningLabel
                : waitlistContent.googleJoiningLabel}
            </p>
          ) : problemKey !== null ? (
            <WaitlistProblemNote
              problemKey={problemKey}
              actions={
                retryEmailProof === null ? null : (
                  <MintTextButton
                    label={waitlistInvitesPageContent.tryAgainLabel}
                    onClick={() => void joinWithCodeProof(retryEmailProof)}
                  />
                )
              }
            />
          ) : null}
        </div>
        <p id={promiseId} className="max-w-[34em] text-sm leading-[1.4] text-ink-secondary-small">
          {waitlistContent.promise}{' '}
          <a
            href={legalPagePaths.privacyPolicy}
            className="text-ink underline decoration-hairline underline-offset-4 transition-colors duration-300 ease-standard hover:decoration-current"
          >
            {waitlistContent.privacyLabel}
          </a>
        </p>
      </div>
    </div>
  )
}
