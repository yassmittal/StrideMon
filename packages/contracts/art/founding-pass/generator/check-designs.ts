import { COLOR_FAMILIES } from '../art-system/color-families'
import { COLORWAYS } from '../art-system/colorways'
import { LACE_COLORS } from '../art-system/lace-colors'
import { SNEAKER_TEMPLATES } from '../art-system/templates'
import type { Design, Rarity } from '../art-system/types'
import {
  countSharedVisibleLayers,
  MAX_SHARED_VISIBLE_LAYERS,
  VISIBLE_LAYER_COUNT,
} from './design-rules'
import { countNeighbourClashes, DESIGNS_PER_BLOCK } from './order-designs'
import { DESIGN_COUNT } from './plan-designs'

const RARITY_REPORT_ORDER: readonly Rarity[] = ['common', 'uncommon', 'rare', 'legendary']

/**
 * Checks the generated collection against the rules, throws on a broken one, and returns a short
 * report of the counts for the console.
 */
export function checkDesigns(designs: readonly Design[]): string[] {
  if (designs.length !== DESIGN_COUNT) {
    throw new Error(`Expected ${DESIGN_COUNT} designs, got ${designs.length}`)
  }
  assertUniqueNames(designs)
  const neighbourClashCount = countNeighbourClashes(designs.map((design) => design.layers))
  if (neighbourClashCount > 0) {
    throw new Error(`${neighbourClashCount} designs share a template or family with a neighbour`)
  }
  const maxSharedLayers = measureMaxSharedVisibleLayers(designs)
  if (maxSharedLayers > MAX_SHARED_VISIBLE_LAYERS) {
    throw new Error(
      `Two designs share ${maxSharedLayers} visible layers (limit ${MAX_SHARED_VISIBLE_LAYERS})`,
    )
  }
  return [
    `designs: ${designs.length}, names: ${new Set(designs.map((design) => design.name)).size} unique`,
    `most visible layers any two designs share: ${maxSharedLayers} of ${VISIBLE_LAYER_COUNT} (limit ${MAX_SHARED_VISIBLE_LAYERS})`,
    `rarity: ${formatCounts(
      designs.map((design) => design.rarity),
      RARITY_REPORT_ORDER,
    )}`,
    `templates: ${formatCounts(
      designs.map((design) => design.layers.templateKey),
      SNEAKER_TEMPLATES.map((template) => template.key),
    )}`,
    `families: ${formatCounts(
      designs.map((design) => design.layers.colorFamilyKey),
      COLOR_FAMILIES.map((colorFamily) => colorFamily.key),
    )}`,
    `colourways: ${formatCounts(
      designs.map((design) => design.layers.colorwayKey),
      COLORWAYS.map((colorway) => colorway.key),
    )}`,
    `laces: ${formatCounts(
      designs.map((design) => design.layers.laceColorKey),
      LACE_COLORS.map((laceColor) => laceColor.key),
    )}`,
    `legendaries per block of ${DESIGNS_PER_BLOCK}: ${countLegendariesPerBlock(designs).join(' ')}`,
  ]
}

function assertUniqueNames(designs: readonly Design[]): void {
  const seenNames = new Set<string>()
  for (const design of designs) {
    if (seenNames.has(design.name)) throw new Error(`Name used twice: ${design.name}`)
    seenNames.add(design.name)
  }
}

function measureMaxSharedVisibleLayers(designs: readonly Design[]): number {
  let maxSharedLayers = 0
  designs.forEach((design, designIndex) => {
    for (const other of designs.slice(designIndex + 1)) {
      maxSharedLayers = Math.max(
        maxSharedLayers,
        countSharedVisibleLayers(design.layers, other.layers),
      )
    }
  })
  return maxSharedLayers
}

function countLegendariesPerBlock(designs: readonly Design[]): number[] {
  const blockCount = Math.ceil(designs.length / DESIGNS_PER_BLOCK)
  return Array.from(
    { length: blockCount },
    (_, blockIndex) =>
      designs
        .slice(blockIndex * DESIGNS_PER_BLOCK, (blockIndex + 1) * DESIGNS_PER_BLOCK)
        .filter((design) => design.rarity === 'legendary').length,
  )
}

/** "runner 100, racer 100, …" in the art system's own order. */
function formatCounts(values: readonly string[], keysInOrder: readonly string[]): string {
  const counts = new Map<string, number>()
  for (const value of values) counts.set(value, (counts.get(value) ?? 0) + 1)
  return keysInOrder.map((key) => `${key} ${counts.get(key) ?? 0}`).join(', ')
}
