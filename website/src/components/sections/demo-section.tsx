import { demoVideo, screenshotHeightPixels, screenshotWidthPixels } from '@/content/screenshots'
import { sectionIds } from '@/content/site'
import { hasPublicFile } from '@/lib/read-public-file'
import { MetaLabel } from '../ui/meta-label'

const headingId = `${sectionIds.demo}-heading`

// Only rendered when public/screenshots/demo-walk.mp4 exists. Muted, `preload="none"`, and it
// plays only when the visitor presses play.
export function DemoSection() {
  const posterPath = `/screenshots/${demoVideo.posterFileName}`
  return (
    <section
      id={sectionIds.demo}
      aria-labelledby={headingId}
      className="page-gutter page-container grid gap-8 py-16 md:grid-cols-12 md:items-center md:gap-6 md:py-24"
    >
      <div data-reveal className="flex flex-col gap-5 md:col-span-5">
        <MetaLabel items={['Demo', 'Android']} />
        <h2 id={headingId} className="-ml-[0.04em] text-heading text-balance">
          {demoVideo.heading}
        </h2>
        <p className="max-w-[20em] text-lg leading-[1.4]">{demoVideo.description}</p>
      </div>
      <div data-reveal className="flex justify-center md:col-span-6 md:col-start-7 md:justify-end">
        <div className="w-[66%] max-w-[296px] rounded-[28px] bg-ink p-[5px]">
          <video
            className="block h-auto w-full rounded-[23px]"
            src={`/screenshots/${demoVideo.fileName}`}
            poster={hasPublicFile(posterPath) ? posterPath : undefined}
            width={screenshotWidthPixels}
            height={screenshotHeightPixels}
            preload="none"
            controls
            muted
            playsInline
          />
        </div>
      </div>
    </section>
  )
}
