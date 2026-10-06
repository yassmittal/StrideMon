'use client'

import { type FormEvent, useEffect, useId, useRef, useState } from 'react'
import { waitlistApiUrl } from '@/content/site'
import { waitlistContent, waitlistPhonePlatformOptions } from '@/content/waitlist'
import {
  isLikelyEmail,
  readWaitlistSource,
  sendWaitlistSignup,
  type WaitlistPhonePlatform,
} from '@/lib/waitlist-request'
import { buildPillClassName, PillContent } from './pill-button'

type FormStatus = 'idle' | 'submitting' | 'joined'

// The honeypot's field name in the request body. People never see the field; bots fill it in.
const HONEYPOT_FIELD_NAME = 'website'

// Email and an optional phone platform, posted to the StrideMon API (D-037). On success the form
// is replaced by one line, the same for a new and a repeat email.
export function WaitlistForm() {
  const [email, setEmail] = useState('')
  const [phonePlatform, setPhonePlatform] = useState<WaitlistPhonePlatform | null>(null)
  const [status, setStatus] = useState<FormStatus>('idle')
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const joinedMessageRef = useRef<HTMLParagraphElement>(null)
  const fieldId = useId()
  const emailInputId = `${fieldId}-email`
  const errorMessageId = `${fieldId}-error`
  const promiseId = `${fieldId}-promise`

  useEffect(() => {
    // The form is gone, so keep keyboard focus on what replaced it.
    if (status === 'joined') joinedMessageRef.current?.focus()
  }, [status])

  async function joinWaitlist(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (status === 'submitting') return
    if (!isLikelyEmail(email)) {
      setErrorMessage(waitlistContent.invalidEmailError)
      return
    }

    setErrorMessage(null)
    setStatus('submitting')
    const honeypotValue = new FormData(event.currentTarget).get(HONEYPOT_FIELD_NAME)
    const outcome = await sendWaitlistSignup(waitlistApiUrl, {
      email,
      phonePlatform,
      source: readWaitlistSource(window.location.search),
      honeypotValue: typeof honeypotValue === 'string' ? honeypotValue : '',
    })

    if (outcome === 'joined') {
      setStatus('joined')
      return
    }
    setStatus('idle')
    setErrorMessage(
      outcome === 'invalidEmail'
        ? waitlistContent.invalidEmailError
        : waitlistContent.requestFailedError,
    )
  }

  return (
    <div aria-live="polite">
      {status === 'joined' ? (
        <p
          ref={joinedMessageRef}
          tabIndex={-1}
          className="waitlist-joined text-[clamp(1.625rem,3vw,2.5rem)] leading-[1.05] tracking-[-0.01em] outline-none"
        >
          {waitlistContent.joinedMessage}
        </p>
      ) : (
        <form noValidate onSubmit={joinWaitlist} className="flex flex-col gap-6">
          <div className="flex flex-col gap-2.5">
            <label
              htmlFor={emailInputId}
              className="text-label font-medium tracking-[0.08em] text-ink-secondary-small uppercase"
            >
              {waitlistContent.emailLabel}
            </label>
            <input
              id={emailInputId}
              name="email"
              type="email"
              autoComplete="email"
              inputMode="email"
              spellCheck={false}
              required
              placeholder={waitlistContent.emailPlaceholder}
              value={email}
              onChange={(event) => {
                setEmail(event.target.value)
                if (errorMessage !== null) setErrorMessage(null)
              }}
              aria-invalid={errorMessage === waitlistContent.invalidEmailError}
              aria-describedby={`${errorMessageId} ${promiseId}`}
              className="h-[52px] w-full rounded-full border border-hairline bg-page px-5 text-base placeholder:text-ink-secondary transition-colors duration-300 ease-standard focus-visible:border-ink aria-invalid:border-ink"
            />
            <p id={errorMessageId} className="min-h-5 text-sm leading-[1.4]">
              {errorMessage}
            </p>
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
              <input type="text" name={HONEYPOT_FIELD_NAME} tabIndex={-1} autoComplete="off" />
            </label>
          </div>

          <div className="flex flex-col items-start gap-4">
            <button
              type="submit"
              disabled={status === 'submitting'}
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
            <p
              id={promiseId}
              className="max-w-[34em] text-sm leading-[1.4] text-ink-secondary-small"
            >
              {waitlistContent.promise}
            </p>
          </div>
        </form>
      )}
    </div>
  )
}
