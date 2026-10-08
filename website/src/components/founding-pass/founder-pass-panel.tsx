'use client'

import { shortenAddress } from '@/content/contracts'
import { passPromiseLine } from '@/content/founding-pass'
import { founderContent, revealContent } from '@/content/founding-pass-mint'
import {
  buildPassPagePath,
  formatPassNumber,
  readPassDesign,
} from '@/lib/founding-pass/pass-design'
import { MetaLabel } from '../ui/meta-label'
import { buildPillClassName, PillContent } from '../ui/pill-button'
import { PassArt } from './pass-art'

type FounderPassPanelProps = {
  /** How we know: the signed-in wallet holds it, or the API said this email has one. */
  reason: 'wallet' | 'email'
  designNumber: number | null
  founderNumber?: number | null
  isLaced?: boolean | null
  walletAddress?: string | null
  headingLevel: 'h2' | 'h3'
  headingId?: string
  /** "See your pass": the reveal from this visit. */
  onSeeReveal?: () => void
}

/**
 * Already a founder (Part 5): the pass this person holds and the next step, the app. Never just
 * an error.
 */
export function FounderPassPanel({
  reason,
  designNumber,
  founderNumber = null,
  isLaced = null,
  walletAddress = null,
  headingLevel,
  headingId,
  onSeeReveal,
}: FounderPassPanelProps) {
  const design = designNumber === null ? undefined : readPassDesign(designNumber)
  const Heading = headingLevel
  return (
    <div className="grid grid-cols-1 gap-6 rounded-panel bg-surface p-5 md:grid-cols-12 md:gap-8 md:p-[30px]">
      {design !== undefined ? (
        <div className="overflow-hidden rounded-panel ring-1 ring-hairline md:col-span-5">
          <PassArt design={design} view="card" />
        </div>
      ) : null}
      <div
        className={`flex flex-col gap-4 ${design === undefined ? 'md:col-span-12' : 'md:col-span-7 md:justify-center'}`}
      >
        <MetaLabel items={founderContent.metaLabels} />
        <Heading
          id={headingId}
          className="-ml-[0.03em] text-[clamp(2rem,5vw,3rem)] leading-[0.95] tracking-[-0.01em]"
        >
          {founderContent.heading}
        </Heading>
        {design !== undefined ? (
          <p className="text-lg leading-[1.35]">
            {reason === 'wallet' ? founderContent.walletText : founderContent.emailText}{' '}
            <span className="font-mono">{formatPassNumber(design.designNumber)}</span> {design.name}
            {founderNumber === null ? '' : `, Founder ${founderNumber} of 1,000`}.
          </p>
        ) : null}
        <p className="text-base leading-[1.45] text-ink-secondary-small">
          {founderContent.onePerPerson}
        </p>
        {isLaced === null ? null : (
          <p className="text-sm leading-[1.45]">
            {isLaced ? founderContent.laced : founderContent.unlaced}
          </p>
        )}
        <p className="text-base leading-[1.45]">
          {reason === 'wallet' && walletAddress !== null ? (
            <>
              {revealContent.sameWalletPrefix}{' '}
              <span className="font-mono text-sm">
                {shortenAddress(walletAddress as `0x${string}`)}
              </span>
            </>
          ) : reason === 'email' ? (
            founderContent.emailWalletText
          ) : (
            revealContent.nextStepText
          )}
        </p>
        <div className="flex flex-wrap gap-2.5">
          <a href={revealContent.getAppUrl} className={buildPillClassName('primary', 'regular')}>
            <PillContent label={revealContent.getAppLabel} />
          </a>
          {onSeeReveal !== undefined ? (
            <button
              type="button"
              onClick={onSeeReveal}
              className={buildPillClassName('secondary', 'regular')}
            >
              <PillContent label={founderContent.seeRevealLabel} />
            </button>
          ) : design !== undefined ? (
            <a
              href={buildPassPagePath(design.designNumber)}
              className={buildPillClassName('secondary', 'regular')}
            >
              <PillContent label={founderContent.seePassLabel} />
            </a>
          ) : null}
        </div>
        <p className="text-label font-medium tracking-[0.08em] text-ink-secondary-small uppercase">
          {passPromiseLine}
        </p>
      </div>
    </div>
  )
}
