'use client'

import { type FormEvent, type ReactNode, useId, useRef, useState } from 'react'
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
import { buildPillClassName, PillContent } from '../ui/pill-button'
import { PassCard } from './pass-card'

type PassFinderProps = {
  onOpenDesign: (designNumber: number) => void
}

const QUIZ_RESULTS_PAGE_SIZE = 6

type QuizAnswers = Partial<Record<(typeof passQuizQuestions)[number]['key'], PassQuizOption>>

/** The three ways to find "the one" without scrolling 1,000 cards (brief §5.2). */
export function PassFinder({ onOpenDesign }: PassFinderProps) {
  const [isQuizOpen, setIsQuizOpen] = useState(false)
  const [surpriseMessage, setSurpriseMessage] = useState<string | null>(null)
  const { collection } = usePassCollection()

  function openSurprisePass() {
    const surpriseDesign = pickSurprisePassDesign(listTakenDesignNumbers(collection))
    if (surpriseDesign === null) {
      setSurpriseMessage(passFindContent.surpriseNoneLeft)
      return
    }
    setSurpriseMessage(null)
    onOpenDesign(surpriseDesign.designNumber)
  }

  return (
    <div className="flex flex-col gap-2.5">
      <div className="grid grid-cols-1 gap-2.5 md:grid-cols-3">
        <FinderTile title={passFindContent.quizTitle} description={passFindContent.quizDescription}>
          <button
            type="button"
            aria-expanded={isQuizOpen}
            onClick={() => setIsQuizOpen(true)}
            className={buildPillClassName('primary', 'regular', 'self-start')}
          >
            <PillContent label={passFindContent.quizStartLabel} />
          </button>
        </FinderTile>
        <FinderTile
          title={passFindContent.surpriseTitle}
          description={passFindContent.surpriseDescription}
        >
          <button
            type="button"
            onClick={openSurprisePass}
            className={buildPillClassName('secondary', 'regular', 'self-start')}
          >
            <PillContent label={passFindContent.surpriseLabel} />
          </button>
          {surpriseMessage === null ? null : (
            <p className="text-sm text-ink-secondary-small">{surpriseMessage}</p>
          )}
        </FinderTile>
        <FinderTile
          title={passFindContent.searchTitle}
          description={passFindContent.searchDescription}
        >
          <PassNumberSearch onOpenDesign={onOpenDesign} />
        </FinderTile>
      </div>
      {isQuizOpen ? (
        <PassQuiz onOpenDesign={onOpenDesign} onClose={() => setIsQuizOpen(false)} />
      ) : null}
    </div>
  )
}

function FinderTile({
  title,
  description,
  children,
}: {
  title: string
  description: string
  children: ReactNode
}) {
  return (
    <div className="flex flex-col justify-between gap-6 rounded-panel bg-surface p-5 md:p-6">
      <div className="flex flex-col gap-2">
        <h3 className="text-2xl leading-[1.1] tracking-[-0.01em]">{title}</h3>
        <p className="text-base leading-[1.4] text-ink-secondary-small">{description}</p>
      </div>
      <div className="flex flex-col gap-2">{children}</div>
    </div>
  )
}

function PassNumberSearch({ onOpenDesign }: PassFinderProps) {
  const [searchText, setSearchText] = useState('')
  const [isInvalid, setIsInvalid] = useState(false)
  const inputId = useId()
  const errorId = `${inputId}-error`

  function searchPassNumber(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const designNumber = parsePassNumberSearch(searchText)
    if (designNumber === null) {
      setIsInvalid(true)
      return
    }
    setIsInvalid(false)
    onOpenDesign(designNumber)
  }

  return (
    <form noValidate onSubmit={searchPassNumber} className="flex flex-col gap-2">
      <label htmlFor={inputId} className="sr-only">
        {passFindContent.searchLabel}
      </label>
      <div className="flex gap-2">
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
            if (isInvalid) setIsInvalid(false)
          }}
          aria-invalid={isInvalid}
          aria-describedby={errorId}
          className="h-[45px] min-w-0 flex-1 rounded-full border border-hairline bg-page px-5 font-mono text-base placeholder:text-ink-secondary transition-colors duration-300 ease-standard focus-visible:border-ink aria-invalid:border-ink"
        />
        <button type="submit" className={buildPillClassName('primary', 'regular', 'shrink-0')}>
          <PillContent label={passFindContent.searchSubmitLabel} />
        </button>
      </div>
      <p id={errorId} className="min-h-5 text-sm leading-[1.4]">
        {isInvalid ? passFindContent.searchInvalid : null}
      </p>
    </form>
  )
}

function PassQuiz({
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
          className="-mt-2.5 -mr-2.5 flex size-11 shrink-0 items-center justify-center rounded-full transition-colors duration-300 ease-standard active:bg-dark-track"
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
