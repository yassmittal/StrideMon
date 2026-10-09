'use client'

import { useEffect, useId, useRef } from 'react'
import { passNextStepContent, passPromiseLine } from '@/content/founding-pass'
import {
  calendarReminderContent,
  mintProblemActionLabels,
  mintStepContent,
  revealContent,
} from '@/content/founding-pass-mint'
import { siteUrl } from '@/content/site'
import { buildGoogleCalendarUrl, buildIcsDataUrl } from '@/lib/calendar-reminder'
import {
  buildPassPagePath,
  formatPassNumber,
  type PassDesign,
  readPassDesign,
} from '@/lib/founding-pass/pass-design'
import {
  checkMintAgain,
  closePassMint,
  type MintProblem,
  mintSimilarDesign,
  reportMintTurnstileProblem,
  requestMint,
  setMintTurnstileToken,
  usePassMintFlow,
} from '@/lib/founding-pass/pass-mint-flow'
import { usePassMintReadiness } from '@/lib/founding-pass/pass-mint-readiness'
import { isMintingPhase } from '@/lib/founding-pass/pass-schedule'
import { usePassSchedule } from '@/lib/founding-pass/use-pass-schedule'
import { useNow } from '@/lib/use-now'
import { MetaLabel } from '../ui/meta-label'
import { buildPillClassName, PillContent } from '../ui/pill-button'
import { EmailCheckStep } from './email-check-step'
import { FavouriteButton } from './favourite-button'
import { FounderPassPanel } from './founder-pass-panel'
import { LocalDateTime } from './local-date-time'
import { MintProblemNote, MintTextButton } from './mint-problem-note'
import { PassArt } from './pass-art'
import { PassMintProgress } from './pass-mint-progress'
import { TurnstileCheck } from './turnstile-check'
import { WalletSignInStep } from './wallet-sign-in-step'

const SCHEDULE_REFRESH_MILLISECONDS = 30_000
const COUNTDOWN_TICK_MILLISECONDS = 1000
const OPEN_MINT_REMINDER_MINUTES = 30
const DEAD_END_PROBLEM_KEYS: ReadonlySet<MintProblem['key']> = new Set([
  'alreadyMinted',
  'waitlistOnly',
  'notOpen',
  'allMinted',
  'mintClosed',
  'mintStillQueued',
  'mintLostContact',
])

/**
 * The mint (Part 5, D-045), over the gallery or a pass page: whatever "Get ready" step is
 * missing, then one tap, the calm wait, and the reveal. A modal `<dialog>`, like the pass sheet,
 * so it opens above it.
 */
export function PassMintDialog() {
  const flow = usePassMintFlow()
  const dialogRef = useRef<HTMLDialogElement>(null)
  const headingId = useId()
  const isOpen = flow.designNumber !== null

  useEffect(() => {
    const dialog = dialogRef.current
    if (dialog === null) return
    if (isOpen && !dialog.open) dialog.showModal()
    if (!isOpen && dialog.open) dialog.close()
  }, [isOpen])

  const stageDesign =
    flow.stageDesignNumber === null ? undefined : readPassDesign(flow.stageDesignNumber)

  return (
    // biome-ignore lint/a11y/useKeyWithClickEvents: the click only catches the backdrop; the keyboard closes a modal dialog with Escape.
    <dialog
      ref={dialogRef}
      aria-labelledby={headingId}
      onClose={closePassMint}
      onClick={(event) => {
        if (event.target === dialogRef.current) closePassMint()
      }}
      className="pass-sheet pass-mint-sheet"
    >
      <div className="pass-sheet-scroll">
        <div className="sticky top-0 z-10 flex justify-end px-3 pt-3 md:px-4 md:pt-4">
          <button
            type="button"
            onClick={closePassMint}
            aria-label={mintStepContent.closeLabel}
            className="flex size-11 items-center justify-center rounded-full bg-surface-muted shadow-floating-pill transition-colors duration-300 ease-standard hover:bg-surface active:bg-surface"
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
        <div className="px-4 pt-1 pb-10 md:-mt-11 md:px-[30px] md:pt-0 md:pb-[30px]">
          {isOpen && stageDesign !== undefined ? (
            <PassMintDialogBody design={stageDesign} headingId={headingId} />
          ) : null}
        </div>
      </div>
    </dialog>
  )
}

