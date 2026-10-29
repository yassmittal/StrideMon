import { closingContent } from '@/content/closing'
import { passGalleryPath, sectionIds } from '@/content/site'
import { MetaLabel } from '../ui/meta-label'
import { PillButton } from '../ui/pill-button'

const headingId = 'closing-heading'

/** The home page ends on a choice, not on the footer's links (D-072). It runs into the dark footer. */
export function ClosingSection() {
  return (
    <section aria-labelledby={headingId} className="bg-dark text-on-dark">
      <div className="page-gutter page-container">
        <div className="flex flex-col gap-8 border-b border-hairline-on-dark pt-16 pb-16 md:flex-row md:items-end md:justify-between md:gap-6 md:pt-24 md:pb-24">
          <div data-reveal className="flex flex-col gap-5">
            <MetaLabel items={closingContent.metaLabels} tone="dark" />
            <h2 id={headingId} className="-ml-[0.04em] max-w-[11em] text-heading text-balance">
              {closingContent.heading}
            </h2>
          </div>
          <div data-reveal className="flex shrink-0 flex-wrap gap-2.5 md:pb-2">
            <PillButton
              href={passGalleryPath}
              label={closingContent.galleryLabel}
              variant="callToAction"
            />
            <PillButton
              href={`#${sectionIds.waitlist}`}
              label={closingContent.waitlistLabel}
              variant="secondary"
            />
          </div>
        </div>
      </div>
    </section>
  )
}
