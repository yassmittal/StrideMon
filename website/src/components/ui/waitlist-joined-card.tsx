import type { ReactNode, Ref } from 'react'
import { passSectionIds, plannedPassScheduleTimes } from '@/content/founding-pass'
import { passGalleryPath } from '@/content/site'
import { waitlistJoinedContent, waitlistShareText, waitlistShareUrl } from '@/content/waitlist'
import { buildXPostUrl } from '@/lib/build-x-post-url'
import { LocalDateTime } from '../founding-pass/local-date-time'
import { CrossMarks } from './cross-marks'
import { buildPillClassName, PillContent } from './pill-button'
import { XLogoIcon } from './x-logo-icon'

type WaitlistJoinedCardProps = {
  /** The email as it was sent, so a typo shows. */
  email: string
  /** The shoes, drawn by the server (`WaitlistSection`). */
  showcase: ReactNode
  headingRef: Ref<HTMLParagraphElement>
  onUseAnotherEmail: () => void
}

/**
 * What replaces the form after joining (D-055): a ticket in the Founding Pass card's look, then
 * the promise, Post on X and the gallery. A new and a repeat email see the same card (D-037).
 */
export function WaitlistJoinedCard({
  email,
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

      <div className="flex flex-col items-start gap-4">
        <p className="text-base leading-[1.4]">
          {waitlistJoinedContent.promise}{' '}
          <span className="text-ink-secondary-small">{waitlistJoinedContent.sharePrompt}</span>
        </p>
        <div className="flex flex-wrap gap-2.5">
          <a
            href={buildXPostUrl(waitlistShareText, waitlistShareUrl)}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={waitlistJoinedContent.postOnXAccessibleLabel}
            className={buildPillClassName('primary', 'regular')}
          >
            <XLogoIcon />
            <PillContent label={waitlistJoinedContent.postOnXLabel} />
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
