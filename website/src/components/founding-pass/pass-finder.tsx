'use client'

import { type FormEvent, useEffect, useId, useRef, useState } from 'react'
import {
  type PassQuizOption,
  passFindContent,
  passQuizContent,
  passQuizQuestions,
} from '@/content/founding-pass'
import { passDesignTables } from '@/content/founding-pass-designs'
import {
  findRecentPassMint,
  listTakenDesignNumbers,
  readPassAvailability,
} from '@/lib/founding-pass/pass-collection'
import {
  parsePassNumberSearch,
  pickSurprisePassDesign,
  rankPassQuizMatches,
} from '@/lib/founding-pass/pass-gallery-view'
import { usePassCollection } from '@/lib/founding-pass/use-pass-collection'
import { ArrowIcon } from '../ui/arrow-icon'
import { buildPillClassName, PillContent } from '../ui/pill-button'
import { PassCard } from './pass-card'

type PassFinderProps = {
  onOpenDesign: (designNumber: number) => void
}

type PassFinderActionsProps = PassFinderProps & {
  isQuizOpen: boolean
  onToggleQuiz: () => void
}

const QUIZ_RESULTS_PAGE_SIZE = 6

type QuizAnswers = Partial<Record<(typeof passQuizQuestions)[number]['key'], PassQuizOption>>

/**
 * The ways to find a pass without scrolling 1,000 cards (brief §5.2), in the collection's toolbar
 * (D-050): go to a number, take the quiz, or be surprised. The quiz panel is `PassQuiz`.
 */
export function PassFinderActions({
  onOpenDesign,
  isQuizOpen,
  onToggleQuiz,
}: PassFinderActionsProps) {
  const [searchText, setSearchText] = useState('')
  const [message, setMessage] = useState<string | null>(null)
  const [isSearchInvalid, setIsSearchInvalid] = useState(false)
  const { collection } = usePassCollection()
  const inputId = useId()
  const messageId = `${inputId}-message`

  function searchPassNumber(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const designNumber = parsePassNumberSearch(searchText)
    if (designNumber === null) {
      setIsSearchInvalid(true)
      setMessage(passFindContent.searchInvalid)
      return
    }
    setIsSearchInvalid(false)
    setMessage(null)
    onOpenDesign(designNumber)
  }

  function openSurprisePass() {
    const surpriseDesign = pickSurprisePassDesign(listTakenDesignNumbers(collection))
    if (surpriseDesign === null) {
      setMessage(passFindContent.surpriseNoneLeft)
      return
    }
    setMessage(null)
    onOpenDesign(surpriseDesign.designNumber)
  }

  return (
    <div className="flex flex-col gap-2">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
        <form
          noValidate
          onSubmit={searchPassNumber}
          className="flex h-10 items-center rounded-full border border-hairline bg-surface pr-1 pl-4 transition-colors duration-300 ease-standard focus-within:border-ink has-aria-invalid:border-ink sm:w-[300px]"
        >
          <label htmlFor={inputId} className="sr-only">
            {passFindContent.searchLabel}
          </label>
          <SearchIcon />
          <input
            id={inputId}
            type="text"
            inputMode="numeric"
            autoComplete="off"
            spellCheck={false}
            placeholder={passFindContent.searchPlaceholder}
            value={searchText}
            onChange={(event) => {
              setSearchText(event.target.value)
              if (isSearchInvalid) {
                setIsSearchInvalid(false)
                setMessage(null)
              }
            }}
            aria-invalid={isSearchInvalid}
            aria-describedby={messageId}
            className="h-full min-w-0 flex-1 bg-transparent px-2.5 text-sm outline-none placeholder:text-ink-secondary"
          />
          <button
            type="submit"
            aria-label={passFindContent.searchSubmitLabel}
            className="flex size-8 shrink-0 items-center justify-center rounded-full bg-primary text-on-dark transition-colors duration-300 ease-standard hover:bg-ink active:bg-ink"
          >
            <ArrowIcon className="size-3.5" />
          </button>
        </form>
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            aria-expanded={isQuizOpen}
            aria-controls={isQuizOpen ? PASS_QUIZ_PANEL_ID : undefined}
            title={passFindContent.quizHint}
            onClick={onToggleQuiz}
            className={`inline-flex h-10 items-center gap-2 rounded-full px-4 text-xs leading-[1.15] font-medium uppercase transition-colors duration-300 ease-standard ${
              isQuizOpen
                ? 'bg-ink text-on-dark'
                : 'bg-primary text-on-dark hover:bg-ink active:bg-ink'
            }`}
          >
            <SparkIcon />
            {passFindContent.quizLabel}
          </button>
          <button
            type="button"
            title={passFindContent.surpriseHint}
            onClick={openSurprisePass}
            className="inline-flex h-10 items-center gap-2 rounded-full bg-surface-muted px-4 text-xs leading-[1.15] font-medium uppercase transition-colors duration-300 ease-standard hover:bg-surface active:bg-surface"
          >
            <ShuffleIcon />
            {passFindContent.surpriseLabel}
          </button>
        </div>
      </div>
      <p id={messageId} aria-live="polite" className="text-sm leading-[1.4] empty:hidden">
        {message}
      </p>
    </div>
  )
}

