import type { FoundingPassDesign } from '@stridemon/chain/founding-pass-designs'
import { FOUNDING_PASS_DESIGN_COUNT } from '@stridemon/shared/domain'

const BITS_PER_BITMAP_WORD = 256n

/**
 * The design numbers set in `FoundingPass.mintedBitmap()`, ascending. Bit n of the 1,024 is
 * design n, in word n / 256 (D-042), so bit 0 is never read.
 */
export function toMintedDesignNumbers(mintedBitmapWords: readonly bigint[]): number[] {
  const mintedDesignNumbers: number[] = []
  for (let designNumber = 1; designNumber <= FOUNDING_PASS_DESIGN_COUNT; designNumber++) {
    const bitIndex = BigInt(designNumber)
    const word = mintedBitmapWords[Number(bitIndex / BITS_PER_BITMAP_WORD)] ?? 0n
    if (((word >> (bitIndex % BITS_PER_BITMAP_WORD)) & 1n) === 1n) {
      mintedDesignNumbers.push(designNumber)
    }
  }
  return mintedDesignNumbers
}

// How much each shared layer counts. A shared template matters most: it's the silhouette.
const SAME_TEMPLATE_SCORE = 8
const SAME_COLOR_FAMILY_SCORE = 4
const SAME_COLORWAY_SCORE = 2
const SAME_OPTION_SCORE = 1
const SAME_RARITY_SCORE = 1

/**
 * The designs still free that look most like `designNumber`, for "#0137 was just minted, try one
 * of these" (D-043): the most shared layers first, then the nearest number.
 */
export function findSimilarAvailableDesignNumbers({
  designNumber,
  designs,
  takenDesignNumbers,
  count,
}: {
  designNumber: number
  designs: readonly FoundingPassDesign[]
  takenDesignNumbers: ReadonlySet<number>
  count: number
}): number[] {
  const targetDesign = designs[designNumber - 1]
  if (targetDesign === undefined) return []
  return designs
    .filter(
      (design) =>
        design.designNumber !== designNumber && !takenDesignNumbers.has(design.designNumber),
    )
    .map((design) => ({
      designNumber: design.designNumber,
      similarityScore: calculateDesignSimilarityScore(targetDesign, design),
      numberDistance: Math.abs(design.designNumber - designNumber),
    }))
    .sort(
      (left, right) =>
        right.similarityScore - left.similarityScore ||
        left.numberDistance - right.numberDistance ||
        left.designNumber - right.designNumber,
    )
    .slice(0, count)
    .map((candidate) => candidate.designNumber)
}

function calculateDesignSimilarityScore(
  targetDesign: FoundingPassDesign,
  candidateDesign: FoundingPassDesign,
): number {
  const isSameTemplate = candidateDesign.templateKey === targetDesign.templateKey
  // Options belong to a template, so they only compare between designs of the same one.
  const sameOptionCount = isSameTemplate
    ? Object.entries(targetDesign.optionValueKeys).filter(
        ([slotKey, valueKey]) => candidateDesign.optionValueKeys[slotKey] === valueKey,
      ).length
    : 0
  return (
    (isSameTemplate ? SAME_TEMPLATE_SCORE : 0) +
    (candidateDesign.colorFamilyKey === targetDesign.colorFamilyKey ? SAME_COLOR_FAMILY_SCORE : 0) +
    (candidateDesign.colorwayKey === targetDesign.colorwayKey ? SAME_COLORWAY_SCORE : 0) +
    sameOptionCount * SAME_OPTION_SCORE +
    (candidateDesign.rarity === targetDesign.rarity ? SAME_RARITY_SCORE : 0)
  )
}
