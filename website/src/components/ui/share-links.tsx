'use client'

import { type ReactNode, useEffect, useState } from 'react'
import { inviteContent } from '@/content/waitlist'
import { buildXPostUrl } from '@/lib/build-x-post-url'
import { buildInviteShareUrl, type InviteShareTarget } from '@/lib/waitlist-invites'
import { ShareSheetIcon } from './share-sheet-icon'
import { TelegramLogoIcon } from './telegram-logo-icon'
import { WhatsAppLogoIcon } from './whatsapp-logo-icon'
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

const shareLinkClassName =
  'flex min-w-14 flex-col items-center gap-1.5 text-label leading-[1.15] font-medium tracking-[0.08em] uppercase transition-opacity duration-300 ease-standard hover:opacity-80 active:opacity-70'

const logoCircleClassName = 'grid size-11 place-items-center overflow-hidden rounded-full'

/**
 * Share where people share (D-056, D-059): WhatsApp, Telegram, X and the phone's own share sheet
 * (only where the browser has one), each a round logo in the app's own colour with its name under
 * it. Each link carries the sharer's code and its own `source`, and nothing is ever sent for
 * anyone: each opens a composer they edit and send themselves.
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
    <ul className="flex flex-wrap gap-x-4 gap-y-3">
      <li>
        <ExternalShareLink
          href={`https://wa.me/?text=${encodeURIComponent(`${messageText} ${buildUrl('whatsapp')}`)}`}
          label={inviteContent.whatsAppLabel}
          accessibleLabel={`${inviteContent.shareOnPrefix} ${inviteContent.whatsAppLabel}`}
          logo={
            <span className={`${logoCircleClassName} bg-whatsapp text-on-dark`}>
              <WhatsAppLogoIcon />
            </span>
          }
        />
      </li>
      <li>
        <ExternalShareLink
          href={`https://t.me/share/url?url=${encodeURIComponent(buildUrl('telegram'))}&text=${encodeURIComponent(messageText)}`}
          label={inviteContent.telegramLabel}
          accessibleLabel={`${inviteContent.shareOnPrefix} ${inviteContent.telegramLabel}`}
          logo={
            <span className={`${logoCircleClassName} bg-telegram text-on-dark`}>
              <TelegramLogoIcon />
            </span>
          }
        />
      </li>
      <li>
        <ExternalShareLink
          href={buildXPostUrl(xPostText, buildUrl('x'))}
          label={inviteContent.xLabel}
          accessibleLabel={inviteContent.postOnXLabel}
          logo={
            <span className={`${logoCircleClassName} bg-ink text-on-dark`}>
              <XLogoIcon className="size-4" />
            </span>
          }
        />
      </li>
      {canUseShareSheet ? (
        <li>
          <button
            type="button"
            onClick={() => void openShareSheet()}
            aria-label={inviteContent.shareSheetAccessibleLabel}
            className={shareLinkClassName}
          >
            <span className={`${logoCircleClassName} bg-surface-muted text-ink`}>
              <ShareSheetIcon />
            </span>
            <span aria-hidden="true">{inviteContent.shareSheetLabel}</span>
          </button>
        </li>
      ) : null}
    </ul>
  )
}

function ExternalShareLink({
  href,
  label,
  accessibleLabel,
  logo,
}: {
  href: string
  label: string
  accessibleLabel: string
  logo: ReactNode
}) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={`${accessibleLabel} ${inviteContent.opensInNewTab}`}
      className={shareLinkClassName}
    >
      {logo}
      <span aria-hidden="true">{label}</span>
    </a>
  )
}
