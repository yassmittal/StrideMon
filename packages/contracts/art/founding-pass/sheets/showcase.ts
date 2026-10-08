import { readColorFamily } from '../art-system/color-families'
import { readColorway } from '../art-system/colorways'
import { readLaceColor } from '../art-system/lace-colors'
import { resolveSneakerArtwork } from '../art-system/resolve-design'
import type {
  ColorFamilyKey,
  Design,
  LacingStage,
  OptionValue,
  SneakerTemplate,
} from '../art-system/types'
import type { PassCard } from '../render-pass-card'
import type { SneakerArtwork } from '../render-sneaker'

/** One file in previews/: the SVG, and how wide its PNG should be. */
export type PreviewFile = { fileName: string; svg: string; pngWidthPixels: number }

/** The family and colourway the template and option sheets use, so only the shapes change. */
const SHOWCASE_FAMILY_KEY: ColorFamilyKey = 'ember'
export const SHOWCASE_COLORWAY_KEY = 'day'

const DESIGN_NUMBER_DIGITS = 4

/** A Sneaker in the showcase family and colourway, with each slot's first value and cream laces. */
export function buildShowcaseArtwork({
  template,
  lacingStage,
  colorFamilyKey = SHOWCASE_FAMILY_KEY,
  colorwayKey = SHOWCASE_COLORWAY_KEY,
  optionValues = template.optionSlots.map((optionSlot) => readFirstValue(optionSlot.values)),
}: {
  template: SneakerTemplate
  lacingStage: LacingStage
  colorFamilyKey?: ColorFamilyKey
  colorwayKey?: string
  optionValues?: readonly OptionValue[]
}): SneakerArtwork {
  return {
    template,
    colorFamily: readColorFamily(colorFamilyKey),
    colorway: readColorway(colorwayKey),
    optionValues,
    laceColor: readLaceColor('cream'),
    lacingStage,
  }
}

export function buildPassCard({
  design,
  lacingStage,
  founderNumber,
  hasGoldFrame,
}: {
  design: Design
  lacingStage: LacingStage
  founderNumber: number | null
  hasGoldFrame: boolean
}): PassCard {
  return {
    designNumber: design.designNumber,
    name: design.name,
    rarity: design.rarity,
    artwork: resolveSneakerArtwork(design.layers, lacingStage),
    founderNumber,
    hasGoldFrame,
  }
}

/** How the gallery shows a design that nobody has minted yet. */
export function buildAvailablePassCard(design: Design): PassCard {
  return buildPassCard({ design, lacingStage: 'unlaced', founderNumber: null, hasGoldFrame: false })
}

export function readFirstValue(values: readonly OptionValue[]): OptionValue {
  const [firstValue] = values
  if (firstValue === undefined) throw new Error('An option slot needs at least one value')
  return firstValue
}

export function formatDesignNumber(designNumber: number): string {
  return String(designNumber).padStart(DESIGN_NUMBER_DIGITS, '0')
}

/** "EMBER DAY": the showcase family and colourway, as sheet titles show them. */
export function formatShowcaseLook(): string {
  const colorFamily = readColorFamily(SHOWCASE_FAMILY_KEY)
  const colorway = readColorway(SHOWCASE_COLORWAY_KEY)
  return `${colorFamily.label} ${colorway.label}`.toUpperCase()
}
