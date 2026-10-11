import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { PassDetails } from '@/components/founding-pass/pass-details'
import { PassMintRoot } from '@/components/founding-pass/pass-mint-root'
import { PassHowItWorksSection } from '@/components/sections/pass-how-it-works-section'
import { SiteFooter } from '@/components/sections/site-footer'
import { SiteHeader } from '@/components/sections/site-header'
import { WaitlistSection } from '@/components/sections/waitlist-section'
import { RevealObserver } from '@/components/ui/reveal-observer'
import { passDetailContent } from '@/content/founding-pass'
import { passGalleryPath, passIndexPath, sectionIds } from '@/content/site'
import { buildPageMetadata } from '@/lib/build-page-metadata'
import {
  buildPassPagePath,
  formatPassNumber,
  type PassDesign,
  passDesigns,
  passRarityLabels,
  readNeighbourPassDesigns,
  readPassDesign,
} from '@/lib/founding-pass/pass-design'

type PassPageProps = {
  params: Promise<{ number: string }>
}

// All 1,000 pages are built ahead (brief §8, D-044); any other number is a 404.
export const dynamicParams = false

export function generateStaticParams(): { number: string }[] {
  return passDesigns.map((design) => ({ number: String(design.designNumber) }))
}

async function readPageDesign(params: PassPageProps['params']): Promise<PassDesign> {
  const design = readPassDesign(Number((await params).number))
  if (design === undefined) notFound()
  return design
}

export async function generateMetadata({ params }: PassPageProps): Promise<Metadata> {
  const design = await readPageDesign(params)
  const title = `Founding Pass ${formatPassNumber(design.designNumber)}: ${design.name}`
  const description = `${passRarityLabels[design.rarity]} Founding Pass: a ${design.template.label} in ${design.colorFamily.label}, ${design.colorway.label} colourway. One of one, free to mint, and it can’t be sent or sold.`
  return buildPageMetadata({
    title,
    description,
    path: buildPassPagePath(design.designNumber),
    hasOwnShareImage: true,
  })
}

/** One pass's page, the one people share (brief §8). Its live state loads in the browser. */
export default async function PassPage({ params }: PassPageProps) {
  const design = await readPageDesign(params)
  return (
    <>
      <SiteHeader waitlistHref={`#${sectionIds.waitlist}`} />
      <main>
        <div className="page-gutter page-container flex flex-col gap-6 pt-8 pb-16 md:pt-12 md:pb-24">
          <a
            href={passGalleryPath}
            className="group inline-flex min-h-11 items-center gap-2 self-start text-label font-medium tracking-[0.08em] uppercase"
          >
            <svg
              aria-hidden="true"
              className="size-4 shrink-0 transition-transform duration-300 ease-standard group-hover:-translate-x-[3px]"
              viewBox="0 0 18 18"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M15 9H3M8 4 3 9l5 5" />
            </svg>
            {passDetailContent.backToGalleryLabel}
          </a>
          <PassDetails designNumber={design.designNumber} headingLevel="h1" isArtEager />
          <NeighbourPassLinks designNumber={design.designNumber} />
        </div>
        <PassHowItWorksSection />
        <WaitlistSection />
      </main>
      <SiteFooter />
      <PassMintRoot />
      <RevealObserver />
    </>
  )
}

/** Previous, every pass and next: plain links, so every pass page has one crawlers follow (D-051). */
function NeighbourPassLinks({ designNumber }: { designNumber: number }) {
  const { previousDesign, nextDesign } = readNeighbourPassDesigns(designNumber)
  const linkClassName =
    'flex min-h-11 flex-col justify-center gap-0.5 underline-offset-4 hover:underline'
  const labelClassName =
    'text-label font-medium tracking-[0.08em] text-ink-secondary-small uppercase'
  return (
    <nav
      aria-label={passDetailContent.allPassesLinkLabel}
      className="grid grid-cols-2 gap-x-4 gap-y-2 border-t border-hairline pt-5 md:grid-cols-3"
    >
      <a href={buildPassPagePath(previousDesign.designNumber)} className={linkClassName}>
        <span className={labelClassName}>{passDetailContent.previousPassLabel}</span>
        <span>
          {formatPassNumber(previousDesign.designNumber)} {previousDesign.name}
        </span>
      </a>
      <a
        href={passIndexPath}
        className={`${linkClassName} order-last col-span-2 md:order-none md:col-span-1 md:items-center`}
      >
        <span className="text-label font-medium tracking-[0.08em] uppercase underline decoration-hairline underline-offset-4">
          {passDetailContent.allPassesLinkLabel}
        </span>
      </a>
      <a
        href={buildPassPagePath(nextDesign.designNumber)}
        className={`${linkClassName} items-end text-right`}
      >
        <span className={labelClassName}>{passDetailContent.nextPassLabel}</span>
        <span>
          {formatPassNumber(nextDesign.designNumber)} {nextDesign.name}
        </span>
      </a>
    </nav>
  )
}
