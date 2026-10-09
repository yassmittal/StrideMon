import { faqContent, frequentlyAskedQuestions } from '@/content/faq'
import { sectionIds } from '@/content/site'
import { ArrowIcon } from '../ui/arrow-icon'
import { SectionHeading } from '../ui/section-heading'

const headingId = `${sectionIds.faq}-heading`

export function FaqSection() {
  return (
    <section
      id={sectionIds.faq}
      aria-labelledby={headingId}
      className="page-gutter page-container grid gap-10 py-16 md:grid-cols-12 md:gap-6 md:py-24"
    >
      <div className="flex flex-col gap-8 md:col-span-4">
        <SectionHeading
          id={headingId}
          metaLabels={faqContent.metaLabels}
          heading={faqContent.heading}
        />
        <a
          data-reveal
          href={faqContent.helpPath}
          className="group inline-flex min-h-11 items-center gap-2 self-start text-label font-medium tracking-[0.08em] uppercase"
        >
          {faqContent.helpLabel}
          <ArrowIcon className="transition-transform duration-300 ease-standard group-hover:translate-x-[3px]" />
        </a>
      </div>
      <div data-reveal className="border-t border-hairline md:col-span-7 md:col-start-6">
        {frequentlyAskedQuestions.map((item) => (
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
