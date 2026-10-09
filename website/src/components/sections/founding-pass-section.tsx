import { foundingPassSectionContent } from '@/content/founding-pass'
import { passGalleryPath, sectionIds } from '@/content/site'
import { buildRevealDelayStyle } from '@/lib/build-reveal-delay-style'
import {
  buildPassPagePath,
  formatPassNumber,
  readPassDesign,
} from '@/lib/founding-pass/pass-design'
import { PassArt } from '../founding-pass/pass-art'
import { MetaLabel } from '../ui/meta-label'
import { PillButton } from '../ui/pill-button'

const headingId = `${foundingPassSectionContent.id}-heading`

/** The landing page's way into `/pass` (Part 4): a black section with a few of the 1,000. */
export function FoundingPassSection() {
  const showcaseDesigns = foundingPassSectionContent.showcaseDesignNumbers.flatMap(
    (designNumber) => {
      const design = readPassDesign(designNumber)
      return design === undefined ? [] : [design]
    },
  )
  return (
    <section
      id={foundingPassSectionContent.id}
      aria-labelledby={headingId}
      className="bg-dark text-on-dark"
    >
      <div className="page-gutter page-container flex flex-col gap-12 py-16 md:py-24">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-12 md:gap-6">
          <div data-reveal className="flex flex-col gap-5 md:col-span-7">
            <MetaLabel items={foundingPassSectionContent.metaLabels} tone="dark" />
            <h2 id={headingId} className="-ml-[0.04em] text-heading text-balance">
              {foundingPassSectionContent.heading}
            </h2>
          </div>
          <div data-reveal className="flex flex-col gap-6 md:col-span-5 md:self-end">
            <p className="text-lg leading-[1.4] text-on-dark-secondary">
              {foundingPassSectionContent.intro}
            </p>
            <div className="flex flex-wrap gap-2.5">
              <PillButton
                href={passGalleryPath}
                label={foundingPassSectionContent.galleryLabel}
                variant="callToAction"
              />
              <PillButton
                href={`#${sectionIds.waitlist}`}
                label={foundingPassSectionContent.waitlistLabel}
                variant="secondary"
              />
            </div>
          </div>
        </div>
        <ul className="grid grid-cols-2 gap-2.5 md:grid-cols-3 lg:grid-cols-6">
          {showcaseDesigns.map((design, designIndex) => (
            <li key={design.designNumber} data-reveal style={buildRevealDelayStyle(designIndex)}>
              <a
                href={buildPassPagePath(design.designNumber)}
                className="group flex flex-col gap-2.5"
              >
                <span className="overflow-hidden rounded-panel transition-opacity duration-300 ease-standard group-hover:opacity-85">
                  <PassArt design={design} view="card" />
                </span>
                <span className="flex items-baseline justify-between gap-2 text-sm">
                  <span>{design.name}</span>
                  <span className="font-mono text-xs text-on-dark-secondary">
                    {formatPassNumber(design.designNumber)}
                  </span>
                </span>
              </a>
            </li>
          ))}
        </ul>
      </div>
    </section>
  )
}
