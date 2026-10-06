import { sectionIds } from '@/content/site'
import { waitlistContent } from '@/content/waitlist'
import { SectionHeading } from '../ui/section-heading'
import { WaitlistForm } from '../ui/waitlist-form'

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
      </div>
      <div
        data-reveal
        className="relative self-start rounded-panel bg-surface p-6 md:col-span-5 md:col-start-8 md:p-[30px]"
      >
        <WaitlistForm />
      </div>
    </section>
  )
}
