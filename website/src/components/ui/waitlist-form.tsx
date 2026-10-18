'use client'

import { type FormEvent, type ReactNode, useEffect, useId, useRef, useState } from 'react'
import type { WaitlistProblemKey } from '@/content/waitlist'
import { waitlistContent, waitlistPhonePlatformOptions } from '@/content/waitlist'
import { readProblemCode } from '@/lib/api-request'
import { checkPassEmailWithGoogle } from '@/lib/founding-pass/pass-api'
import {
  readArrivalInviteCode,
  readInviteCodeFromUrl,
  saveInvitesSession,
  saveOwnInviteCode,
} from '@/lib/waitlist-invites'
import {
  isLikelyEmail,
  joinWaitlist,
  readWaitlistSource,
  startWaitlistInvitesSession,
  type WaitlistInvites,
  type WaitlistPhonePlatform,
} from '@/lib/waitlist-request'
import { useTurnstileToken } from '../founding-pass/turnstile-check'
import { GoogleSignInButton } from '../waitlist/google-sign-in-button'
import { readWaitlistProblemKey, WaitlistProblemNote } from '../waitlist/waitlist-problem-note'
import { buildPillClassName, PillContent } from './pill-button'
import { WaitlistJoinedCard } from './waitlist-joined-card'

type FormStatus = 'idle' | 'submitting' | 'googleJoining'

type JoinedSignup = {
  email: string
  inviteUrl: string
  /** Known at once after a Google join; after an email join, once the email is confirmed. */
  invites: WaitlistInvites | null
}

// The honeypot's field name in the request body. People never see the field; bots fill it in.
const HONEYPOT_FIELD_NAME = 'website'

type WaitlistFormProps = {
  /** The joined card's shoes, drawn by the server so this island never ships the design table. */
  joinedShowcase: ReactNode
}

/**
 * Joining the waitlist (D-037, D-056): Continue with Google first (it checks the email without
 * sending one), then an email and an optional phone, posted to the StrideMon API with a Turnstile
 * token that stays out of sight unless it needs a tap. On success the form gives way to the joined
 * card (D-055), the same for a new and a repeat email.
 */