function PassMintDialogBody({ design, headingId }: { design: PassDesign; headingId: string }) {
  const flow = usePassMintFlow()
  const { stage } = flow
  const { heldPassState, signIn } = usePassMintReadiness()

  if (stage.kind === 'minting' || stage.kind === 'revealed') {
    return (
      <PassMintProgress
        design={design}
        mint={stage.mint}
        isRevealed={stage.kind === 'revealed'}
        isSlow={stage.kind === 'minting' && stage.isSlow}
        hasLostContact={stage.kind === 'minting' && stage.hasLostContact}
        headingId={headingId}
        onDone={closePassMint}
      />
    )
  }
  if (stage.kind === 'founder') {
    const { founderRefusal } = stage
    const heldPass = heldPassState.status === 'held' ? heldPassState.heldPass : null
    return (
      <FounderPassPanel
        reason={founderRefusal.reason}
        designNumber={heldPass?.designNumber ?? founderRefusal.designNumber}
        founderNumber={heldPass?.founderNumber ?? null}
        walletAddress={founderRefusal.reason === 'wallet' ? (signIn?.walletAddress ?? null) : null}
        headingLevel="h2"
        headingId={headingId}
      />
    )
  }
  if (heldPassState.status === 'held') {
    const { heldPass } = heldPassState
    return (
      <FounderPassPanel
        reason="wallet"
        designNumber={heldPass.designNumber}
        founderNumber={heldPass.founderNumber}
        isLaced={heldPass.isLaced}
        walletAddress={heldPass.walletAddress}
        headingLevel="h2"
        headingId={headingId}
      />
    )
  }
  return <MintSetup design={design} headingId={headingId} />
}

