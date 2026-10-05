import { heroContent } from '@/content/hero'
import { screenshots } from '@/content/screenshots'
import { sectionIds } from '@/content/site'
import { readSneakerArtForDrawing } from '@/lib/read-sneaker-art'
import { MetaLabel } from '../ui/meta-label'
import { PhoneFrame } from '../ui/phone-frame'
import { PillButton } from '../ui/pill-button'

type HeroSectionProps = {
  hasDemoVideo: boolean
}

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
          {hasDemoVideo ? (
            <PillButton href={`#${sectionIds.demo}`} label={heroContent.watchDemoLabel} />
          ) : null}
          <PillButton
            href={`#${sectionIds.onChain}`}
            label={heroContent.seeContractsLabel}
            variant={hasDemoVideo ? 'callToAction' : 'primary'}
          />
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
        <PhoneFrame
          screenshot={screenshots.home}
          sizes="(min-width: 1024px) 296px, 38vw"
          isPriority
          className="w-[38%] max-w-[296px] shrink-0 self-end"
        />
      </div>
    </section>
  )
}
