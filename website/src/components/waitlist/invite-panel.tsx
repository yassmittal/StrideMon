'use client'

import { useState } from 'react'
import { passSectionIds, plannedEarlyHourStartsAt } from '@/content/founding-pass'
import { passGalleryPath, siteUrl, waitlistPagePath } from '@/content/site'
import { inviteContent, inviteShareText, waitlistShareText } from '@/content/waitlist'
import { buildGoogleCalendarUrl, buildIcsDataUrl } from '@/lib/calendar-reminder'
import { readInviteCodeFromUrl } from '@/lib/waitlist-invites'
import type { WaitlistInvites } from '@/lib/waitlist-request'
import { LocalDateTime } from '../founding-pass/local-date-time'
import { HelpTopicLink } from '../ui/help-topic-link'
import { ShareLinks } from '../ui/share-links'

type InvitePanelProps = {
  inviteUrl: string
  /** Known only once the email is checked (D-056: progress only to its owner). */
  invites: WaitlistInvites | null
}

const reminderLinkClassName =
  'inline-flex h-10 items-center rounded-full bg-surface-muted px-4 text-xs leading-[1.15] font-medium uppercase transition-colors duration-300 ease-standard active:bg-surface'

/**
 * A sign-up's invites (D-056, D-059), the same on the joined card and on /waitlist/invites: the
 * count once the email is checked, then the early hour's rule, the link and the share links. With
 * the early hour, its news, a reminder and the night's steps come first, and sharing moves last.
 * Quiet: no badges, no countdown pressure.
 */
export function InvitePanel({ inviteUrl, invites }: InvitePanelProps) {
  if (invites?.hasEarlyHour) {
    return (
      <div className="flex flex-col gap-5">
        <InviteProgress invites={invites} />
        <div className="flex flex-col gap-1.5 rounded-panel bg-surface-muted p-4">
          <p className="text-lg leading-[1.25]">{inviteContent.hasEarlyHourHeading}</p>
          <p className="text-sm leading-[1.45] text-ink-secondary-small">
            {inviteContent.hasEarlyHourPrefix}{' '}
            <LocalDateTime isoTimestamp={plannedEarlyHourStartsAt} />
            {inviteContent.hasEarlyHourSuffix}
          </p>
        </div>
        <EarlyHourReminder />
        <EarlyHourNight />
        <div className="flex flex-col gap-4 border-t border-hairline pt-4">
          <p className="text-sm leading-[1.45] text-ink-secondary-small">
            {inviteContent.keepSharingText}
          </p>
          <InviteShare inviteUrl={inviteUrl} />
        </div>
      </div>
    )
  }
  return (
    <div className="flex flex-col gap-4">
      {invites === null ? null : <InviteProgress invites={invites} />}
      <div className="flex flex-col gap-1.5">
        <p className="text-lg leading-[1.25]">{inviteContent.earlyHourHeading}</p>
        <p className="text-sm leading-[1.45] text-ink-secondary-small">
          {inviteContent.earlyHourRulePrefix}{' '}
          <LocalDateTime isoTimestamp={plannedEarlyHourStartsAt} />
          {inviteContent.earlyHourRuleSuffix}
        </p>
      </div>
      <InviteShare inviteUrl={inviteUrl} />
    </div>
  )
}

/** "How invites count": the rules' details, on /help (D-059). */
export function InvitesHelpLink() {
  return <HelpTopicLink helpTopicId="invites" label={inviteContent.howInvitesCountLabel} />
}

