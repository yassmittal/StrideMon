import { demoVideo } from '@/content/demo-video'
import { heroContent } from '@/content/hero'
import { screenshots } from '@/content/screenshots'
import { sectionIds } from '@/content/site'
import { hasPublicFile } from '@/lib/read-public-file'
import { readSneakerArtForDrawing } from '@/lib/read-sneaker-art'
import { DemoVideoPlayer } from '../ui/demo-video-player'
import { MetaLabel } from '../ui/meta-label'
import { PhoneFrame } from '../ui/phone-frame'
import { PillButton } from '../ui/pill-button'

type HeroSectionProps = {
  hasDemoVideo: boolean
}

const phoneClassName = 'w-[38%] max-w-[296px] shrink-0 self-end'

// With the demo video in public/, it stands beside the Sneaker art in place of the Home screenshot
// (its poster is that same screen).
export function HeroSection({ hasDemoVideo }: HeroSectionProps) {
  const sneakerArtMarkup = readSneakerArtForDrawing()
  return (
    <section
      aria-labelledby="hero-heading"
      className="page-gutter page-container grid gap-10 pt-10 pb-16 md:pt-16 md:pb-24 lg:grid-cols-12 lg:items-end lg:gap-6"
    >
      <div className="flex flex-col gap-6 lg:col-span-6 lg:pb-4">
        <MetaLabel items={heroContent.metaLabels} />
        <h1 id="hero-heading" className="-ml-[0.05em] text-display">
          {heroContent.headlineWords.map((word) => (
            <span key={word} className="block">
              {word}
            </span>
          ))}
        </h1>
        <p className="max-w-[17em] text-intro">{heroContent.intro}</p>
        <div className="flex flex-wrap gap-2.5 pt-2">
          <PillButton href={`#${sectionIds.onChain}`} label={heroContent.seeContractsLabel} />
        </div>
      </div>

      <div className="flex items-stretch gap-2.5 lg:col-span-6 lg:justify-end">
        <figure className="relative flex min-w-0 flex-1 flex-col justify-center rounded-panel bg-dark-panel lg:max-w-[440px]">
          <div
            className="sneaker-art w-full"
            // biome-ignore lint/security/noDangerouslySetInnerHtml: our own on-chain SVG, read from public/ at build time.
            dangerouslySetInnerHTML={{ __html: sneakerArtMarkup }}
          />
          <figcaption className="px-5 pb-5 text-center text-label font-medium tracking-[0.08em] text-on-dark-secondary uppercase md:pb-6">
            {heroContent.sneakerArtCaption}
          </figcaption>
        </figure>
        {hasDemoVideo ? (
          <DemoVideoPlayer
            filePath={demoVideo.filePath}
            posterPath={hasPublicFile(demoVideo.posterPath) ? demoVideo.posterPath : undefined}
            widthPixels={demoVideo.widthPixels}
            heightPixels={demoVideo.heightPixels}
            label={demoVideo.label}
            className={phoneClassName}
          />
        ) : (
          <PhoneFrame
            screenshot={screenshots.home}
            sizes="(min-width: 1024px) 296px, 38vw"
            isPriority
            className={phoneClassName}
          />
        )}
      </div>
    </section>
  )
}
