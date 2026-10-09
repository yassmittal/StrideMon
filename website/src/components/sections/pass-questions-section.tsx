import {
  PASS_QUESTIONS_SHOWN_FIRST,
  type PassQuestion,
  passPromiseLine,
  passQuestions,
  passQuestionsContent,
  passSectionIds,
} from '@/content/founding-pass'
import { ArrowIcon } from '../ui/arrow-icon'
import { SectionHeading } from '../ui/section-heading'
import { XLogoIcon } from '../ui/x-logo-icon'

const headingId = `${passSectionIds.questions}-heading`

/**
 * The Founding Pass's short answers, and where to get help: the full help page (D-047) or us. Six
 * show; the rest open with "More questions" (D-050).
 */
export function PassQuestionsSection() {
  const firstQuestions = passQuestions.slice(0, PASS_QUESTIONS_SHOWN_FIRST)
  const moreQuestions = passQuestions.slice(PASS_QUESTIONS_SHOWN_FIRST)
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
        <p
          data-reveal
          className="max-w-[26em] text-label font-medium tracking-[0.08em] text-ink-secondary-small uppercase"
        >
          {passPromiseLine}
        </p>
        <div data-reveal className="flex flex-col gap-1 text-base leading-[1.4]">
          <a
            href={passQuestionsContent.helpPath}
            className="group mb-3 inline-flex min-h-11 items-center gap-2 self-start text-label font-medium tracking-[0.08em] uppercase"
          >
            {passQuestionsContent.helpLabel}
            <ArrowIcon className="transition-transform duration-300 ease-standard group-hover:translate-x-[3px]" />
          </a>
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
        {firstQuestions.map((item) => (
          <QuestionItem key={item.question} item={item} />
        ))}
        {moreQuestions.length > 0 ? (
          <details className="pass-more-questions">
            <summary className="inline-flex min-h-11 items-center gap-2 pt-5 text-label font-medium tracking-[0.08em] uppercase transition-opacity duration-300 ease-standard hover:opacity-60">
              {passQuestionsContent.moreQuestionsLabel(moreQuestions.length)}
              <PlusIcon className="pass-more-questions-icon size-3" />
            </summary>
            <div className="mt-3 border-t border-hairline">
              {moreQuestions.map((item) => (
                <QuestionItem key={item.question} item={item} />
              ))}
            </div>
          </details>
        ) : null}
      </div>
    </section>
  )
}

function QuestionItem({ item }: { item: PassQuestion }) {
  return (
    <details className="faq-item border-b border-hairline">
      <summary className="flex min-h-11 items-center justify-between gap-6 py-5 text-xl leading-[1.2] md:text-2xl">
        {item.question}
        <span
          aria-hidden="true"
          className="faq-plus flex size-9 shrink-0 items-center justify-center rounded-full bg-surface-muted"
        >
          <PlusIcon className="size-3.5" />
        </span>
      </summary>
      <p className="max-w-[29em] pb-6 text-lg leading-[1.4] text-ink-secondary-small">
        {item.answer}
      </p>
    </details>
  )
}

function PlusIcon({ className }: { className: string }) {
  return (
    <svg
      aria-hidden="true"
      className={className}
      viewBox="0 0 14 14"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
    >
      <path d="M7 1v12M1 7h12" />
    </svg>
  )
}
