'use client'

import type { ReactNode } from 'react'
import { plannedPassScheduleTimes } from '@/content/founding-pass'
import { passGalleryPath } from '@/content/site'
import { waitlistContent } from '@/content/waitlist'
import { calculatePassSchedulePosition } from '@/lib/founding-pass/pass-schedule'
import { useNow } from '@/lib/use-now'
import { LocalDateTime } from '../founding-pass/local-date-time'
import { buildPillClassName, PillContent } from './pill-button'

const PHASE_CHECK_MILLISECONDS = 60_000

/**
 * Shows the waitlist form until the waitlist window opens. After that, joining gets nobody into
 * the window (D-043), so the form gives way to what to do instead. It goes by the planned times
 * (D-044), so the landing page asks the API for nothing.
 */
export function WaitlistPhaseGate({ children }: { children: ReactNode }) {
  const now = useNow(PHASE_CHECK_MILLISECONDS)
  const phase =
    now === null
      ? 'preview'
      : calculatePassSchedulePosition({
          scheduleTimes: plannedPassScheduleTimes,
          mintedCount: null,
          now,
        }).phase
  if (phase === 'preview') return children
  return (
    <div className="flex flex-col items-start gap-5">
      <p className="text-[clamp(1.625rem,3vw,2.5rem)] leading-[1.05] tracking-[-0.01em]">
        {phase === 'openToAll' || phase === 'allMinted'
          ? waitlistContent.closedOpenToAllHeading
          : waitlistContent.closedHeading}
      </p>
      <p className="text-base leading-[1.4] text-ink-secondary-small">
        {phase === 'waitlistWindow' ? (
          <>
            {waitlistContent.closedTextPrefix}{' '}
            <LocalDateTime isoTimestamp={plannedPassScheduleTimes.openMintStartsAt} />.
          </>
        ) : phase === 'openMint' ? (
          waitlistContent.closedOpenMintText
        ) : (
          waitlistContent.closedOpenToAllText
        )}
      </p>
      <a href={passGalleryPath} className={buildPillClassName('primary', 'regular')}>
        <PillContent label={waitlistContent.closedGalleryLabel} />
      </a>
    </div>
  )
}
