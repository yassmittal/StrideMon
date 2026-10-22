import { PASS_DESIGN_COUNT, type PassDesign, passDesigns, readPassDesign } from './sneaker-design'

// Find a Sneaker (brief §10, D-066): a number (1 to 1,000, with or without `#` and leading zeros)
// or any part of a name, matched against the design table that ships with the page, so it works
// even when the API doesn't answer.

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

/**
 * "Surprise me": a design nobody has minted or is minting, never the one already on the stand. Any
 * design when the minted state is unknown (an empty set), D-063 §10, #5.
 */
export function pickSurpriseDesignNumber({
  takenDesignNumbers,
  standDesignNumber,
  random = Math.random,
}: {
  takenDesignNumbers: ReadonlySet<number>
  standDesignNumber: number
  random?: () => number
}): number {
  const candidates = passDesigns
    .map((design) => design.designNumber)
    .filter(
      (designNumber) => !takenDesignNumbers.has(designNumber) && designNumber !== standDesignNumber,
    )
  if (candidates.length === 0) {
    // All taken: any design but the one on the stand.
    return (standDesignNumber % PASS_DESIGN_COUNT) + 1
  }
  return candidates[Math.floor(random() * candidates.length)] ?? standDesignNumber
}