/** The quiz panel's id, for its button's `aria-controls`. */
export const PASS_QUIZ_PANEL_ID = 'pass-quiz'

function SearchIcon() {
  return (
    <svg
      aria-hidden="true"
      className="size-4 shrink-0 text-ink-secondary-small"
      viewBox="0 0 18 18"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
    >
      <circle cx="8" cy="8" r="5" />
      <path d="m12 12 3.5 3.5" />
    </svg>
  )
}

function SparkIcon() {
  return (
    <svg
      aria-hidden="true"
      className="size-4 shrink-0"
      viewBox="0 0 18 18"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinejoin="round"
    >
      <path d="M9 2.5c.6 3.4 2.6 5.4 6 6-3.4.6-5.4 2.6-6 6-.6-3.4-2.6-5.4-6-6 3.4-.6 5.4-2.6 6-6Z" />
    </svg>
  )
}

function ShuffleIcon() {
  return (
    <svg
      aria-hidden="true"
      className="size-4 shrink-0"
      viewBox="0 0 18 18"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M2.5 5.5h3c3 0 4 7 7 7h3M13 10l2.5 2.5L13 15M2.5 12.5h3c1.2 0 2-1 2.6-2.2M10.4 7.7c.6-1.2 1.4-2.2 2.6-2.2h2.5M13 3l2.5 2.5L13 8" />
    </svg>
  )
}

export function PassQuiz({
  onOpenDesign,
  onClose,
}: PassFinderProps & {
  onClose: () => void
}) {
  const [answers, setAnswers] = useState<QuizAnswers>({})
  const [shownResultCount, setShownResultCount] = useState(QUIZ_RESULTS_PAGE_SIZE)
  const { collection } = usePassCollection()
  const panelRef = useRef<HTMLDivElement>(null)
  const questionIndex = passQuizQuestions.findIndex(
    (question) => answers[question.key] === undefined,
  )
  const currentQuestion = passQuizQuestions[questionIndex]

  // Opened from the toolbar: move there, so the first question is in view and read out.
  useEffect(() => {
    panelRef.current?.focus({ preventScroll: true })
    panelRef.current?.scrollIntoView({ behavior: 'smooth', block: 'nearest' })
  }, [])

  function answerQuestion(option: PassQuizOption) {
    if (currentQuestion === undefined) return
    setAnswers({ ...answers, [currentQuestion.key]: option })
    setShownResultCount(QUIZ_RESULTS_PAGE_SIZE)
    panelRef.current?.focus()
  }

  function goBack() {
    const previousQuestion = passQuizQuestions[questionIndex - 1]
    if (previousQuestion === undefined) return
    const { [previousQuestion.key]: _removedAnswer, ...keptAnswers } = answers
    setAnswers(keptAnswers)
  }

  function startOver() {
    setAnswers({})
    setShownResultCount(QUIZ_RESULTS_PAGE_SIZE)
    panelRef.current?.focus()
  }

  return (
    <div
      ref={panelRef}
      id={PASS_QUIZ_PANEL_ID}
      tabIndex={-1}
      aria-live="polite"
      className="quiz-panel relative flex flex-col gap-6 rounded-panel bg-dark p-5 text-on-dark outline-none md:p-[30px]"
    >
      <div className="flex items-start justify-between gap-4">
        <p className="text-label font-medium tracking-[0.08em] text-on-dark-secondary uppercase">
          {currentQuestion === undefined
            ? passQuizContent.resultsHeading
            : `${passQuizContent.stepLabel} ${questionIndex + 1} / ${passQuizQuestions.length}`}
        </p>
        <button
          type="button"
          onClick={onClose}
          aria-label={passQuizContent.closeLabel}
          className="-mt-2.5 -mr-2.5 flex size-11 shrink-0 items-center justify-center rounded-full transition-colors duration-300 ease-standard hover:bg-dark-track active:bg-dark-track"
        >
          <svg
            aria-hidden="true"
            className="size-4"
            viewBox="0 0 18 18"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
          >
            <path d="M4 4l10 10M14 4 4 14" />
          </svg>
        </button>
      </div>

      {currentQuestion === undefined ? (
        <QuizResults
          answers={answers}
          shownResultCount={shownResultCount}
          onShowMore={() => setShownResultCount(shownResultCount + QUIZ_RESULTS_PAGE_SIZE)}
          onStartOver={startOver}
          onOpenDesign={onOpenDesign}
          collection={collection}
        />
      ) : (
        <>
          <h3 className="text-[clamp(1.75rem,4vw,2.75rem)] leading-[1.05] tracking-[-0.01em]">
            {currentQuestion.question}
          </h3>
          <ul className="flex flex-wrap gap-2">
            {currentQuestion.options.map((option) => (
              <li key={option.key}>
                <button
                  type="button"
                  onClick={() => answerQuestion(option)}
                  className="inline-flex min-h-[45px] items-center gap-2.5 rounded-full bg-dark-track px-5 py-2 text-sm leading-[1.15] font-medium uppercase transition-colors duration-300 ease-standard hover:bg-on-dark hover:text-ink active:bg-on-dark active:text-ink"
                >
                  {currentQuestion.key === 'color' ? <ColorSwatches option={option} /> : null}
                  {option.label}
                </button>
              </li>
            ))}
          </ul>
          {questionIndex > 0 ? (
            <button
              type="button"
              onClick={goBack}
              className="min-h-11 self-start text-label font-medium tracking-[0.08em] text-on-dark-secondary uppercase"
            >
              {passQuizContent.backLabel}
            </button>
          ) : null}
        </>
      )}
    </div>
  )
}

