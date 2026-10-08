import { sectionIds, xAccountHandle, xAccountUrl } from '@/content/site'
import { waitlistContent } from '@/content/waitlist'
import { ArrowIcon } from '../ui/arrow-icon'
import { SectionHeading } from '../ui/section-heading'
import { WaitlistForm } from '../ui/waitlist-form'
import { WaitlistPhaseGate } from '../ui/waitlist-phase-gate'
import { XLogoIcon } from '../ui/x-logo-icon'

const headingId = `${sectionIds.waitlist}-heading`

export function WaitlistSection() {
  return (
    <section
      id={sectionIds.waitlist}
      aria-labelledby={headingId}
      className="page-gutter page-container grid gap-10 py-16 md:grid-cols-12 md:gap-6 md:py-24"
    >
      <div className="flex flex-col gap-6 md:col-span-6">
        <SectionHeading
          id={headingId}
          metaLabels={waitlistContent.metaLabels}
          heading={waitlistContent.heading}
        />
        <p data-reveal className="max-w-[29em] text-lg leading-[1.4] text-ink-secondary-small">
          {waitlistContent.intro}
        </p>
        <p data-reveal className="flex flex-wrap items-center gap-x-3 text-lg leading-[1.4]">
          <span className="text-ink-secondary-small">{waitlistContent.followPrompt}</span>
          <a
            href={xAccountUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="group inline-flex min-h-11 items-center gap-2 font-mono"
          >
            <XLogoIcon />
            {xAccountHandle}
            <ArrowIcon className="transition-transform duration-300 ease-standard group-hover:translate-x-[3px]" />
          </a>
        </p>
      </div>
      <div
        data-reveal
        className="relative self-start rounded-panel bg-surface p-6 md:col-span-5 md:col-start-8 md:p-[30px]"
      >
        <WaitlistPhaseGate>
          <WaitlistForm />
        </WaitlistPhaseGate>
      </div>
    </section>
  )
}
