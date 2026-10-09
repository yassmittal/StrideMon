'use client'

import {
  passAppAccessContent,
  passPhaseContent,
  passScheduleContent,
  passSectionIds,
} from '@/content/founding-pass'
import { getReadyContent } from '@/content/founding-pass-mint'
import { appDownloadUrl, sectionIds } from '@/content/site'
import type { PassCollection } from '@/lib/founding-pass/pass-collection'
import { formatPassNumber, readPassDesign } from '@/lib/founding-pass/pass-design'
import {
  type CountdownParts,
  isMintingPhase,
  type PassSchedulePhase,
  splitCountdown,
} from '@/lib/founding-pass/pass-schedule'
import { retryPassCollection, usePassCollection } from '@/lib/founding-pass/use-pass-collection'
import { usePassSchedule } from '@/lib/founding-pass/use-pass-schedule'
import { buildPillClassName, PillContent } from '../ui/pill-button'
import { LocalDateTime } from './local-date-time'

const COUNTDOWN_TICK_MILLISECONDS = 1000
const DATES_REFRESH_MILLISECONDS = 30_000

const countdownUnits: readonly { key: keyof CountdownParts; label: string }[] = [
  { key: 'days', label: 'Days' },
  { key: 'hours', label: 'Hours' },
  { key: 'minutes', label: 'Min' },
  { key: 'seconds', label: 'Sec' },
]

/**
 * The hero's dark panel: what's happening now, when the next thing happens, and the one thing to
 * do (Part 4's stuck-point rule), for every phase. The full dates live in How it works (D-050).
 */
export function PassSchedulePanel() {
  const { position, now, scheduleTimes, collection } = usePassSchedule(COUNTDOWN_TICK_MILLISECONDS)
  const { requestStatus } = usePassCollection()
  const phase: PassSchedulePhase | null = position?.phase ?? null
  const phaseContent = phase === null ? null : passPhaseContent[phase]
  const latestMint = collection?.recentMints[0]
  const latestMintDesign =
    latestMint === undefined ? undefined : readPassDesign(latestMint.designNumber)
  const isMinting = phase !== null && isMintingPhase(phase)
  const isOver = phase === 'allMinted' || phase === 'openToAll'
  const isPreview = phase === null || phase === 'preview'
  const nextPhaseAtPrefix =
    phase === 'preview' || phase === 'waitlistWindow'
      ? passScheduleContent.nextPhaseAtPrefix[phase]
      : null

  return (
    <div className="flex flex-col gap-6 rounded-panel bg-dark-panel p-6 text-on-dark md:p-[30px]">
      {/* Fixed heights while the time loads, so nothing below moves (CLS). */}
      <div className="flex min-h-[172px] flex-col gap-4">
        <p className="flex items-center gap-2.5 text-label font-medium tracking-[0.08em] uppercase">
          <span aria-hidden="true" className="size-[7px] rounded-full bg-lime" />
          {phaseContent?.label ?? passPhaseContent.preview.label}
        </p>
        <p className="min-h-[2.4em] max-w-[22em] text-xl leading-[1.2] md:text-2xl">
          {phaseContent?.headline ?? ''}
        </p>
        {phaseContent?.countdownLabel && position?.nextPhaseAt && now ? (
          <div className="flex flex-col gap-2.5">
            <p className="text-sm text-on-dark-secondary">{phaseContent.countdownLabel}</p>
            <Countdown parts={splitCountdown(position.nextPhaseAt, now)} />
            {nextPhaseAtPrefix === null ? null : (
              <p className="text-sm text-on-dark-secondary">
                {nextPhaseAtPrefix}{' '}
                <LocalDateTime
                  isoTimestamp={position.nextPhaseAt.toISOString()}
                  className="text-on-dark"
                />
                , {passScheduleContent.yourTimeSuffix}.
              </p>
            )}
          </div>
        ) : collection !== null ? (
          <p className="font-mono text-[clamp(1.75rem,4.5vw,2.75rem)] leading-none tracking-[-0.02em]">
            {collection.mintedCount.toLocaleString('en-US')}
            <span className="text-on-dark-secondary">
              {' '}
              of {collection.designCount.toLocaleString('en-US')}{' '}
              {passScheduleContent.mintedCountLabel}
            </span>
          </p>
        ) : null}
      </div>

      {isMinting && collection !== null && phaseContent?.countdownLabel ? (
        <p className="font-mono text-sm">
          {collection.mintedCount.toLocaleString('en-US')} of{' '}
          {collection.designCount.toLocaleString('en-US')} {passScheduleContent.mintedCountLabel}
        </p>
      ) : null}
      {phase === 'openMint' ? (
        <p className="text-sm text-on-dark-secondary">
          {passScheduleContent.openMintUntilPrefix}{' '}
          <LocalDateTime isoTimestamp={scheduleTimes.backupOpeningAt} />.
        </p>
      ) : null}
      {latestMint !== undefined && latestMintDesign !== undefined && isMinting ? (
        <p className="text-sm text-on-dark-secondary">
          {passScheduleContent.liveLinePrefix}:{' '}
          <span className="text-on-dark">
            {formatPassNumber(latestMint.designNumber)} {latestMintDesign.name}
          </span>
        </p>
      ) : null}

      <div className="flex flex-col gap-4 border-t border-hairline-on-dark pt-6">
        <p className="max-w-[26em] text-base leading-[1.4]">
          {phaseContent?.nextStep ?? passPhaseContent.preview.nextStep}
        </p>
        <div className="flex flex-wrap gap-2.5">
          {isPreview ? (
            <a
              href={`#${sectionIds.waitlist}`}
              className={buildPillClassName('callToAction', 'regular')}
            >
              <PillContent label={passScheduleContent.joinWaitlistLabel} />
            </a>
          ) : null}
          {isOver ? (
            <a href={appDownloadUrl} className={buildPillClassName('callToAction', 'regular')}>
              <PillContent label={passScheduleContent.getAppLabel} />
            </a>
          ) : null}
          <a
            href={`#${passSectionIds.gallery}`}
            className={buildPillClassName(isMinting ? 'callToAction' : 'secondary', 'regular')}
          >
            <PillContent
              label={
                isMinting ? passScheduleContent.findPassLabel : passScheduleContent.browseLabel
              }
            />
          </a>
          {isMinting ? (
            <a
              href={`#${getReadyContent.sectionId}`}
              className={buildPillClassName('secondary', 'regular')}
            >
              <PillContent label={passScheduleContent.getReadyLabel} />
            </a>
          ) : null}
        </div>
      </div>

      {collection === null && requestStatus === 'failed' ? (
        <p className="flex flex-wrap items-center gap-x-2 text-xs leading-[1.4] text-on-dark-secondary">
          {passScheduleContent.unavailableLine}
          <button
            type="button"
            onClick={retryPassCollection}
            className="min-h-11 text-on-dark underline decoration-hairline-on-dark underline-offset-4"
          >
            {passScheduleContent.retryLabel}
          </button>
        </p>
      ) : null}
    </div>
  )
}

