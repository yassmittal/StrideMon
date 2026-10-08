'use client'

import { type FormEvent, useEffect, useId, useRef, useState } from 'react'
import {
  emailStepContent,
  type MintProblemKey,
  mintProblemActionLabels,
} from '@/content/founding-pass-mint'
import {
  readProblemCode,
  sendPassEmailCode,
  verifyPassEmailCode,
} from '@/lib/founding-pass/pass-api'
import {
  forgetEmailCheck,
  saveEmailCheck,
  usePassMintReadiness,
} from '@/lib/founding-pass/pass-mint-readiness'
import { useNow } from '@/lib/use-now'
import { isLikelyEmail } from '@/lib/waitlist-request'
import { buildPillClassName, PillContent } from '../ui/pill-button'
import { LocalDateTime } from './local-date-time'
import { MintProblemNote, MintTextButton } from './mint-problem-note'
import { MintStepFrame, mintFieldClassName, mintQuietButtonClassName } from './mint-step-frame'
import { TurnstileCheck } from './turnstile-check'

type EmailCheckStepProps = {
  headingLevel: 'h3' | 'h4'
  /** When minting next opens, if it hasn't: a check that runs out before then says so. */
  mintingOpensAt: Date | null
}

type Phase = 'enterEmail' | 'sending' | 'enterCode' | 'checking'

type StepProblem = {
  key: MintProblemKey
  attemptsLeft?: number
  /** How long the API asked us to wait (a rate limit). */
  retryAfterSeconds?: number
  /** Offer "Send a new code" in the note. */
  canResend?: boolean
}

const RESEND_AFTER_MILLISECONDS = 60_000
const CODE_LENGTH = 6
const COUNTDOWN_TICK_MILLISECONDS = 1000

/**
 * Step 1 of "Get ready" (D-045): an email, Turnstile, a 6-digit code, and a proof kept in this
 * browser for 6 hours. Every refusal says what to do next.
 */