function ColorSwatches({ option }: { option: PassQuizOption }) {
  const swatchFamilyKeys = option.swatchFamilyKeys ?? option.matchKeys
  const swatchColors = passDesignTables.colorFamilies
    .filter((colorFamily) => swatchFamilyKeys.includes(colorFamily.key))
    .map((colorFamily) => colorFamily.swatchColor)
  return (
    <span aria-hidden="true" className="flex -space-x-1">
      {swatchColors.map((swatchColor) => (
        <span
          key={swatchColor}
          className="size-3.5 rounded-full ring-2 ring-dark-track"
          style={{ backgroundColor: swatchColor }}
        />
      ))}
    </span>
  )
}

function QuizResults({
  answers,
  shownResultCount,
  onShowMore,
  onStartOver,
  onOpenDesign,
  collection,
}: {
  answers: QuizAnswers
  shownResultCount: number
  onShowMore: () => void
  onStartOver: () => void
  onOpenDesign: (designNumber: number) => void
  collection: ReturnType<typeof usePassCollection>['collection']
}) {
  const rankedDesigns = rankPassQuizMatches({
    rule: {
      colorwayKeys: answers.walkTime?.matchKeys ?? [],
      colorFamilyKeys: answers.color?.matchKeys ?? [],
      templateKeys: answers.style?.matchKeys ?? [],
    },
    answerKey: [answers.walkTime?.key, answers.color?.key, answers.style?.key].join('-'),
    takenDesignNumbers: listTakenDesignNumbers(collection),
  })
  const shownDesigns = rankedDesigns.slice(0, shownResultCount)

  return (
    <div className="flex flex-col gap-6">
      <p className="max-w-[34em] text-lg leading-[1.4] text-on-dark-secondary">
        {rankedDesigns.length === 0 ? passQuizContent.noneLeft : passQuizContent.resultsIntro}
      </p>
      <ul className="grid grid-cols-2 gap-2.5 text-ink sm:grid-cols-3 lg:grid-cols-6">
        {shownDesigns.map((design) => (
          <li key={design.designNumber}>
            <PassCard
              design={design}
              availability={readPassAvailability(collection, design.designNumber)}
              recentMint={findRecentPassMint(collection, design.designNumber)}
              onOpen={onOpenDesign}
            />
          </li>
        ))}
      </ul>
      <div className="flex flex-wrap gap-2.5">
        {shownResultCount < rankedDesigns.length ? (
          <button
            type="button"
            onClick={onShowMore}
            className={buildPillClassName('callToAction', 'regular')}
          >
            <PillContent label={passQuizContent.moreLabel} />
          </button>
        ) : null}
        <button
          type="button"
          onClick={onStartOver}
          className="inline-flex h-[45px] items-center rounded-full px-4 text-sm leading-[1.15] font-medium uppercase"
        >
          {passQuizContent.restartLabel}
        </button>
      </div>
    </div>
  )
}
