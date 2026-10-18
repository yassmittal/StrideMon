'use client'

import { type FormEvent, useEffect, useId, useRef, useState } from 'react'
import { legalPagePaths } from '@/content/site'
import type { WaitlistProblemKey } from '@/content/waitlist'
import { waitlistContent } from '@/content/waitlist'
import { readProblemCode } from '@/lib/api-request'
import { checkPassEmailWithGoogle } from '@/lib/founding-pass/pass-api'
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
  isLikelyEmail,
  joinWaitlist,
  readWaitlistInvites,
  readWaitlistSource,
  startWaitlistInvitesSession,
  type WaitlistInvites,
} from '@/lib/waitlist-request'
import { useTurnstileToken } from '../founding-pass/turnstile-check'
import { GoogleSignInButton } from '../waitlist/google-sign-in-button'
import { OrDivider } from '../waitlist/or-divider'
import { readWaitlistProblemKey, WaitlistProblemNote } from '../waitlist/waitlist-problem-note'
import { buildPillClassName, PillContent } from './pill-button'
import { WaitlistJoinedCard } from './waitlist-joined-card'

type FormStatus = 'idle' | 'submitting' | 'googleJoining'

type JoinedSignup = StoredWaitlistSignup & {
  /** Known at once after a Google join; after an email join, once the email is confirmed. */
  invites: WaitlistInvites | null
}

// The honeypot's field name in the request body. People never see the field; bots fill it in.
const HONEYPOT_FIELD_NAME = 'website'

/**
 * Joining the waitlist (D-037, D-056, D-059): Continue with Google first (it checks the email
 * without sending one), then an email, posted to the StrideMon API with a Turnstile token that
 * stays out of sight unless it needs a tap. On success the form gives way to the joined card
 * (D-055), the same for a new and a repeat email. This browser remembers the sign-up, so coming
 * back shows the card again, with the count while the invites token lasts.
 */
