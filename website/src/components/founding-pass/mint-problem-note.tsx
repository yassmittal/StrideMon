import type { ReactNode } from 'react'
import {
  type MintProblemKey,
  mintHelpLabel,
  mintHelpPath,
  mintProblemContent,
} from '@/content/founding-pass-mint'

type MintProblemNoteProps = {
  problemKey: MintProblemKey
  /** A time, a count of tries left, the network details… */
  extra?: ReactNode
  /** The next step's buttons. The help link always follows them. */
  actions?: ReactNode
  tone?: 'light' | 'dark'
}

/** What went wrong, what to do about it, and where to get help, in plain words (Part 5). */
export function MintProblemNote({
  problemKey,
  extra,
  actions,
  tone = 'light',
}: MintProblemNoteProps) {
  const { title, text } = mintProblemContent[problemKey]
  const secondaryClass = tone === 'dark' ? 'text-on-dark-secondary' : 'text-ink-secondary-small'
  return (
    <div
      className={`flex flex-col gap-3 rounded-panel p-4 md:p-5 ${tone === 'dark' ? 'bg-dark-track text-on-dark' : 'bg-surface-muted text-ink'}`}
    >
      <p className="text-lg leading-[1.25]">{title}</p>
      <p className={`text-sm leading-[1.45] ${secondaryClass}`}>{text}</p>
      {extra}
      <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
        {actions}
        <a
          href={mintHelpPath}
          className="inline-flex min-h-11 items-center text-label font-medium tracking-[0.08em] uppercase underline decoration-hairline underline-offset-4"
        >
          {mintHelpLabel}
        </a>
      </div>
    </div>
  )
}

/** A small button inside a problem note or a step. */
export function MintTextButton({
  label,
  onClick,
  isDisabled = false,
}: {
  label: string
  onClick: () => void
  isDisabled?: boolean
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={isDisabled}
      className="inline-flex h-10 items-center rounded-full bg-ink px-4 text-xs leading-[1.15] font-medium text-on-dark uppercase transition-colors duration-300 ease-standard active:bg-primary disabled:opacity-60"
    >
      {label}
    </button>
  )
}
