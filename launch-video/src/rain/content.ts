import type { RainCarShotName } from './tracks'

// Every word and Sneaker the Rain film adds (FACTS.md §21). The hook's caption ("I always wondered
// what the rain would say...") is the reference's own, burnt into its frames, and stays as it is.
// The names are the frozen design table's own (@stridemon/chain/founding-pass-designs).

/**
 * What the rain types after the reference's gibberish, one line each, in the doc's caps. Each key
 * lands on a frame; the first two lines take the reference's own keystrokes on "Y BUY THE" and
 * "CORVETTE" (src/rain/tracks.ts, referenceTypedExtents), and the last types after the scroll, on
 * the music's hit. The line breaks are the reference's own: its second line sits on page 2 after
 * the scroll.
 */
export type TypedLine = { text: string; keyFrames: readonly number[] }

export const typedLines = {
  /** On the reference's "Y BUY THE" (line 5). */
  waitlist: { text: 'WAITLIST', keyFrames: [219, 230, 257, 266, 272, 274, 277, 281] },
  /** On its "CORVETTE" (line 6, page 2 after the scroll). The last two keys take its first "!"s. */
  yourself: { text: 'YOURSELF', keyFrames: [300, 305, 312, 316, 321, 326, 343, 357] },
  /** On its "!!!!" after the scroll: the rain hits Enter and the doc scrolls to it. */
  now: { text: 'NOW!!!!!', keyFrames: [383, 386, 389, 392, 395, 398, 401, 404] },
} as const satisfies Record<string, TypedLine>

/** The reference's own gibberish above them (lines 0-4), drawn only while the doc scrolls. */
export const gibberishLines = ['GGchgbvjkfdg', 'hf72jfb', 'bduhwo28bcjkb', 'YUFG783BFC', 'HGBXHGVEU'] as const

/**
 * Where a Sneaker stands in its shot, in the plate's pixels: the middle of its sole (the laced
 * art's x 501, y 520) lands on (x, y), and the art's 1000-unit width is `width` pixels.
 */
export type SneakerPlacement = { x: number; y: number; width: number }

export type RainSneaker = {
  designNumber: number
  name: string
  placement: SneakerPlacement
  /** How much light the shot has on the Sneaker: 1 is the art as minted. */
  brightness: number
}

/**
 * One Sneaker per car shot, standing where the car stood, at its size. Racers for the car, picked
 * to echo each shot: the white car's chrome in the wide shot, gold at golden hour, #0185 Afterglow
 * (a Legendary) under the sunset, chrome at dusk, and #0678 Moonbow, a Legendary named for a
 * rainbow at night, on the night shot: after the rain.
 */
export const rainShots: Record<RainCarShotName, RainSneaker> = {
  palms: { designNumber: 500, name: 'Chrome Racer Day', placement: { x: 362, y: 846, width: 430 }, brightness: 0.9 },
  close: { designNumber: 159, name: 'Gold Racer Flare', placement: { x: 330, y: 1050, width: 1080 }, brightness: 0.88 },
  front: { designNumber: 185, name: 'Afterglow', placement: { x: 362, y: 858, width: 560 }, brightness: 0.9 },
  rear: { designNumber: 279, name: 'Chrome Racer Dusk', placement: { x: 330, y: 1045, width: 900 }, brightness: 0.86 },
  night: { designNumber: 678, name: 'Moonbow', placement: { x: 410, y: 935, width: 640 }, brightness: 0.78 },
}
