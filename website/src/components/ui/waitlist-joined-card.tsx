'use client'

import type { Ref } from 'react'
import { plannedPassScheduleTimes } from '@/content/founding-pass'
import { waitlistInvitesPath } from '@/content/site'
import { inviteContent, waitlistJoinedContent } from '@/content/waitlist'
import type { WaitlistInvites } from '@/lib/waitlist-request'
import { LocalDateTime } from '../founding-pass/local-date-time'
import { InvitePanel, InvitesHelpLink } from '../waitlist/invite-panel'
import { ArrowIcon } from './arrow-icon'

type WaitlistJoinedCardProps = {
  /** The email that was checked, so a typo shows. */
  email: string
  inviteUrl: string
  /** Known at once after joining (D-060); null for a sign-up whose invites token is gone. */
  invites: WaitlistInvites | null
  headingRef: Ref<HTMLParagraphElement>
  onChangeEmail: () => void
}

/**
 * What replaces the form after joining, and when coming back (D-055, D-059, D-060): a ticket that
 * says when your window opens, then the invites. Its one job is sharing the link. A new and a
 * repeat email see the same card (D-037).
 */
export function WaitlistJoinedCard({
  email,
  inviteUrl,
  invites,
  headingRef,
  onChangeEmail,
}: WaitlistJoinedCardProps) {
  return (
    <div className="waitlist-joined flex flex-col gap-6">
      <div className="flex flex-col gap-3.5 rounded-panel border border-hairline bg-page px-6 pt-5 pb-6 md:px-7">
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
        <p className="text-base leading-[1.4]">
          {waitlistJoinedContent.windowSentencePrefix}{' '}
          <LocalDateTime
            isoTimestamp={plannedPassScheduleTimes.waitlistWindowStartsAt}
            className="font-medium whitespace-nowrap"
          />
          .
        </p>
        <p className="flex flex-wrap items-center gap-x-3 border-t border-hairline pt-1 text-sm leading-[1.4]">
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
      </div>

      <InvitePanel inviteUrl={inviteUrl} invites={invites} />

      <div className="flex flex-wrap items-center gap-x-5">
        {invites === null ? (
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