export function EmailCheckStep({ headingLevel, mintingOpensAt }: EmailCheckStepProps) {
  const { emailCheck } = usePassMintReadiness()
  const [phase, setPhase] = useState<Phase>('enterEmail')
  const [email, setEmail] = useState('')
  const [code, setCode] = useState('')
  const [problem, setProblem] = useState<StepProblem | null>(null)
  const [resendAtMilliseconds, setResendAtMilliseconds] = useState(0)
  /** The email the last code went to: the code form only ever names that one. */
  const [sentToEmail, setSentToEmail] = useState<string | null>(null)
  const [turnstileToken, setTurnstileToken] = useState<string | null>(null)
  const [turnstileResetKey, setTurnstileResetKey] = useState(0)
  const [isWaitingForTurnstile, setIsWaitingForTurnstile] = useState(false)
  const [hasTurnstileProblem, setHasTurnstileProblem] = useState(false)
  const codeInputRef = useRef<HTMLInputElement>(null)
  const fieldId = useId()
  const now = useNow(COUNTDOWN_TICK_MILLISECONDS)

  // Send code waits for Turnstile's token, then goes on its own.
  // biome-ignore lint/correctness/useExhaustiveDependencies: runs when the token arrives, with the latest email.
  useEffect(() => {
    if (isWaitingForTurnstile && turnstileToken !== null) void sendCode(turnstileToken)
  }, [isWaitingForTurnstile, turnstileToken])

  useEffect(() => {
    if (phase === 'enterCode') codeInputRef.current?.focus()
  }, [phase])

  if (emailCheck !== null) {
    const expiresAt = new Date(emailCheck.emailProofExpiresAt)
    const runsOutBeforeMinting =
      mintingOpensAt !== null && expiresAt.getTime() < mintingOpensAt.getTime()
    return (
      <MintStepFrame
        stepLabel={emailStepContent.stepLabel}
        title={emailStepContent.title}
        isDone
        headingLevel={headingLevel}
      >
        <p className="text-base leading-[1.4] break-words">
          {emailStepContent.checkedPrefix}{' '}
          <span className="font-mono text-sm">{emailCheck.email}</span>
        </p>
        <p className="text-sm leading-[1.4] text-ink-secondary-small">
          {emailStepContent.checkedUntilPrefix}{' '}
          <LocalDateTime isoTimestamp={emailCheck.emailProofExpiresAt} />.
          {runsOutBeforeMinting ? ` ${emailStepContent.checkedRunsOutBeforeMinting}` : null}
        </p>
        <button
          type="button"
          onClick={() => {
            forgetEmailCheck()
            startOver()
          }}
          className={mintQuietButtonClassName}
        >
          {emailStepContent.changeEmailLabel}
        </button>
      </MintStepFrame>
    )
  }

  function startOver() {
    setPhase('enterEmail')
    setCode('')
    setProblem(null)
    setSentToEmail(null)
    setResendAtMilliseconds(0)
  }

  function askForCode(event?: FormEvent<HTMLFormElement>) {
    event?.preventDefault()
    if (phase === 'sending') return
    if (!isLikelyEmail(email)) {
      setProblem({ key: 'emailInvalid' })
      return
    }
    setProblem(null)
    // The check can't run (blocked or offline): its note already says what to do.
    if (turnstileToken === null && hasTurnstileProblem) return
    if (turnstileToken === null) {
      setIsWaitingForTurnstile(true)
      setPhase('sending')
      return
    }
    void sendCode(turnstileToken)
  }

  async function sendCode(token: string) {
    setIsWaitingForTurnstile(false)
    setPhase('sending')
    // The token is spent either way: ask for the next one.
    setTurnstileToken(null)
    setTurnstileResetKey((key) => key + 1)
    const trimmedEmail = email.trim()
    const result = await sendPassEmailCode(trimmedEmail, token)
    if (result.isOk) {
      setSentToEmail(trimmedEmail)
      setResendAtMilliseconds(Date.now() + RESEND_AFTER_MILLISECONDS)
      setCode('')
      setPhase('enterCode')
      return
    }
    const problemCode = readProblemCode(result.problem)
    const details = result.problem.kind === 'apiError' ? result.problem.details : {}
    if (problemCode === 'EMAIL_CODE_RECENTLY_SENT') {
      const retryAfterSeconds =
        typeof details.retryAfterSeconds === 'number' ? details.retryAfterSeconds : 60
      setSentToEmail(trimmedEmail)
      setResendAtMilliseconds(Date.now() + retryAfterSeconds * 1000)
      setPhase('enterCode')
      setProblem({ key: 'codeRecentlySent' })
      return
    }
    // Back to the code form only if a code really went to this email.
    setPhase(sentToEmail === trimmedEmail ? 'enterCode' : 'enterEmail')
    setProblem({
      key: readSendProblemKey(problemCode, result.problem.kind),
      retryAfterSeconds: readRetryAfterSeconds(details),
    })
  }

  async function checkCode(codeText: string) {
    if (phase === 'checking') return
    if (!new RegExp(`^\\d{${CODE_LENGTH}}$`).test(codeText)) {
      setProblem({ key: 'codeFormat' })
      return
    }
    setProblem(null)
    setPhase('checking')
    const checkedEmail = sentToEmail ?? email.trim()
    const result = await verifyPassEmailCode(checkedEmail, codeText)
    if (result.isOk) {
      saveEmailCheck({ ...result.data, email: checkedEmail.toLowerCase() })
      setPhase('enterEmail')
      return
    }
    setPhase('enterCode')
    const problemCode = readProblemCode(result.problem)
    const details = result.problem.kind === 'apiError' ? result.problem.details : {}
    switch (problemCode) {
      case 'EMAIL_CODE_INCORRECT':
        setProblem({
          key: 'codeIncorrect',
          attemptsLeft: typeof details.attemptsLeft === 'number' ? details.attemptsLeft : undefined,
        })
        return
      case 'EMAIL_CODE_EXPIRED':
        setProblem({ key: 'codeExpired', canResend: true })
        return
      case 'EMAIL_CODE_TOO_MANY_ATTEMPTS':
        setProblem({ key: 'codeTooManyAttempts', canResend: true })
        return
      case 'VALIDATION_FAILED':
        setProblem({ key: 'codeFormat' })
        return
      case 'RATE_LIMITED':
        setProblem({ key: 'rateLimited', retryAfterSeconds: readRetryAfterSeconds(details) })
        return
      default:
        setProblem({ key: result.problem.kind === 'unreachable' ? 'unreachable' : 'unexpected' })
    }
  }

  const resendInSeconds =
    now === null ? 0 : Math.max(0, Math.ceil((resendAtMilliseconds - now.getTime()) / 1000))
  const canResend = resendInSeconds === 0 && phase !== 'sending'
  const emailInputId = `${fieldId}-email`
  const codeInputId = `${fieldId}-code`
  const isCodePhase = phase === 'enterCode' || phase === 'checking'

  return (
    <MintStepFrame
      stepLabel={emailStepContent.stepLabel}
      title={emailStepContent.title}
      isDone={false}
      headingLevel={headingLevel}
    >
      <p className="text-sm leading-[1.45] text-ink-secondary-small">
        {emailStepContent.description}
      </p>

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
            {emailStepContent.codeSentPrefix}{' '}
            <span className="font-mono">{sentToEmail ?? email.trim()}</span>.{' '}
            {emailStepContent.codeSentSuffix}
          </p>
          <label
            htmlFor={codeInputId}
            className="text-label font-medium tracking-[0.08em] text-ink-secondary-small uppercase"
          >
            {emailStepContent.codeLabel}
          </label>
          <div className="flex flex-wrap gap-2.5">
            <input
              ref={codeInputRef}
              id={codeInputId}
              name="code"
              inputMode="numeric"
              autoComplete="one-time-code"
              pattern="\d{6}"
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
                    ? emailStepContent.checkingLabel
                    : emailStepContent.checkCodeLabel
                }
              />
            </button>
          </div>
          <p className="text-sm leading-[1.45] text-ink-secondary-small">
            {canResend ? (
              <>
                {emailStepContent.noCodePrompt}{' '}
                <button
                  type="button"
                  onClick={() => askForCode()}
                  className="text-ink underline decoration-hairline underline-offset-4"
                >
                  {emailStepContent.resendLabel}
                </button>
                .
              </>
            ) : (
              `${emailStepContent.resendWaitPrefix} ${resendInSeconds} s.`
            )}{' '}
            <button
              type="button"
              onClick={startOver}
              className="text-ink underline decoration-hairline underline-offset-4"
            >
              {emailStepContent.changeEmailLabel}
            </button>
          </p>
        </form>
      ) : (
        <form noValidate onSubmit={askForCode} className="flex flex-col gap-2.5">
          <label
            htmlFor={emailInputId}
            className="text-label font-medium tracking-[0.08em] text-ink-secondary-small uppercase"
          >
            {emailStepContent.emailLabel}
          </label>
          <div className="flex flex-wrap gap-2.5">
            <input
              id={emailInputId}
              name="email"
              type="email"
              autoComplete="email"
              inputMode="email"
              spellCheck={false}
              placeholder={emailStepContent.emailPlaceholder}
              value={email}
              onChange={(event) => {
                setEmail(event.target.value)
                if (problem !== null) setProblem(null)
              }}
              aria-invalid={problem?.key === 'emailInvalid'}
              className={`${mintFieldClassName} min-w-0 flex-1 basis-56`}
            />
            <button
              type="submit"
              disabled={phase === 'sending'}
              className={buildPillClassName('primary', 'regular', 'disabled:opacity-60')}
            >
              <PillContent
                label={
                  phase === 'sending'
                    ? emailStepContent.sendingLabel
                    : emailStepContent.sendCodeLabel
                }
              />
            </button>
          </div>
        </form>
      )}

      <TurnstileCheck
        action="send-code"
        resetKey={turnstileResetKey}
        onTokenChange={(token) => {
          setTurnstileToken(token)
          if (token !== null) setHasTurnstileProblem(false)
        }}
        onProblem={() => {
          setHasTurnstileProblem(true)
          if (isWaitingForTurnstile) {
            setIsWaitingForTurnstile(false)
            setPhase(sentToEmail === null ? 'enterEmail' : 'enterCode')
          }
        }}
      />

      <div aria-live="polite" className="empty:hidden">
        {hasTurnstileProblem && turnstileToken === null ? (
          <MintProblemNote problemKey="turnstileUnavailable" />
        ) : problem !== null ? (
          <MintProblemNote
            problemKey={problem.key}
            extra={
              problem.attemptsLeft !== undefined ? (
                <p className="font-mono text-sm">
                  {problem.attemptsLeft}{' '}
                  {problem.attemptsLeft === 1
                    ? mintProblemActionLabels.attemptLeftSuffix
                    : mintProblemActionLabels.attemptsLeftSuffix}
                </p>
              ) : problem.retryAfterSeconds !== undefined ? (
                <p className="font-mono text-sm">
                  {mintProblemActionLabels.waitPrefix} {problem.retryAfterSeconds} s.
                </p>
              ) : null
            }
            actions={
              problem.canResend ? (
                <MintTextButton
                  label={emailStepContent.resendLabel}
                  onClick={() => askForCode()}
                  isDisabled={!canResend}
                />
              ) : null
            }
          />
        ) : null}
      </div>
    </MintStepFrame>
  )
}

function readRetryAfterSeconds(details: Record<string, unknown>): number | undefined {
  return typeof details.retryAfterSeconds === 'number' ? details.retryAfterSeconds : undefined
}

function readSendProblemKey(problemCode: string | null, problemKind: string): MintProblemKey {
  switch (problemCode) {
    case 'TURNSTILE_FAILED':
      return 'turnstileFailed'
    case 'VALIDATION_FAILED':
      return 'emailInvalid'
    case 'EMAIL_SEND_FAILED':
      return 'emailSendFailed'
    case 'RATE_LIMITED':
      return 'rateLimited'
    default:
      return problemKind === 'unreachable' ? 'unreachable' : 'unexpected'
  }
}
