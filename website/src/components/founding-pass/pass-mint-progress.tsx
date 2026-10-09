'use client'

import { useEffect, useState } from 'react'
import { buildExplorerTransactionUrl, shortenAddress } from '@/content/contracts'
import { passPromiseLine } from '@/content/founding-pass'
import {
  buildMintedShareText,
  buildRevealNumbersLine,
  mintPendingContent,
  revealContent,
} from '@/content/founding-pass-mint'
import { siteUrl } from '@/content/site'
import type { PassMint } from '@/lib/founding-pass/pass-api'
import {
  buildPassPagePath,
  formatPassNumber,
  type PassDesign,
} from '@/lib/founding-pass/pass-design'
import { usePassMintReadiness } from '@/lib/founding-pass/pass-mint-readiness'
import { ArrowIcon } from '../ui/arrow-icon'
import { MetaLabel } from '../ui/meta-label'
import { buildPillClassName, PillContent } from '../ui/pill-button'
import { XLogoIcon } from '../ui/x-logo-icon'
import { describePassArt, PassArt } from './pass-art'

type PassMintProgressProps = {
  design: PassDesign
  mint: PassMint
  isRevealed: boolean
  isSlow: boolean
  hasLostContact: boolean
  headingId: string
  onDone: () => void
}

/** How long the card waits for its on-chain picture before turning to the gallery card. */
const MINTED_IMAGE_WAIT_MILLISECONDS = 6000
const FOUNDER_COUNT_MILLISECONDS = 1100
/** The count starts as the card finishes turning. */
const FOUNDER_COUNT_DELAY_MILLISECONDS = 700

/**
 * The mint from the queue to the reveal (D-045): a dark card back while it mints, then the card
 * turns to the minted pass as the chain draws it, and the founder number counts up.
 */
export function PassMintProgress({
  design,
  mint,
  isRevealed,
  isSlow,
  hasLostContact,
  headingId,
  onDone,
}: PassMintProgressProps) {
  const mintedImage = useMintedPassImage(isRevealed ? design.designNumber : null)
  const isTurned = isRevealed && mintedImage.status !== 'loading'
  const founderNumber = mint.founderNumber ?? 0
  const countedFounderNumber = useCountUp(founderNumber, isTurned)
  const passNumberText = formatPassNumber(design.designNumber)

  return (
    <div className="grid grid-cols-1 gap-6 md:grid-cols-2 md:gap-8">
      <div className="pass-reveal-card" data-turned={isTurned}>
        <div className="pass-reveal-card-inner">
          <div className="pass-reveal-face flex flex-col justify-between bg-dark-panel p-6 text-on-dark">
            <MetaLabel items={['StrideMon', 'Founding Pass']} tone="dark" />
            <p className="font-mono text-[clamp(3rem,10vw,5rem)] leading-none tracking-[-0.02em]">
              {passNumberText}
            </p>
            <p className="flex items-center gap-2.5 text-label font-medium tracking-[0.08em] uppercase">
              <span
                aria-hidden="true"
                className="pass-mint-pulse size-[7px] rounded-full bg-lime"
              />
              {mintPendingContent.metaLabel}
            </p>
          </div>
          <div className="pass-reveal-face pass-reveal-face-front overflow-hidden bg-page ring-1 ring-hairline">
            {mintedImage.status === 'loaded' ? (
              // biome-ignore lint/performance/noImgElement: the chain's own SVG, as a data URL.
              <img
                src={mintedImage.dataUrl}
                alt={`${describePassArt(design)}, Founder ${founderNumber}${mint.hasGoldFrame ? ', with a gold frame' : ''}`}
                width={1000}
                height={1000}
                className="block h-auto w-full"
              />
            ) : (
              <PassArt design={design} view="card" isEager />
            )}
          </div>
        </div>
      </div>

      <div aria-live="polite" className="flex flex-col gap-5 md:justify-center">
        {isRevealed ? (
          <>
            <MetaLabel items={['Founding Pass', passNumberText, revealContent.oneOfOne]} />
            <h2
              id={headingId}
              className="-ml-[0.03em] text-[clamp(2rem,5vw,3rem)] leading-[0.95] tracking-[-0.01em] text-balance"
            >
              {design.name}
            </h2>
            <p className="flex items-baseline gap-3 font-mono">
              <span className="text-label tracking-[0.08em] uppercase">
                {revealContent.founderLabel}
              </span>
              <span
                className="text-[clamp(2.5rem,8vw,4rem)] leading-none tabular-nums"
                style={{ minWidth: `${String(founderNumber).length}ch` }}
              >
                {countedFounderNumber}
              </span>
              <span className="text-sm text-ink-secondary-small">{revealContent.ofLabel}</span>
            </p>
            <p className="text-sm leading-[1.4] text-ink-secondary-small">
              {buildRevealNumbersLine(passNumberText, founderNumber)}
            </p>
            {mint.hasGoldFrame ? (
              <p className="text-base leading-[1.4]">{revealContent.goldFrameLine}</p>
            ) : null}
            {mintedImage.status === 'failed' ? (
              <p className="text-sm leading-[1.4] text-ink-secondary-small">
                {revealContent.imageUnavailableLine}
                {mint.hasGoldFrame ? ` ${revealContent.goldFrameInWords}` : ''}
              </p>
            ) : null}
            <RevealNextSteps
              design={design}
              founderNumber={founderNumber}
              transactionHash={mint.transactionHash}
              onDone={onDone}
            />
          </>
        ) : (
          <>
            <MetaLabel items={[mintPendingContent.metaLabel, passNumberText]} />
            <h2
              id={headingId}
              className="-ml-[0.03em] text-[clamp(2rem,5vw,3rem)] leading-[0.95] tracking-[-0.01em] text-balance"
            >
              {mintPendingContent.heading}
            </h2>
            <p className="text-base leading-[1.45]">
              {hasLostContact
                ? mintPendingContent.lostContactText
                : isSlow
                  ? mintPendingContent.slowText
                  : mintPendingContent.text}
            </p>
            {mint.transactionHash !== null ? (
              <TransactionLink
                transactionHash={mint.transactionHash}
                label={mintPendingContent.transactionLabel}
              />
            ) : null}
          </>
        )}
      </div>
    </div>
  )
}

