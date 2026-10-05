import { gameRules, rulesContent, starterSneakerStats } from '@/content/game-rules'
import { sectionIds } from '@/content/site'
import { buildRevealDelayStyle } from '@/lib/build-reveal-delay-style'
import { CountUp } from '../ui/count-up'
import { CrossMarks } from '../ui/cross-marks'
import { SectionHeading } from '../ui/section-heading'

const headingId = `${sectionIds.rules}-heading`

// The whole section flips to black, like Lusion's dark bands.
export function RulesSection() {
  return (
    <section
      id={sectionIds.rules}
      aria-labelledby={headingId}
      className="relative bg-dark text-on-dark"
    >
      <CrossMarks tone="dark" />
      <div className="page-gutter page-container py-16 md:py-24">
        <SectionHeading
          id={headingId}
          metaLabels={rulesContent.metaLabels}
          heading={rulesContent.heading}
          tone="dark"
        />

        <dl className="mt-12 grid border-t border-hairline-on-dark md:mt-16 md:grid-cols-2 lg:grid-cols-3">
          {gameRules.map((rule, ruleIndex) => (
            <div
              key={rule.label}
              data-reveal
              style={buildRevealDelayStyle(ruleIndex % 3)}
              className="flex flex-col gap-3 border-b border-hairline-on-dark py-8 md:pr-8"
            >
              <dt className="text-label font-medium tracking-[0.08em] text-on-dark-secondary uppercase">
                {rule.label}
              </dt>
              <dd className="flex flex-col gap-3">
                <span className="flex items-baseline gap-3 font-mono">
                  <span className="text-[clamp(3rem,9vw,4.5rem)] leading-[0.9] tracking-[-0.02em]">
                    <CountUp value={rule.value} fractionDigits={rule.fractionDigits} />
                  </span>
                  <span className="text-sm text-on-dark-secondary">{rule.unit}</span>
                </span>
                <span className="max-w-[19em] leading-[1.4]">{rule.explanation}</span>
              </dd>
            </div>
          ))}

          <div
            data-reveal
            className="flex flex-col gap-4 border-b border-hairline-on-dark py-8 md:pr-8"
          >
            <dt className="text-label font-medium tracking-[0.08em] text-on-dark-secondary uppercase">
              {rulesContent.starterSneakerLabel}
            </dt>
            <dd className="grid grid-cols-2 gap-2.5">
              {starterSneakerStats.map((stat) => (
                <span
                  key={stat.label}
                  className="flex flex-col gap-1 rounded-panel bg-dark-panel p-4"
                >
                  <span className="font-mono text-3xl leading-none text-lime">{stat.value}</span>
                  <span className="text-label font-medium tracking-[0.08em] text-on-dark-secondary uppercase">
                    {stat.label}
                  </span>
                </span>
              ))}
            </dd>
          </div>
        </dl>

        <div data-reveal className="mt-10 flex items-center gap-3">
          <span aria-hidden="true" className="size-2 rounded-full bg-lime" />
          <p className="text-label font-medium tracking-[0.08em] uppercase">
            {rulesContent.footnote}
          </p>
        </div>
      </div>
    </section>
  )
}
