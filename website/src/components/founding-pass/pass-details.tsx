'use client'

import { type MouseEvent, useEffect, useState } from 'react'
import { buildExplorerTokenUrl, foundingPassContract } from '@/content/contracts'
import {
  buildPassShareMessage,
  buildPassShareText,
  passDetailContent,
  passNextStepContent,
  passScheduleContent,
} from '@/content/founding-pass'
import { buildShowroomPassUrl, sectionIds, siteUrl } from '@/content/site'
import {
  findRecentPassMint,
  listTakenDesignNumbers,
  readPassAvailability,
} from '@/lib/founding-pass/pass-collection'
import {
  buildPassPagePath,
  findSimilarPassDesigns,
  formatPassNumber,
  type PassDesign,
  readPassDesign,
} from '@/lib/founding-pass/pass-design'
import { isMintingPhase } from '@/lib/founding-pass/pass-schedule'
import { retryPassCollection, usePassCollection } from '@/lib/founding-pass/use-pass-collection'
import { usePassSchedule } from '@/lib/founding-pass/use-pass-schedule'
import { useOwnInviteCode } from '@/lib/waitlist-invites'
import { ArrowIcon } from '../ui/arrow-icon'
import { PillButton } from '../ui/pill-button'
import { ShareLinks } from '../ui/share-links'
import { ShowroomButton } from '../ui/showroom-button'
import { FavouriteButton } from './favourite-button'
import { MintPassButton } from './mint-pass-button'
import { PassArt } from './pass-art'
import { PassStatusPill } from './pass-availability-text'
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
 * One pass, in full (D-044): the card, what's happening with it, what to do next, its layers, the
 * laced look, and three similar passes nobody has minted. The card already says Founding Pass, its
 * number and 1 of 1, so nothing above the name repeats it (D-073).
 */
export function PassDetails({
  designNumber,
  headingLevel,
  headingId,
  onSelectDesign,
  isArtEager = false,
}: PassDetailsProps) {
  const { collection, position } = usePassSchedule(SCHEDULE_REFRESH_MILLISECONDS)
  // A friend who joins through a shared pass counts for this visitor, once they've joined (D-056).
  const ownInviteCode = useOwnInviteCode()
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
  const passNumberText = formatPassNumber(design.designNumber)

  return (
    <div className="grid grid-cols-1 gap-8 md:grid-cols-12 md:gap-6">
      <div className="overflow-hidden rounded-panel ring-1 ring-hairline md:sticky md:top-4 md:col-span-6 md:self-start">
        <PassArt design={design} view="card" isEager={isArtEager} />
      </div>

      <div className="flex flex-col gap-8 md:col-span-6">
        <header className="flex flex-col gap-4">
          <Heading
            id={headingId}
            className="-ml-[0.03em] text-[clamp(2.25rem,6vw,3.75rem)] leading-[0.95] tracking-[-0.01em] text-balance"
          >
            {design.name}
          </Heading>
          <div className="flex flex-wrap items-center gap-x-3 gap-y-2">
            <AvailabilityLine
              availability={availability}
              hasCollection={collection !== null}
              recentMint={recentMint}
            />
            <PassRarityBadge rarity={design.rarity} />
          </div>
          {isTaken ? (
            <p className="text-lg leading-[1.4]">{passDetailContent.takenNextStep}</p>
          ) : position !== null ? (
            <p className="text-lg leading-[1.4]">{passNextStepContent[position.phase]}</p>
          ) : null}
          {position?.phase === 'preview' && !isTaken ? (
            <PillButton
              href={`/pass#${sectionIds.waitlist}`}
              label={passScheduleContent.joinWaitlistLabel}
              className="self-start"
            />
          ) : null}
          {position !== null && isMintingPhase(position.phase) && !isTaken ? (
            <MintPassButton designNumber={design.designNumber} />
          ) : null}
          <div className="flex flex-wrap gap-2">
            <FavouriteButton designNumber={design.designNumber} appearance="pill" />
            <CopyPassLinkButton designNumber={design.designNumber} />
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
          <ShareLinks
            path={buildPassPagePath(design.designNumber)}
            inviteCode={ownInviteCode}
            messageText={buildPassShareMessage(passNumberText, design.name)}
            xPostText={buildPassShareText(passNumberText, design.name)}
          />
          <ShowroomButton
            href={buildShowroomPassUrl(design.designNumber)}
            label={passDetailContent.showroomLabel}
            className="mt-2 self-start"
          />
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
            {passDetailContent.layersHeading}
          </SectionHeading>
          {/* Tiles, not a list: the label above its value, a badge on a rarer layer (D-073). */}
          <dl className="grid grid-cols-2 gap-2">
            <LayerTile
              label={passDetailContent.templateLabel}
              value={design.template.label}
              note={design.template.description}
              className="col-span-2"
            />
            <LayerTile
              label={passDetailContent.colorFamilyLabel}
              value={design.colorFamily.label}
              rarity={design.colorFamily.rarity}
              swatchColor={design.colorFamily.swatchColor}
            />
            <LayerTile label={passDetailContent.colorwayLabel} value={design.colorway.label} />
            {design.options.map((option) => (
              <LayerTile
                key={option.slot.key}
                label={option.slot.label}
                value={option.value.label}
                rarity={option.value.rarity}
              />
            ))}
            <LayerTile
              label={passDetailContent.lacesLabel}
              value={design.laceColor.label}
              rarity={design.laceColor.rarity}
            />
          </dl>
          <p className="text-sm leading-[1.4] text-ink-secondary-small">
            {passDetailContent.rarityNote}
          </p>
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
  return <PassStatusPill availability={availability} recentMint={recentMint} />
}

/** One layer as a tile: its label, its value, and a badge when it's rarer than common. */
function LayerTile({
  label,
  value,
  rarity,
  swatchColor,
  note,
  className = '',
}: {
  label: string
  value: string
  rarity?: PassDesign['rarity']
  swatchColor?: string
  note?: string
  className?: string
}) {
  return (
    <div className={`flex flex-col gap-1.5 rounded-panel bg-surface px-4 pt-3 pb-3.5 ${className}`}>
      <dt className="flex items-center justify-between gap-2 text-label font-medium tracking-[0.08em] text-ink-secondary-small uppercase">
        {label}
        {rarity !== undefined && rarity !== 'common' ? <PassRarityBadge rarity={rarity} /> : null}
      </dt>
      <dd className="flex items-center gap-2 text-lg leading-[1.2]">
        {swatchColor !== undefined ? (
          <span
            aria-hidden="true"
            className="size-3.5 shrink-0 rounded-full ring-1 ring-hairline"
            style={{ backgroundColor: swatchColor }}
          />
        ) : null}
        {value}
      </dd>
      {note !== undefined ? (
        <dd className="text-sm leading-[1.35] text-ink-secondary-small">{note}</dd>
      ) : null}
    </div>
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
      className="inline-flex h-10 items-center rounded-full bg-surface-muted px-4 text-xs leading-[1.15] font-medium uppercase transition-colors duration-300 ease-standard hover:bg-surface active:bg-surface"
    >
      <span aria-live="polite">
        {isCopied ? passDetailContent.copiedLabel : passDetailContent.copyLinkLabel}
      </span>
    </button>
  )
}
