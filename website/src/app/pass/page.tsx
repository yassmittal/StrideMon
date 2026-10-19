import type { Metadata } from 'next'
import { GetReadySection } from '@/components/founding-pass/get-ready-section'
import { PassGallery } from '@/components/founding-pass/pass-gallery'
import { PassMintRoot } from '@/components/founding-pass/pass-mint-root'
import { HelpChatLauncher } from '@/components/help-chat/help-chat-launcher'
import { PassHeroSection } from '@/components/sections/pass-hero-section'
import { PassHowItWorksSection } from '@/components/sections/pass-how-it-works-section'
import { PassQuestionsSection } from '@/components/sections/pass-questions-section'
import { SiteFooter } from '@/components/sections/site-footer'
import { SiteHeader } from '@/components/sections/site-header'
import { WaitlistSection } from '@/components/sections/waitlist-section'
import { RevealObserver } from '@/components/ui/reveal-observer'
import { StructuredDataScript } from '@/components/ui/structured-data-script'
import { passPageContent } from '@/content/founding-pass'
import { markdownPagePaths, passGalleryPath, sectionIds } from '@/content/site'
import { buildPageMetadata } from '@/lib/build-page-metadata'
import { buildPassGalleryStructuredData } from '@/lib/build-structured-data'

export const metadata: Metadata = buildPageMetadata({
  title: passPageContent.title,
  description: passPageContent.description,
  path: passGalleryPath,
  hasOwnShareImage: true,
  markdownPath: markdownPagePaths.pass,
})

/** The Founding Pass gallery (Part 4, D-044), its mint (Part 5, D-045) and the help chatbot (D-048). */
export default function PassGalleryPage() {
  return (
    <>
      <StructuredDataScript structuredData={buildPassGalleryStructuredData()} />
      <SiteHeader waitlistHref={`#${sectionIds.waitlist}`} />
      <main>
        <PassHeroSection />
        <GetReadySection />
        <PassGallery />
        <PassHowItWorksSection />
        <WaitlistSection />
        <PassQuestionsSection />
      </main>
      <SiteFooter />
      <PassMintRoot />
      <HelpChatLauncher />
      <RevealObserver />
    </>
  )
}
