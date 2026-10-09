import { passPageContent } from '@/content/founding-pass'
import { PassSchedulePanel } from '../founding-pass/pass-schedule-panel'
import { MetaLabel } from '../ui/meta-label'

/** `/pass`'s first screen: what the Founding Pass is, and what's next (D-050: kept short). */
export function PassHeroSection() {
  return (
    <section
      aria-labelledby="pass-hero-heading"
      className="page-gutter page-container grid gap-10 pt-10 pb-6 md:pt-16 lg:grid-cols-12 lg:items-end lg:gap-6"
    >
      <div className="flex flex-col gap-6 lg:col-span-6 lg:pb-4">
        <MetaLabel items={passPageContent.metaLabels} />
        <h1 id="pass-hero-heading" className="-ml-[0.05em] text-display">
          {passPageContent.headlineWords.map((word) => (
            <span key={word} className="block">
              {word}
            </span>
          ))}
        </h1>
        <p className="max-w-[20em] text-intro">{passPageContent.intro}</p>
      </div>
      <div className="lg:col-span-6">
        <PassSchedulePanel />
      </div>
    </section>
  )
}