/**
 * The schedule's four steps with their dates, and where the app stands (D-049), under How it
 * works (D-050). The current step is marked.
 */
export function PassScheduleDates() {
  const { position, scheduleTimes, collection } = usePassSchedule(DATES_REFRESH_MILLISECONDS)
  const phase: PassSchedulePhase | null = position?.phase ?? null

  return (
    <div className="flex flex-col gap-6 rounded-panel bg-dark-panel p-6 text-on-dark md:p-[30px]">
      <div className="flex flex-wrap items-baseline justify-between gap-x-6 gap-y-1">
        <h3 className="text-2xl leading-[1.1] tracking-[-0.01em]">
          {passScheduleContent.datesHeading}
        </h3>
        <p className="text-sm text-on-dark-secondary">{passScheduleContent.yourTimeZoneNote}</p>
      </div>
      <ol className="grid grid-cols-1 gap-x-4 gap-y-5 border-t border-hairline-on-dark pt-6 sm:grid-cols-2 lg:grid-cols-4">
        {passScheduleContent.steps.map((step) => {
          const isCurrent =
            phase === step.phase || (step.phase === 'openToAll' && phase === 'allMinted')
          return (
            <li
              key={step.phase}
              aria-current={isCurrent ? 'step' : undefined}
              className="flex flex-col gap-1.5"
            >
              <span
                className={`flex items-center gap-2 text-label font-medium tracking-[0.08em] uppercase ${isCurrent ? '' : 'text-on-dark-secondary'}`}
              >
                {isCurrent ? (
                  <span aria-hidden="true" className="size-[7px] rounded-full bg-lime" />
                ) : null}
                {step.title}
              </span>
              {step.timeKey === null ? null : (
                <LocalDateTime isoTimestamp={scheduleTimes[step.timeKey]} className="text-base" />
              )}
              <span className="text-sm leading-[1.4] text-on-dark-secondary">
                {step.description}
              </span>
            </li>
          )
        })}
      </ol>
      <AppAccessLine
        phase={phase}
        collection={collection}
        backupOpeningAt={scheduleTimes.backupOpeningAt}
      />
    </div>
  )
}

/**
 * Who can play the app right now (D-049), from the API's gate. Before early access, the test
 * period; while the gate is on, founders only. Nothing once it's open to all (the hero says so),
 * or when the API hasn't said.
 */
function AppAccessLine({
  phase,
  collection,
  backupOpeningAt,
}: {
  phase: PassSchedulePhase | null
  collection: PassCollection | null
  backupOpeningAt: string
}) {
  const isEarlyAccessGateOn = collection?.isEarlyAccessGateOn ?? null
  const isOver = phase === 'allMinted' || phase === 'openToAll'
  if (phase === null || isOver || isEarlyAccessGateOn === null) return null
  if (!isEarlyAccessGateOn && phase !== 'preview') return null
  return (
    <div className="flex flex-col gap-1.5 border-t border-hairline-on-dark pt-6">
      <p className="text-label font-medium tracking-[0.08em] uppercase">
        {passAppAccessContent.label}
      </p>
      <p className="max-w-[46em] text-sm leading-[1.45] text-on-dark-secondary">
        {isEarlyAccessGateOn ? (
          <>
            {passAppAccessContent.foundersOnlyPrefix}{' '}
            <LocalDateTime isoTimestamp={backupOpeningAt} /> at the latest.
          </>
        ) : (
          <>
            {passAppAccessContent.testPeriodText}{' '}
            <a
              href={appDownloadUrl}
              className="text-on-dark underline decoration-hairline-on-dark underline-offset-4"
            >
              {passAppAccessContent.getAppLabel}
            </a>
          </>
        )}
      </p>
    </div>
  )
}

function Countdown({ parts }: { parts: CountdownParts }) {
  return (
    <p className="flex gap-4 md:gap-6">
      {countdownUnits.map((unit) => (
        <span key={unit.key} className="flex flex-col gap-1.5">
          <span className="font-mono text-[clamp(1.75rem,4.5vw,2.75rem)] leading-none tracking-[-0.02em] tabular-nums">
            {String(parts[unit.key]).padStart(2, '0')}
          </span>
          <span className="text-label font-medium tracking-[0.08em] text-on-dark-secondary uppercase">
            {unit.label}
          </span>
        </span>
      ))}
    </p>
  )
}
