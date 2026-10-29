import { sectionIds } from '@/content/site'
import { waitlistContent } from '@/content/waitlist'
import { SectionHeading } from '../ui/section-heading'
import { WaitlistForm } from '../ui/waitlist-form'
import { WaitlistPhaseGate } from '../ui/waitlist-phase-gate'
import { WaitlistCount } from '../waitlist/waitlist-count'

const headingId = `${sectionIds.waitlist}-heading`

type WaitlistSectionProps = {
  /** True on `/waitlist`, where the section leads the page and its heading is the `<h1>`. */
  isPageHeading?: boolean
}

export function WaitlistSection({ isPageHeading = false }: WaitlistSectionProps) {
  return (
    <section
      id={sectionIds.waitlist}
      aria-labelledby={headingId}
      className={`page-gutter page-container grid gap-10 md:grid-cols-12 md:gap-6 ${isPageHeading ? 'pt-10 pb-16 md:pt-16 md:pb-24' : 'py-16 md:py-24'}`}
    >
      <div className="flex flex-col gap-6 md:col-span-6">
        <SectionHeading
          id={headingId}
          heading={waitlistContent.heading}
          headingLevel={isPageHeading ? 'h1' : 'h2'}
        />
        <p data-reveal className="max-w-[29em] text-lg leading-[1.4] text-ink-secondary-small">
          {waitlistContent.intro}
        </p>
        <WaitlistCount />
      </div>
      <div
        data-reveal
        className="relative min-w-0 self-start rounded-panel bg-surface p-6 md:col-span-5 md:col-start-8 md:p-[30px]"
      >
        <WaitlistPhaseGate>
          <WaitlistForm />
        </WaitlistPhaseGate>
      </div>
    </section>
  )
}
