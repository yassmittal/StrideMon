'use client'

import { useEffect, useState } from 'react'
import { inviteContent } from '@/content/waitlist'
import { buildXPostUrl } from '@/lib/build-x-post-url'
import { buildInviteShareUrl, type InviteShareTarget } from '@/lib/waitlist-invites'
import { XLogoIcon } from './x-logo-icon'

type ShareLinksProps = {
  /** The site page the links open: `/waitlist`, or a pass's page. */
  path: string
  /** The sharer's own invite code, so a friend who joins counts for them (D-056). */
  inviteCode: string | null
  /** The message for WhatsApp, Telegram and the phone's share sheet. */
  messageText: string
  /** The post X opens with. */
  xPostText: string
}

const shareButtonClassName =
  'inline-flex h-10 items-center gap-2 rounded-full bg-surface-muted px-4 text-xs leading-[1.15] font-medium uppercase transition-colors duration-300 ease-standard hover:bg-surface active:bg-surface'

/**
 * Share where people share (D-056): WhatsApp, Telegram, X and the phone's own share sheet (only
 * where the browser has one). Each link carries the sharer's code and its own `source`, and
 * nothing is ever sent for anyone: each opens a composer they edit and send themselves.
 */
export function ShareLinks({ path, inviteCode, messageText, xPostText }: ShareLinksProps) {
  const [canUseShareSheet, setCanUseShareSheet] = useState(false)
  useEffect(() => {
    setCanUseShareSheet(typeof navigator.share === 'function')
  }, [])

  const buildUrl = (shareTarget: InviteShareTarget) =>
    buildInviteShareUrl({ path, inviteCode, shareTarget })

  async function openShareSheet() {
    try {
      await navigator.share({ text: messageText, url: buildUrl('share') })
    } catch {
      // Closed without sharing, or the browser refused: nothing to do.
    }
  }

  return (
    <div className="flex flex-wrap gap-2">
      <ExternalShareLink
        href={`https://wa.me/?text=${encodeURIComponent(`${messageText} ${buildUrl('whatsapp')}`)}`}
        label={inviteContent.whatsAppLabel}
      />
      <ExternalShareLink
        href={`https://t.me/share/url?url=${encodeURIComponent(buildUrl('telegram'))}&text=${encodeURIComponent(messageText)}`}
        label={inviteContent.telegramLabel}
      />
      <ExternalShareLink
        href={buildXPostUrl(xPostText, buildUrl('x'))}
        label={inviteContent.postOnXLabel}
        hasXLogo
      />
      {canUseShareSheet ? (
        <button
          type="button"
          onClick={() => void openShareSheet()}
          className={shareButtonClassName}
        >
          {inviteContent.shareSheetLabel}
        </button>
      ) : null}
    </div>
  )
}

function ExternalShareLink({
  href,
  label,
  hasXLogo = false,
}: {
  href: string
  label: string
  hasXLogo?: boolean
}) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={`${label} ${inviteContent.opensInNewTab}`}
      className={shareButtonClassName}
    >
      {hasXLogo ? <XLogoIcon /> : null}
      {label}
    </a>
  )
}
