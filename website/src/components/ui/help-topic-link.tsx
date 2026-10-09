import { mintHelpLabel } from '@/content/founding-pass-mint'
import { buildHelpPath, type HelpTopicId } from '@/content/help'

type HelpTopicLinkProps = {
  helpTopicId: HelpTopicId
  label?: string
}

/**
 * "Get help": one answer on /help (D-047), in a new tab, so a mint in progress or a half-done step
 * stays where it is.
 */
export function HelpTopicLink({ helpTopicId, label = mintHelpLabel }: HelpTopicLinkProps) {
  return (
    <a
      href={buildHelpPath(helpTopicId)}
      target="_blank"
      rel="noopener"
      className="inline-flex min-h-11 items-center self-start text-label font-medium tracking-[0.08em] uppercase underline decoration-hairline underline-offset-4"
    >
      {label}
    </a>
  )
}
