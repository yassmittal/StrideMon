import { LACE_COLORS } from '../art-system/lace-colors'
import { calculateDesignRarity, compareRarity } from '../art-system/resolve-design'
import type {
  ColorFamily,
  Colorway,
  DesignLayers,
  LaceColor,
  LaceColorKey,
  Rarity,
  SneakerTemplate,
} from '../art-system/types'
import { countSharedVisibleLayers, MAX_SHARED_VISIBLE_LAYERS } from './design-rules'
import type { DesignDraft } from './plan-designs'
import { pickRandomItem, type RandomSource, shuffleItems } from './random-source'
import { incrementUsage, rankByUsage, type UsageCounts } from './usage-counts'

/** On a design that may carry uncommon layers, how often a second one turns up. */
const EXTRA_UNCOMMON_LAYER_CHANCE = 0.2
/**
 * How many uncommon designs get there through lime laces alone. Laces only show once a pass is
 * laced, so most uncommon designs carry a detail the gallery can see.
 */
const LACES_ONLY_UNCOMMON_SHARE = 0.2
const LACE_LAYER_KEY = 'laces'
/** Ink laces only on a light or mid eyestay: black slats on a dark one would hide the lacing. */
const DARKEST_EYESTAY_SHADE_FOR_INK_LACES = 2
/** Rare designs have the fewest options left, so they pick first. */
const RARITY_PROCESSING_ORDER: readonly Rarity[] = ['legendary', 'rare', 'uncommon', 'common']

/**
 * Picks the option values and laces for every draft of one template, the most constrained first.
 * Returns `null` at a dead end, so the caller can start the template again.
 */
export function pickTemplateDetails(
  drafts: readonly DesignDraft[],
  { usageCounts, randomSource }: { usageCounts: UsageCounts; randomSource: RandomSource },
): DesignLayers[] | null {
  const orderedDrafts = shuffleItems(drafts, randomSource).sort(
    (first, second) =>
      RARITY_PROCESSING_ORDER.indexOf(first.targetRarity) -
      RARITY_PROCESSING_ORDER.indexOf(second.targetRarity),
  )
  const templateDesigns: DesignLayers[] = []
  for (const draft of orderedDrafts) {
    const design = pickDetails({ draft, templateDesigns, usageCounts, randomSource })
    if (design === null) return null
    templateDesigns.push(design)
  }
  return templateDesigns
}

/**
 * Lists every option combination the draft's rarity allows, keeps the ones that leave it
 * distinct from the template's other designs, and takes the least used.
 */
function pickDetails({
  draft,
  templateDesigns,
  usageCounts,
  randomSource,
}: {
  draft: DesignDraft
  templateDesigns: readonly DesignLayers[]
  usageCounts: UsageCounts
  randomSource: RandomSource
}): DesignLayers | null {
  const { template, colorFamily, colorway, targetRarity } = draft
  const forcedLayerKey = chooseForcedLayerKey(draft, randomSource)
  const otherLayerRarities = readOtherLayerRarities(targetRarity, randomSource)
  const readAllowedRarities = (layerKey: string): ReadonlySet<Rarity> =>
    layerKey === forcedLayerKey ? new Set([targetRarity]) : otherLayerRarities
  const buildLayers = (
    optionValueKeys: Record<string, string>,
    laceColorKey: LaceColorKey,
  ): DesignLayers => ({
    templateKey: template.key,
    colorFamilyKey: colorFamily.key,
    colorwayKey: colorway.key,
    optionValueKeys,
    laceColorKey,
  })
  // Laces don't count towards distinctness, so any lace colour stands in while filtering.
  const validCombinations = listOptionCombinations(template, readAllowedRarities).filter(
    (combination) => isDistinctEnough(buildLayers(combination, 'cream'), templateDesigns),
  )
  const [optionValueKeys] = rankByUsage(validCombinations, {
    readUsage: (combination) => readCombinationUsage(template, combination, usageCounts),
    randomSource,
  })
  const [laceColor] = rankByUsage(
    LACE_COLORS.filter(
      (candidate) =>
        readAllowedRarities(LACE_LAYER_KEY).has(candidate.rarity) &&
        isLaceColorReadable(candidate, { colorFamily, colorway }),
    ),
    { readUsage: (candidate) => usageCounts.get(`lace:${candidate.key}`) ?? 0, randomSource },
  )
  if (optionValueKeys === undefined || laceColor === undefined) return null
  const design = buildLayers(optionValueKeys, laceColor.key)
  if (compareRarity(calculateDesignRarity(design), targetRarity) !== 0) return null
  for (const [slotKey, valueKey] of Object.entries(optionValueKeys)) {
    incrementUsage(usageCounts, `option:${template.key}:${slotKey}:${valueKey}`)
  }
  incrementUsage(usageCounts, `lace:${laceColor.key}`)
  return design
}