function RevealNextSteps({
  design,
  founderNumber,
  transactionHash,
  onDone,
}: {
  design: PassDesign
  founderNumber: number
  transactionHash: `0x${string}` | null
  onDone: () => void
}) {
  const { signIn } = usePassMintReadiness()
  const passNumberText = formatPassNumber(design.designNumber)
  const shareUrl = `${siteUrl}${buildPassPagePath(design.designNumber)}?source=x-share`
  const shareText = buildMintedShareText(passNumberText, design.name, founderNumber)
  return (
    <div className="flex flex-col gap-5 border-t border-hairline pt-5">
      {transactionHash !== null ? (
        <TransactionLink transactionHash={transactionHash} label={revealContent.transactionLabel} />
      ) : null}
      <p className="text-base leading-[1.45]">{revealContent.nextStepText}</p>
      {signIn !== null ? (
        <p className="text-base leading-[1.45]">
          {revealContent.sameWalletPrefix}{' '}
          <span className="font-mono text-sm">{shortenAddress(signIn.walletAddress)}</span>
        </p>
      ) : null}
      <div className="flex flex-wrap gap-2.5">
        <a href={revealContent.getAppUrl} className={buildPillClassName('primary', 'regular')}>
          <PillContent label={revealContent.getAppLabel} />
        </a>
        <a
          href={`https://x.com/intent/post?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(shareUrl)}`}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex h-[45px] items-center gap-2 rounded-full bg-surface-muted px-5 text-sm leading-[1.15] font-medium uppercase transition-colors duration-300 ease-standard hover:bg-surface active:bg-surface"
        >
          <XLogoIcon />
          {revealContent.postOnXLabel}
        </a>
        <button
          type="button"
          onClick={onDone}
          className="inline-flex h-[45px] items-center rounded-full px-3 text-sm leading-[1.15] font-medium uppercase"
        >
          {revealContent.doneLabel}
        </button>
      </div>
      <p className="text-label font-medium tracking-[0.08em] text-ink-secondary-small uppercase">
        {passPromiseLine}
      </p>
    </div>
  )
}

function TransactionLink({
  transactionHash,
  label,
}: {
  transactionHash: `0x${string}`
  label: string
}) {
  return (
    <a
      href={buildExplorerTransactionUrl(transactionHash)}
      target="_blank"
      rel="noopener noreferrer"
      className="group inline-flex min-h-11 items-center gap-2 self-start text-label font-medium tracking-[0.08em] uppercase"
    >
      {label}
      <ArrowIcon className="transition-transform duration-300 ease-standard group-hover:translate-x-[3px]" />
    </a>
  )
}

type MintedImageState =
  | { status: 'loading' }
  | { status: 'loaded'; dataUrl: string }
  | { status: 'failed' }

/** The minted card from the chain (`imageSvg`), or `failed` if it doesn't come in time. */
function useMintedPassImage(designNumber: number | null): MintedImageState {
  const [mintedImage, setMintedImage] = useState<MintedImageState>({ status: 'loading' })
  useEffect(() => {
    if (designNumber === null) return
    let isCancelled = false
    setMintedImage({ status: 'loading' })
    const timeoutId = window.setTimeout(() => {
      if (!isCancelled) setMintedImage({ status: 'failed' })
    }, MINTED_IMAGE_WAIT_MILLISECONDS)
    import('@/lib/founding-pass/pass-chain-reads')
      .then(({ readMintedPassSvg }) => readMintedPassSvg(designNumber))
      .then((svgText) => {
        if (isCancelled) return
        window.clearTimeout(timeoutId)
        setMintedImage({
          status: 'loaded',
          dataUrl: `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svgText)}`,
        })
      })
      .catch(() => {
        if (isCancelled) return
        window.clearTimeout(timeoutId)
        setMintedImage({ status: 'failed' })
      })
    return () => {
      isCancelled = true
      window.clearTimeout(timeoutId)
    }
  }, [designNumber])
  return mintedImage
}

/** Counts from 1 to `target` once `isRunning`, eased. Reduced motion shows the number at once. */
function useCountUp(target: number, isRunning: boolean): number {
  const [countedValue, setCountedValue] = useState(1)
  useEffect(() => {
    if (!isRunning) return
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      setCountedValue(target)
      return
    }
    let animationFrameId = 0
    const delayId = window.setTimeout(() => {
      const startMilliseconds = performance.now()
      const step = (nowMilliseconds: number) => {
        const progress = Math.min(
          1,
          (nowMilliseconds - startMilliseconds) / FOUNDER_COUNT_MILLISECONDS,
        )
        const easedProgress = 1 - (1 - progress) ** 3
        setCountedValue(Math.max(1, Math.round(target * easedProgress)))
        if (progress < 1) animationFrameId = requestAnimationFrame(step)
      }
      animationFrameId = requestAnimationFrame(step)
    }, FOUNDER_COUNT_DELAY_MILLISECONDS)
    return () => {
      window.clearTimeout(delayId)
      cancelAnimationFrame(animationFrameId)
    }
  }, [target, isRunning])
  return countedValue
}
