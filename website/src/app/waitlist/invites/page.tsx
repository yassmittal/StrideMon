import type { Metadata } from 'next'
import { SiteFooter } from '@/components/sections/site-footer'
import { SiteHeader } from '@/components/sections/site-header'
import { SectionHeading } from '@/components/ui/section-heading'
import { WaitlistInvitesView } from '@/components/waitlist/waitlist-invites-view'
import { waitlistInvitesPath, waitlistPagePath } from '@/content/site'
import { waitlistInvitesPageContent } from '@/content/waitlist'
import { buildPageMetadata } from '@/lib/build-page-metadata'

// A personal page (D-056): static, and kept out of search results.
export const metadata: Metadata = {
  ...buildPageMetadata({
    title: waitlistInvitesPageContent.title,
    description: waitlistInvitesPageContent.description,
    path: waitlistInvitesPath,
  }),
  robots: { index: false, follow: false },
}

const headingId = 'invites-heading'

/** `/waitlist/invites`: check your email, then see your link, your friends and the early hour. */
export default function WaitlistInvitesPage() {
  return (
    <>
      <SiteHeader waitlistHref={waitlistPagePath} />
      <main>
        <section
          aria-labelledby={headingId}
          className="page-gutter page-container grid gap-10 pt-10 pb-16 md:grid-cols-12 md:gap-6 md:pt-16 md:pb-24"
        >
          <div className="flex flex-col gap-6 md:col-span-5">
            <SectionHeading
              id={headingId}
              metaLabels={waitlistInvitesPageContent.metaLabels}
              heading={waitlistInvitesPageContent.heading}
              headingLevel="h1"
            />
          </div>
          <div className="relative self-start rounded-panel bg-surface p-6 md:col-span-6 md:col-start-7 md:p-[30px]">
            <WaitlistInvitesView />
          </div>
        </section>
      </main>
      <SiteFooter />
    </>
  )
}
