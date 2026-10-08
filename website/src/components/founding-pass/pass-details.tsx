'use client'

import { type MouseEvent, type ReactNode, useEffect, useState } from 'react'
import { buildExplorerTokenUrl, foundingPassContract } from '@/content/contracts'
import {
  buildPassShareText,
  passDetailContent,
  passNextStepContent,
  passPromiseLine,
  passScheduleContent,
} from '@/content/founding-pass'
import { sectionIds, siteUrl } from '@/content/site'
import {
  findRecentPassMint,
  listTakenDesignNumbers,
  readPassAvailability,
} from '@/lib/founding-pass/pass-collection'
import {
  buildPassPagePath,
  findSimilarPassDesigns,
  formatPassNumber,
  listRareLayers,
  type PassDesign,
  passRarityLabels,
  readPassDesign,
} from '@/lib/founding-pass/pass-design'
import { isMintingPhase } from '@/lib/founding-pass/pass-schedule'
import { retryPassCollection, usePassCollection } from '@/lib/founding-pass/use-pass-collection'
import { usePassSchedule } from '@/lib/founding-pass/use-pass-schedule'
import { ArrowIcon } from '../ui/arrow-icon'
import { MetaLabel } from '../ui/meta-label'
import { XLogoIcon } from '../ui/x-logo-icon'
import { FavouriteButton } from './favourite-button'
import { MintPassButton } from './mint-pass-button'
import { PassArt } from './pass-art'
import { PassAvailabilityText } from './pass-availability-text'
import { PassRarityBadge } from './pass-rarity-badge'

type PassDetailsProps = {
  /** A number from the table, so the page sends the browser one number, not the whole design. */
  designNumber: number
  /** `h1` on the pass's own page, `h2` in the gallery's sheet. */
  headingLevel: 'h1' | 'h2'
  headingId?: string
  /** In the sheet, a similar pass replaces this one in place. On the page, it's a link. */
  onSelectDesign?: (designNumber: number) => void
  /** The page loads its card at once; the sheet's card is already in the browser's cache. */
  isArtEager?: boolean
}

const SIMILAR_PASS_COUNT = 3
const SCHEDULE_REFRESH_MILLISECONDS = 30_000

/**
 * One pass, in full (D-044): the card, what's happening with it, what to do next, its rarity and
 * layers, the laced look, and three similar passes nobody has minted.
 */
