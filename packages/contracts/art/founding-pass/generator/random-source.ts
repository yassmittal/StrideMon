/** A seeded random source (mulberry32): the same seed always picks the same 1,000 designs. */
export type RandomSource = { nextFraction: () => number }

const MULBERRY_INCREMENT = 0x6d2b79f5
const UINT32_RANGE = 4_294_967_296

export function createRandomSource(seed: number): RandomSource {
  let state = seed >>> 0
  return {
    nextFraction() {
      state = (state + MULBERRY_INCREMENT) >>> 0
      let mixed = state
      mixed = Math.imul(mixed ^ (mixed >>> 15), mixed | 1)
      mixed ^= mixed + Math.imul(mixed ^ (mixed >>> 7), mixed | 61)
      return ((mixed ^ (mixed >>> 14)) >>> 0) / UINT32_RANGE
    },
  }
}

export function pickRandomItem<Item>(items: readonly Item[], randomSource: RandomSource): Item {
  const item = items[Math.floor(randomSource.nextFraction() * items.length)]
  if (item === undefined) throw new Error('Cannot pick from an empty list')
  return item
}

/** Fisher–Yates, on a copy. */
export function shuffleItems<Item>(items: readonly Item[], randomSource: RandomSource): Item[] {
  const shuffled = [...items]
  for (let index = shuffled.length - 1; index > 0; index--) {
    const swapIndex = Math.floor(randomSource.nextFraction() * (index + 1))
    const current = shuffled[index]
    const swapped = shuffled[swapIndex]
    if (current === undefined || swapped === undefined) continue
    shuffled[index] = swapped
    shuffled[swapIndex] = current
  }
  return shuffled
}
