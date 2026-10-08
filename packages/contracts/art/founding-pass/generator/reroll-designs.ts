import { COLOR_FAMILIES, readColorFamily } from '../art-system/color-families'
import { COLORWAYS } from '../art-system/colorways'
import { buildDesignName, calculateDesignRarity } from '../art-system/resolve-design'
import { readSneakerTemplate } from '../art-system/templates'
import type { ColorFamily, Colorway, Design, DesignLayers } from '../art-system/types'
import { GENERATOR_SEED } from './generate-designs'
import { pickDetails } from './pick-details'
import { isColorwayReadable } from './plan-designs'
import { createRandomSource, type RandomSource } from './random-source'
import { DESIGNS_FROZEN_ON, REVIEW_ROUNDS, type ReviewRound } from './review-rounds'
import { incrementUsage, rankByUsage, type UsageCounts } from './usage-counts'

/** FNV-1a's 32-bit prime, for mixing the re-roll seed. */
const FNV_PRIME = 0x01000193

type Look = { colorFamily: ColorFamily; colorway: Colorway }

/** Applies every review round in order: the marked designs are re-rolled, the rest stay. */
export function applyReviewRounds(
  designs: readonly Design[],
  reviewRounds: readonly ReviewRound[] = REVIEW_ROUNDS,
): Design[] {
  let reviewedDesigns = [...designs]
  /** Every look Yash has marked, by design number, so a later round never brings one back. */
  const rejectedLayersByNumber = new Map<number, DesignLayers[]>()
  reviewRounds.forEach((reviewRound, roundIndex) => {
    if (DESIGNS_FROZEN_ON !== null && reviewRound.markedOn > DESIGNS_FROZEN_ON) {
      throw new Error(`The designs were frozen on ${DESIGNS_FROZEN_ON}: no round may follow`)
    }
    const markedNumbers = [...reviewRound.designNumbers].sort((first, second) => first - second)
    for (const designNumber of markedNumbers) {
      const markedDesign = reviewedDesigns[designNumber - 1]
      if (markedDesign === undefined || markedDesign.designNumber !== designNumber) {
        throw new Error(`Round ${roundIndex + 1} marks #${designNumber}, which isn't a design`)
      }
      const rejectedLayers = [
        ...(rejectedLayersByNumber.get(designNumber) ?? []),
        markedDesign.layers,
      ]
      rejectedLayersByNumber.set(designNumber, rejectedLayers)
      const rerolledDesign = rerollDesign({
        designs: reviewedDesigns,
        design: markedDesign,
        rejectedLayers,
        randomSource: createRandomSource(deriveRerollSeed(roundIndex + 1, designNumber)),
      })
      reviewedDesigns = reviewedDesigns.map((candidate) =>
        candidate.designNumber === designNumber ? rerolledDesign : candidate,
      )
    }
  })
  return reviewedDesigns
}

/**
 * Draws one design again under the generator's rules, as distinct from its template's other
 * designs as a first pick. It keeps its number, template and rarity, so the blocks of 100, the
 * template counts and the rarity counts all hold. In order, it tries:
 * 1. its own family in a colourway that template and family don't use yet (names stay unique)
 * 2. for an everyday design, another everyday family its neighbours don't have, the family with
 *    the fewest designs first, so the family totals stay about even
 * 3. its own family and colourway with new options
 * and never a look Yash has already marked for this number.
 */
function rerollDesign({
  designs,
  design,
  rejectedLayers,
  randomSource,
}: {
  designs: readonly Design[]
  design: Design
  rejectedLayers: readonly DesignLayers[]
  randomSource: RandomSource
}): Design {
  const template = readSneakerTemplate(design.layers.templateKey)
  const otherDesigns = designs.filter((other) => other.designNumber !== design.designNumber)
  const templateDesigns = otherDesigns
    .filter((other) => other.layers.templateKey === template.key)
    .map((other) => other.layers)
  const usageCounts = countUsage(otherDesigns)
  const candidateLooks = listCandidateLooks({
    designs,
    design,
    templateDesigns,
    usageCounts,
    randomSource,
  })
  // Colours Yash hasn't marked come first; one he marked only comes back with other options.
  const isMarkedColor = ({ colorFamily, colorway }: Look) =>
    rejectedLayers.some(
      (rejected) =>
        rejected.colorFamilyKey === colorFamily.key && rejected.colorwayKey === colorway.key,
    )
  const orderedLooks = [
    ...candidateLooks.filter((look) => !isMarkedColor(look)),
    ...candidateLooks.filter(isMarkedColor),
  ]
  for (const { colorFamily, colorway } of orderedLooks) {
    const layers = pickDetails({
      draft: { template, colorFamily, colorway, targetRarity: design.rarity },
      templateDesigns,
      usageCounts,
      randomSource,
    })
    if (layers === null) continue
    if (rejectedLayers.some((rejected) => hasSameVisibleLayers(layers, rejected))) continue
    return {
      designNumber: design.designNumber,
      layers,
      name: buildDesignName(layers),
      rarity: calculateDesignRarity(layers),
    }
  }
  throw new Error(`#${design.designNumber} can't be re-rolled: no other look fits the rules`)
}

