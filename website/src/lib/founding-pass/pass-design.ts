import { passDesignTables } from '@/content/founding-pass-designs'

// The Founding Pass collection as the site reads it (D-044). The table is generated from the
// frozen designs by `bun run website:export-pass-art`; these types describe its shape.

export const PASS_RARITIES = ['common', 'uncommon', 'rare', 'legendary'] as const
export type PassRarity = (typeof PASS_RARITIES)[number]

export type PassOptionValue = { key: string; label: string; rarity: PassRarity }
export type PassOptionSlot = { key: string; label: string; values: readonly PassOptionValue[] }

export type PassTemplate = {
  key: string
  /** The word in a design's name: "Ember Runner Dusk". */
  label: string
  /** The name of this template's one Legendary (D-041). */
  legendaryName: string
  description: string
  optionSlots: readonly PassOptionSlot[]
}

export type PassColorFamily = {
  key: string
  label: string
  rarity: PassRarity
  /** The family's middle shade, for swatches. */
  swatchColor: string
}

export type PassColorway = { key: string; label: string }
export type PassLaceColor = { key: string; label: string; rarity: PassRarity }

export type PassDesignTables = {
  templates: readonly PassTemplate[]
  colorFamilies: readonly PassColorFamily[]
  colorways: readonly PassColorway[]
  laceColors: readonly PassLaceColor[]
  /**
   * Index n - 1 is design n: template, colour family, colourway, three option value indexes,
   * lace colour and rarity, each an index into the lists above.
   */
  designRows: readonly (readonly number[])[]
}

export type PassDesignOption = {
  slot: PassOptionSlot
  value: PassOptionValue
  valueIndex: number
}

/** One of the 1,000 designs, with its layers resolved to labels. */
export type PassDesign = {
  /** 1 to 1,000: the pass's token id. */
  designNumber: number
  /** "Ember Runner Dusk", or a Legendary's hand-picked name. */
  name: string
  rarity: PassRarity
  templateIndex: number
  template: PassTemplate
  colorFamilyIndex: number
  colorFamily: PassColorFamily
  colorwayIndex: number
  colorway: PassColorway
  options: readonly PassDesignOption[]
  laceColor: PassLaceColor
}

export const PASS_DESIGN_COUNT = 1000

export const passRarityLabels: Record<PassRarity, string> = {
  common: 'Common',
  uncommon: 'Uncommon',
  rare: 'Rare',
  legendary: 'Legendary',
}

export const passDesigns: readonly PassDesign[] = passDesignTables.designRows.map(
  (designRow, designIndex) => resolvePassDesign(designRow, designIndex + 1),
)

export function readPassDesign(designNumber: number): PassDesign | undefined {
  return Number.isInteger(designNumber) ? passDesigns[designNumber - 1] : undefined
}

/** `#0137`: the pass number as the card shows it. */
export function formatPassNumber(designNumber: number): string {
  return `#${String(designNumber).padStart(4, '0')}`
}

/**
 * The card's art space is 1000 × 1000, and every shoe with its shadow sits between y = 252 and
 * 715 (measured on all 1,000). This window shows them centred, without the card's text and
 * hairlines: the grid's crop and the share images' (D-044).
 */
export const PASS_CARD_SHOE_WINDOW = { top: 175, width: 1000, height: 615 } as const

/** The card, exactly as the renderer draws it on-chain before anyone mints it. */
export function buildPassCardArtPath(designNumber: number): string {
  return `/pass-art/cards/${String(designNumber).padStart(4, '0')}.svg`
}

/** The Sneaker alone after its first walk: lace slats in its lace colour. */
export function buildPassLacedArtPath(designNumber: number): string {
  return `/pass-art/laced/${String(designNumber).padStart(4, '0')}.svg`
}

export function buildPassPagePath(designNumber: number): string {
  return `/pass/${designNumber}`
}

export function compareRarity(first: PassRarity, second: PassRarity): number {
  return PASS_RARITIES.indexOf(first) - PASS_RARITIES.indexOf(second)
}

/**
 * The layers that make a design rarer than Common, in words ("the Gold family", "its Cage heel",
 * "its lime laces"), so its label has a reason you can see.
 */
export function listRareLayers(design: PassDesign): string[] {
  const rareLayers: string[] = []
  if (design.colorFamily.rarity !== 'common') {
    rareLayers.push(`the ${design.colorFamily.label} family`)
  }
  for (const option of design.options) {
    if (option.value.rarity !== 'common') {
      rareLayers.push(`its ${option.value.label} ${option.slot.label.toLowerCase()}`)
    }
  }
  if (design.laceColor.rarity !== 'common') {
    rareLayers.push(`its ${design.laceColor.label.toLowerCase()} laces`)
  }
  return rareLayers
}

