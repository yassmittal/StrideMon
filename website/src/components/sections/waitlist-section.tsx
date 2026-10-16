import { sectionIds, xAccountHandle, xAccountUrl } from '@/content/site'
import { waitlistContent, waitlistPageContent } from '@/content/waitlist'
import { readPassDesign } from '@/lib/founding-pass/pass-design'
import { PassArt } from '../founding-pass/pass-art'
import { ArrowIcon } from '../ui/arrow-icon'
import { SectionHeading } from '../ui/section-heading'
import { WaitlistForm } from '../ui/waitlist-form'
import { WaitlistPhaseGate } from '../ui/waitlist-phase-gate'
import { XLogoIcon } from '../ui/x-logo-icon'

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
          metaLabels={waitlistContent.metaLabels}
          heading={waitlistContent.heading}
          headingLevel={isPageHeading ? 'h1' : 'h2'}
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
          <WaitlistForm joinedShowcase={<WaitlistShowcaseShoes />} />
        </WaitlistPhaseGate>
      </div>
    </section>
  )
}

/**
 * The joined card's shoes, drawn here on the server so the form's island never ships the design
 * table. They're lazy images that load only once the card shows.
 */
function WaitlistShowcaseShoes() {
  return (
    <ul aria-hidden="true" className="grid grid-cols-2 gap-x-3 gap-y-1">
      {waitlistPageContent.showcaseDesignNumbers.map((designNumber) => {
        const design = readPassDesign(designNumber)
        return design === undefined ? null : (
          <li key={designNumber}>
            <PassArt design={design} view="shoe" />
          </li>
        )
      })}
    </ul>
  )
}
