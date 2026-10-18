'use client'

import { type ReactNode, type Ref, useState } from 'react'
import { passSectionIds, plannedPassScheduleTimes } from '@/content/founding-pass'
import { passGalleryPath, waitlistInvitesPath } from '@/content/site'
import type { WaitlistProblemKey } from '@/content/waitlist'
import { waitlistEmailCheckContent, waitlistJoinedContent } from '@/content/waitlist'
import { readProblemCode } from '@/lib/api-request'
import type { EmailProof } from '@/lib/founding-pass/pass-api'
import { saveInvitesSession } from '@/lib/waitlist-invites'
import { startWaitlistInvitesSession, type WaitlistInvites } from '@/lib/waitlist-request'
import { LocalDateTime } from '../founding-pass/local-date-time'
import { InvitePanel } from '../waitlist/invite-panel'
import { WaitlistEmailCodeCheck } from '../waitlist/waitlist-email-code-check'
import { readWaitlistProblemKey, WaitlistProblemNote } from '../waitlist/waitlist-problem-note'
import { CrossMarks } from './cross-marks'
import { buildPillClassName, PillContent } from './pill-button'

type WaitlistJoinedCardProps = {
  /** The email as it was sent (or as Google gave it), so a typo shows. */
  email: string
  inviteUrl: string
  /** Shown once the email is checked (D-056: progress only to its owner). */
  invites: WaitlistInvites | null
  onInvitesReady: (invites: WaitlistInvites) => void
  /** The shoes, drawn by the server (`WaitlistSection`). */
  showcase: ReactNode
  headingRef: Ref<HTMLParagraphElement>
  onUseAnotherEmail: () => void
}

/**
 * What replaces the form after joining (D-055, D-056): a ticket in the Founding Pass card's look,
 * then the invite link with its share row, the early hour, and either the confirmed friends or
 * "Confirm your email". A new and a repeat email see the same card (D-037).
 */
export function WaitlistJoinedCard({
  email,
  inviteUrl,
  invites,
  onInvitesReady,
  showcase,
  headingRef,
  onUseAnotherEmail,
}: WaitlistJoinedCardProps) {
  return (
    <div className="waitlist-joined flex flex-col gap-6">
      <div className="relative flex flex-col gap-4 rounded-panel border border-hairline bg-page px-6 pt-6 pb-7 md:px-7">
        <CrossMarks insetClassName="inset-2" />
        <div className="flex items-center justify-between border-b border-hairline pb-3 font-mono text-xs leading-[1.2] tracking-[0.08em] uppercase">
          <span>{waitlistJoinedContent.ticketLabel}</span>
          <span className="inline-flex items-center gap-1.5">
            <CheckIcon />
            {waitlistJoinedContent.ticketStatus}
          </span>
        </div>
        {showcase}
        <div className="flex flex-col gap-2 border-t border-hairline pt-4">
          <p
            ref={headingRef}
            tabIndex={-1}
            className="text-[clamp(1.625rem,3vw,2.25rem)] leading-[1.05] tracking-[-0.01em] outline-none"
          >
            {waitlistJoinedContent.heading}
          </p>
          <p className="font-mono text-sm leading-[1.4] break-all text-ink-secondary-small">
            {email}
          </p>
        </div>
        <dl className="grid grid-cols-2 gap-4 border-t border-hairline pt-4 font-mono">
          <div className="flex flex-col gap-1.5">
            <dt className="text-label tracking-[0.08em] text-ink-secondary-small uppercase">
              {waitlistJoinedContent.windowLabel}
            </dt>
            <dd className="text-sm leading-[1.3]">
              <LocalDateTime isoTimestamp={plannedPassScheduleTimes.waitlistWindowStartsAt} />
            </dd>
          </div>
          <div className="flex flex-col gap-1.5">
            <dt className="text-label tracking-[0.08em] text-ink-secondary-small uppercase">
              {waitlistJoinedContent.headStartLabel}
            </dt>
            <dd className="text-sm leading-[1.3]">{waitlistJoinedContent.headStartValue}</dd>
          </div>
        </dl>
      </div>

      <InvitePanel inviteUrl={inviteUrl} invites={invites} />

      {invites === null ? (
        <ConfirmEmailBlock email={email} onInvitesReady={onInvitesReady} />
      ) : null}

      <div className="flex flex-col items-start gap-4">
        <p className="text-sm leading-[1.4] text-ink-secondary-small">
          {waitlistJoinedContent.promise}
        </p>
        <div className="flex flex-wrap gap-2.5">
          <a href={waitlistInvitesPath} className={buildPillClassName('primary', 'regular')}>
            <PillContent label={waitlistJoinedContent.seeInvitesLabel} />
          </a>
          <a
            href={`${passGalleryPath}#${passSectionIds.gallery}`}
            className={buildPillClassName('secondary', 'regular')}
          >
            <PillContent label={waitlistJoinedContent.favouritesLabel} />
          </a>
        </div>
        <button
          type="button"
          onClick={onUseAnotherEmail}
          className="min-h-11 text-sm leading-[1.4] text-ink-secondary-small underline decoration-hairline underline-offset-4 transition-colors duration-300 ease-standard hover:text-ink hover:decoration-current"
        >
          {waitlistJoinedContent.useAnotherEmailLabel}
        </button>
      </div>
    </div>
  )
}

/**
 * After an email join: an optional 6-digit code. It shows the visitor's invites, and makes the
 * invite of whoever sent them count. Skipping it never blocks anything.
 */
function ConfirmEmailBlock({
  email,
  onInvitesReady,
}: {
  email: string
  onInvitesReady: (invites: WaitlistInvites) => void
}) {
  const [sessionProblemKey, setSessionProblemKey] = useState<WaitlistProblemKey | null>(null)

  async function openInvites(emailProof: EmailProof) {
    setSessionProblemKey(null)
    const result = await startWaitlistInvitesSession(emailProof.emailProof)
    if (!result.isOk) {
      setSessionProblemKey(
        readWaitlistProblemKey(readProblemCode(result.problem), result.problem.kind),
      )
      return
    }
    saveInvitesSession({
      email: emailProof.email,
      invitesToken: result.data.invitesToken,
      invitesTokenExpiresAt: result.data.invitesTokenExpiresAt,
    })
    onInvitesReady(result.data.invites)
  }

  return (
    <div className="flex flex-col gap-3 rounded-panel bg-page p-5">
      <p className="text-lg leading-[1.25]">{waitlistEmailCheckContent.confirmHeading}</p>
      <p className="text-sm leading-[1.45] text-ink-secondary-small">
        {waitlistEmailCheckContent.confirmText}
      </p>
      <WaitlistEmailCodeCheck
        fixedEmail={email}
        onEmailProof={(proof) => void openInvites(proof)}
      />
      {sessionProblemKey !== null ? <WaitlistProblemNote problemKey={sessionProblemKey} /> : null}
    </div>
  )
}

function CheckIcon() {
  return (
    <svg
      aria-hidden="true"
      className="size-3 shrink-0"
      viewBox="0 0 12 12"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M2 6.5 4.75 9 10 3" />
    </svg>
  )
}
