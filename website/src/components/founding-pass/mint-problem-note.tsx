import type { ReactNode } from 'react'
import {
  type MintProblemKey,
  mintProblemContent,
  mintProblemHelpTopicIds,
} from '@/content/founding-pass-mint'
import { ProblemNote } from '../ui/problem-note'

type MintProblemNoteProps = {
  problemKey: MintProblemKey
  /** A time, a count of tries left, the network details… */
  extra?: ReactNode
  /** The next step's buttons. The help link always follows them. */
  actions?: ReactNode
  tone?: 'light' | 'dark'
}

/**
 * What went wrong in the mint, what to do about it, and where to get help, in plain words (Part 5).
 * The help link opens the problem's own answer (D-047).
 */
export function MintProblemNote({ problemKey, extra, actions, tone }: MintProblemNoteProps) {
  return (
    <ProblemNote
      {...mintProblemContent[problemKey]}
      helpTopicId={mintProblemHelpTopicIds[problemKey]}
      extra={extra}
      actions={actions}
      tone={tone}
    />
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
      className="inline-flex h-10 items-center rounded-full bg-ink px-4 text-xs leading-[1.15] font-medium text-on-dark uppercase transition-colors duration-300 ease-standard hover:bg-primary active:bg-primary disabled:opacity-60"
    >
      {label}
    </button>
  )
}
