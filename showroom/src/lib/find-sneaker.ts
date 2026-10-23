import { PASS_DESIGN_COUNT, type PassDesign, passDesigns, readPassDesign } from './sneaker-design'

// Find a Sneaker (brief §10, D-066): a number (1 to 1,000, with or without `#` and leading zeros)
// or any part of a name, matched against the design table that ships with the page.

export const FIND_RESULT_LIMIT = 6

const DESIGN_NUMBER_PATTERN = /^#?(\d{1,4})$/

/** The deep link's `?pass=`: "137", "0137" or "#0137" → 137; anything else → null. */
export function readDeepLinkDesignNumber(text: string): number | null {
  const match = DESIGN_NUMBER_PATTERN.exec(text.trim())
  if (match === null) return null
  const designNumber = Number(match[1])
  return readPassDesign(designNumber) === undefined ? null : designNumber
}

export function findSneakerDesigns(query: string): readonly PassDesign[] {
  const trimmed = query.trim().toLowerCase()
  if (trimmed === '') return []
  const numberMatch = DESIGN_NUMBER_PATTERN.exec(trimmed)
  if (numberMatch !== null) {
    const design = readPassDesign(Number(numberMatch[1]))
    return design === undefined ? [] : [design]
  }
  const words = trimmed.replace(/^#/, '').split(/\s+/)
  return passDesigns
    .filter((design) => {
      const name = design.name.toLowerCase()
      return words.every((word) => name.includes(word))
    })
    .slice(0, FIND_RESULT_LIMIT)
}

/** "Surprise me": any design but the one already on the stand (D-068: no minted state). */
export function pickSurpriseDesignNumber({
  standDesignNumber,
  random = Math.random,
}: {
  standDesignNumber: number
  random?: () => number
}): number {
  // One of the other 999, counted on from the stand's design.
  const offset = 1 + Math.min(Math.floor(random() * (PASS_DESIGN_COUNT - 1)), PASS_DESIGN_COUNT - 2)
  return ((standDesignNumber - 1 + offset) % PASS_DESIGN_COUNT) + 1
}