export function PassDetails({
  designNumber,
  headingLevel,
  headingId,
  onSelectDesign,
  isArtEager = false,
}: PassDetailsProps) {
  const { collection, position } = usePassSchedule(SCHEDULE_REFRESH_MILLISECONDS)
  const design = readPassDesign(designNumber)
  if (design === undefined) return null
  const availability = readPassAvailability(collection, design.designNumber)
  const recentMint = findRecentPassMint(collection, design.designNumber)
  const isTaken = availability === 'minted' || availability === 'pending'
  const similarDesigns = findSimilarPassDesigns({
    designNumber: design.designNumber,
    takenDesignNumbers: listTakenDesignNumbers(collection),
    count: SIMILAR_PASS_COUNT,
  })
  const Heading = headingLevel
  // The sections sit one level under the name, so the outline never skips a level.
  const SectionHeading = headingLevel === 'h1' ? 'h2' : 'h3'
  const rareLayers = listRareLayers(design)
  const passNumberText = formatPassNumber(design.designNumber)

  return (
    <div className="grid grid-cols-1 gap-8 md:grid-cols-12 md:gap-6">
      <div className="flex flex-col gap-2.5 md:sticky md:top-4 md:col-span-6 md:self-start">
        <div className="overflow-hidden rounded-panel ring-1 ring-hairline">
          <PassArt design={design} view="card" isEager={isArtEager} />
        </div>
        <p className="text-label font-medium tracking-[0.08em] text-ink-secondary-small uppercase">
          {passPromiseLine}
        </p>
      </div>

      <div className="flex flex-col gap-8 md:col-span-6">
        <header className="flex flex-col gap-4">
          <MetaLabel items={['Founding Pass', passNumberText, passDetailContent.oneOfOne]} />
          <Heading
            id={headingId}
            className="-ml-[0.03em] text-[clamp(2.25rem,6vw,3.75rem)] leading-[0.95] tracking-[-0.01em] text-balance"
          >
            {design.name}
          </Heading>
          <div className="flex flex-wrap items-center gap-x-3 gap-y-1.5">
            <PassRarityBadge rarity={design.rarity} />
            <AvailabilityLine
              availability={availability}
              hasCollection={collection !== null}
              recentMint={recentMint}
            />
          </div>
          {isTaken ? (
            <p className="text-lg leading-[1.4]">{passDetailContent.takenNextStep}</p>
          ) : position !== null ? (
            <p className="text-lg leading-[1.4]">
              {passNextStepContent[position.phase]}{' '}
              {position.phase === 'preview' ? (
                <a
                  href={`/pass#${sectionIds.waitlist}`}
                  className="underline decoration-hairline underline-offset-4"
                >
                  {passScheduleContent.joinWaitlistLabel}
                </a>
              ) : null}
            </p>
          ) : null}
          {position !== null && isMintingPhase(position.phase) && !isTaken ? (
            <MintPassButton designNumber={design.designNumber} />
          ) : null}
          <div className="flex flex-wrap gap-2">
            <FavouriteButton designNumber={design.designNumber} appearance="pill" />
            <CopyPassLinkButton designNumber={design.designNumber} />
            <a
              href={buildPostOnXUrl(design, passNumberText)}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex h-10 items-center gap-2 rounded-full bg-surface-muted px-4 text-xs leading-[1.15] font-medium uppercase transition-colors duration-300 ease-standard active:bg-surface"
            >
              <XLogoIcon />
              {passDetailContent.postOnXLabel}
            </a>
            {onSelectDesign ? (
              <a
                href={buildPassPagePath(design.designNumber)}
                className="group inline-flex h-10 items-center gap-2 rounded-full px-2 text-xs leading-[1.15] font-medium uppercase"
              >
                {passDetailContent.openPageLabel}
                <ArrowIcon className="transition-transform duration-300 ease-standard group-hover:translate-x-[3px]" />
              </a>
            ) : null}
          </div>
          {availability === 'minted' ? (
            <a
              href={buildExplorerTokenUrl(foundingPassContract.address, design.designNumber)}
              target="_blank"
              rel="noopener noreferrer"
              className="group inline-flex min-h-11 items-center gap-2 self-start text-label font-medium tracking-[0.08em] uppercase"
            >
              {passDetailContent.explorerLabel}
              <ArrowIcon className="transition-transform duration-300 ease-standard group-hover:translate-x-[3px]" />
            </a>
          ) : null}
        </header>

        <section className="flex flex-col gap-3 border-t border-hairline pt-5">
          <SectionHeading className="text-label font-medium tracking-[0.08em] text-ink-secondary-small uppercase">
            {passDetailContent.rarityHeading}
          </SectionHeading>
          <p className="text-lg leading-[1.4]">
            {rareLayers.length === 0
              ? passDetailContent.rarityCommonReason
              : `${passRarityLabels[design.rarity]} ${passDetailContent.rarityReasonJoiner} ${joinWords(rareLayers)}.`}
          </p>
          <p className="text-sm leading-[1.4] text-ink-secondary-small">
            {passDetailContent.rarityNote}
          </p>
        </section>

        <section className="flex flex-col gap-3 border-t border-hairline pt-5">
          <SectionHeading className="text-label font-medium tracking-[0.08em] text-ink-secondary-small uppercase">
            {passDetailContent.layersHeading}
          </SectionHeading>
          <dl className="grid grid-cols-[auto_1fr] gap-x-6 gap-y-2.5 text-base leading-[1.35]">
            <LayerRow label={passDetailContent.templateLabel} value={design.template.label}>
              <span className="block text-sm text-ink-secondary-small">
                {design.template.description}
              </span>
            </LayerRow>
            <LayerRow
              label={passDetailContent.colorFamilyLabel}
              value={design.colorFamily.label}
              rarity={design.colorFamily.rarity}
              prefix={
                <span
                  aria-hidden="true"
                  className="mr-2 inline-block size-3 rounded-full align-[-1px]"
                  style={{ backgroundColor: design.colorFamily.swatchColor }}
                />
              }
            />
            <LayerRow label={passDetailContent.colorwayLabel} value={design.colorway.label} />
            {design.options.map((option) => (
              <LayerRow
                key={option.slot.key}
                label={option.slot.label}
                value={option.value.label}
                rarity={option.value.rarity}
              />
            ))}
            <LayerRow
              label={passDetailContent.lacesLabel}
              value={design.laceColor.label}
              rarity={design.laceColor.rarity}
            />
          </dl>
        </section>

        <section className="flex flex-col gap-3 border-t border-hairline pt-5">
          <SectionHeading className="text-label font-medium tracking-[0.08em] text-ink-secondary-small uppercase">
            {passDetailContent.lacedHeading}
          </SectionHeading>
          <div className="rounded-panel bg-surface px-4 py-2">
            <PassArt design={design} view="laced" />
          </div>
          <p className="text-base leading-[1.4] text-ink-secondary-small">
            {passDetailContent.lacedText}
          </p>
        </section>

        <section className="flex flex-col gap-3 border-t border-hairline pt-5">
          <SectionHeading className="text-label font-medium tracking-[0.08em] text-ink-secondary-small uppercase">
            {passDetailContent.similarHeading}
          </SectionHeading>
          {collection !== null ? (
            <p className="text-sm leading-[1.4] text-ink-secondary-small">
              {passDetailContent.similarTakenNote}
            </p>
          ) : null}
          <ul className="grid grid-cols-3 gap-2.5">
            {similarDesigns.map((similarDesign) => (
              <li key={similarDesign.designNumber}>
                <SimilarPassLink design={similarDesign} onSelectDesign={onSelectDesign} />
              </li>
            ))}
          </ul>
        </section>
      </div>
    </div>
  )
}