/** The pass, the steps still to do, the Mint button and anything that went wrong. */
function MintSetup({ design, headingId }: { design: PassDesign; headingId: string }) {
  const flow = usePassMintFlow()
  const { emailCheck, signIn } = usePassMintReadiness()
  const { position } = usePassSchedule(SCHEDULE_REFRESH_MILLISECONDS)
  const isReady = emailCheck !== null && signIn !== null
  const isMintingOpen = position !== null && isMintingPhase(position.phase)
  const passNumberText = formatPassNumber(design.designNumber)
  const isBusy = flow.isWaitingForTurnstile || flow.stage.kind === 'requesting'
  // After these, tapping Mint on this pass again can't work: the note offers the next step.
  const isMintButtonHidden =
    flow.stage.kind === 'problem' && DEAD_END_PROBLEM_KEYS.has(flow.stage.problem.key)

  return (
    <div className="flex flex-col gap-6">
      <header className="grid grid-cols-[1fr_auto] items-end gap-4">
        <div className="flex flex-col gap-3">
          <MetaLabel items={[mintStepContent.title, passNumberText, revealContent.oneOfOne]} />
          <h2
            id={headingId}
            className="-ml-[0.03em] text-[clamp(2rem,6vw,3.25rem)] leading-[0.95] tracking-[-0.01em] text-balance"
          >
            {design.name}
          </h2>
        </div>
        <div className="w-28 overflow-hidden rounded-panel bg-surface md:w-40">
          <PassArt design={design} view="shoe" isEager />
        </div>
      </header>

      {isReady ? null : (
        <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
          <EmailCheckStep headingLevel="h3" mintingOpensAt={null} />
          <WalletSignInStep headingLevel="h3" />
        </div>
      )}

      {isMintButtonHidden ? null : (
        <div className="flex flex-col gap-4 rounded-panel bg-dark-panel p-5 text-on-dark md:p-6">
          {isMintingOpen ? (
            <>
              {isReady ? (
                <TurnstileCheck
                  action="mint"
                  resetKey={flow.turnstileResetKey}
                  onTokenChange={setMintTurnstileToken}
                  onProblem={reportMintTurnstileProblem}
                />
              ) : null}
              <button
                type="button"
                onClick={requestMint}
                disabled={!isReady || isBusy}
                className={buildPillClassName(
                  'callToAction',
                  'regular',
                  'self-start disabled:opacity-60',
                )}
              >
                <PillContent label={`${mintStepContent.mintLabelPrefix} ${passNumberText}`} />
              </button>
              <p aria-live="polite" className="text-sm leading-[1.45] text-on-dark-secondary">
                {!isReady
                  ? mintStepContent.notReadyText
                  : flow.stage.kind === 'requesting'
                    ? mintStepContent.requestingText
                    : flow.isWaitingForTurnstile
                      ? mintStepContent.checkingRobotText
                      : mintStepContent.freeLine}
              </p>
            </>
          ) : position !== null ? (
            <p className="text-base leading-[1.45]">{passNextStepContent[position.phase]}</p>
          ) : null}
          {flow.hasTurnstileProblem && flow.turnstileToken === null && isReady ? (
            <MintProblemNote problemKey="turnstileUnavailable" tone="dark" />
          ) : null}
        </div>
      )}

      {flow.stage.kind === 'problem' ? (
        <div aria-live="polite">
          <MintStageProblem problem={flow.stage.problem} design={design} />
        </div>
      ) : null}

      <p className="text-label font-medium tracking-[0.08em] text-ink-secondary-small uppercase">
        {passPromiseLine}
      </p>
    </div>
  )
}

/** A refused or stuck mint: what happened, and the one next step for it. */
function MintStageProblem({ problem, design }: { problem: MintProblem; design: PassDesign }) {
  const now = useNow(COUNTDOWN_TICK_MILLISECONDS)
  switch (problem.key) {
    case 'alreadyMinted':
      return (
        <MintProblemNote
          problemKey="alreadyMinted"
          extra={
            problem.similarDesignNumbers.length > 0 ? (
              <ul className="grid grid-cols-3 gap-2.5">
                {problem.similarDesignNumbers.map((designNumber) => (
                  <li key={designNumber}>
                    <SimilarPassMintButton designNumber={designNumber} />
                  </li>
                ))}
              </ul>
            ) : null
          }
        />
      )
    case 'waitlistOnly':
      return (
        <MintProblemNote
          problemKey="waitlistOnly"
          extra={
            problem.openMintStartsAt === null ? null : (
              <OpenMintReminder openMintStartsAt={problem.openMintStartsAt} />
            )
          }
          actions={<FavouriteButton designNumber={design.designNumber} appearance="pill" />}
        />
      )
    case 'notOpen':
      return (
        <MintProblemNote
          problemKey="notOpen"
          extra={
            problem.opensAt === null ? null : (
              <p className="text-sm leading-[1.45]">
                {mintProblemActionLabels.opensAtPrefix}{' '}
                <LocalDateTime isoTimestamp={problem.opensAt} />.
              </p>
            )
          }
          actions={<FavouriteButton designNumber={design.designNumber} appearance="pill" />}
        />
      )
    case 'rateLimited': {
      return <RateLimitedProblem retryAfterSeconds={problem.retryAfterSeconds} now={now} />
    }
    case 'mintStillQueued':
    case 'mintLostContact':
      return (
        <MintProblemNote
          problemKey={problem.key}
          actions={
            <MintTextButton label={mintProblemActionLabels.checkAgain} onClick={checkMintAgain} />
          }
        />
      )
    case 'allMinted':
    case 'mintClosed':
      return (
        <MintProblemNote
          problemKey={problem.key}
          actions={
            <a href={revealContent.getAppUrl} className={buildPillClassName('primary', 'compact')}>
              <PillContent label={mintProblemActionLabels.getApp} />
            </a>
          }
        />
      )
    case 'emailProofInvalid':
    case 'signInEnded':
      // The step above is open again: doing it is the next step.
      return <MintProblemNote problemKey={problem.key} />
    default:
      return (
        <MintProblemNote
          problemKey={problem.key}
          actions={
            <MintTextButton label={mintProblemActionLabels.tryAgain} onClick={requestMint} />
          }
        />
      )
  }
}

