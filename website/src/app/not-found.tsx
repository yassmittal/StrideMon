import type { Metadata } from 'next'
import { SiteFooter } from '@/components/sections/site-footer'
import { SiteHeader } from '@/components/sections/site-header'
import { MetaLabel } from '@/components/ui/meta-label'
import { PillButton } from '@/components/ui/pill-button'
import { notFoundContent } from '@/content/not-found'
import { helpPath, passGalleryPath } from '@/content/site'

// `canonical: null` drops the layout's, so a 404 never claims to be the home page. Next adds the
// `noindex` itself.
export const metadata: Metadata = {
  title: notFoundContent.metaTitle,
  alternates: { canonical: null },
}

/** Every unknown path (`out/404.html`), with a way back to each part of the site. */
export default function NotFoundPage() {
  return (
    <>
      <SiteHeader />
      <main className="page-gutter page-container pt-10 pb-16 md:pt-16 md:pb-24">
        <div className="flex max-w-[44rem] flex-col gap-5">
          <MetaLabel items={notFoundContent.metaLabels} />
          <h1 className="-ml-[0.04em] text-heading text-balance">{notFoundContent.title}</h1>
          <p className="text-intro">{notFoundContent.intro}</p>
          <div className="flex flex-wrap gap-2.5 pt-2">
            <PillButton href="/" label={notFoundContent.homeLabel} />
            <PillButton
              href={passGalleryPath}
              label={notFoundContent.passGalleryLabel}
              variant="secondary"
            />
            <PillButton href={helpPath} label={notFoundContent.helpLabel} variant="secondary" />
          </div>
        </div>
      </main>
      <SiteFooter />
    </>
  )
}
