import type { ReactNode } from 'react'
import {
  type WaitlistProblemKey,
  waitlistProblemContent,
  waitlistProblemHelpTopicIds,
} from '@/content/waitlist'
import { ProblemNote } from '../ui/problem-note'

/** A waitlist or invites problem in plain words, with its next step and its help answer (D-056). */
export function WaitlistProblemNote({
  problemKey,
  extra,
  actions,
}: {
  problemKey: WaitlistProblemKey
  extra?: ReactNode
  actions?: ReactNode
}) {
  return (
    <ProblemNote
      {...waitlistProblemContent[problemKey]}
      helpTopicId={waitlistProblemHelpTopicIds[problemKey]}
      extra={extra}
      actions={actions}
    />
  )
}

/** The API's refusal (or none) as the problem to show. */
export function readWaitlistProblemKey(
  problemCode: string | null,
  problemKind: 'apiError' | 'unreachable',
): WaitlistProblemKey {
  switch (problemCode) {
    case 'VALIDATION_FAILED':
      return 'emailInvalid'
    case 'EMAIL_DOMAIN_DISPOSABLE':
      return 'emailDisposable'
    case 'TURNSTILE_FAILED':
      return 'turnstileFailed'
    case 'EMAIL_CODE_RECENTLY_SENT':
      return 'codeRecentlySent'
    case 'EMAIL_SEND_FAILED':
      return 'emailSendFailed'
    case 'EMAIL_CODE_INCORRECT':
      return 'codeIncorrect'
    case 'EMAIL_CODE_EXPIRED':
      return 'codeExpired'
    case 'EMAIL_CODE_TOO_MANY_ATTEMPTS':
      return 'codeTooManyAttempts'
    case 'EMAIL_DAILY_LIMIT_REACHED':
      return 'emailDailyLimitReached'
    case 'GOOGLE_SIGN_IN_UNAVAILABLE':
      return 'googleUnavailable'
    case 'GOOGLE_SIGN_IN_FAILED':
      return 'googleFailed'
    case 'EMAIL_PROOF_INVALID':
    case 'INVITES_TOKEN_INVALID':
      return 'emailCheckEnded'
    case 'RATE_LIMITED':
      return 'rateLimited'
    default:
      return problemKind === 'unreachable' ? 'unreachable' : 'unexpected'
  }
}
