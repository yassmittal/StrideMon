import type { ReactNode } from 'react'
import type { HelpTopicId } from '@/content/help'
import { HelpTopicLink } from './help-topic-link'

type ProblemNoteProps = {
  title: string
  text: string
  /** The problem's own answer on /help (D-047). */
  helpTopicId: HelpTopicId
  /** A time, a count of tries left… */
  extra?: ReactNode
  /** The next step's buttons. The help link always follows them. */
  actions?: ReactNode
  tone?: 'light' | 'dark'
}

/** What went wrong, what to do about it, and where to get help, in plain words. */
export function ProblemNote({
  title,
  text,
  helpTopicId,
  extra,
  actions,
  tone = 'light',
}: ProblemNoteProps) {
  const secondaryClass = tone === 'dark' ? 'text-on-dark-secondary' : 'text-ink-secondary-small'
  return (
    <div
      role="status"
      className={`flex flex-col gap-3 rounded-panel p-4 md:p-5 ${tone === 'dark' ? 'bg-dark-track text-on-dark' : 'bg-surface-muted text-ink'}`}
    >
      <p className="text-lg leading-[1.25]">{title}</p>
      <p className={`text-sm leading-[1.45] ${secondaryClass}`}>{text}</p>
      {extra}
      <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
        {actions}
        <HelpTopicLink helpTopicId={helpTopicId} />
      </div>
    </div>
  )
}
