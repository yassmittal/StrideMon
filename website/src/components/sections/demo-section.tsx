import { demoVideo } from '@/content/demo-video'
import { sectionIds } from '@/content/site'
import { hasPublicFile } from '@/lib/read-public-file'
import { DemoVideoPlayer } from '../ui/demo-video-player'
import { MetaLabel } from '../ui/meta-label'

const headingId = `${sectionIds.demo}-heading`

// Only rendered when the demo video exists in public/. Muted, `preload="none"`, and it plays only
// when the visitor presses play or a chapter.
export function DemoSection() {
  return (
    <section
      id={sectionIds.demo}
      aria-labelledby={headingId}
      className="page-gutter page-container grid gap-10 py-16 md:grid-cols-12 md:items-center md:gap-6 md:py-24"
    >
      <div data-reveal className="flex flex-col gap-5 md:col-span-5">
        <MetaLabel items={['Demo', 'Android']} />
        <h2 id={headingId} className="-ml-[0.04em] text-heading text-balance">
          {demoVideo.heading}
        </h2>
        <p className="max-w-[20em] text-lg leading-[1.4]">{demoVideo.description}</p>
      </div>
      <div data-reveal className="flex justify-center md:col-span-7 md:col-start-6 md:justify-end">
        <DemoVideoPlayer
          filePath={demoVideo.filePath}
          posterPath={hasPublicFile(demoVideo.posterPath) ? demoVideo.posterPath : undefined}
          widthPixels={demoVideo.widthPixels}
          heightPixels={demoVideo.heightPixels}
          chapters={demoVideo.chapters}
          chaptersLabel={demoVideo.chaptersLabel}
        />
      </div>
    </section>
  )
}
