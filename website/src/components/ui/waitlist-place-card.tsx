'use client'

import { useEffect, useState } from 'react'
import { sectionIds, siteUrl } from '@/content/site'
import { waitlistPlaceContent } from '@/content/waitlist'
import type { WaitlistPlace } from '@/lib/waitlist-request'
import { buildPillClassName, PillContent } from './pill-button'

type WaitlistPlaceCardProps = {
  place: WaitlistPlace
  onNotYou: () => void
}

const copiedLabelMilliseconds = 1600

// The place in line, and the link that moves it up (D-041).
export function WaitlistPlaceCard({ place, onNotYou }: WaitlistPlaceCardProps) {
  const [isCopied, setIsCopied] = useState(false)
  const [canShare, setCanShare] = useState(false)
  const shareUrl = `${siteUrl}/?ref=${place.referralCode}#${sectionIds.waitlist}`

  useEffect(() => {
    // Only known after hydration: the static HTML can't tell whether the browser can share.
    setCanShare(typeof navigator.share === 'function')
  }, [])

  useEffect(() => {
    if (!isCopied) return
    const timeoutId = window.setTimeout(() => setIsCopied(false), copiedLabelMilliseconds)
    return () => window.clearTimeout(timeoutId)
  }, [isCopied])

  async function copyShareUrl() {
    try {
      await navigator.clipboard.writeText(shareUrl)
      setIsCopied(true)
    } catch {
      // Clipboard blocked (insecure context or permission): the link stays selectable.
    }
  }

  async function shareLink() {
    try {
      await navigator.share({ text: waitlistPlaceContent.shareText, url: shareUrl })
    } catch {
      // Dismissed, or the share sheet failed: the link is still there to copy.
    }
  }

  return (
    <div className="waitlist-joined flex flex-col gap-6">
      <div className="flex flex-col gap-2">
        <p className="text-label font-medium tracking-[0.08em] text-ink-secondary-small uppercase">
          {waitlistPlaceContent.placeLabel}
        </p>
        <p
          tabIndex={-1}
          className="font-mono text-[clamp(2.75rem,6vw,4.5rem)] leading-none tracking-[-0.02em] outline-none"
        >
          #{place.placeInLine.toLocaleString('en-US')}
        </p>
        {place.referralCount > 0 && (
          <p className="text-sm leading-[1.4]">
            {waitlistPlaceContent.buildReferralLine(place.referralCount)}
          </p>
        )}
      </div>

      <div className="flex flex-col gap-2.5">
        <p className="text-lg leading-[1.4]">{waitlistPlaceContent.shareIntro}</p>
        <p className="text-label font-medium tracking-[0.08em] text-ink-secondary-small uppercase">
          {waitlistPlaceContent.shareLinkLabel}
        </p>
        <p className="rounded-panel bg-page px-4 py-3 font-mono text-sm break-all select-all">
          {shareUrl}
        </p>
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={copyShareUrl}
            className={buildPillClassName('primary', 'compact')}
          >
            <PillContent
              label={isCopied ? waitlistPlaceContent.copiedLabel : waitlistPlaceContent.copyLabel}
            />
          </button>
          {canShare && (
            <button
              type="button"
              onClick={shareLink}
              className={buildPillClassName('secondary', 'compact')}
            >
              <PillContent label={waitlistPlaceContent.shareLabel} />
            </button>
          )}
        </div>
      </div>

      <div className="flex flex-col items-start gap-1">
        <p className="text-sm leading-[1.4] text-ink-secondary-small">
          {waitlistPlaceContent.waveNote}
        </p>
        <button
          type="button"
          onClick={onNotYou}
          className="min-h-11 text-sm underline decoration-hairline underline-offset-4 transition-colors duration-300 ease-standard hover:decoration-ink"
        >
          {waitlistPlaceContent.notYouLabel}
        </button>
      </div>
    </div>
  )
}
