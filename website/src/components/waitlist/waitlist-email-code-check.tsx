'use client'

import { type FormEvent, useEffect, useId, useRef, useState } from 'react'
import { waitlistContent, waitlistEmailCheckContent } from '@/content/waitlist'
import { readProblemCode, readProblemDetailNumber } from '@/lib/api-request'
import {
  type EmailProof,
  sendPassEmailCode,
  verifyPassEmailCode,
} from '@/lib/founding-pass/pass-api'
import { useNow } from '@/lib/use-now'
import { isLikelyEmail } from '@/lib/waitlist-request'
import { mintFieldClassName } from '../founding-pass/mint-step-frame'
import { useTurnstileToken } from '../founding-pass/turnstile-check'
import { buildPillClassName, PillContent } from '../ui/pill-button'
import { readWaitlistProblemKey, WaitlistProblemNote } from './waitlist-problem-note'

type WaitlistEmailCodeCheckProps = {
  /** The email to check, when it's already known. Otherwise it asks. */
  fixedEmail?: string
  /** What the email box starts with, say after a join that was refused. */
  initialEmail?: string
  /** The button that sends the code: Join the waitlist on the form (D-060), Send code elsewhere. */
  sendCodeLabel?: string
  sendingLabel?: string
  /** Text that describes the email box, such as the form's promise. */
  emailDescriptionId?: string
  /** A code is on its way: a good moment to start the next step's checks. */
  onCodeSent?: () => void
  onEmailProof: (emailProof: EmailProof) => void
}

type Phase = 'enterEmail' | 'sending' | 'enterCode' | 'checking'

type CheckProblem = {
  key: ReturnType<typeof readWaitlistProblemKey> | 'turnstileUnavailable' | 'codeFormat'
  attemptsLeft?: number
  retryAfterSeconds?: number
}

const RESEND_AFTER_MILLISECONDS = 60_000
const CODE_LENGTH = 6
const CODE_PATTERN = new RegExp(`^\\d{${CODE_LENGTH}}$`)
const COUNTDOWN_TICK_MILLISECONDS = 1000

/**
 * The waitlist's email check with a 6-digit code (D-056, D-057, D-060): the code is sent with the
 * waitlist's words and counts toward the day's email budget. Turnstile stays out of sight unless it
 * needs a tap. Every refusal says what to do next, and a typo can be fixed from the code step.
 */
