import { passQuestions, passQuestionsContent, passSectionIds } from '@/content/founding-pass'
import { ArrowIcon } from '../ui/arrow-icon'
import { SectionHeading } from '../ui/section-heading'
import { XLogoIcon } from '../ui/x-logo-icon'

const headingId = `${passSectionIds.questions}-heading`

/** The Founding Pass's short answers, and where to get help (Part 7 adds the full help page). */
export function PassQuestionsSection() {
  return (
    <section
      id={passSectionIds.questions}
      aria-labelledby={headingId}
      className="page-gutter page-container grid gap-10 py-16 md:grid-cols-12 md:gap-6 md:py-24"
    >
      <div className="flex flex-col gap-8 md:col-span-4">
        <SectionHeading
          id={headingId}
          metaLabels={passQuestionsContent.metaLabels}
          heading={passQuestionsContent.heading}
        />
        <div data-reveal className="flex flex-col gap-1 text-base leading-[1.4]">
          <p className="text-ink-secondary-small">{passQuestionsContent.helpPrompt}</p>
          <a
            href={`mailto:${passQuestionsContent.supportEmail}`}
            className="inline-flex min-h-11 items-center self-start font-mono text-sm break-all underline decoration-hairline underline-offset-4"
          >
            {passQuestionsContent.supportEmail}
          </a>
          <p className="text-ink-secondary-small">{passQuestionsContent.helpOr}</p>
          <a
            href={passQuestionsContent.xAccountUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="group inline-flex min-h-11 items-center gap-2 self-start font-mono text-sm"
          >
            <XLogoIcon />
            {passQuestionsContent.xAccountHandle}
            <ArrowIcon className="transition-transform duration-300 ease-standard group-hover:translate-x-[3px]" />
          </a>
        </div>
      </div>
      <div data-reveal className="border-t border-hairline md:col-span-7 md:col-start-6">
        {passQuestions.map((item) => (
          <details key={item.question} className="faq-item border-b border-hairline">
            <summary className="flex min-h-11 items-center justify-between gap-6 py-5 text-xl leading-[1.2] md:text-2xl">
              {item.question}
              <span
                aria-hidden="true"
                className="faq-plus flex size-9 shrink-0 items-center justify-center rounded-full bg-surface-muted"
              >
                <svg
                  aria-hidden="true"
                  className="size-3.5"
                  viewBox="0 0 14 14"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.5"
                >
                  <path d="M7 1v12M1 7h12" />
                </svg>
              </span>
            </summary>
            <p className="max-w-[29em] pb-6 text-lg leading-[1.4] text-ink-secondary-small">
              {item.answer}
            </p>
          </details>
        ))}
      </div>
    </section>
  )
}
