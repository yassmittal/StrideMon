// Every word in the Sneaker drop film, mirrored from FACTS.md §13, and the one mapping from what
// you hear to what moves (docs/sneaker-drop-video-prompt.md §3). Nothing goes on screen from
// anywhere else. No price, worth, value, mint, date, STRIDE amount or "limited".

import type { HitKind } from './hits'

/** The hero's label (the drop bar): design #0137's number and name, as the design table has them. */
export const heroLabel = { number: '#0137', name: 'Rose Hiker Night' } as const

/** The Legendary's label and rarity (scene 6). */
export const legendaryLabel = {
  number: '#0020',
  name: 'Earthshine',
  rarity: 'Legendary',
} as const

export const sneakerDropEndCardContent = {
  siteLabel: 'stridemon.xyz',
  wordmark: 'StrideMon',
  metaItems: ['Monad testnet'],
} as const

/**
 * What each kind of hit does, decided once and used the same way everywhere:
 *
 * | Hit | One shoe on screen | A split (2, 4 or 9) | The flood |
 * |---|---|---|---|
 * | kick | cut to the next shoe; on a bar's downbeat, also flip black ↔ off-white | the next cell stamps a new shoe; on a downbeat, the next split cuts in | the grid pulls back a step |
 * | clap | a cut, like a kick (ghost claps don't move anything) | a stamp | a step |
 * | cowbell | a 3% punch | a stamp | a step |
 * | hat | nothing | nothing | a step |
 * | stop | the music falls silent: cut to the next quiet frame | | |
 *
 * The flood is the only place a hat moves anything.
 */
export const hitMoves: Record<HitKind, { oneShoe: string; split: string; flood: string }> = {
  kick: { oneShoe: 'cut', split: 'stamp', flood: 'step' },
  snare: { oneShoe: 'cut', split: 'stamp', flood: 'step' },
  cowbell: { oneShoe: 'punch', split: 'stamp', flood: 'step' },
  hat: { oneShoe: 'none', split: 'none', flood: 'step' },
  stop: { oneShoe: 'cut', split: 'cut', flood: 'cut' },
}

/** Claps under this strength are ghost notes (the off-beat claps in bars 2, 5, 6 and 7). */
export const GHOST_CLAP_STRENGTH = 0.65

/** The cowbell's punch: up 3% on the hit, back over this many frames. */
export const PUNCH_SCALE = 1.03
export const PUNCH_DURATION_FRAMES = 14