export function WaitlistEmailCodeCheck({
  fixedEmail,
  initialEmail = '',
  sendCodeLabel = waitlistEmailCheckContent.sendCodeLabel,
  sendingLabel = waitlistEmailCheckContent.sendingLabel,
  emailDescriptionId,
  onCodeSent,
  onEmailProof,
}: WaitlistEmailCodeCheckProps) {
  const [phase, setPhase] = useState<Phase>('enterEmail')
  const [email, setEmail] = useState(fixedEmail ?? initialEmail)
  const [sentToEmail, setSentToEmail] = useState<string | null>(null)
  const [code, setCode] = useState('')
  const [problem, setProblem] = useState<CheckProblem | null>(null)
  const [resendAtMilliseconds, setResendAtMilliseconds] = useState(0)
  // Starts when someone types an email or asks for a code, not when the card first shows.
  const { turnstileCheck, takeTurnstileToken, armTurnstile } = useTurnstileToken(
    'send-waitlist-code',
    { isLazy: true },
  )
  const codeInputRef = useRef<HTMLInputElement>(null)
  const emailInputRef = useRef<HTMLInputElement>(null)
  const shouldFocusEmailRef = useRef(false)
  const now = useNow(COUNTDOWN_TICK_MILLISECONDS)
  const fieldId = useId()

  useEffect(() => {
    if (phase === 'enterCode') codeInputRef.current?.focus()
    if (phase === 'enterEmail' && shouldFocusEmailRef.current) {
      shouldFocusEmailRef.current = false
      emailInputRef.current?.focus()
      emailInputRef.current?.select()
    }
  }, [phase])

  /** Back to the email box, with the email still in it, to fix a typo. */
  function returnToEmailStep() {
    shouldFocusEmailRef.current = true
    setProblem(null)
    setSentToEmail(null)
    setCode('')
    setPhase('enterEmail')
  }

  async function sendCode(event?: FormEvent<HTMLFormElement>) {
    event?.preventDefault()
    if (phase === 'sending') return
    const trimmedEmail = email.trim()
    if (!isLikelyEmail(trimmedEmail)) {
      setProblem({ key: 'emailInvalid' })
      return
    }
    setProblem(null)
    setPhase('sending')
    const turnstileToken = await takeTurnstileToken()
    if (turnstileToken === null) {
      setPhase(sentToEmail === null ? 'enterEmail' : 'enterCode')
      setProblem({ key: 'turnstileUnavailable' })
      return
    }
    const result = await sendPassEmailCode(trimmedEmail, turnstileToken, 'waitlist')
    if (result.isOk || readProblemCode(result.problem) === 'EMAIL_CODE_RECENTLY_SENT') {
      const retryAfterSeconds = result.isOk
        ? undefined
        : readProblemDetailNumber(result.problem, 'retryAfterSeconds')
      setSentToEmail(trimmedEmail)
      setResendAtMilliseconds(
        Date.now() +
          (retryAfterSeconds === undefined ? RESEND_AFTER_MILLISECONDS : retryAfterSeconds * 1000),
      )
      setCode('')
      setPhase('enterCode')
      if (!result.isOk) setProblem({ key: 'codeRecentlySent' })
      onCodeSent?.()
      return
    }
    setPhase(sentToEmail === trimmedEmail ? 'enterCode' : 'enterEmail')
    setProblem({
      key: readWaitlistProblemKey(readProblemCode(result.problem), result.problem.kind),
      retryAfterSeconds: readProblemDetailNumber(result.problem, 'retryAfterSeconds'),
    })
  }

  async function checkCode(codeText: string) {
    if (phase === 'checking') return
    if (!CODE_PATTERN.test(codeText)) {
      setProblem({ key: 'codeFormat' })
      return
    }
    setProblem(null)
    setPhase('checking')
    const checkedEmail = sentToEmail ?? email.trim()
    const result = await verifyPassEmailCode(checkedEmail, codeText)
    if (result.isOk) {
      onEmailProof({ ...result.data, email: checkedEmail.toLowerCase() })
      return
    }
    setPhase('enterCode')
    setProblem({
      key: readWaitlistProblemKey(readProblemCode(result.problem), result.problem.kind),
      attemptsLeft: readProblemDetailNumber(result.problem, 'attemptsLeft'),
      retryAfterSeconds: readProblemDetailNumber(result.problem, 'retryAfterSeconds'),
    })
  }

  const resendInSeconds =
    now === null ? 0 : Math.max(0, Math.ceil((resendAtMilliseconds - now.getTime()) / 1000))
  const isCodePhase = phase === 'enterCode' || phase === 'checking'
  const emailInputId = `${fieldId}-email`
  const codeInputId = `${fieldId}-code`

  return (
    <div className="flex flex-col gap-3">
      {isCodePhase ? (
        <form
          noValidate
          onSubmit={(event) => {
            event.preventDefault()
            void checkCode(code)
          }}
          className="flex flex-col gap-3"
        >
          <p className="text-sm leading-[1.45]">
            {waitlistEmailCheckContent.codeSentPrefix}{' '}
            <span className="font-mono break-all">{sentToEmail}</span>.{' '}
            {waitlistEmailCheckContent.codeSentSuffix}
          </p>
          <label
            htmlFor={codeInputId}
            className="text-label font-medium tracking-[0.08em] text-ink-secondary-small uppercase"
          >
            {waitlistEmailCheckContent.codeLabel}
          </label>
          <div className="flex flex-wrap gap-2.5">
            <input
              ref={codeInputRef}
              id={codeInputId}
              name="code"
              inputMode="numeric"
              autoComplete="one-time-code"
              maxLength={CODE_LENGTH}
              value={code}
              onChange={(event) => {
                const digits = event.target.value.replace(/\D/g, '').slice(0, CODE_LENGTH)
                setCode(digits)
                if (problem !== null) setProblem(null)
                // Six digits check at once: one tap fewer.
                if (digits.length === CODE_LENGTH) void checkCode(digits)
              }}
              aria-invalid={problem?.key === 'codeIncorrect' || problem?.key === 'codeFormat'}
              className={`${mintFieldClassName} max-w-[12rem] font-mono tracking-[0.3em]`}
            />
            <button
              type="submit"
              disabled={phase === 'checking'}
              className={buildPillClassName('primary', 'regular', 'disabled:opacity-60')}
            >
              <PillContent
                label={
                  phase === 'checking'
                    ? waitlistEmailCheckContent.checkingLabel
                    : waitlistEmailCheckContent.checkCodeLabel
                }
              />
            </button>
          </div>
          <p className="text-sm leading-[1.45] text-ink-secondary-small">
            {resendInSeconds === 0 ? (
              <>
                {waitlistEmailCheckContent.noCodePrompt}{' '}
                <button
                  type="button"
                  onClick={() => void sendCode()}
                  className="text-ink underline decoration-hairline underline-offset-4"
                >
                  {waitlistEmailCheckContent.resendLabel}
                </button>
                .
              </>
            ) : (
              `${waitlistEmailCheckContent.resendWaitPrefix} ${resendInSeconds} s.`
            )}
          </p>
          {fixedEmail === undefined ? (
            <button
              type="button"
              onClick={returnToEmailStep}
              className="inline-flex min-h-11 items-center self-start text-sm leading-[1.4] text-ink-secondary-small underline decoration-hairline underline-offset-4 transition-colors duration-300 ease-standard hover:text-ink hover:decoration-current"
            >
              {waitlistEmailCheckContent.useDifferentEmailLabel}
            </button>
          ) : null}
        </form>
      ) : (
        <form
          noValidate
          onSubmit={(event) => void sendCode(event)}
          className="flex flex-col gap-2.5"
        >
          {fixedEmail === undefined ? (
            <>
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
                placeholder={waitlistContent.emailPlaceholder}
                value={email}
                onFocus={armTurnstile}
                onChange={(event) => {
                  setEmail(event.target.value)
                  if (problem !== null) setProblem(null)
                }}
                aria-invalid={problem?.key === 'emailInvalid' || problem?.key === 'emailDisposable'}
                aria-describedby={emailDescriptionId}
                className={mintFieldClassName}
              />
            </>
          ) : null}
          <button
            type="submit"
            disabled={phase === 'sending'}
            className={buildPillClassName('primary', 'regular', 'self-start disabled:opacity-60')}
          >
            <PillContent label={phase === 'sending' ? sendingLabel : sendCodeLabel} />
          </button>
        </form>
      )}
      {turnstileCheck}
      {problem !== null ? (
        <WaitlistProblemNote problemKey={problem.key} extra={<ProblemExtra problem={problem} />} />
      ) : null}
    </div>
  )
}

function ProblemExtra({ problem }: { problem: CheckProblem }) {
  if (problem.attemptsLeft !== undefined) {
    return (
      <p className="text-sm leading-[1.45]">
        {problem.attemptsLeft} {problem.attemptsLeft === 1 ? 'try' : 'tries'} left.
      </p>
    )
  }
  if (problem.retryAfterSeconds !== undefined && problem.key === 'rateLimited') {
    return <p className="text-sm leading-[1.45]">Try again in {problem.retryAfterSeconds} s.</p>
  }
  return null
}
