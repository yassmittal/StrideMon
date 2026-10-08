import type { Design } from '../art-system/types'
import { GENERATOR_SEED } from '../generator/generate-designs'
import { DESIGNS_PER_BLOCK } from '../generator/order-designs'
import { renderPassCardSvg } from '../render-pass-card'
import { buildCardSheet } from './sheet-layout'
import {
  buildAvailablePassCard,
  buildPassCard,
  formatDesignNumber,
  type PreviewFile,
} from './showcase'

/** The sheets that show the generated collection: the first 100, the card states, the Legendaries. */
const SHEET_PNG_WIDTH_PIXELS = 2400
const DESIGNS_SHEET_PNG_WIDTH_PIXELS = 3200
const SINGLE_CARD_PNG_WIDTH_PIXELS = 1000
/** The pass the card sheet shows, as in the brief's own example: #0137, Founder 042. */
const SHOWCASE_DESIGN_NUMBER = 137
const SHOWCASE_FOUNDER_NUMBER = 42

const CARD_STATES = [
  {
    key: 'available',
    caption: 'AVAILABLE · IN THE GALLERY',
    lacingStage: 'unlaced',
    founderNumber: null,
    hasGoldFrame: false,
  },
  {
    key: 'minted',
    caption: 'MINTED · FOUNDER 042',
    lacingStage: 'unlaced',
    founderNumber: SHOWCASE_FOUNDER_NUMBER,
    hasGoldFrame: false,
  },
  {
    key: 'laced',
    caption: 'LACED · AFTER THE FIRST WALK',
    lacingStage: 'laced',
    founderNumber: SHOWCASE_FOUNDER_NUMBER,
    hasGoldFrame: false,
  },
  {
    key: 'gold-frame',
    caption: 'GOLD FRAME · 1 IN 10 AT MINT',
    lacingStage: 'laced',
    founderNumber: SHOWCASE_FOUNDER_NUMBER,
    hasGoldFrame: true,
  },
] as const

/** The first block of designs exactly as the gallery would show them: available, unlaced. */
export function buildFirstDesignsSheet(designs: readonly Design[]): PreviewFile {
  const blockDesigns = designs.slice(0, DESIGNS_PER_BLOCK)
  const firstNumber = formatDesignNumber(blockDesigns[0]?.designNumber ?? 1)
  const lastNumber = formatDesignNumber(blockDesigns.at(-1)?.designNumber ?? DESIGNS_PER_BLOCK)
  return {
    fileName: `3-designs-${firstNumber}-${lastNumber}`,
    pngWidthPixels: DESIGNS_SHEET_PNG_WIDTH_PIXELS,
    svg: buildCardSheet({
      title: `DESIGNS #${firstNumber}–#${lastNumber} · SEED ${GENERATOR_SEED}`,
      subtitle: 'As the generator picks them, as the gallery shows them: available and unlaced.',
      cells: blockDesigns.map((design) => ({
        card: buildAvailablePassCard(design),
        caption: null,
        clipPathId: `pass${design.designNumber}`,
      })),
      columnCount: 10,
    }),
  }
}

/** The pass card in its four states, as one sheet and as one SVG per state. */
export function buildCardStateFiles(designs: readonly Design[]): PreviewFile[] {
  const design = designs.find((candidate) => candidate.designNumber === SHOWCASE_DESIGN_NUMBER)
  if (design === undefined) throw new Error(`No design #${SHOWCASE_DESIGN_NUMBER}`)
  const designLabel = formatDesignNumber(design.designNumber)
  const stateCards = CARD_STATES.map((state) => ({
    state,
    card: buildPassCard({ design, ...state }),
  }))
  const statesSheet: PreviewFile = {
    fileName: '4-pass-card-states',
    pngWidthPixels: SHEET_PNG_WIDTH_PIXELS,
    svg: buildCardSheet({
      title: `THE PASS CARD · #${designLabel} ${design.name.toUpperCase()}`,
      subtitle: 'Square, for the NFT image. Quiet card, loud shoe.',
      cells: stateCards.map(({ state, card }) => ({
        card,
        caption: state.caption,
        clipPathId: `state-${state.key}`,
      })),
      columnCount: CARD_STATES.length,
    }),
  }
  const singleCards = stateCards.map(({ state, card }) => ({
    fileName: `pass-${designLabel}-${state.key}`,
    svg: renderPassCardSvg(card),
    pngWidthPixels: SINGLE_CARD_PNG_WIDTH_PIXELS,
  }))
  return [statesSheet, ...singleCards]
}

/** The Legendaries (Prism, one per template), as the gallery would show them. */
export function buildLegendariesSheet(designs: readonly Design[]): PreviewFile {
  const legendaries = designs.filter((design) => design.rarity === 'legendary')
  return {
    fileName: '7-legendaries',
    pngWidthPixels: SHEET_PNG_WIDTH_PIXELS,
    svg: buildCardSheet({
      title: `THE ${legendaries.length} LEGENDARIES · PRISM`,
      subtitle: 'One per template, one per sheet of 100. Five hues instead of five shades.',
      cells: legendaries.map((design) => ({
        card: buildAvailablePassCard(design),
        caption: null,
        clipPathId: `legendary${design.designNumber}`,
      })),
      columnCount: 5,
    }),
  }
}
