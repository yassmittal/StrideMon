import { type WhyMonadPoint, whyMonadContent, whyMonadPoints } from '@/content/why-monad'
import { buildRevealDelayStyle } from '@/lib/build-reveal-delay-style'
import { SectionHeading } from '../ui/section-heading'

const headingId = `${whyMonadContent.id}-heading`

/** Why Monad, always shown (D-073): three points, a title and one line each. */
export function WhyMonadSection() {
  return (
    <section id={whyMonadContent.id} aria-labelledby={headingId} className="bg-dark text-on-dark">
      <div className="page-gutter page-container flex flex-col gap-10 py-16 md:gap-14 md:py-24">
        <SectionHeading id={headingId} heading={whyMonadContent.heading} />
        <ul className="grid gap-2.5 md:grid-cols-3">
          {whyMonadPoints.map((point, pointIndex) => (
            <li
              key={point.title}
              data-reveal
              style={buildRevealDelayStyle(pointIndex)}
              className="flex flex-col gap-10 rounded-panel bg-dark-panel p-6 md:gap-16 md:p-[30px]"
            >
              <span className="flex size-12 items-center justify-center rounded-full bg-lime text-ink">
                <WhyMonadIcon icon={point.icon} />
              </span>
              <div className="flex flex-col gap-3">
                <h3 className="text-[clamp(1.625rem,2.6vw,2.25rem)] leading-[1.05] tracking-[-0.01em]">
                  {point.title}
                </h3>
                <p className="max-w-[22em] leading-[1.4] text-on-dark-secondary">
                  {point.description}
                </p>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </section>
  )
}

const iconPaths: Record<WhyMonadPoint['icon'], string> = {
  fast: 'M13 2.5 4.5 13.5H11l-1 8 8.5-11H12l1-8Z',
  cheap: 'M12 3.5s6 6.4 6 10.75a6 6 0 0 1-12 0C6 9.9 12 3.5 12 3.5Z',
  wallet:
    'M4 7.5h14.5a1.5 1.5 0 0 1 1.5 1.5v8.5a1.5 1.5 0 0 1-1.5 1.5H5.5A1.5 1.5 0 0 1 4 17.5v-10Zm0 0 1.5-3h11v3M16 13.25h.01',
}

function WhyMonadIcon({ icon }: { icon: WhyMonadPoint['icon'] }) {
  return (
    <svg
      aria-hidden="true"
      className="size-6"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d={iconPaths[icon]} />
    </svg>
  )
}
