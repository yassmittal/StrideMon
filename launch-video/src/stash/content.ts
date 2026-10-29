// Every word and Sneaker the Stash film adds (FACTS.md §22). The hook's caption ("what is bro
// filming 💀") is the reference's own, burnt into its frames, and stays as it is. The names are the
// frozen design table's own (@stridemon/chain/founding-pass-designs, DESIGNS_FROZEN_ON).

export type StashSneaker = {
  designNumber: number
  name: string
  /** Where the middle of the Sneaker lands on the case floor, in shot A's keyframe pixels. */
  x: number
  y: number
}

/** The laced art's 1000-unit width, in shot A's keyframe pixels. */
export const STASH_SNEAKER_WIDTH = 250

/**
 * Six Sneakers in two columns of three, laid in the case where the reference's ten nails were.
 * Picked to echo the nails' red, black, white and silver, one of each template, with #0137 Rose
 * Hiker Night, the other films' hero, first.
 */
export const stashSneakers: readonly StashSneaker[] = [
  { designNumber: 137, name: 'Rose Hiker Night', x: 225, y: 500 },
  { designNumber: 220, name: 'Chrome Hoop Eclipse', x: 470, y: 500 },
  { designNumber: 110, name: 'Cherry Racer Night', x: 225, y: 635 },
  { designNumber: 363, name: 'Chrome Trail Night', x: 470, y: 635 },
  { designNumber: 82, name: 'Cherry Spike Frost', x: 225, y: 770 },
  { designNumber: 713, name: 'Cherry Chunky Night', x: 470, y: 770 },
]

export const stashContent = {
  /** The end card (Yash's ask: simple). The waitlist window is 48 hours (founding-pass.ts). */
  headline: 'Want a Founding Pass?',
  /** A no-break space keeps "48 hours" on one line. */
  bodyLines: ['Join the waitlist.', 'Mint free, 48 hours early.'],
  link: 'stridemon.xyz/pass',
} as const