export function WaitlistForm({ joinedShowcase }: WaitlistFormProps) {
  const [email, setEmail] = useState('')
  const [phonePlatform, setPhonePlatform] = useState<WaitlistPhonePlatform | null>(null)
  const [status, setStatus] = useState<FormStatus>('idle')
  const [problemKey, setProblemKey] = useState<WaitlistProblemKey | null>(null)
  const [joinedSignup, setJoinedSignup] = useState<JoinedSignup | null>(null)
  // Turnstile starts only once someone begins to join (D-050: browsing never loads it).
  const { turnstileCheck, takeTurnstileToken, armTurnstile } = useTurnstileToken('join-waitlist', {
    isLazy: true,
  })
  const joinedHeadingRef = useRef<HTMLParagraphElement>(null)
  const emailInputRef = useRef<HTMLInputElement>(null)
  const honeypotInputRef = useRef<HTMLInputElement>(null)
  const shouldFocusEmailRef = useRef(false)
  const fieldId = useId()
  const emailInputId = `${fieldId}-email`
  const problemId = `${fieldId}-problem`
  const promiseId = `${fieldId}-promise`

  useEffect(() => {
    // The form is gone, so keep keyboard focus on what replaced it, and back again.
    if (joinedSignup !== null) {
      joinedHeadingRef.current?.focus()
    } else if (shouldFocusEmailRef.current) {
      shouldFocusEmailRef.current = false
      emailInputRef.current?.focus()
      emailInputRef.current?.select()
    }
  }, [joinedSignup])

  function showEmailForm() {
    shouldFocusEmailRef.current = true
    setStatus('idle')
    setJoinedSignup(null)
  }

  /** Joins with a Turnstile token; `emailProof` (from Google) confirms the sign-up at once. */
  async function sendJoin(
    joinEmail: string,
    emailProof: string | null,
  ): Promise<{ inviteUrl: string } | null> {
    const turnstileToken = await takeTurnstileToken()
    if (turnstileToken === null) {
      setProblemKey('turnstileUnavailable')
      return null
    }
    const result = await joinWaitlist({
      email: joinEmail,
      phonePlatform,
      source: readWaitlistSource(window.location.search),
      inviteCode: readArrivalInviteCode(),
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
    return { inviteUrl: result.data }
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
    const joinResult = await sendJoin(email.trim(), null)
    setStatus('idle')
    if (joinResult !== null) {
      setJoinedSignup({ email: email.trim(), inviteUrl: joinResult.inviteUrl, invites: null })
    }
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
    const joinResult = await sendJoin(emailProof.email, emailProof.emailProof)
    if (joinResult === null) {
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
    setJoinedSignup({
      email: emailProof.email,
      inviteUrl: joinResult.inviteUrl,
      invites: sessionResult.isOk ? sessionResult.data.invites : null,
    })
  }

  if (joinedSignup !== null) {
    return (
      <WaitlistJoinedCard
        email={joinedSignup.email}
        inviteUrl={joinedSignup.inviteUrl}
        invites={joinedSignup.invites}
        onInvitesReady={(invites) => setJoinedSignup({ ...joinedSignup, invites })}
        showcase={joinedShowcase}
        headingRef={joinedHeadingRef}
        onUseAnotherEmail={showEmailForm}
      />
    )
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-3">
        <GoogleSignInButton
          onGoogleIdToken={(googleIdToken) => void joinWithGoogle(googleIdToken)}
        />
        {status === 'googleJoining' ? (
          <p aria-live="polite" className="text-sm leading-[1.4] text-ink-secondary-small">
            {waitlistContent.googleJoiningLabel}
          </p>
        ) : null}
      </div>

      <form noValidate onSubmit={joinWithEmail} className="flex flex-col gap-6">
        <div className="flex flex-col gap-2.5">
          <label
            htmlFor={emailInputId}
            className="text-label font-medium tracking-[0.08em] text-ink-secondary-small uppercase"
          >
            {waitlistContent.orUseEmailLabel}
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
        </div>

        <fieldset className="flex flex-col gap-2.5">
          <legend className="mb-2.5 text-label font-medium tracking-[0.08em] text-ink-secondary-small uppercase">
            {waitlistContent.phonePlatformLabel}
          </legend>
          <div className="flex flex-wrap gap-2">
            {waitlistPhonePlatformOptions.map((option) => (
              <label
                key={option.value}
                className="inline-flex h-10 cursor-pointer items-center rounded-full bg-surface-muted px-5 text-xs leading-[1.15] font-medium uppercase transition-colors duration-300 ease-standard has-checked:bg-ink has-checked:text-on-dark has-focus-visible:outline-2 has-focus-visible:outline-offset-3 has-focus-visible:outline-accent"
              >
                <input
                  type="radio"
                  name="phonePlatform"
                  value={option.value}
                  checked={phonePlatform === option.value}
                  onChange={() => setPhonePlatform(option.value)}
                  className="sr-only"
                />
                {option.label}
              </label>
            ))}
          </div>
        </fieldset>

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

        <div id={problemId} aria-live="polite">
          {problemKey !== null ? <WaitlistProblemNote problemKey={problemKey} /> : null}
        </div>

        <div className="flex flex-col items-start gap-4">
          <button
            type="submit"
            disabled={status !== 'idle'}
            className={buildPillClassName('primary', 'regular', 'disabled:opacity-60')}
          >
            <PillContent
              label={
                status === 'submitting'
                  ? waitlistContent.submittingLabel
                  : waitlistContent.submitLabel
              }
            />
          </button>
          <p id={promiseId} className="max-w-[34em] text-sm leading-[1.4] text-ink-secondary-small">
            {waitlistContent.promise}
          </p>
        </div>
      </form>
    </div>
  )
}
