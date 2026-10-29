import type { CSSProperties } from 'react'
import { demoVideo, demoVideoChapters } from '@/content/demo-video'
import { heroContent } from '@/content/hero'
import { screenshots } from '@/content/screenshots'
import { appInstallPageUrl, passGalleryPath } from '@/content/site'
import { hasPublicFile } from '@/lib/read-public-file'
import { readSneakerArtForDrawing } from '@/lib/read-sneaker-art'
import { DemoVideoPlayer } from '../ui/demo-video-player'
import { HoverTip } from '../ui/hover-tip'
import { PhoneFrame } from '../ui/phone-frame'
import { PillButton } from '../ui/pill-button'

type HeroSectionProps = {
  hasDemoVideo: boolean
}

const phoneClassName = 'w-[38%] max-w-[296px] shrink-0 self-end'
const getAppTooltipId = 'hero-get-app-tip'

function buildHeroDelayStyle(delayMilliseconds: number): CSSProperties {
  return { '--hero-delay': `${delayMilliseconds}ms` } as CSSProperties
}

// The buttons are what a visitor can do (D-050): get a pass, or try the app, whose install note is a
// tooltip (D-073). With the demo video in public/, it stands beside the Sneaker art in place of the
// Home screenshot (its poster is that same screen).
export function HeroSection({ hasDemoVideo }: HeroSectionProps) {
  const sneakerArtMarkup = readSneakerArtForDrawing()
  return (
    <section
      aria-labelledby="hero-heading"
      className="page-gutter page-container grid gap-10 pt-10 pb-16 md:pt-16 md:pb-24 lg:grid-cols-12 lg:items-end lg:gap-6"
    >
      <div className="flex flex-col gap-6 lg:col-span-6 lg:pb-4">
        <h1 id="hero-heading" className="-ml-[0.05em] text-display">
          {/* Each word rises from its own mask on the first view (D-072). */}
          {heroContent.headlineWords.map((word, wordIndex) => (
            <span key={word} className="hero-word-mask">
              <span className="hero-word" style={buildHeroDelayStyle(wordIndex * 90)}>
                {/* The trailing space keeps the words apart in the text crawlers and screen readers get. */}
                {word}{' '}
              </span>
            </span>
          ))}
        </h1>
        <p className="hero-enter max-w-[17em] text-intro" style={buildHeroDelayStyle(350)}>
          {heroContent.intro}
        </p>
        <div className="hero-enter flex flex-wrap gap-2.5 pt-2" style={buildHeroDelayStyle(450)}>
          <PillButton href={passGalleryPath} label={heroContent.getPassLabel} />
          <HoverTip id={getAppTooltipId} text={heroContent.getAppTooltip}>
            <PillButton
              href={appInstallPageUrl}
              label={heroContent.getAppLabel}
              variant="secondary"
              isExternal
              describedById={getAppTooltipId}
            />
          </HoverTip>
        </div>
      </div>

      <div
        className="hero-enter flex items-stretch gap-2.5 lg:col-span-6 lg:justify-end"
        style={buildHeroDelayStyle(250)}
      >
        <div className="relative flex min-w-0 flex-1 flex-col justify-center rounded-panel bg-dark-panel lg:max-w-[440px]">
          <div
            role="img"
            aria-label={heroContent.sneakerArtLabel}
            className="sneaker-art w-full"
            // biome-ignore lint/security/noDangerouslySetInnerHtml: our own on-chain SVG, read from public/ at build time.
            dangerouslySetInnerHTML={{ __html: sneakerArtMarkup }}
          />
        </div>
        {hasDemoVideo ? (
          <DemoVideoPlayer
            filePath={demoVideo.filePath}
            posterPath={hasPublicFile(demoVideo.posterPath) ? demoVideo.posterPath : undefined}
            widthPixels={demoVideo.widthPixels}
            heightPixels={demoVideo.heightPixels}
            durationSeconds={demoVideo.durationSeconds}
            chapters={demoVideoChapters}
            label={demoVideo.label}
            playLabel={demoVideo.playLabel}
            replayLabel={demoVideo.replayLabel}
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