/** The link in a field with Copy, then the share links, each carrying the sign-up's code. */
function InviteShare({ inviteUrl }: { inviteUrl: string }) {
  const shownUrl = inviteUrl.replace(/^https?:\/\//, '')
  const queryIndex = shownUrl.indexOf('?')
  return (
    <div className="flex flex-col gap-4">
      <div className="flex min-h-[52px] items-center justify-between gap-3 rounded-[26px] border border-hairline bg-page py-1.5 pr-1.5 pl-5">
        <p className="min-w-0 font-mono text-sm leading-[1.4] break-words">
          <span className="sr-only">{inviteContent.linkLabel}: </span>
          {queryIndex === -1 ? (
            shownUrl
          ) : (
            // Breaks before `?ref=` on a phone, so the code stays in one piece.
            <>
              {shownUrl.slice(0, queryIndex)}
              <wbr />
              <span className="inline-block">{shownUrl.slice(queryIndex)}</span>
            </>
          )}
        </p>
        <CopyInviteLinkButton inviteUrl={inviteUrl} />
      </div>
      <ShareLinks
        path={waitlistPagePath}
        inviteCode={readInviteCodeFromUrl(inviteUrl)}
        messageText={inviteShareText}
        xPostText={waitlistShareText}
      />
    </div>
  )
}

/** "1 of 3 friends confirmed", with a mark per friend. */
function InviteProgress({ invites }: { invites: WaitlistInvites }) {
  return (
    <div className="flex flex-col gap-2">
      <p className="font-mono text-sm leading-[1.4] tracking-[0.04em] uppercase">
        {inviteContent.buildProgressLine(invites.confirmedFriendCount, invites.requiredFriendCount)}
      </p>
      <div aria-hidden="true" className="flex gap-1.5">
        {Array.from({ length: invites.requiredFriendCount }, (_, markIndex) => (
          <span
            // biome-ignore lint/suspicious/noArrayIndexKey: a fixed row of marks, never reordered.
            key={markIndex}
            className={`h-1 w-10 rounded-full ${markIndex < invites.confirmedFriendCount ? 'bg-ink' : 'bg-hairline'}`}
          />
        ))}
      </div>
    </div>
  )
}

/** A reminder for the early hour with no account: Google Calendar, or a file for the rest. */
function EarlyHourReminder() {
  const reminder = {
    title: inviteContent.reminderTitle,
    details: inviteContent.reminderDetails,
    url: `${siteUrl}${passGalleryPath}`,
    startsAt: new Date(plannedEarlyHourStartsAt),
    durationMinutes: 60,
  }
  return (
    <div className="flex flex-col gap-2.5">
      <p className="text-label font-medium tracking-[0.08em] text-ink-secondary-small uppercase">
        {inviteContent.reminderLabel}
      </p>
      <div className="flex flex-wrap gap-2">
        <a
          href={buildGoogleCalendarUrl(reminder)}
          target="_blank"
          rel="noopener noreferrer"
          aria-label={`${inviteContent.googleCalendarLabel} ${inviteContent.opensInNewTab}`}
          className={reminderLinkClassName}
        >
          {inviteContent.googleCalendarLabel}
        </a>
        <a
          href={buildIcsDataUrl(reminder)}
          download={inviteContent.icsFileName}
          className={reminderLinkClassName}
        >
          {inviteContent.icsLabel}
        </a>
      </div>
    </div>
  )
}

/** What to do on the night, once you have the early hour. */
function EarlyHourNight() {
  return (
    <div className="flex flex-col gap-2.5">
      <p className="text-label font-medium tracking-[0.08em] text-ink-secondary-small uppercase">
        {inviteContent.nightHeading}
      </p>
      <ol className="flex list-decimal flex-col gap-1.5 pl-5 text-sm leading-[1.45]">
        <li>
          <a
            href={`${passGalleryPath}#${passSectionIds.gallery}`}
            className="underline decoration-hairline underline-offset-4 transition-colors duration-300 ease-standard hover:decoration-current"
          >
            {inviteContent.nightFavouritesLinkLabel}
          </a>
          {inviteContent.nightFavouritesSuffix}
        </li>
        {inviteContent.nightSteps.map((step) => (
          <li key={step}>{step}</li>
        ))}
      </ol>
    </div>
  )
}

function CopyInviteLinkButton({ inviteUrl }: { inviteUrl: string }) {
  const [isCopied, setIsCopied] = useState(false)
  const inviteCode = readInviteCodeFromUrl(inviteUrl)

  async function copyInviteLink() {
    try {
      // The copied link says where it came from, like the share links.
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
      className="inline-flex h-10 shrink-0 items-center rounded-full bg-surface px-4 text-xs leading-[1.15] font-medium uppercase transition-colors duration-300 ease-standard hover:bg-surface-muted active:bg-surface-muted"
    >
      <span aria-live="polite">
        {isCopied ? inviteContent.copiedLabel : inviteContent.copyLabel}
      </span>
    </button>
  )
}