/**
 * The one layer that makes an everyday design uncommon or rare: a random slot (or the laces) for
 * uncommon, the template's rare detail for rare. Gold, Chrome and Prism are rare by family.
 */
function chooseForcedLayerKey(
  { template, colorFamily, colorway, targetRarity }: DesignDraft,
  randomSource: RandomSource,
): string | undefined {
  if (colorFamily.rarity !== 'common') return undefined
  if (targetRarity !== 'uncommon' && targetRarity !== 'rare') return undefined
  const canLacesCarryIt = LACE_COLORS.some(
    (laceColor) =>
      laceColor.rarity === targetRarity &&
      isLaceColorReadable(laceColor, { colorFamily, colorway }),
  )
  if (canLacesCarryIt && randomSource.nextFraction() < LACES_ONLY_UNCOMMON_SHARE) {
    return LACE_LAYER_KEY
  }
  const slotKeys = template.optionSlots
    .filter((optionSlot) => optionSlot.values.some((value) => value.rarity === targetRarity))
    .map((optionSlot) => optionSlot.key)
  if (slotKeys.length > 0) return pickRandomItem(slotKeys, randomSource)
  return canLacesCarryIt ? LACE_LAYER_KEY : undefined
}

/** Every layer but the forced one stays common, now and then uncommon on a design that may be. */
function readOtherLayerRarities(targetRarity: Rarity, randomSource: RandomSource): Set<Rarity> {
  if (targetRarity === 'common') return new Set(['common'])
  const allowsUncommon = randomSource.nextFraction() < EXTRA_UNCOMMON_LAYER_CHANCE
  return new Set(allowsUncommon ? ['common', 'uncommon'] : ['common'])
}

function listOptionCombinations(
  template: SneakerTemplate,
  readAllowedRarities: (layerKey: string) => ReadonlySet<Rarity>,
): Record<string, string>[] {
  return template.optionSlots.reduce<Record<string, string>[]>(
    (combinations, optionSlot) => {
      const allowedValues = optionSlot.values.filter((value) =>
        readAllowedRarities(optionSlot.key).has(value.rarity),
      )
      return combinations.flatMap((combination) =>
        allowedValues.map((value) => ({ ...combination, [optionSlot.key]: value.key })),
      )
    },
    [{}],
  )
}

/** A combination is as used as its values are, so every value spreads evenly too. */
function readCombinationUsage(
  template: SneakerTemplate,
  combination: Record<string, string>,
  usageCounts: UsageCounts,
): number {
  return Object.entries(combination).reduce(
    (usage, [slotKey, valueKey]) =>
      usage + (usageCounts.get(`option:${template.key}:${slotKey}:${valueKey}`) ?? 0),
    0,
  )
}

/**
 * Lime laces vanish on the Lime family, only cream or ink suit Prism's five hues, and ink laces
 * need a light enough eyestay to show.
 */
function isLaceColorReadable(
  laceColor: LaceColor,
  { colorFamily, colorway }: { colorFamily: ColorFamily; colorway: Colorway },
): boolean {
  if (laceColor.key === 'ink') {
    return colorway.shadeByRole.eyestay <= DARKEST_EYESTAY_SHADE_FOR_INK_LACES
  }
  if (colorFamily.key === 'lime') return laceColor.key !== 'lime'
  if (colorFamily.key === 'prism') return laceColor.key === 'cream'
  return true
}

function isDistinctEnough(
  candidate: DesignLayers,
  templateDesigns: readonly DesignLayers[],
): boolean {
  return templateDesigns.every(
    (existing) => countSharedVisibleLayers(candidate, existing) <= MAX_SHARED_VISIBLE_LAYERS,
  )
}
