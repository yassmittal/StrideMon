'use client'

import { type Ref, useState } from 'react'
import { plannedPassScheduleTimes } from '@/content/founding-pass'
import { waitlistInvitesPath } from '@/content/site'
import type { WaitlistProblemKey } from '@/content/waitlist'
import { inviteContent, waitlistEmailCheckContent, waitlistJoinedContent } from '@/content/waitlist'
import { readProblemCode } from '@/lib/api-request'
import type { EmailProof } from '@/lib/founding-pass/pass-api'
import { saveInvitesSession } from '@/lib/waitlist-invites'
import { startWaitlistInvitesSession, type WaitlistInvites } from '@/lib/waitlist-request'
import { LocalDateTime } from '../founding-pass/local-date-time'
import { InvitePanel, InvitesHelpLink } from '../waitlist/invite-panel'
import { WaitlistEmailCodeCheck } from '../waitlist/waitlist-email-code-check'
import { readWaitlistProblemKey, WaitlistProblemNote } from '../waitlist/waitlist-problem-note'
import { ArrowIcon } from './arrow-icon'
import { CrossMarks } from './cross-marks'

type WaitlistJoinedCardProps = {
  /** The email as it was sent (or as Google gave it), so a typo shows. */
  email: string
  inviteUrl: string
  /** Shown once the email is checked (D-056: progress only to its owner). */
  invites: WaitlistInvites | null
  /** Joined through a friend's link: until the email is confirmed, the card offers the code. */
  isJoinedThroughFriend: boolean
  onInvitesReady: (invites: WaitlistInvites) => void
  headingRef: Ref<HTMLParagraphElement>
  onChangeEmail: () => void
}

/**
 * What replaces the form after joining, and when coming back (D-055, D-059): a ticket in the
 * Founding Pass card's look, then the invites. Its one job is sharing the link. A new and a repeat
 * email see the same card (D-037).
 */
export function WaitlistJoinedCard({
  email,
  inviteUrl,
  invites,
  isJoinedThroughFriend,
  onInvitesReady,
  headingRef,
  onChangeEmail,
}: WaitlistJoinedCardProps) {
  const isConfirmForFriendShown = invites === null && isJoinedThroughFriend
  return (
    <div className="waitlist-joined flex flex-col gap-6">
      <div className="relative flex flex-col gap-3.5 rounded-panel border border-hairline bg-page px-6 pt-6 pb-[26px] md:px-7">
        <CrossMarks insetClassName="inset-2" />
        <div className="flex items-center justify-between border-b border-hairline pb-3 font-mono text-xs leading-[1.2] tracking-[0.08em] uppercase">
          <span>{waitlistJoinedContent.ticketLabel}</span>
          <span className="inline-flex items-center gap-1.5">
            <CheckIcon />
            {waitlistJoinedContent.ticketStatus}
          </span>
        </div>
        <p
          ref={headingRef}
          tabIndex={-1}
          className="text-[clamp(1.625rem,3vw,2.25rem)] leading-[1.05] tracking-[-0.01em] outline-none"
        >
          {waitlistJoinedContent.heading}
        </p>
        <p className="flex flex-wrap items-center gap-x-3 text-sm leading-[1.4]">
          <span className="font-mono break-all text-ink-secondary-small">{email}</span>
          <button
            type="button"
            onClick={onChangeEmail}
            aria-label={waitlistJoinedContent.changeEmailAccessibleLabel}
            className="inline-flex min-h-11 items-center underline decoration-hairline underline-offset-4 transition-colors duration-300 ease-standard hover:decoration-current"
          >
            {waitlistJoinedContent.changeEmailLabel}
          </button>
        </p>
        <div className="flex flex-col gap-1.5 border-t border-hairline pt-3.5 font-mono">
          <p className="text-label tracking-[0.08em] text-ink-secondary-small uppercase">
            {waitlistJoinedContent.windowLabel}
          </p>
          <p className="text-sm leading-[1.3]">
            <LocalDateTime isoTimestamp={plannedPassScheduleTimes.waitlistWindowStartsAt} />
          </p>
        </div>
      </div>

      {isConfirmForFriendShown ? (
        <ConfirmForFriendBlock email={email} onInvitesReady={onInvitesReady} />
      ) : null}

      <InvitePanel inviteUrl={inviteUrl} invites={invites} />

      <div className="flex flex-wrap items-center gap-x-5">
        {invites === null && !isJoinedThroughFriend ? (
          <a
            href={waitlistInvitesPath}
            className="group inline-flex min-h-11 items-center gap-2 text-label font-medium tracking-[0.08em] uppercase underline decoration-hairline underline-offset-4"
          >
            {inviteContent.invitesPageLabel}
            <ArrowIcon className="transition-transform duration-300 ease-standard group-hover:translate-x-[3px]" />
          </a>
        ) : null}
        <InvitesHelpLink />
      </div>
    </div>
  )
}

/**
 * After an email join through a friend's link: the optional 6-digit code that makes this sign-up
 * count for that friend (D-056 point 5), and shows its own invites. Skipping it never blocks
 * anything.
 */
function ConfirmForFriendBlock({
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
      <p className="text-lg leading-[1.25]">{waitlistEmailCheckContent.confirmForFriendHeading}</p>
      <p className="text-sm leading-[1.45] text-ink-secondary-small">
        {waitlistEmailCheckContent.confirmForFriendText}
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
