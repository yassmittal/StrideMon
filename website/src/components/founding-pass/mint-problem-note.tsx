import type { ReactNode } from 'react'
import {
  type MintProblemKey,
  mintProblemContent,
  mintProblemHelpTopicIds,
} from '@/content/founding-pass-mint'
import { HelpTopicLink } from '../ui/help-topic-link'

type MintProblemNoteProps = {
  problemKey: MintProblemKey
  /** A time, a count of tries left, the network details… */
  extra?: ReactNode
  /** The next step's buttons. The help link always follows them. */
  actions?: ReactNode
  tone?: 'light' | 'dark'
}

/**
 * What went wrong, what to do about it, and where to get help, in plain words (Part 5). The help
 * link opens the problem's own answer (D-047).
 */
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
        <HelpTopicLink helpTopicId={mintProblemHelpTopicIds[problemKey]} />
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
