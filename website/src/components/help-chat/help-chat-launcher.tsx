'use client'

import dynamic from 'next/dynamic'
import { useState } from 'react'
import { helpChatContent } from '@/content/help-chat'

// The dialog and its code download the first time someone taps the pill, so the page itself only
// ships this button (D-048). `ssr: false`: it never renders on the server.
const HelpChatDialog = dynamic(
  () =>
    import('./help-chat-dialog')
      .then((dialogModule) => dialogModule.HelpChatDialog)
      .catch(() => HelpChatLoadFailedNote),
  { ssr: false },
)

type HelpChatDialogProps = { isOpen: boolean; onClose: () => void }

/** When the dialog's code can't download (offline, say): the help page is the next step. */
function HelpChatLoadFailedNote({ isOpen, onClose }: HelpChatDialogProps) {
  if (!isOpen) return null
  return (
    <div
      role="status"
      className="help-chat-load-failed fixed right-4 z-20 flex max-w-[20rem] flex-col gap-2 rounded-panel bg-surface p-4 text-sm leading-[1.4] shadow-floating-pill md:right-[max(5vw,40px)]"
    >
      <p>{helpChatContent.problems.unreachable}</p>
      <div className="flex items-center gap-4">
        <a
          href={helpChatContent.helpPagePath}
          className="inline-flex min-h-11 items-center text-label font-medium tracking-[0.08em] uppercase underline decoration-hairline underline-offset-4"
        >
          {helpChatContent.helpPageLabel}
        </a>
        <button
          type="button"
          onClick={onClose}
          className="inline-flex min-h-11 items-center text-label font-medium tracking-[0.08em] text-ink-secondary-small uppercase"
        >
          {helpChatContent.closeLabel}
        </button>
      </div>
    </div>
  )
}

/**
 * "Ask a question", fixed at the bottom right of /pass and /help (Part 8, D-048), an icon on a
 * phone (D-050). Once opened, the
 * dialog stays mounted, so closing and reopening keeps the conversation (in memory only).
 */
export function HelpChatLauncher() {
  const [isOpen, setIsOpen] = useState(false)
  const [hasOpened, setHasOpened] = useState(false)

  function handleLauncherPress() {
    setHasOpened(true)
    setIsOpen(true)
  }

  return (
    <>
      <button
        type="button"
        onClick={handleLauncherPress}
        aria-haspopup="dialog"
        aria-label={helpChatContent.launcherLabel}
        className="help-chat-launcher fixed right-4 z-20 inline-flex h-11 items-center justify-center gap-2.5 rounded-full bg-surface max-md:w-11 md:pr-5 md:pl-4 text-xs leading-[1.15] font-medium tracking-[0.04em] text-ink uppercase shadow-floating-pill transition-colors duration-300 ease-standard hover:bg-surface-muted active:bg-surface-muted md:right-[max(5vw,40px)]"
      >
        <svg
          aria-hidden="true"
          className="size-4"
          viewBox="0 0 18 18"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.4"
          strokeLinejoin="round"
        >
          <path d="M3 4.5A1.5 1.5 0 0 1 4.5 3h9A1.5 1.5 0 0 1 15 4.5v6a1.5 1.5 0 0 1-1.5 1.5H8l-3.5 3v-3h0A1.5 1.5 0 0 1 3 10.5z" />
        </svg>
        {/* Just the icon on a phone, where the pill covered the page (D-050). */}
        <span aria-hidden="true" className="max-md:hidden">
          {helpChatContent.launcherLabel}
        </span>
      </button>
      {hasOpened ? <HelpChatDialog isOpen={isOpen} onClose={() => setIsOpen(false)} /> : null}
    </>
  )
}
