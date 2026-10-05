import { sectionIds } from '@/content/site'
import { whyMonadContent, whyMonadPoints } from '@/content/why-monad'
import { buildRevealDelayStyle } from '@/lib/build-reveal-delay-style'
import { SectionHeading } from '../ui/section-heading'

const headingId = `${sectionIds.whyMonad}-heading`

export function WhyMonadSection() {
  return (
    <section
      id={sectionIds.whyMonad}
      aria-labelledby={headingId}
      className="page-gutter page-container py-16 md:py-24"
    >
      <SectionHeading
        id={headingId}
        metaLabels={whyMonadContent.metaLabels}
        heading={whyMonadContent.heading}
      />
      <ol className="mt-12 grid gap-2.5 md:mt-16 md:grid-cols-3">
        {whyMonadPoints.map((point, pointIndex) => (
          <li
            key={point.title}
            data-reveal
            style={buildRevealDelayStyle(pointIndex)}
            className="flex flex-col gap-10 rounded-panel bg-dark-panel p-6 text-on-dark md:p-[30px]"
          >
            <span className="font-mono text-sm text-lime">
              {String(pointIndex + 1).padStart(2, '0')}
            </span>
            <div className="flex flex-col gap-3">
              <h3 className="text-[1.625rem] leading-[1.1]">{point.title}</h3>
              <p className="leading-[1.4] text-on-dark-secondary">{point.description}</p>
            </div>
          </li>
        ))}
      </ol>
    </section>
  )
}