function AvailabilityLine({
  availability,
  hasCollection,
  recentMint,
}: {
  availability: ReturnType<typeof readPassAvailability>
  hasCollection: boolean
  recentMint: ReturnType<typeof findRecentPassMint>
}) {
  const { requestStatus } = usePassCollection()
  if (!hasCollection && requestStatus === 'failed') {
    return (
      <span className="flex flex-wrap items-center gap-x-2 text-sm text-ink-secondary-small">
        {passDetailContent.statusUnknown}
        <button
          type="button"
          onClick={retryPassCollection}
          className="min-h-11 underline decoration-hairline underline-offset-4"
        >
          {passScheduleContent.retryLabel}
        </button>
      </span>
    )
  }
  return (
    <PassAvailabilityText
      availability={availability}
      recentMint={recentMint}
      isAvailableShown
      className="font-mono text-sm"
    />
  )
}

/** One layer: its value, a badge when it's rarer than common, and an optional note below. */
function LayerRow({
  label,
  value,
  rarity,
  prefix,
  children,
}: {
  label: string
  value: string
  rarity?: PassDesign['rarity']
  prefix?: ReactNode
  children?: ReactNode
}) {
  return (
    <>
      <dt className="text-ink-secondary-small">{label}</dt>
      <dd>
        {prefix}
        {value}
        {rarity !== undefined && rarity !== 'common' ? (
          <PassRarityBadge rarity={rarity} className="ml-2" />
        ) : null}
        {children}
      </dd>
    </>
  )
}

function SimilarPassLink({
  design,
  onSelectDesign,
}: {
  design: PassDesign
  onSelectDesign?: (designNumber: number) => void
}) {
  function selectInPlace(event: MouseEvent<HTMLAnchorElement>) {
    if (!onSelectDesign || event.metaKey || event.ctrlKey || event.shiftKey || event.button !== 0) {
      return
    }
    event.preventDefault()
    onSelectDesign(design.designNumber)
  }
  return (
    <a
      href={buildPassPagePath(design.designNumber)}
      onClick={selectInPlace}
      className="group flex flex-col overflow-hidden rounded-panel bg-surface"
    >
      <PassArt
        design={design}
        view="shoe"
        className="transition-opacity duration-300 ease-standard group-hover:opacity-85"
      />
      <span className="flex flex-col gap-0.5 px-2.5 pt-2 pb-2.5">
        <span className="font-mono text-[0.6875rem]">{formatPassNumber(design.designNumber)}</span>
        <span className="text-xs leading-[1.25]">{design.name}</span>
      </span>
    </a>
  )
}

const copiedLabelMilliseconds = 1600

function CopyPassLinkButton({ designNumber }: { designNumber: number }) {
  const [isCopied, setIsCopied] = useState(false)

  useEffect(() => {
    if (!isCopied) return
    const timeoutId = window.setTimeout(() => setIsCopied(false), copiedLabelMilliseconds)
    return () => window.clearTimeout(timeoutId)
  }, [isCopied])

  async function copyPassLink() {
    try {
      await navigator.clipboard.writeText(`${siteUrl}${buildPassPagePath(designNumber)}`)
      setIsCopied(true)
    } catch {
      // Clipboard blocked: "Open its page" and the address bar still have the link.
    }
  }

  return (
    <button
      type="button"
      onClick={copyPassLink}
      className="inline-flex h-10 items-center rounded-full bg-surface-muted px-4 text-xs leading-[1.15] font-medium uppercase transition-colors duration-300 ease-standard active:bg-surface"
    >
      <span aria-live="polite">
        {isCopied ? passDetailContent.copiedLabel : passDetailContent.copyLinkLabel}
      </span>
    </button>
  )
}

function buildPostOnXUrl(design: PassDesign, passNumberText: string): string {
  const pageUrl = `${siteUrl}${buildPassPagePath(design.designNumber)}?source=x-share`
  const text = buildPassShareText(passNumberText, design.name)
  return `https://x.com/intent/post?text=${encodeURIComponent(text)}&url=${encodeURIComponent(pageUrl)}`
}

/** "a, b and c". */
function joinWords(words: readonly string[]): string {
  if (words.length <= 1) return words.join('')
  return `${words.slice(0, -1).join(', ')} and ${words.at(-1)}`
}