function RateLimitedProblem({
  retryAfterSeconds,
  now,
}: {
  retryAfterSeconds: number | null
  now: Date | null
}) {
  const shownAtRef = useRef(Date.now())
  const secondsLeft =
    retryAfterSeconds === null || now === null
      ? 0
      : Math.max(0, Math.ceil(retryAfterSeconds - (now.getTime() - shownAtRef.current) / 1000))
  return (
    <MintProblemNote
      problemKey="rateLimited"
      actions={
        <MintTextButton
          label={
            secondsLeft > 0
              ? `${mintProblemActionLabels.waitPrefix} ${secondsLeft} s`
              : mintProblemActionLabels.tryAgain
          }
          onClick={requestMint}
          isDisabled={secondsLeft > 0}
        />
      }
    />
  )
}

function SimilarPassMintButton({ designNumber }: { designNumber: number }) {
  const design = readPassDesign(designNumber)
  if (design === undefined) return null
  return (
    <div className="flex flex-col overflow-hidden rounded-panel bg-surface">
      <a href={buildPassPagePath(design.designNumber)} className="block">
        <PassArt design={design} view="shoe" />
      </a>
      <div className="flex flex-col gap-2 px-2.5 pt-2 pb-2.5">
        <span className="text-xs leading-[1.25]">{design.name}</span>
        <button
          type="button"
          onClick={() => mintSimilarDesign(design.designNumber)}
          className="inline-flex h-9 items-center justify-center rounded-full bg-ink px-3 text-[0.6875rem] leading-[1.15] font-medium text-on-dark uppercase transition-colors duration-300 ease-standard hover:bg-primary active:bg-primary"
        >
          {mintProblemActionLabels.mintSimilarPrefix} {formatPassNumber(design.designNumber)}
        </button>
      </div>
    </div>
  )
}

/** When the open mint starts, in the visitor's time zone, with a calendar reminder (D-045). */
export function OpenMintReminder({ openMintStartsAt }: { openMintStartsAt: string }) {
  const reminder = {
    title: calendarReminderContent.title,
    details: calendarReminderContent.details,
    url: `${siteUrl}/pass`,
    startsAt: new Date(openMintStartsAt),
    durationMinutes: OPEN_MINT_REMINDER_MINUTES,
  }
  return (
    <div className="flex flex-col gap-2 text-sm leading-[1.45]">
      <p>
        {mintProblemActionLabels.openMintStartsPrefix}{' '}
        <LocalDateTime isoTimestamp={openMintStartsAt} />.
      </p>
      <p className="flex flex-wrap items-center gap-x-3 gap-y-1">
        <span className="text-ink-secondary-small">{calendarReminderContent.addPrompt}</span>
        <a
          href={buildGoogleCalendarUrl(reminder)}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex min-h-11 items-center underline decoration-hairline underline-offset-4"
        >
          {calendarReminderContent.googleLabel}
        </a>
        <a
          href={buildIcsDataUrl(reminder)}
          download={calendarReminderContent.icsFileName}
          className="inline-flex min-h-11 items-center underline decoration-hairline underline-offset-4"
        >
          {calendarReminderContent.icsLabel}
        </a>
      </p>
    </div>
  )
}
