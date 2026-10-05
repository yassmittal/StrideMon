import { DemoSection } from '@/components/sections/demo-section'
import { FairPlaySection } from '@/components/sections/fair-play-section'
import { FaqSection } from '@/components/sections/faq-section'
import { HeroSection } from '@/components/sections/hero-section'
import { HowItWorksSection } from '@/components/sections/how-it-works-section'
import { OnChainSection } from '@/components/sections/on-chain-section'
import { RulesSection } from '@/components/sections/rules-section'
import { SiteFooter } from '@/components/sections/site-footer'
import { SiteHeader } from '@/components/sections/site-header'
import { WhyMonadSection } from '@/components/sections/why-monad-section'
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
        <HowItWorksSection />
        {hasDemoVideo ? <DemoSection /> : null}
        <RulesSection />
        <FairPlaySection />
        <OnChainSection />
        <WhyMonadSection />
        <FaqSection />
      </main>
      <SiteFooter />
      <RevealObserver />
    </>
  )
}
