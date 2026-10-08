import type { Design } from '../art-system/types'
import { GENERATOR_SEED } from '../generator/generate-designs'
import { DESIGNS_PER_BLOCK } from '../generator/order-designs'
import { renameClipPath } from './rendered-art'
import { buildCardSheet } from './sheet-layout'
import { formatDesignNumber, type PreviewPlan } from './showcase'

/** Where the review stands, for the contact sheets' titles and captions. */
export type ReviewStatus = {
  roundCount: number
  /** The designs the latest round re-rolled: the ones Yash needs to look at again. */
  rerolledInLatestRound: ReadonlySet<number>
  frozenOn: string | null
}

/** The sheets that show the collection: the ten contact sheets, the card states, the Legendaries. */
const SHEET_PNG_WIDTH_PIXELS = 2400
const CONTACT_SHEET_PNG_WIDTH_PIXELS = 3200
const SINGLE_CARD_PNG_WIDTH_PIXELS = 1000
const CONTACT_SHEET_COLUMN_COUNT = 10
/** The pass the card sheet shows, as in the brief's own example: #0137, Founder 042. */
const SHOWCASE_DESIGN_NUMBER = 137
const SHOWCASE_FOUNDER_NUMBER = 42

const CARD_STATES = [
  {
    key: 'available',
    caption: 'AVAILABLE · IN THE GALLERY',
    isMinted: false,
    isLaced: false,
    hasGoldFrame: false,
  },
  {
    key: 'minted',
    caption: 'MINTED · FOUNDER 042',
    isMinted: true,
    isLaced: false,
    hasGoldFrame: false,
  },
  {
    key: 'laced',
    caption: 'LACED · AFTER THE FIRST WALK',
    isMinted: true,
    isLaced: true,
    hasGoldFrame: false,
  },
  {
    key: 'gold-frame',
    caption: 'GOLD FRAME · 1 IN 10 AT MINT',
    isMinted: true,
    isLaced: true,
    hasGoldFrame: true,
  },
] as const

/**
 * The review's ten contact sheets: each block of 100 exactly as the gallery shows it, drawn by
 * the Solidity renderer. Designs the latest round re-rolled say so under the card.
 */
export function planContactSheets(
  designs: readonly Design[],
  reviewStatus: ReviewStatus,
): PreviewPlan[] {
  const blockCount = Math.ceil(designs.length / DESIGNS_PER_BLOCK)
  return Array.from({ length: blockCount }, (_, blockIndex) => {
    const blockDesigns = designs.slice(
      blockIndex * DESIGNS_PER_BLOCK,
      (blockIndex + 1) * DESIGNS_PER_BLOCK,
    )
    const firstNumber = formatDesignNumber(blockDesigns[0]?.designNumber ?? 1)
    const lastNumber = formatDesignNumber(blockDesigns.at(-1)?.designNumber ?? DESIGNS_PER_BLOCK)
    return {
      fileName: `3-designs-${firstNumber}-${lastNumber}`,
      pngWidthPixels: CONTACT_SHEET_PNG_WIDTH_PIXELS,
      cardRequests: [],
      sneakerRequests: [],
      composeSvg: (renderedArt) =>
        buildCardSheet({
          title: `DESIGNS #${firstNumber}–#${lastNumber} · SHEET ${blockIndex + 1} OF ${blockCount}`,
          subtitle: describeReview(blockDesigns, reviewStatus),
          cells: blockDesigns.map((design) => ({
            svg: renderedArt.readDesignCardSvg(design.designNumber),
            caption: reviewStatus.rerolledInLatestRound.has(design.designNumber)
              ? `NEW IN ROUND ${reviewStatus.roundCount}`
              : null,
          })),
          columnCount: CONTACT_SHEET_COLUMN_COUNT,
        }),
    }
  })
}

/** The pass card in its four states, as one sheet and as one SVG per state. */
export function planCardStateFiles(designs: readonly Design[]): PreviewPlan[] {
  const design = designs.find((candidate) => candidate.designNumber === SHOWCASE_DESIGN_NUMBER)
  if (design === undefined) throw new Error(`No design #${SHOWCASE_DESIGN_NUMBER}`)
  const designLabel = formatDesignNumber(design.designNumber)
  const cardRequests = CARD_STATES.map((state) => ({
    fileName: `pass-${designLabel}-${state.key}`,
    designNumber: design.designNumber,
    isMinted: state.isMinted,
    founderNumber: state.isMinted ? SHOWCASE_FOUNDER_NUMBER : 0,
    hasGoldFrame: state.hasGoldFrame,
    isLaced: state.isLaced,
  }))
  const statesSheet: PreviewPlan = {
    fileName: '4-pass-card-states',
    pngWidthPixels: SHEET_PNG_WIDTH_PIXELS,
    cardRequests,
    sneakerRequests: [],
    composeSvg: (renderedArt) =>
      buildCardSheet({
        title: `THE PASS CARD · #${designLabel} ${design.name.toUpperCase()}`,
        subtitle: 'Square, for the NFT image. Quiet card, loud shoe.',
        cells: CARD_STATES.map((state, stateIndex) => ({
          // All four are one design, so each needs its own clip path id on the sheet.
          svg: renameClipPath(
            renderedArt.readCardSvg(cardRequests[stateIndex]?.fileName ?? ''),
            `pass${design.designNumber}`,
            `state-${state.key}`,
          ),
          caption: state.caption,
        })),
        columnCount: CARD_STATES.length,
      }),
  }
  const singleCards = cardRequests.map(
    (cardRequest): PreviewPlan => ({
      fileName: cardRequest.fileName,
      pngWidthPixels: SINGLE_CARD_PNG_WIDTH_PIXELS,
      cardRequests: [],
      sneakerRequests: [],
      composeSvg: (renderedArt) => renderedArt.readCardSvg(cardRequest.fileName),
    }),
  )
  return [statesSheet, ...singleCards]
}

/** The Legendaries (Prism, one per template, each with its own name), as the gallery shows them. */
export function planLegendariesSheet(designs: readonly Design[]): PreviewPlan {
  const legendaries = designs.filter((design) => design.rarity === 'legendary')
  return {
    fileName: '7-legendaries',
    pngWidthPixels: SHEET_PNG_WIDTH_PIXELS,
    cardRequests: [],
    sneakerRequests: [],
    composeSvg: (renderedArt) =>
      buildCardSheet({
        title: `THE ${legendaries.length} LEGENDARIES · PRISM`,
        subtitle:
          'One per template, one per sheet of 100, each named after a rare light in the sky.',
        cells: legendaries.map((design) => ({
          svg: renderedArt.readDesignCardSvg(design.designNumber),
          caption: null,
        })),
        columnCount: 5,
      }),
  }
}

function describeReview(blockDesigns: readonly Design[], reviewStatus: ReviewStatus): string {
  if (reviewStatus.frozenOn !== null)
    return `Frozen on ${reviewStatus.frozenOn}. Seed ${GENERATOR_SEED}.`
  if (reviewStatus.roundCount === 0) {
    return `Seed ${GENERATOR_SEED}, before any review. Mark the numbers you want re-rolled.`
  }
  const rerolledCount = blockDesigns.filter((design) =>
    reviewStatus.rerolledInLatestRound.has(design.designNumber),
  ).length
  return `Seed ${GENERATOR_SEED}, after review round ${reviewStatus.roundCount}: ${rerolledCount} re-rolled on this sheet.`
}
