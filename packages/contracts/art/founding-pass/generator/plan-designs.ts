import { COLOR_FAMILIES, readColorFamily } from '../art-system/color-families'
import { COLORWAYS } from '../art-system/colorways'
import { SNEAKER_TEMPLATES } from '../art-system/templates'
import type { ColorFamily, Colorway, Rarity, SneakerTemplate } from '../art-system/types'
import { type RandomSource, shuffleItems } from './random-source'
import { incrementUsage, rankByUsage, type UsageCounts } from './usage-counts'

export const DESIGN_COUNT = 1_000
const DESIGNS_PER_TEMPLATE = DESIGN_COUNT / SNEAKER_TEMPLATES.length

/** Every template gets the same mix, so each one has its Legendary, metals and rare details. */
const PRISM_DESIGNS_PER_TEMPLATE = 1
const GOLD_DESIGNS_PER_TEMPLATE = 3
const CHROME_DESIGNS_PER_TEMPLATE = 3
const RARE_DETAIL_DESIGNS_PER_TEMPLATE = 3
const UNCOMMON_DESIGNS_PER_TEMPLATE = 25
/** On a mostly pale shoe, Gold reads as plain yellow and Chrome as plain white. */
const PALE_COLORWAY_KEYS: ReadonlySet<string> = new Set(['dawn', 'frost'])

/** A design before its details: template, family, and how rare it should come out. */
type DraftPlan = {
  template: SneakerTemplate
  colorFamily: ColorFamily
  targetRarity: Rarity
}
export type DesignDraft = DraftPlan & { colorway: Colorway }

/** One template's 100 slots: which family each takes, and how rare it should come out. */
export function planTemplate(
  template: SneakerTemplate,
  templateIndex: number,
  randomSource: RandomSource,
): DraftPlan[] {
  const repeatPlan = (count: number, colorFamily: ColorFamily, targetRarity: Rarity) =>
    Array.from({ length: count }, () => ({ template, colorFamily, targetRarity }))
  const specialPlans = [
    ...repeatPlan(PRISM_DESIGNS_PER_TEMPLATE, readColorFamily('prism'), 'legendary'),
    ...repeatPlan(GOLD_DESIGNS_PER_TEMPLATE, readColorFamily('gold'), 'rare'),
    ...repeatPlan(CHROME_DESIGNS_PER_TEMPLATE, readColorFamily('chrome'), 'rare'),
  ]
  const everydayFamilyPlan = planEverydayFamilies(
    DESIGNS_PER_TEMPLATE - specialPlans.length,
    templateIndex,
  )
  const everydayRarities: Rarity[] = [
    ...Array<Rarity>(RARE_DETAIL_DESIGNS_PER_TEMPLATE).fill('rare'),
    ...Array<Rarity>(UNCOMMON_DESIGNS_PER_TEMPLATE).fill('uncommon'),
  ]
  const everydayPlans = shuffleItems(everydayFamilyPlan, randomSource).map(
    (colorFamily, planIndex): DraftPlan => ({
      template,
      colorFamily,
      targetRarity: everydayRarities[planIndex] ?? 'common',
    }),
  )
  return [...specialPlans, ...everydayPlans]
}

/**
 * Gives every design of one template and family a different colourway, which keeps names unique,
 * and spreads each family's colourways evenly over the collection.
 */
export function assignColorways(
  plans: readonly DraftPlan[],
  { usageCounts, randomSource }: { usageCounts: UsageCounts; randomSource: RandomSource },
): DesignDraft[] {
  const drafts: DesignDraft[] = []
  for (const familyPlans of Map.groupBy(plans, (plan) => plan.colorFamily.key).values()) {
    const firstPlan = familyPlans[0]
    if (firstPlan === undefined) continue
    const readUsageKey = (colorway: Colorway) =>
      `colorway:${firstPlan.colorFamily.key}:${colorway.key}`
    const rankedColorways = rankByUsage(
      COLORWAYS.filter((colorway) => isColorwayReadable(colorway, firstPlan.colorFamily)),
      { readUsage: (colorway) => usageCounts.get(readUsageKey(colorway)) ?? 0, randomSource },
    )
    if (familyPlans.length > rankedColorways.length) {
      throw new Error(
        `More ${firstPlan.colorFamily.key} ${firstPlan.template.key}s than colourways`,
      )
    }
    familyPlans.forEach((plan, planIndex) => {
      const colorway = rankedColorways[planIndex]
      if (colorway === undefined) return
      incrementUsage(usageCounts, readUsageKey(colorway))
      drafts.push({ ...plan, colorway })
    })
  }
  return drafts
}

/**
 * Splits the everyday designs over the eleven everyday families. The families that get one extra
 * design rotate with the template, so every family ends up with nearly the same total.
 */
function planEverydayFamilies(designCount: number, templateIndex: number): ColorFamily[] {
  const everydayFamilies = COLOR_FAMILIES.filter((colorFamily) => colorFamily.rarity === 'common')
  const familyCount = everydayFamilies.length
  const baseCountPerFamily = Math.floor(designCount / familyCount)
  const extraDesignCount = designCount % familyCount
  return everydayFamilies.flatMap((colorFamily, familyIndex) => {
    const rotatedIndex =
      (((familyIndex - templateIndex * extraDesignCount) % familyCount) + familyCount) % familyCount
    const familyDesignCount = baseCountPerFamily + (rotatedIndex < extraDesignCount ? 1 : 0)
    return Array.from({ length: familyDesignCount }, () => colorFamily)
  })
}

function isColorwayReadable(colorway: Colorway, colorFamily: ColorFamily): boolean {
  return colorFamily.sheenColor === null || !PALE_COLORWAY_KEYS.has(colorway.key)
}
