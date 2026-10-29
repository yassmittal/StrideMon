import type { Metadata } from 'next'
import { SiteFooter } from '@/components/sections/site-footer'
import { SiteHeader } from '@/components/sections/site-header'
import { PillButton } from '@/components/ui/pill-button'
import { StructuredDataScript } from '@/components/ui/structured-data-script'
import { passIndexContent } from '@/content/founding-pass'
import { markdownPagePaths, passGalleryPath, passIndexPath } from '@/content/site'
import { buildPageMetadata } from '@/lib/build-page-metadata'
import { buildBreadcrumbList, passBreadcrumbItems } from '@/lib/build-structured-data'
import { buildPassPagePath, formatPassNumber, passDesigns } from '@/lib/founding-pass/pass-design'

const PASSES_PER_GROUP = 100

export const metadata: Metadata = buildPageMetadata({
  title: passIndexContent.metaTitle,
  description: passIndexContent.description,
  path: passIndexPath,
  markdownPath: markdownPagePaths.passIndex,
})

const passGroups = Array.from(
  { length: Math.ceil(passDesigns.length / PASSES_PER_GROUP) },
  (_, groupIndex) => {
    const designs = passDesigns.slice(
      groupIndex * PASSES_PER_GROUP,
      (groupIndex + 1) * PASSES_PER_GROUP,
    )
    return {
      heading: passIndexContent.groupHeading(
        formatPassNumber(groupIndex * PASSES_PER_GROUP + 1),
        formatPassNumber(groupIndex * PASSES_PER_GROUP + designs.length),
      ),
      designs,
    }
  },
)

/** Every pass by number and name (D-051): plain links, so no pass page is an orphan. */
export default function PassIndexPage() {
  return (
    <>
      <StructuredDataScript
        structuredData={buildBreadcrumbList([
          ...passBreadcrumbItems,
          { name: passIndexContent.title, path: passIndexPath },
        ])}
      />
      <SiteHeader />
      <main className="page-gutter page-container flex flex-col gap-12 pt-10 pb-16 md:pt-16 md:pb-24">
        <header className="flex max-w-[44rem] flex-col gap-5">
          <h1 className="-ml-[0.04em] text-heading text-balance">{passIndexContent.title}</h1>
          <p className="text-intro">{passIndexContent.intro}</p>
          <div className="pt-2">
            <PillButton href={passGalleryPath} label={passIndexContent.galleryLinkLabel} />
          </div>
        </header>
        {passGroups.map((group) => (
          <section
            key={group.heading}
            aria-label={group.heading}
            className="flex flex-col gap-4 border-t border-hairline pt-6"
          >
            <h2 className="text-label font-medium tracking-[0.08em] text-ink-secondary-small uppercase">
              {group.heading}
            </h2>
            <ul className="grid grid-cols-1 gap-x-6 sm:grid-cols-2 lg:grid-cols-4">
              {group.designs.map((design) => (
                <li key={design.designNumber}>
                  <a
                    href={buildPassPagePath(design.designNumber)}
                    className="flex min-h-9 items-center gap-2 underline-offset-4 hover:underline"
                  >
                    <span className="font-mono text-sm text-ink-secondary-small">
                      {formatPassNumber(design.designNumber)}
                    </span>
                    <span>{design.name}</span>
                  </a>
                </li>
              ))}
            </ul>
          </section>
        ))}
      </main>
      <SiteFooter />
    </>
  )
}
