import { howItWorksContent, howItWorksSteps } from '@/content/how-it-works'
import { sectionIds } from '@/content/site'
import { InViewLoopVideo } from '../ui/in-view-loop-video'
import { PhoneFrame } from '../ui/phone-frame'
import { SectionHeading } from '../ui/section-heading'

const headingId = `${sectionIds.howItWorks}-heading`

function formatStepNumber(stepIndex: number): string {
  return String(stepIndex + 1).padStart(2, '0')
}

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

      <ol className="mt-12 md:mt-16">
        {howItWorksSteps.map((step, stepIndex) => (
          <li
            key={step.title}
            className="grid gap-8 border-t border-hairline py-10 md:grid-cols-12 md:gap-6 md:py-14"
          >
            <div
              data-reveal
              className="flex flex-col gap-4 md:col-span-5 md:col-start-1 md:self-center"
            >
              <span className="font-mono text-sm text-ink-secondary-small">
                {formatStepNumber(stepIndex)} / {formatStepNumber(howItWorksSteps.length - 1)}
              </span>
              <h3 className="text-[clamp(2rem,5vw,3.5rem)] leading-[1] tracking-[-0.01em]">
                {step.title}
              </h3>
              <p className="max-w-[20em] text-lg leading-[1.4]">{step.description}</p>
            </div>
            <div
              data-reveal
              className="flex justify-center gap-3 md:col-span-6 md:col-start-7 md:justify-end"
            >
              {step.screenshots.map((screenshot) => {
                const hasSeveralScreenshots = step.screenshots.length > 1
                const sizes = hasSeveralScreenshots
                  ? '(min-width: 768px) 260px, 42vw'
                  : '(min-width: 768px) 277px, 56vw'
                const frameClassName = hasSeveralScreenshots
                  ? 'w-[44%] max-w-[260px]'
                  : 'w-[56%] max-w-[277px]'
                if (step.loopVideoPath) {
                  return (
                    <InViewLoopVideo
                      key={screenshot.fileName}
                      videoPath={step.loopVideoPath}
                      className={frameClassName}
                    >
                      <PhoneFrame screenshot={screenshot} sizes={sizes} />
                    </InViewLoopVideo>
                  )
                }
                return (
                  <PhoneFrame
                    key={screenshot.fileName}
                    screenshot={screenshot}
                    sizes={sizes}
                    className={frameClassName}
                  />
                )
              })}
            </div>
          </li>
        ))}
      </ol>
    </section>
  )
}
