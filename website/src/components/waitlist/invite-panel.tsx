'use client'

import { useState } from 'react'
import { plannedEarlyHourStartsAt } from '@/content/founding-pass'
import { waitlistPagePath } from '@/content/site'
import {
  inviteContent,
  inviteShareText,
  waitlistNoPromiseLine,
  waitlistShareText,
} from '@/content/waitlist'
import { readInviteCodeFromUrl } from '@/lib/waitlist-invites'
import type { WaitlistInvites } from '@/lib/waitlist-request'
import { LocalDateTime } from '../founding-pass/local-date-time'
import { ShareLinks } from '../ui/share-links'

type InvitePanelProps = {
  inviteUrl: string
  /** Known only once the email is checked (D-056: progress only to its owner). */
  invites: WaitlistInvites | null
}

/**
 * A sign-up's invite link with Copy, the share row, the early hour's rule, and, once the email
 * is checked, how many friends have confirmed (D-056). Quiet: no badges, no countdown pressure.
 */
export function InvitePanel({ inviteUrl, invites }: InvitePanelProps) {
  const inviteCode = readInviteCodeFromUrl(inviteUrl)
  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-2">
        <p className="text-label font-medium tracking-[0.08em] text-ink-secondary-small uppercase">
          {inviteContent.linkLabel}
        </p>
        <div className="flex flex-wrap items-center gap-2.5">
          <span className="font-mono text-sm leading-[1.4] break-all">{inviteUrl}</span>
          <CopyInviteLinkButton inviteUrl={inviteUrl} />
        </div>
      </div>
      <ShareLinks
        path={waitlistPagePath}
        inviteCode={inviteCode}
        messageText={inviteShareText}
        xPostText={waitlistShareText}
      />
      {invites === null ? <EarlyHourRule /> : <InviteProgress invites={invites} />}
      <p className="text-sm leading-[1.45] text-ink-secondary-small">{waitlistNoPromiseLine}</p>
    </div>
  )
}

function EarlyHourRule() {
  return (
    <p className="text-base leading-[1.45]">
      {inviteContent.earlyHourPrefix} <LocalDateTime isoTimestamp={plannedEarlyHourStartsAt} />
      {inviteContent.earlyHourSuffix}
    </p>
  )
}

/** "1 of 3 friends confirmed", or the early hour once there are 3. */
function InviteProgress({ invites }: { invites: WaitlistInvites }) {
  if (invites.hasEarlyHour) {
    return (
      <div className="flex flex-col gap-1.5 rounded-panel bg-surface-muted p-4">
        <p className="text-lg leading-[1.25]">{inviteContent.hasEarlyHourHeading}</p>
        <p className="text-sm leading-[1.45] text-ink-secondary-small">
          {inviteContent.hasEarlyHourPrefix}{' '}
          <LocalDateTime isoTimestamp={plannedEarlyHourStartsAt} />
          {inviteContent.hasEarlyHourSuffix}
        </p>
      </div>
    )
  }
  return (
    <div className="flex flex-col gap-2">
      <p className="font-mono text-sm leading-[1.4] tracking-[0.04em] uppercase">
        {inviteContent.buildProgressLine(invites.confirmedFriendCount, invites.requiredFriendCount)}
      </p>
      <ProgressMarks
        filledCount={invites.confirmedFriendCount}
        totalCount={invites.requiredFriendCount}
      />
      {invites.confirmedFriendCount === 0 ? (
        <p className="text-sm leading-[1.45] text-ink-secondary-small">
          {inviteContent.noFriendsYet}
        </p>
      ) : null}
      <EarlyHourRule />
      <p className="text-sm leading-[1.45] text-ink-secondary-small">
        {inviteContent.countsUntilPrefix} <LocalDateTime isoTimestamp={invites.countsUntil} />{' '}
        {inviteContent.countsUntilSuffix}
      </p>
    </div>
  )
}

function ProgressMarks({ filledCount, totalCount }: { filledCount: number; totalCount: number }) {
  return (
    <div aria-hidden="true" className="flex gap-1.5">
      {Array.from({ length: totalCount }, (_, markIndex) => (
        <span
          // biome-ignore lint/suspicious/noArrayIndexKey: a fixed row of marks, never reordered.
          key={markIndex}
          className={`h-1 w-10 rounded-full ${markIndex < filledCount ? 'bg-ink' : 'bg-hairline'}`}
        />
      ))}
    </div>
  )
}

function CopyInviteLinkButton({ inviteUrl }: { inviteUrl: string }) {
  const [isCopied, setIsCopied] = useState(false)
  const inviteCode = readInviteCodeFromUrl(inviteUrl)

  async function copyInviteLink() {
    try {
      // The copied link says where it came from, like the share buttons' links.
      const copiedUrl = new URL(inviteUrl)
      if (inviteCode !== null) copiedUrl.searchParams.set('source', 'invite-copy')
      await navigator.clipboard.writeText(copiedUrl.toString())
      setIsCopied(true)
    } catch {
      // Clipboard blocked: the link is right there to select by hand.
    }
  }

  return (
    <button
      type="button"
      onClick={() => void copyInviteLink()}
      className="inline-flex h-10 items-center rounded-full bg-surface-muted px-4 text-xs leading-[1.15] font-medium uppercase transition-colors duration-300 ease-standard hover:bg-surface active:bg-surface"
    >
      <span aria-live="polite">
        {isCopied ? inviteContent.copiedLabel : inviteContent.copyLabel}
      </span>
    </button>
  )
}
