import type { Metadata } from 'next'
import { FoundingPassSection } from '@/components/sections/founding-pass-section'
import { HowItWorksSection } from '@/components/sections/how-it-works-section'
import { SiteFooter } from '@/components/sections/site-footer'
import { SiteHeader } from '@/components/sections/site-header'
import { WaitlistSection } from '@/components/sections/waitlist-section'
import { RevealObserver } from '@/components/ui/reveal-observer'
import { sectionIds, waitlistPagePath } from '@/content/site'
import { waitlistPageContent } from '@/content/waitlist'
import { buildPageMetadata } from '@/lib/build-page-metadata'

export const metadata: Metadata = buildPageMetadata({
  title: waitlistPageContent.title,
  description: waitlistPageContent.description,
  path: waitlistPagePath,
  hasOwnShareImage: true,
})

/**
 * The link a joined visitor posts on X (D-055): the waitlist first, so a friend can join at once,
 * then what they'd be joining for.
 */
export default function WaitlistPage() {
  return (
    <>
      <SiteHeader waitlistHref={`#${sectionIds.waitlist}`} />
      <main>
        <WaitlistSection isPageHeading />
        <FoundingPassSection />
        <HowItWorksSection />
      </main>
      <SiteFooter />
      <RevealObserver />
    </>
  )
}
