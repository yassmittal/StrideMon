import { fairPlayColumns, fairPlayContent } from '@/content/fair-play'
import { sectionIds } from '@/content/site'
import { buildRevealDelayStyle } from '@/lib/build-reveal-delay-style'
import { SectionHeading } from '../ui/section-heading'

const headingId = `${sectionIds.fairPlay}-heading`

export function FairPlaySection() {
  return (
    <section
      id={sectionIds.fairPlay}
      aria-labelledby={headingId}
      className="page-gutter page-container py-16 md:py-24"
    >
      <SectionHeading
        id={headingId}
        metaLabels={fairPlayContent.metaLabels}
        heading={fairPlayContent.heading}
      />
      <div className="mt-12 grid gap-2.5 md:mt-16 md:grid-cols-2">
        {fairPlayColumns.map((column, columnIndex) => (
          <article
            key={column.label}
            data-reveal
            style={buildRevealDelayStyle(columnIndex)}
            className="flex flex-col gap-6 rounded-panel bg-surface p-6 md:p-[30px]"
          >
            <p className="text-label font-medium tracking-[0.08em] text-ink-secondary-small uppercase">
              {column.label}
            </p>
            <h3 className="text-[clamp(1.625rem,3vw,2.5rem)] leading-[1.05] tracking-[-0.01em]">
              {column.heading}
            </h3>
            <ul className="flex flex-col">
              {column.points.map((point) => (
                <li
                  key={point}
                  className="flex gap-4 border-t border-hairline py-4 text-base leading-[1.4] md:text-lg"
                >
                  <span
                    aria-hidden="true"
                    className="pt-[0.2em] font-mono text-sm text-ink-secondary-small"
                  >
                    +
                  </span>
                  <span>{point}</span>
                </li>
              ))}
            </ul>
          </article>
        ))}
      </div>
    </section>
  )
}
