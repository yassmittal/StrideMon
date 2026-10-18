'use client'

import { useCallback, useEffect, useState } from 'react'
import { waitlistPagePath } from '@/content/site'
import {
  type WaitlistProblemKey,
  waitlistContent,
  waitlistInvitesPageContent,
} from '@/content/waitlist'
import { readProblemCode } from '@/lib/api-request'
import { checkPassEmailWithGoogle, type EmailProof } from '@/lib/founding-pass/pass-api'
import {
  forgetInvitesSession,
  readArrivalInviteCode,
  readInviteCodeFromUrl,
  readStoredInvitesSession,
  saveInvitesSession,
  saveOwnInviteCode,
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
import { buildPillClassName, PillContent } from '../ui/pill-button'
import { GoogleSignInButton } from './google-sign-in-button'
import { InvitePanel } from './invite-panel'
import { WaitlistEmailCodeCheck } from './waitlist-email-code-check'
import { readWaitlistProblemKey, WaitlistProblemNote } from './waitlist-problem-note'

type ViewState =
  | { kind: 'loading' }
  | { kind: 'checkEmail' }
  | { kind: 'opening' }
  | {
      kind: 'shown'
      email: string
      invites: WaitlistInvites
      /** This visit's proof, so an email that isn't on the list can join in one tap. */
      emailProof: EmailProof | null
    }

/**
 * `/waitlist/invites` (D-056): a returning visitor's token opens their invites with no email;
 * otherwise they check their email (Google or a code) first. Every state has a next step: the
 * form when not on the list, share when no friends yet, the early hour at 3, Google or tomorrow
 * when codes are used up, and try again (with help) when the API can't be reached.
 */
export function WaitlistInvitesView() {
  const [viewState, setViewState] = useState<ViewState>({ kind: 'loading' })
  const [problemKey, setProblemKey] = useState<WaitlistProblemKey | null>(null)
  const [isJoining, setIsJoining] = useState(false)
  const { turnstileCheck, takeTurnstileToken } = useTurnstileToken('join-waitlist', {
    isLazy: true,
  })

  const showInvites = useCallback(
    (email: string, invites: WaitlistInvites, emailProof: EmailProof | null) => {
      if (invites.isOnWaitlist) {
        const ownInviteCode = readInviteCodeFromUrl(invites.inviteUrl)
        if (ownInviteCode !== null) saveOwnInviteCode(ownInviteCode)
      }
      setViewState({ kind: 'shown', email, invites, emailProof })
    },
    [],
  )

  const loadStoredInvites = useCallback(async () => {
    const storedSession = readStoredInvitesSession(new Date())
    if (storedSession === null) {
      setViewState({ kind: 'checkEmail' })
      return
    }
    setProblemKey(null)
    setViewState({ kind: 'loading' })
    const result = await readWaitlistInvites(storedSession.invitesToken)
    if (result.isOk) {
      showInvites(storedSession.email, result.data, null)
      return
    }
    if (readProblemCode(result.problem) === 'INVITES_TOKEN_INVALID') {
      forgetInvitesSession()
      setViewState({ kind: 'checkEmail' })
      return
    }
    setViewState({ kind: 'checkEmail' })
    setProblemKey(readWaitlistProblemKey(readProblemCode(result.problem), result.problem.kind))
  }, [showInvites])

  useEffect(() => {
    void loadStoredInvites()
  }, [loadStoredInvites])

  async function openInvites(emailProof: EmailProof) {
    setProblemKey(null)
    setViewState({ kind: 'opening' })
    const result = await startWaitlistInvitesSession(emailProof.emailProof)
    if (!result.isOk) {
      setViewState({ kind: 'checkEmail' })
      setProblemKey(readWaitlistProblemKey(readProblemCode(result.problem), result.problem.kind))
      return
    }
    saveInvitesSession({
      email: emailProof.email,
      invitesToken: result.data.invitesToken,
      invitesTokenExpiresAt: result.data.invitesTokenExpiresAt,
    })
    showInvites(emailProof.email, result.data.invites, emailProof)
  }

  async function checkWithGoogle(googleIdToken: string) {
    setProblemKey(null)
    setViewState({ kind: 'opening' })
    const result = await checkPassEmailWithGoogle(googleIdToken)
    if (!result.isOk) {
      setViewState({ kind: 'checkEmail' })
      setProblemKey(readWaitlistProblemKey(readProblemCode(result.problem), result.problem.kind))
      return
    }
    await openInvites(result.data)
  }

  async function joinWithCheckedEmail(emailProof: EmailProof) {
    if (isJoining) return
    setProblemKey(null)
    setIsJoining(true)
    const turnstileToken = await takeTurnstileToken()
    if (turnstileToken === null) {
      setIsJoining(false)
      setProblemKey('turnstileUnavailable')
      return
    }
    const result = await joinWaitlist({
      email: emailProof.email,
      phonePlatform: null,
      source: readWaitlistSource(window.location.search),
      inviteCode: readArrivalInviteCode(),
      emailProof: emailProof.emailProof,
      turnstileToken,
      honeypotValue: '',
    })
    setIsJoining(false)
    if (!result.isOk) {
      setProblemKey(readWaitlistProblemKey(readProblemCode(result.problem), result.problem.kind))
      return
    }
    await openInvites(emailProof)
  }

  function switchToDifferentEmail() {
    forgetInvitesSession()
    setProblemKey(null)
    setViewState({ kind: 'checkEmail' })
  }

  const problemNote =
    problemKey === null ? null : (
      <WaitlistProblemNote
        problemKey={problemKey}
        actions={
          problemKey === 'unreachable' || problemKey === 'unexpected' ? (
            <MintTextButton
              label={waitlistInvitesPageContent.tryAgainLabel}
              onClick={() => void loadStoredInvites()}
            />
          ) : null
        }
      />
    )

  if (viewState.kind === 'loading' || viewState.kind === 'opening') {
    return (
      <p aria-live="polite" className="text-base leading-[1.45] text-ink-secondary-small">
        {waitlistInvitesPageContent.checkingLabel}
      </p>
    )
  }

  if (viewState.kind === 'checkEmail') {
    return (
      <div className="flex flex-col gap-5">
        <p className="text-base leading-[1.45]">{waitlistInvitesPageContent.checkIntro}</p>
        <GoogleSignInButton
          onGoogleIdToken={(googleIdToken) => void checkWithGoogle(googleIdToken)}
        />
        <p className="text-label font-medium tracking-[0.08em] text-ink-secondary-small uppercase">
          {waitlistContent.orUseEmailLabel}
        </p>
        <WaitlistEmailCodeCheck onEmailProof={(emailProof) => void openInvites(emailProof)} />
        {problemNote}
      </div>
    )
  }

  const { email, invites, emailProof } = viewState
  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-1.5 border-b border-hairline pb-4">
        <p className="text-sm leading-[1.4] text-ink-secondary-small">
          {waitlistInvitesPageContent.usingEmailPrefix}
        </p>
        <p className="font-mono text-sm leading-[1.4] break-all">{email}</p>
      </div>

      {invites.isOnWaitlist ? (
        <InvitePanel inviteUrl={invites.inviteUrl} invites={invites} />
      ) : (
        <div className="flex flex-col gap-3">
          <p className="text-lg leading-[1.25]">{waitlistInvitesPageContent.notOnListHeading}</p>
          <p className="text-sm leading-[1.45] text-ink-secondary-small">
            {waitlistInvitesPageContent.notOnListText}
          </p>
          {emailProof !== null ? (
            <>
              <button
                type="button"
                disabled={isJoining}
                onClick={() => void joinWithCheckedEmail(emailProof)}
                className={buildPillClassName(
                  'primary',
                  'regular',
                  'self-start disabled:opacity-60',
                )}
              >
                <PillContent
                  label={
                    isJoining
                      ? waitlistInvitesPageContent.joiningLabel
                      : waitlistInvitesPageContent.joinWithEmailLabel
                  }
                />
              </button>
              {turnstileCheck}
            </>
          ) : (
            <a
              href={waitlistPagePath}
              className={buildPillClassName('primary', 'regular', 'self-start')}
            >
              <PillContent label={waitlistInvitesPageContent.joinTheWaitlistLabel} />
            </a>
          )}
        </div>
      )}

      {problemNote}

      <button
        type="button"
        onClick={switchToDifferentEmail}
        className="min-h-11 self-start text-sm leading-[1.4] text-ink-secondary-small underline decoration-hairline underline-offset-4 transition-colors duration-300 ease-standard hover:text-ink hover:decoration-current"
      >
        {waitlistInvitesPageContent.useAnotherEmailLabel}
      </button>
    </div>
  )
}