// How much each shared layer counts, as the API ranks "3 similar passes" (D-043).
const SAME_TEMPLATE_SCORE = 8
const SAME_COLOR_FAMILY_SCORE = 4
const SAME_COLORWAY_SCORE = 2
const SAME_OPTION_SCORE = 1
const SAME_RARITY_SCORE = 1

/**
 * The designs that look most like `designNumber` and aren't taken: the most shared layers first,
 * then the nearest number. The same ranking as the API's (D-043), so the site and a refused mint
 * suggest the same passes.
 */
export function findSimilarPassDesigns({
  designNumber,
  takenDesignNumbers,
  count,
}: {
  designNumber: number
  takenDesignNumbers: ReadonlySet<number>
  count: number
}): PassDesign[] {
  const targetDesign = readPassDesign(designNumber)
  if (targetDesign === undefined) return []
  return passDesigns
    .filter(
      (design) =>
        design.designNumber !== designNumber && !takenDesignNumbers.has(design.designNumber),
    )
    .map((design) => ({
      design,
      similarityScore: calculateSimilarityScore(targetDesign, design),
      numberDistance: Math.abs(design.designNumber - designNumber),
    }))
    .sort(
      (left, right) =>
        right.similarityScore - left.similarityScore ||
        left.numberDistance - right.numberDistance ||
        left.design.designNumber - right.design.designNumber,
    )
    .slice(0, count)
    .map((candidate) => candidate.design)
}

function calculateSimilarityScore(targetDesign: PassDesign, candidateDesign: PassDesign): number {
  const isSameTemplate = candidateDesign.templateIndex === targetDesign.templateIndex
  // Options belong to a template, so they only compare between designs of the same one.
  const sameOptionCount = isSameTemplate
    ? targetDesign.options.filter(
        (option, slotIndex) => candidateDesign.options[slotIndex]?.valueIndex === option.valueIndex,
      ).length
    : 0
  return (
    (isSameTemplate ? SAME_TEMPLATE_SCORE : 0) +
    (candidateDesign.colorFamilyIndex === targetDesign.colorFamilyIndex
      ? SAME_COLOR_FAMILY_SCORE
      : 0) +
    (candidateDesign.colorwayIndex === targetDesign.colorwayIndex ? SAME_COLORWAY_SCORE : 0) +
    sameOptionCount * SAME_OPTION_SCORE +
    (candidateDesign.rarity === targetDesign.rarity ? SAME_RARITY_SCORE : 0)
  )
}

function resolvePassDesign(designRow: readonly number[], designNumber: number): PassDesign {
  const [
    templateIndex = -1,
    colorFamilyIndex = -1,
    colorwayIndex = -1,
    firstValueIndex = -1,
    secondValueIndex = -1,
    thirdValueIndex = -1,
    laceColorIndex = -1,
    rarityIndex = -1,
  ] = designRow
  const template = readTableEntry(passDesignTables.templates, templateIndex, designNumber)
  const colorFamily = readTableEntry(passDesignTables.colorFamilies, colorFamilyIndex, designNumber)
  const colorway = readTableEntry(passDesignTables.colorways, colorwayIndex, designNumber)
  const laceColor = readTableEntry(passDesignTables.laceColors, laceColorIndex, designNumber)
  const rarity = readTableEntry(PASS_RARITIES, rarityIndex, designNumber)
  const options = [firstValueIndex, secondValueIndex, thirdValueIndex].map(
    (valueIndex, slotIndex): PassDesignOption => {
      const slot = readTableEntry(template.optionSlots, slotIndex, designNumber)
      return { slot, value: readTableEntry(slot.values, valueIndex, designNumber), valueIndex }
    },
  )
  return {
    designNumber,
    // The same rule as the renderer (D-041); the export checks it against every card.
    name:
      colorFamily.rarity === 'legendary'
        ? template.legendaryName
        : `${colorFamily.label} ${template.label} ${colorway.label}`,
    rarity,
    templateIndex,
    template,
    colorFamilyIndex,
    colorFamily,
    colorwayIndex,
    colorway,
    options,
    laceColor,
  }
}

function readTableEntry<Entry>(entries: readonly Entry[], index: number, designNumber: number) {
  const entry = entries[index]
  if (entry === undefined) throw new Error(`Design ${designNumber} has a layer outside the table`)
  return entry
}
