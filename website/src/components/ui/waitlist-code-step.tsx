'use client'

import { type FormEvent, useId, useState } from 'react'
import { waitlistApiUrl } from '@/content/site'
import { waitlistCodeContent, waitlistContent } from '@/content/waitlist'
import {
  isCompleteVerificationCode,
  readReferralCode,
  readWaitlistSource,
  sendWaitlistSignup,
  sendWaitlistVerification,
  type WaitlistPlace,
} from '@/lib/waitlist-request'
import { buildPillClassName, PillContent } from './pill-button'

type WaitlistCodeStepProps = {
  email: string
  onVerified: (place: WaitlistPlace) => void
  onChangeEmail: () => void
}

const textButtonClassName =
  'min-h-11 text-sm underline decoration-hairline underline-offset-4 transition-colors duration-300 ease-standard hover:decoration-ink disabled:opacity-60'

// The 6-digit code from the email. A wrong or expired one can be replaced with a new code.
export function WaitlistCodeStep({ email, onVerified, onChangeEmail }: WaitlistCodeStepProps) {
  const [verificationCode, setVerificationCode] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isResending, setIsResending] = useState(false)
  const [message, setMessage] = useState<{ text: string; isError: boolean } | null>(null)
  const fieldId = useId()
  const codeInputId = `${fieldId}-code`
  const introId = `${fieldId}-intro`
  const messageId = `${fieldId}-message`

  async function verifyCode(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (isSubmitting) return
    if (!isCompleteVerificationCode(verificationCode)) {
      setMessage({ text: waitlistCodeContent.incompleteCodeError, isError: true })
      return
    }

    setMessage(null)
    setIsSubmitting(true)
    const outcome = await sendWaitlistVerification(waitlistApiUrl, { email, verificationCode })
    setIsSubmitting(false)

    if (outcome.kind === 'verified') {
      onVerified(outcome.place)
      return
    }
    setMessage({
      text:
        outcome.kind === 'invalidCode'
          ? waitlistCodeContent.invalidCodeError
          : waitlistContent.requestFailedError,
      isError: true,
    })
  }

  async function resendCode() {
    if (isResending) return
    setIsResending(true)
    const outcome = await sendWaitlistSignup(waitlistApiUrl, {
      email,
      phonePlatform: null,
      source: readWaitlistSource(window.location.search),
      referralCode: readReferralCode(window.location.search),
      honeypotValue: '',
    })
    setIsResending(false)
    setVerificationCode('')
    setMessage(
      outcome === 'codeSent'
        ? { text: waitlistCodeContent.resentNote, isError: false }
        : { text: waitlistContent.requestFailedError, isError: true },
    )
  }

  return (
    <form noValidate onSubmit={verifyCode} className="flex flex-col gap-6">
      <p id={introId} className="text-lg leading-[1.4]">
        {waitlistCodeContent.buildIntro(email)}
      </p>
      <div className="flex flex-col gap-2.5">
        <label
          htmlFor={codeInputId}
          className="text-label font-medium tracking-[0.08em] text-ink-secondary-small uppercase"
        >
          {waitlistCodeContent.codeLabel}
        </label>
        <input
          id={codeInputId}
          name="verificationCode"
          type="text"
          inputMode="numeric"
          autoComplete="one-time-code"
          pattern="[0-9]*"
          maxLength={6}
          spellCheck={false}
          required
          placeholder="000000"
          value={verificationCode}
          onChange={(event) => {
            setVerificationCode(event.target.value.replace(/\D/g, ''))
            if (message !== null) setMessage(null)
          }}
          aria-invalid={message?.isError === true}
          aria-describedby={`${introId} ${messageId}`}
          className="h-[52px] w-full max-w-[14rem] rounded-full border border-hairline bg-page px-5 font-mono text-xl tracking-[0.3em] placeholder:text-ink-secondary transition-colors duration-300 ease-standard focus-visible:border-ink aria-invalid:border-ink"
        />
        <p id={messageId} className="min-h-5 text-sm leading-[1.4]">
          {message?.text}
        </p>
      </div>

      <div className="flex flex-col items-start gap-3">
        <button
          type="submit"
          disabled={isSubmitting}
          className={buildPillClassName('primary', 'regular', 'disabled:opacity-60')}
        >
          <PillContent
            label={
              isSubmitting ? waitlistCodeContent.verifyingLabel : waitlistCodeContent.verifyLabel
            }
          />
        </button>
        <div className="flex flex-wrap gap-x-6">
          <button
            type="button"
            onClick={resendCode}
            disabled={isResending}
            className={textButtonClassName}
          >
            {waitlistCodeContent.resendLabel}
          </button>
          <button type="button" onClick={onChangeEmail} className={textButtonClassName}>
            {waitlistCodeContent.changeEmailLabel}
          </button>
        </div>
      </div>
    </form>
  )
}
