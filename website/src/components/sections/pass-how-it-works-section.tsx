import { passHowItWorksContent, passSectionIds } from '@/content/founding-pass'
import { buildRevealDelayStyle } from '@/lib/build-reveal-delay-style'
import { PassScheduleDates } from '../founding-pass/pass-schedule-panel'
import { ArrowIcon } from '../ui/arrow-icon'
import { SectionHeading } from '../ui/section-heading'

const headingId = `${passSectionIds.howItWorks}-heading`

function formatStepNumber(stepIndex: number): string {
  return String(stepIndex + 1).padStart(2, '0')
}

/** The Founding Pass in four steps (Part 4), its dates (D-050), and the way to the full help. */
export function PassHowItWorksSection() {
  return (
    <section
      id={passSectionIds.howItWorks}
      aria-labelledby={headingId}
      className="page-gutter page-container flex flex-col gap-10 py-16 md:py-24"
    >
      <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
        <SectionHeading
          id={headingId}
          metaLabels={passHowItWorksContent.metaLabels}
          heading={passHowItWorksContent.heading}
        />
        <a
          data-reveal
          href={passHowItWorksContent.helpPath}
          className="group inline-flex min-h-11 items-center gap-2 self-start text-label font-medium tracking-[0.08em] uppercase md:self-end"
        >
          {passHowItWorksContent.helpLabel}
          <ArrowIcon className="transition-transform duration-300 ease-standard group-hover:translate-x-[3px]" />
        </a>
      </div>
      <div className="flex flex-col gap-2.5">
        <ol className="grid grid-cols-1 gap-2.5 md:grid-cols-2 lg:grid-cols-4">
          {passHowItWorksContent.steps.map((step, stepIndex) => (
            <li
              key={step.title}
              data-reveal
              style={buildRevealDelayStyle(stepIndex)}
              className="flex flex-col gap-4 rounded-panel bg-surface p-6 md:p-[30px]"
            >
              <span className="font-mono text-sm text-ink-secondary-small">
                {formatStepNumber(stepIndex)} /{' '}
                {formatStepNumber(passHowItWorksContent.steps.length - 1)}
              </span>
              <h3 className="text-2xl leading-[1.1] tracking-[-0.01em]">{step.title}</h3>
              <p className="text-base leading-[1.45] text-ink-secondary-small">
                {step.description}
              </p>
            </li>
          ))}
        </ol>
        <div data-reveal>
          <PassScheduleDates />
        </div>
      </div>
    </section>
  )
}
