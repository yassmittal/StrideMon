import { howItWorksContent, howItWorksSteps } from '@/content/how-it-works'
import { sectionIds } from '@/content/site'
import { buildRevealDelayStyle } from '@/lib/build-reveal-delay-style'
import { InViewLoopVideo } from '../ui/in-view-loop-video'
import { PhoneFrame } from '../ui/phone-frame'
import { SectionHeading } from '../ui/section-heading'

const headingId = `${sectionIds.howItWorks}-heading`

function formatStepNumber(stepIndex: number): string {
  return String(stepIndex + 1).padStart(2, '0')
}

/** The game's loop as a compact grid of six cards, one phone each (D-050). */
export function HowItWorksSection() {
  return (
    <section
      id={sectionIds.howItWorks}
      aria-labelledby={headingId}
      className="page-gutter page-container py-16 md:py-24"
    >
      <div className="flex flex-col gap-8 md:flex-row md:items-end md:justify-between">
        <SectionHeading
          id={headingId}
          metaLabels={howItWorksContent.metaLabels}
          heading={howItWorksContent.heading}
        />
        <p
          data-reveal
          className="font-mono text-sm text-ink-secondary-small md:max-w-[19em] md:text-right"
        >
          {howItWorksContent.loopLabels.join(' → ')}
        </p>
      </div>

      <ol className="mt-10 grid grid-cols-2 gap-2.5 md:mt-14 lg:grid-cols-3">
        {howItWorksSteps.map((step, stepIndex) => {
          const hasSeveralScreenshots = step.screenshots.length > 1
          const sizes = hasSeveralScreenshots
            ? '(min-width: 1024px) 150px, 21vw'
            : '(min-width: 1024px) 200px, 28vw'
          const frameClassName = hasSeveralScreenshots
            ? 'w-[46%] max-w-[150px]'
            : 'w-[62%] max-w-[200px]'
          return (
            <li
              key={step.title}
              data-reveal
              style={buildRevealDelayStyle(stepIndex % 3)}
              className="flex flex-col justify-between gap-6 overflow-hidden rounded-panel bg-surface px-4 pt-5 md:px-6 md:pt-6"
            >
              <div className="flex flex-col gap-2.5 md:gap-3">
                <span className="font-mono text-xs text-ink-secondary-small md:text-sm">
                  {formatStepNumber(stepIndex)} / {formatStepNumber(howItWorksSteps.length - 1)}
                </span>
                <h3 className="text-[clamp(1.375rem,3vw,2.25rem)] leading-[1] tracking-[-0.01em]">
                  {step.title}
                </h3>
                <p className="max-w-[22em] text-sm leading-[1.4] text-ink-secondary-small md:text-base">
                  {step.description}
                </p>
              </div>
              {/* The phones sit on the card's bottom edge, their lower part cut off. */}
              <div className="-mb-[18%] flex justify-center gap-2">
                {step.screenshots.map((screenshot) =>
                  step.loopVideoPath ? (
                    <InViewLoopVideo
                      key={screenshot.fileName}
                      videoPath={step.loopVideoPath}
                      className={frameClassName}
                    >
                      <PhoneFrame screenshot={screenshot} sizes={sizes} />
                    </InViewLoopVideo>
                  ) : (
                    <PhoneFrame
                      key={screenshot.fileName}
                      screenshot={screenshot}
                      sizes={sizes}
                      className={frameClassName}
                    />
                  ),
                )}
              </div>
            </li>
          )
        })}
      </ol>
    </section>
  )
}
