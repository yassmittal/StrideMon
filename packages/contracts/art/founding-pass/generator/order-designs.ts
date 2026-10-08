import { readColorFamily } from '../art-system/color-families'
import { SNEAKER_TEMPLATES } from '../art-system/templates'
import type { DesignLayers } from '../art-system/types'
import { type RandomSource, shuffleItems } from './random-source'

/** One review sheet: the gallery and Yash's review both go 100 at a time. */
export const DESIGNS_PER_BLOCK = 100
/** Each design tries to avoid the templates and families of this many designs before it. */
const NEIGHBOUR_WINDOW = 2
const MAX_ORDERING_ATTEMPTS_PER_BLOCK = 50

/**
 * Numbers the designs. Every block of 100 gets ten of each template, one Prism Legendary and an
 * even share of Gold and Chrome, and no two neighbours share a template or a family.
 */
export function orderDesigns(
  designs: readonly DesignLayers[],
  randomSource: RandomSource,
): DesignLayers[] {
  const blockCount = designs.length / DESIGNS_PER_BLOCK
  const blocks: DesignLayers[][] = Array.from({ length: blockCount }, () => [])
  const metalCountsPerBlock = blocks.map(() => 0)
  SNEAKER_TEMPLATES.forEach((template, templateIndex) => {
    distributeTemplateDesigns({
      templateDesigns: designs.filter((design) => design.templateKey === template.key),
      templateIndex,
      blocks,
      metalCountsPerBlock,
      randomSource,
    })
  })
  const orderedDesigns: DesignLayers[] = []
  for (const block of blocks) {
    orderedDesigns.push(...orderBlock(block, orderedDesigns.slice(-NEIGHBOUR_WINDOW), randomSource))
  }
  return orderedDesigns
}

function distributeTemplateDesigns({
  templateDesigns,
  templateIndex,
  blocks,
  metalCountsPerBlock,
  randomSource,
}: {
  templateDesigns: readonly DesignLayers[]
  templateIndex: number
  blocks: DesignLayers[][]
  metalCountsPerBlock: number[]
  randomSource: RandomSource
}): void {
  const designsPerBlock = templateDesigns.length / blocks.length
  const placedCounts = blocks.map(() => 0)
  const place = (design: DesignLayers, blockIndex: number) => {
    blocks[blockIndex]?.push(design)
    placedCounts[blockIndex] = (placedCounts[blockIndex] ?? 0) + 1
  }
  const isMetal = (design: DesignLayers) =>
    readColorFamily(design.colorFamilyKey).sheenColor !== null
  // Template n's Legendary goes to block n, so each review sheet holds a different one.
  for (const design of templateDesigns.filter(
    (candidate) => candidate.colorFamilyKey === 'prism',
  )) {
    place(design, templateIndex % blocks.length)
  }
  // Each metal goes to a different block, the ones with the fewest metals so far first.
  const metalBlockIndexes = shuffleItems(
    blocks.map((_, blockIndex) => blockIndex),
    randomSource,
  ).sort((first, second) => (metalCountsPerBlock[first] ?? 0) - (metalCountsPerBlock[second] ?? 0))
  templateDesigns.filter(isMetal).forEach((design, metalIndex) => {
    const blockIndex = metalBlockIndexes[metalIndex] ?? metalIndex % blocks.length
    place(design, blockIndex)
    metalCountsPerBlock[blockIndex] = (metalCountsPerBlock[blockIndex] ?? 0) + 1
  })
  const everydayDesigns = templateDesigns.filter(
    (design) => readColorFamily(design.colorFamilyKey).rarity === 'common',
  )
  for (const design of shuffleItems(everydayDesigns, randomSource)) {
    place(
      design,
      placedCounts.findIndex((placedCount) => placedCount < designsPerBlock),
    )
  }
}

/** Retries the greedy order until no two neighbours clash, and keeps the best one it found. */
function orderBlock(
  block: readonly DesignLayers[],
  previousDesigns: readonly DesignLayers[],
  randomSource: RandomSource,
): DesignLayers[] {
  let bestOrder: DesignLayers[] = []
  let fewestClashes = Number.POSITIVE_INFINITY
  for (let attemptIndex = 0; attemptIndex < MAX_ORDERING_ATTEMPTS_PER_BLOCK; attemptIndex++) {
    const order = orderBlockGreedily(block, previousDesigns, randomSource)
    const clashCount = countNeighbourClashes([...previousDesigns.slice(-1), ...order])
    if (clashCount < fewestClashes) {
      bestOrder = order
      fewestClashes = clashCount
    }
    if (clashCount === 0) break
  }
  return bestOrder
}

/** Each next design avoids the templates and families of the last few, if it can. */
function orderBlockGreedily(
  block: readonly DesignLayers[],
  previousDesigns: readonly DesignLayers[],
  randomSource: RandomSource,
): DesignLayers[] {
  const remaining = shuffleItems(block, randomSource)
  const ordered: DesignLayers[] = []
  while (remaining.length > 0) {
    const recent = [...previousDesigns, ...ordered].slice(-NEIGHBOUR_WINDOW)
    const clashesWithRecent = (design: DesignLayers, windowSize: number) =>
      recent.slice(-windowSize).some((previous) => isClash(previous, design))
    let nextIndex = remaining.findIndex((design) => !clashesWithRecent(design, NEIGHBOUR_WINDOW))
    if (nextIndex === -1) nextIndex = remaining.findIndex((design) => !clashesWithRecent(design, 1))
    if (nextIndex === -1) nextIndex = 0
    const [next] = remaining.splice(nextIndex, 1)
    if (next !== undefined) ordered.push(next)
  }
  return ordered
}

/** How many designs share a template or a family with the one just before them. */
export function countNeighbourClashes(designs: readonly DesignLayers[]): number {
  return designs.filter((design, index) => {
    const previous = designs[index - 1]
    return previous !== undefined && isClash(previous, design)
  }).length
}

function isClash(first: DesignLayers, second: DesignLayers): boolean {
  return first.templateKey === second.templateKey || first.colorFamilyKey === second.colorFamilyKey
}
