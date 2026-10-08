import type { ReactNode } from 'react'

type MintStepFrameProps = {
  stepLabel: string
  title: string
  isDone: boolean
  headingLevel: 'h3' | 'h4'
  children: ReactNode
}

/** One "Get ready" step: its number, its title with a tick once done, and its content. */
export function MintStepFrame({
  stepLabel,
  title,
  isDone,
  headingLevel,
  children,
}: MintStepFrameProps) {
  const Heading = headingLevel
  return (
    <div className="flex flex-col gap-4 rounded-panel bg-surface p-5 md:p-6">
      <div className="flex items-start justify-between gap-4">
        <div className="flex flex-col gap-1.5">
          <p className="text-label font-medium tracking-[0.08em] text-ink-secondary-small uppercase">
            {stepLabel}
          </p>
          <Heading className="text-2xl leading-[1.1] tracking-[-0.01em]">{title}</Heading>
        </div>
        {isDone ? <DoneMark /> : null}
      </div>
      {children}
    </div>
  )
}

function DoneMark() {
  return (
    <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-ink text-lime">
      <svg
        aria-hidden="true"
        className="size-4"
        viewBox="0 0 18 18"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.75"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="m4 9.5 3.2 3L14 5.5" />
      </svg>
      <span className="sr-only">Done</span>
    </span>
  )
}

/** The shared look of the steps' text fields. */
export const mintFieldClassName =
  'h-[52px] w-full rounded-full border border-hairline bg-page px-5 text-base placeholder:text-ink-secondary transition-colors duration-300 ease-standard focus-visible:border-ink aria-invalid:border-ink'

/** The small uppercase link-buttons under a done step ("Use another email"). */
export const mintQuietButtonClassName =
  'inline-flex min-h-11 items-center self-start text-label font-medium tracking-[0.08em] uppercase underline decoration-hairline underline-offset-4'