function listCandidateLooks({
  designs,
  design,
  templateDesigns,
  usageCounts,
  randomSource,
}: {
  designs: readonly Design[]
  design: Design
  templateDesigns: readonly DesignLayers[]
  usageCounts: UsageCounts
  randomSource: RandomSource
}): Look[] {
  const ownFamily = readColorFamily(design.layers.colorFamilyKey)
  const listFreeLooks = (colorFamily: ColorFamily): Look[] =>
    rankFreeColorways({ colorFamily, templateDesigns, usageCounts, randomSource }).map(
      (colorway) => ({ colorFamily, colorway }),
    )
  const ownFamilyLooks = listFreeLooks(ownFamily)
  const newColorwayLooks = ownFamilyLooks.filter(
    ({ colorway }) => colorway.key !== design.layers.colorwayKey,
  )
  const otherFamilyLooks =
    ownFamily.rarity === 'common'
      ? rankOtherEverydayFamilies({ designs, design, randomSource }).flatMap(listFreeLooks)
      : []
  const ownColorway = COLORWAYS.find((colorway) => colorway.key === design.layers.colorwayKey)
  const ownColorwayLooks =
    ownColorway === undefined ? [] : [{ colorFamily: ownFamily, colorway: ownColorway }]
  return [...newColorwayLooks, ...otherFamilyLooks, ...ownColorwayLooks]
}

/** The colourways a template and family don't use yet, least used across the family first. */
function rankFreeColorways({
  colorFamily,
  templateDesigns,
  usageCounts,
  randomSource,
}: {
  colorFamily: ColorFamily
  templateDesigns: readonly DesignLayers[]
  usageCounts: UsageCounts
  randomSource: RandomSource
}): Colorway[] {
  const takenColorwayKeys = new Set(
    templateDesigns
      .filter((other) => other.colorFamilyKey === colorFamily.key)
      .map((other) => other.colorwayKey),
  )
  return rankByUsage(
    COLORWAYS.filter(
      (colorway) =>
        isColorwayReadable(colorway, colorFamily) && !takenColorwayKeys.has(colorway.key),
    ),
    {
      readUsage: (colorway) => usageCounts.get(`colorway:${colorFamily.key}:${colorway.key}`) ?? 0,
      randomSource,
    },
  )
}

/** Everyday families other than the design's own and its neighbours', the smallest first. */
function rankOtherEverydayFamilies({
  designs,
  design,
  randomSource,
}: {
  designs: readonly Design[]
  design: Design
  randomSource: RandomSource
}): ColorFamily[] {
  const neighbourFamilyKeys = new Set(
    [designs[design.designNumber - 2], designs[design.designNumber]].flatMap((neighbour) =>
      neighbour === undefined ? [] : [neighbour.layers.colorFamilyKey],
    ),
  )
  const familyCounts = new Map<string, number>()
  for (const { layers } of designs) {
    familyCounts.set(layers.colorFamilyKey, (familyCounts.get(layers.colorFamilyKey) ?? 0) + 1)
  }
  return rankByUsage(
    COLOR_FAMILIES.filter(
      (colorFamily) =>
        colorFamily.rarity === 'common' &&
        colorFamily.key !== design.layers.colorFamilyKey &&
        !neighbourFamilyKeys.has(colorFamily.key),
    ),
    { readUsage: (colorFamily) => familyCounts.get(colorFamily.key) ?? 0, randomSource },
  )
}

/** The same usage keys the generator counts, over the rest of the collection. */
function countUsage(designs: readonly Design[]): UsageCounts {
  const usageCounts: UsageCounts = new Map()
  for (const { layers } of designs) {
    incrementUsage(usageCounts, `colorway:${layers.colorFamilyKey}:${layers.colorwayKey}`)
    incrementUsage(usageCounts, `lace:${layers.laceColorKey}`)
    for (const [slotKey, valueKey] of Object.entries(layers.optionValueKeys)) {
      incrementUsage(usageCounts, `option:${layers.templateKey}:${slotKey}:${valueKey}`)
    }
  }
  return usageCounts
}

/** Laces don't count: they only show once a pass is laced. */
function hasSameVisibleLayers(first: DesignLayers, second: DesignLayers): boolean {
  return (
    first.colorFamilyKey === second.colorFamilyKey &&
    first.colorwayKey === second.colorwayKey &&
    Object.entries(first.optionValueKeys).every(
      ([slotKey, valueKey]) => second.optionValueKeys[slotKey] === valueKey,
    )
  )
}

/** Mixes the collection's seed, the round and the design number into one 32-bit seed. */
function deriveRerollSeed(roundNumber: number, designNumber: number): number {
  let seed = GENERATOR_SEED >>> 0
  for (const part of [roundNumber, designNumber]) {
    seed = Math.imul(seed ^ part, FNV_PRIME) >>> 0
  }
  return seed
}
