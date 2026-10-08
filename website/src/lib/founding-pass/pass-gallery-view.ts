import { type PassCollection, readPassAvailability } from './pass-collection'
import {
  compareRarity,
  PASS_DESIGN_COUNT,
  type PassDesign,
  type PassRarity,
  passDesigns,
} from './pass-design'

// The gallery's filters, sort, search, "Surprise me" and match quiz: views over the design table
// that ships with the page (D-044). Only the minted state comes from the API.

export type PassGalleryFilters = {
  templateIndexes: readonly number[]
  colorFamilyIndexes: readonly number[]
  rarities: readonly PassRarity[]
  /** Option values by slot index. Used only while exactly one template is chosen. */
  optionValueIndexesBySlot: Readonly<Record<number, readonly number[]>>
  isAvailableOnly: boolean
  isFavouritesOnly: boolean
}

export const PASS_GALLERY_SORTS = ['number', 'rarity', 'recentlyMinted'] as const
export type PassGallerySort = (typeof PASS_GALLERY_SORTS)[number]

export const emptyPassGalleryFilters: PassGalleryFilters = {
  templateIndexes: [],
  colorFamilyIndexes: [],
  rarities: [],
  optionValueIndexesBySlot: {},
  isAvailableOnly: false,
  isFavouritesOnly: false,
}

export function countActiveFilters(filters: PassGalleryFilters): number {
  return (
    filters.templateIndexes.length +
    filters.colorFamilyIndexes.length +
    filters.rarities.length +
    Object.values(filters.optionValueIndexesBySlot).reduce(
      (valueCount, valueIndexes) => valueCount + valueIndexes.length,
      0,
    ) +
    (filters.isAvailableOnly ? 1 : 0) +
    (filters.isFavouritesOnly ? 1 : 0)
  )
}

/** The single chosen template, whose details (option slots) can then be filtered. */
export function readSingleChosenTemplateIndex(filters: PassGalleryFilters): number | null {
  const [templateIndex] = filters.templateIndexes
  return filters.templateIndexes.length === 1 && templateIndex !== undefined ? templateIndex : null
}

export function listGalleryDesigns({
  filters,
  sort,
  collection,
  favouriteDesignNumbers,
}: {
  filters: PassGalleryFilters
  sort: PassGallerySort
  collection: PassCollection | null
  favouriteDesignNumbers: readonly number[]
}): PassDesign[] {
  const favourites = new Set(favouriteDesignNumbers)
  const singleTemplateIndex = readSingleChosenTemplateIndex(filters)
  const matchingDesigns = passDesigns.filter((design) => {
    if (filters.isFavouritesOnly && !favourites.has(design.designNumber)) return false
    if (
      filters.isAvailableOnly &&
      collection !== null &&
      readPassAvailability(collection, design.designNumber) !== 'available'
    ) {
      return false
    }
    if (!matchesChoice(filters.templateIndexes, design.templateIndex)) return false
    if (!matchesChoice(filters.colorFamilyIndexes, design.colorFamilyIndex)) return false
    if (!matchesChoice(filters.rarities, design.rarity)) return false
    if (singleTemplateIndex === null) return true
    return design.options.every((option, slotIndex) =>
      matchesChoice(filters.optionValueIndexesBySlot[slotIndex] ?? [], option.valueIndex),
    )
  })
  return sortGalleryDesigns(matchingDesigns, sort, collection)
}

function matchesChoice<Choice>(chosen: readonly Choice[], value: Choice): boolean {
  return chosen.length === 0 || chosen.includes(value)
}

function sortGalleryDesigns(
  designs: PassDesign[],
  sort: PassGallerySort,
  collection: PassCollection | null,
): PassDesign[] {
  if (sort === 'rarity') {
    return designs.sort(
      (left, right) =>
        compareRarity(right.rarity, left.rarity) || left.designNumber - right.designNumber,
    )
  }
  if (sort === 'recentlyMinted' && collection !== null) {
    // The API names the order of the last 10 mints only. Then the other minted ones, then the
    // ones being minted, then the rest.
    const recentRankByDesignNumber = new Map(
      collection.recentMints.map((recentMint, rank) => [recentMint.designNumber, rank]),
    )
    const readGroup = (design: PassDesign): number => {
      if (recentRankByDesignNumber.has(design.designNumber)) return 0
      const availability = readPassAvailability(collection, design.designNumber)
      return availability === 'minted' ? 1 : availability === 'pending' ? 2 : 3
    }
    return designs.sort(
      (left, right) =>
        readGroup(left) - readGroup(right) ||
        (recentRankByDesignNumber.get(left.designNumber) ?? 0) -
          (recentRankByDesignNumber.get(right.designNumber) ?? 0) ||
        left.designNumber - right.designNumber,
    )
  }
  return designs.sort((left, right) => left.designNumber - right.designNumber)
}

/** "#0137", "0137" or "137" → 137. Null for anything that isn't a pass number. */
export function parsePassNumberSearch(searchText: string): number | null {
  const digits = searchText.trim().replace(/^#/, '')
  if (!/^\d{1,4}$/.test(digits)) return null
  const designNumber = Number(digits)
  return designNumber >= 1 && designNumber <= PASS_DESIGN_COUNT ? designNumber : null
}

/** One random pass nobody has taken, or null when none is left. */
export function pickSurprisePassDesign(takenDesignNumbers: ReadonlySet<number>): PassDesign | null {
  const availableDesigns = passDesigns.filter(
    (design) => !takenDesignNumbers.has(design.designNumber),
  )
  return availableDesigns[Math.floor(Math.random() * availableDesigns.length)] ?? null
}

export type PassQuizMatchRule = {
  colorFamilyKeys: readonly string[]
  templateKeys: readonly string[]
  colorwayKeys: readonly string[]
}

// What each answer is worth (D-044): the colour shows most, then the silhouette, then the shades.
const COLOR_MATCH_SCORE = 3
const STYLE_MATCH_SCORE = 2
const WALK_TIME_MATCH_SCORE = 1

/**
 * Every pass nobody has taken, best match first. Ties are shuffled by the answers, so each set of
 * answers gets its own order, and the same answers always get the same one.
 */
export function rankPassQuizMatches({
  rule,
  answerKey,
  takenDesignNumbers,
}: {
  rule: PassQuizMatchRule
  /** The answers as one string, the seed for the tie order. */
  answerKey: string
  takenDesignNumbers: ReadonlySet<number>
}): PassDesign[] {
  return passDesigns
    .filter((design) => !takenDesignNumbers.has(design.designNumber))
    .map((design) => ({
      design,
      matchScore:
        (rule.colorFamilyKeys.includes(design.colorFamily.key) ? COLOR_MATCH_SCORE : 0) +
        (rule.templateKeys.includes(design.template.key) ? STYLE_MATCH_SCORE : 0) +
        (rule.colorwayKeys.includes(design.colorway.key) ? WALK_TIME_MATCH_SCORE : 0),
      tieOrder: hashText(`${answerKey}:${design.designNumber}`),
    }))
    .sort((left, right) => right.matchScore - left.matchScore || left.tieOrder - right.tieOrder)
    .map((candidate) => candidate.design)
}

/** FNV-1a, 32-bit: a stable shuffle key, not for anything secret. */
function hashText(text: string): number {
  let hash = 0x811c9dc5
  for (let characterIndex = 0; characterIndex < text.length; characterIndex++) {
    hash ^= text.charCodeAt(characterIndex)
    hash = Math.imul(hash, 0x01000193)
  }
  return hash >>> 0
}
