import type { RandomSource } from './random-source'

/** How often each option value, lace colour and colourway has been used so far. */
export type UsageCounts = Map<string, number>

/** Random noise added to usage counts, so ties break differently every time. */
const USAGE_TIE_BREAK_SPREAD = 1.5

/** Least used first, with random tie-breaks, so values spread evenly but not in lockstep. */
export function rankByUsage<Item>(
  items: readonly Item[],
  { readUsage, randomSource }: { readUsage: (item: Item) => number; randomSource: RandomSource },
): Item[] {
  return items
    .map((item) => ({
      item,
      score: readUsage(item) + randomSource.nextFraction() * USAGE_TIE_BREAK_SPREAD,
    }))
    .sort((first, second) => first.score - second.score)
    .map(({ item }) => item)
}

export function incrementUsage(usageCounts: UsageCounts, usageKey: string): void {
  usageCounts.set(usageKey, (usageCounts.get(usageKey) ?? 0) + 1)
}
