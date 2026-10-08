import { buildDesignName, calculateDesignRarity } from '../art-system/resolve-design'
import { SNEAKER_TEMPLATES } from '../art-system/templates'
import type { Design, DesignLayers, SneakerTemplate } from '../art-system/types'
import { orderDesigns } from './order-designs'
import { pickTemplateDetails } from './pick-details'
import { assignColorways, planTemplate } from './plan-designs'
import { createRandomSource, type RandomSource } from './random-source'
import type { UsageCounts } from './usage-counts'

/** Change it to re-roll the whole collection. Part 1b re-rolls single designs instead. */
export const GENERATOR_SEED = 20_261_008

const MAX_ATTEMPTS_PER_TEMPLATE = 50

/**
 * Picks the 1,000 designs under the brief's rules (§4.2): fair counts per template and family,
 * the rare layers in fixed small counts, names that never repeat, and no near-copies.
 */
export function generateDesigns(seed: number = GENERATOR_SEED): Design[] {
  const randomSource = createRandomSource(seed)
  const usageCounts: UsageCounts = new Map()
  const unnumberedDesigns = SNEAKER_TEMPLATES.flatMap((template, templateIndex) =>
    generateTemplateDesigns({ template, templateIndex, usageCounts, randomSource }),
  )
  return orderDesigns(unnumberedDesigns, randomSource).map((layers, index) => ({
    designNumber: index + 1,
    layers,
    name: buildDesignName(layers),
    rarity: calculateDesignRarity(layers),
  }))
}

/** One template's 100 designs. A dead end restarts the template, never the whole collection. */
function generateTemplateDesigns({
  template,
  templateIndex,
  usageCounts,
  randomSource,
}: {
  template: SneakerTemplate
  templateIndex: number
  usageCounts: UsageCounts
  randomSource: RandomSource
}): DesignLayers[] {
  for (let attemptIndex = 0; attemptIndex < MAX_ATTEMPTS_PER_TEMPLATE; attemptIndex++) {
    const attemptUsageCounts = new Map(usageCounts)
    const plans = planTemplate(template, templateIndex, randomSource)
    const drafts = assignColorways(plans, { usageCounts: attemptUsageCounts, randomSource })
    const templateDesigns = pickTemplateDetails(drafts, {
      usageCounts: attemptUsageCounts,
      randomSource,
    })
    if (templateDesigns === null) continue
    for (const [usageKey, count] of attemptUsageCounts) usageCounts.set(usageKey, count)
    return templateDesigns
  }
  throw new Error(`No set of ${template.key} designs fits the rules`)
}
