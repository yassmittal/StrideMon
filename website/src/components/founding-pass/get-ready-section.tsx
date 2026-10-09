'use client'

import { passSectionIds } from '@/content/founding-pass'
import { getReadyContent } from '@/content/founding-pass-mint'
import { reopenPassReveal, usePassMintFlow } from '@/lib/founding-pass/pass-mint-flow'
import { usePassMintReadiness } from '@/lib/founding-pass/pass-mint-readiness'
import { isMintingPhase } from '@/lib/founding-pass/pass-schedule'
import { usePassSchedule } from '@/lib/founding-pass/use-pass-schedule'
import { MetaLabel } from '../ui/meta-label'
import { buildPillClassName, PillContent } from '../ui/pill-button'
import { EmailCheckStep } from './email-check-step'
import { FounderPassPanel } from './founder-pass-panel'
import { WalletSignInStep } from './wallet-sign-in-step'

const SCHEDULE_REFRESH_MILLISECONDS = 30_000
/** Get ready shows this long before the waitlist window (D-050). */
const SHOWN_BEFORE_MINTING_MILLISECONDS = 24 * 60 * 60 * 1000

/**
 * "Get ready" near the top of /pass (Part 5, D-045): check the email and sign in ahead, so mint
 * day is one tap. It shows from a day before the waitlist window until minting is over (D-050);
 * a founder always sees their pass here instead.
 */
export function GetReadySection() {
  const { position, now } = usePassSchedule(SCHEDULE_REFRESH_MILLISECONDS)
  const { emailCheck, signIn, heldPassState } = usePassMintReadiness()
  const flow = usePassMintFlow()
  const phase = position?.phase ?? null
  const isFounder = heldPassState.status === 'held'
  const nextPhaseAt = position?.nextPhaseAt ?? null
  const isMintingSoon =
    phase === 'preview' &&
    nextPhaseAt !== null &&
    now !== null &&
    nextPhaseAt.getTime() - now.getTime() <= SHOWN_BEFORE_MINTING_MILLISECONDS
  const isShown = isFounder || isMintingSoon || (phase !== null && isMintingPhase(phase))
  if (!isShown) return null

  const isReady = emailCheck !== null && signIn !== null
  const mintingOpensAt = phase === 'preview' ? (position?.nextPhaseAt ?? null) : null
  const hasRevealThisVisit = flow.stage.kind === 'revealed'

  return (
    <section
      id={getReadyContent.sectionId}
      aria-labelledby="get-ready-heading"
      className="page-gutter page-container flex flex-col gap-6 pt-6 pb-4 md:pt-10"
    >
      {isFounder ? (
        <FounderPassPanel
          reason="wallet"
          designNumber={heldPassState.heldPass.designNumber}
          founderNumber={heldPassState.heldPass.founderNumber}
          isLaced={heldPassState.heldPass.isLaced}
          walletAddress={heldPassState.heldPass.walletAddress}
          headingLevel="h2"
          headingId="get-ready-heading"
          onSeeReveal={hasRevealThisVisit ? reopenPassReveal : undefined}
        />
      ) : (
        <>
          <div className="flex flex-col gap-4">
            <MetaLabel items={getReadyContent.metaLabels} />
            <h2
              id="get-ready-heading"
              className="-ml-[0.03em] max-w-[16em] text-[clamp(2rem,5vw,3.25rem)] leading-[0.95] tracking-[-0.01em] text-balance"
            >
              {getReadyContent.heading}
            </h2>
            <p className="max-w-[36em] text-base leading-[1.45]">
              {getReadyContent.intro}
              {phase === 'preview' ? ` ${getReadyContent.previewNote}` : ''}
            </p>
          </div>
          <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
            <EmailCheckStep headingLevel="h3" mintingOpensAt={mintingOpensAt} />
            <WalletSignInStep headingLevel="h3" />
          </div>
          {isReady ? (
            <div className="flex flex-wrap items-center justify-between gap-4 rounded-panel bg-dark-panel p-5 text-on-dark md:p-6">
              <div className="flex flex-col gap-1.5">
                <p className="flex items-center gap-2.5 text-xl leading-[1.2]">
                  <span aria-hidden="true" className="size-[7px] rounded-full bg-lime" />
                  {getReadyContent.readyHeading}
                </p>
                <p className="text-sm leading-[1.45] text-on-dark-secondary">
                  {phase !== null && isMintingPhase(phase)
                    ? getReadyContent.readyText
                    : getReadyContent.readyPreviewText}
                </p>
              </div>
              <a
                href={`#${passSectionIds.gallery}`}
                className={buildPillClassName('callToAction', 'regular')}
              >
                <PillContent label={getReadyContent.browseLabel} />
              </a>
            </div>
          ) : null}
        </>
      )}
    </section>
  )
}