export function WaitlistForm() {
  const [email, setEmail] = useState('')
  const [status, setStatus] = useState<FormStatus>('idle')
  const [problemKey, setProblemKey] = useState<WaitlistProblemKey | null>(null)
  const [joinedSignup, setJoinedSignup] = useState<JoinedSignup | null>(null)
  const [isRestoring, setIsRestoring] = useState(false)
  // Turnstile starts only once someone begins to join (D-050: browsing never loads it).
  const { turnstileCheck, takeTurnstileToken, armTurnstile } = useTurnstileToken('join-waitlist', {
    isLazy: true,
  })
  const joinedCardRef = useRef<HTMLDivElement>(null)
  const joinedHeadingRef = useRef<HTMLParagraphElement>(null)
  const emailInputRef = useRef<HTMLInputElement>(null)
  const honeypotInputRef = useRef<HTMLInputElement>(null)
  const shouldShowJoinedCardRef = useRef(false)
  const shouldFocusEmailRef = useRef(false)
  const fieldId = useId()
  const emailInputId = `${fieldId}-email`
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
        const restoredSignup = {
          email: storedSession.email,
          inviteUrl: result.data.inviteUrl,
          isJoinedThroughFriend:
            storedSignup?.email === storedSession.email && storedSignup.isJoinedThroughFriend,
        }
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
    // The form is gone, so keep keyboard focus on what replaced it, and back again. Right after
    // joining, the card comes into view with its link; a card restored on arrival stays put.
    if (joinedSignup !== null) {
      if (!shouldShowJoinedCardRef.current) return
      shouldShowJoinedCardRef.current = false
      joinedHeadingRef.current?.focus({ preventScroll: true })
      const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
      joinedCardRef.current?.scrollIntoView({
        block: 'start',
        behavior: prefersReducedMotion ? 'auto' : 'smooth',
      })
    } else if (shouldFocusEmailRef.current) {
      shouldFocusEmailRef.current = false
      emailInputRef.current?.focus()
      emailInputRef.current?.select()
    }
  }, [joinedSignup])

  function showJoinedSignup(signup: StoredWaitlistSignup, invites: WaitlistInvites | null) {
    saveWaitlistSignup(signup)
    shouldShowJoinedCardRef.current = true
    setJoinedSignup({ ...signup, invites })
  }

  /** Change: this browser forgets the sign-up, and the form comes back with the email in it. */
  function changeEmail(joinedEmail: string) {
    forgetWaitlistSignup()
    shouldFocusEmailRef.current = true
    setEmail(joinedEmail)
    setStatus('idle')
    setJoinedSignup(null)
  }

  /** Joins with a Turnstile token; `emailProof` (from Google) confirms the sign-up at once. */
  async function sendJoin(
    joinEmail: string,
    emailProof: string | null,
  ): Promise<StoredWaitlistSignup | null> {
    const turnstileToken = await takeTurnstileToken()
    if (turnstileToken === null) {
      setProblemKey('turnstileUnavailable')
      return null
    }
    const arrivalInviteCode = readArrivalInviteCode()
    const result = await joinWaitlist({
      email: joinEmail,
      source: readWaitlistSource(window.location.search),
      inviteCode: arrivalInviteCode,
      emailProof,
      turnstileToken,
      honeypotValue: honeypotInputRef.current?.value ?? '',
    })
    if (!result.isOk) {
      setProblemKey(readWaitlistProblemKey(readProblemCode(result.problem), result.problem.kind))
      return null
    }
    const ownInviteCode = readInviteCodeFromUrl(result.data)
    if (ownInviteCode !== null) saveOwnInviteCode(ownInviteCode)
    return {
      email: joinEmail,
      inviteUrl: result.data,
      // Your own code never counts as your inviter (D-056).
      isJoinedThroughFriend: arrivalInviteCode !== null && arrivalInviteCode !== ownInviteCode,
    }
  }

  async function joinWithEmail(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (status !== 'idle') return
    if (!isLikelyEmail(email)) {
      setProblemKey('emailInvalid')
      return
    }
    setProblemKey(null)
    setStatus('submitting')
    const joinedSignupResult = await sendJoin(email.trim(), null)
    setStatus('idle')
    if (joinedSignupResult !== null) showJoinedSignup(joinedSignupResult, null)
  }

  async function joinWithGoogle(googleIdToken: string) {
    if (status !== 'idle') return
    setProblemKey(null)
    setStatus('googleJoining')
    const googleResult = await checkPassEmailWithGoogle(googleIdToken)
    if (!googleResult.isOk) {
      setStatus('idle')
      setProblemKey(
        readWaitlistProblemKey(readProblemCode(googleResult.problem), googleResult.problem.kind),
      )
      return
    }
    const emailProof = googleResult.data
    const joinedSignupResult = await sendJoin(emailProof.email, emailProof.emailProof)
    if (joinedSignupResult === null) {
      setStatus('idle')
      return
    }
    // The email is checked, so the invites show at once: "0 of 3 friends confirmed".
    const sessionResult = await startWaitlistInvitesSession(emailProof.emailProof)
    if (sessionResult.isOk) {
      saveInvitesSession({
        email: emailProof.email,
        invitesToken: sessionResult.data.invitesToken,
        invitesTokenExpiresAt: sessionResult.data.invitesTokenExpiresAt,
      })
    }
    setStatus('idle')
    setEmail(emailProof.email)
    showJoinedSignup(joinedSignupResult, sessionResult.isOk ? sessionResult.data.invites : null)
  }

  if (joinedSignup !== null) {
    return (
      <div ref={joinedCardRef} className="scroll-mt-4">
        <WaitlistJoinedCard
          email={joinedSignup.email}
          inviteUrl={joinedSignup.inviteUrl}
          invites={joinedSignup.invites}
          isJoinedThroughFriend={joinedSignup.isJoinedThroughFriend}
          onInvitesReady={(invites) => setJoinedSignup({ ...joinedSignup, invites })}
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
      {status === 'googleJoining' ? (
        <p aria-live="polite" className="text-sm leading-[1.4] text-ink-secondary-small">
          {waitlistContent.googleJoiningLabel}
        </p>
      ) : null}

      <OrDivider />

      <form noValidate onSubmit={joinWithEmail} className="flex flex-col gap-3">
        <label htmlFor={emailInputId} className="sr-only">
          {waitlistContent.emailLabel}
        </label>
        <input
          ref={emailInputRef}
          id={emailInputId}
          name="email"
          type="email"
          autoComplete="email"
          inputMode="email"
          spellCheck={false}
          required
          placeholder={waitlistContent.emailPlaceholder}
          value={email}
          onFocus={armTurnstile}
          onChange={(event) => {
            setEmail(event.target.value)
            if (problemKey !== null) setProblemKey(null)
          }}
          aria-invalid={problemKey === 'emailInvalid' || problemKey === 'emailDisposable'}
          aria-describedby={`${problemId} ${promiseId}`}
          className="h-[52px] w-full rounded-full border border-hairline bg-page px-5 text-base placeholder:text-ink-secondary transition-colors duration-300 ease-standard focus-visible:border-ink aria-invalid:border-ink"
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

        {turnstileCheck}

        <div className="flex flex-col">
          <div id={problemId} aria-live="polite" className="not-empty:mb-3">
            {problemKey !== null ? <WaitlistProblemNote problemKey={problemKey} /> : null}
          </div>
          <button
            type="submit"
            disabled={status !== 'idle'}
            className={buildPillClassName('primary', 'regular', 'self-start disabled:opacity-60')}
          >
            <PillContent
              label={
                status === 'submitting'
                  ? waitlistContent.submittingLabel
                  : waitlistContent.submitLabel
              }
            />
          </button>
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
      </form>
    </div>
  )
}
