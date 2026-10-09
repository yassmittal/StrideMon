import { FaqSection } from '@/components/sections/faq-section'
import { FoundingPassSection } from '@/components/sections/founding-pass-section'
import { HeroSection } from '@/components/sections/hero-section'
import { HowItWorksSection } from '@/components/sections/how-it-works-section'
import { SiteFooter } from '@/components/sections/site-footer'
import { SiteHeader } from '@/components/sections/site-header'
import { UnderTheHoodSection } from '@/components/sections/under-the-hood-section'
import { WaitlistSection } from '@/components/sections/waitlist-section'
import { RevealObserver } from '@/components/ui/reveal-observer'
import { demoVideo } from '@/content/demo-video'
import { buildStructuredData, serializeStructuredData } from '@/lib/build-structured-data'
import { hasPublicFile } from '@/lib/read-public-file'

export default function HomePage() {
  const hasDemoVideo = hasPublicFile(demoVideo.filePath)
  return (
    <>
      <script
        type="application/ld+json"
        // biome-ignore lint/security/noDangerouslySetInnerHtml: JSON-LD from our own content, with `<` escaped.
        dangerouslySetInnerHTML={{
          __html: serializeStructuredData(buildStructuredData({ hasDemoVideo })),
        }}
      />
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
