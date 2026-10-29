import { foundingPassSectionContent } from '@/content/founding-pass'
import { passGalleryPath, showroomUrl } from '@/content/site'
import { buildRevealDelayStyle } from '@/lib/build-reveal-delay-style'
import { buildPassPagePath, readPassDesign } from '@/lib/founding-pass/pass-design'
import { PassArt } from '../founding-pass/pass-art'
import { PillButton } from '../ui/pill-button'
import { ShowroomButton } from '../ui/showroom-button'

const headingId = `${foundingPassSectionContent.id}-heading`

/**
 * The landing page's way into `/pass` (Part 4): a black section with a few of the 1,000. Each card
 * shows its own name and number, so nothing is written under it (D-073).
 */
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
          <h2
            id={headingId}
            data-reveal
            className="-ml-[0.04em] text-heading text-balance md:col-span-7"
          >
            {foundingPassSectionContent.heading}
          </h2>
          <div data-reveal className="flex flex-col gap-6 md:col-span-5 md:self-end">
            <p className="max-w-[22em] text-lg leading-[1.4] text-on-dark-secondary">
              {foundingPassSectionContent.intro}
            </p>
            <div className="flex flex-wrap items-center gap-x-3 gap-y-4">
              <PillButton
                href={passGalleryPath}
                label={foundingPassSectionContent.galleryLabel}
                variant="callToAction"
              />
              <ShowroomButton href={showroomUrl} label={foundingPassSectionContent.showroomLabel} />
            </div>
          </div>
        </div>
        <ul className="grid grid-cols-2 gap-2.5 md:grid-cols-3 lg:grid-cols-6">
          {showcaseDesigns.map((design, designIndex) => (
            <li key={design.designNumber} data-reveal style={buildRevealDelayStyle(designIndex)}>
              <a
                href={buildPassPagePath(design.designNumber)}
                className="block overflow-hidden rounded-panel transition-transform duration-500 ease-standard hover:-translate-y-1.5"
              >
                <PassArt design={design} view="card" />
              </a>
            </li>
          ))}
        </ul>
      </div>
    </section>
  )
}
