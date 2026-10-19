import type { Metadata } from 'next'
import { FaqSection } from '@/components/sections/faq-section'
import { FoundingPassSection } from '@/components/sections/founding-pass-section'
import { HeroSection } from '@/components/sections/hero-section'
import { HowItWorksSection } from '@/components/sections/how-it-works-section'
import { SiteFooter } from '@/components/sections/site-footer'
import { SiteHeader } from '@/components/sections/site-header'
import { UnderTheHoodSection } from '@/components/sections/under-the-hood-section'
import { WaitlistSection } from '@/components/sections/waitlist-section'
import { RevealObserver } from '@/components/ui/reveal-observer'
import { StructuredDataScript } from '@/components/ui/structured-data-script'
import { demoVideo } from '@/content/demo-video'
import { markdownPagePaths } from '@/content/site'
import { buildStructuredData } from '@/lib/build-structured-data'
import { hasPublicFile } from '@/lib/read-public-file'

// The layout's title, description and share cards stand; this adds the Markdown copy (D-061).
export const metadata: Metadata = {
  alternates: { canonical: '/', types: { 'text/markdown': markdownPagePaths.home } },
}

export default function HomePage() {
  const hasDemoVideo = hasPublicFile(demoVideo.filePath)
  return (
    <>
      <StructuredDataScript structuredData={buildStructuredData({ hasDemoVideo })} />
      <div id="top">
        <SiteHeader />
      </div>
      <main>
        <HeroSection hasDemoVideo={hasDemoVideo} />
        <FoundingPassSection />
        <HowItWorksSection />
        <WaitlistSection />
        <UnderTheHoodSection />
        <FaqSection />
      </main>
      <SiteFooter />
      <RevealObserver />
    </>
  )
}
