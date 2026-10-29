import type { DialKey, DialShotName } from './timeline'

// Every word and Sneaker the Dial film adds (FACTS.md §18). The names are the frozen design
// table's own (@stridemon/chain/founding-pass-designs, DESIGNS_FROZEN_ON).

/**
 * Where a Sneaker stands in its shot, in the plate's pixels: the middle of its sole (the laced
 * art's x 501, y 520) lands on (x, y), and the art's 1000-unit width is `width` pixels.
 */
export type SneakerPlacement = { x: number; y: number; width: number }

export type DialSneaker = {
  key: DialKey
  designNumber: number
  name: string
  placement: SneakerPlacement
}

/**
 * One Sneaker per key, standing where the reference's cake stood. Ten templates, one each, picked
 * to echo the cake they replace (the honey cake's gold, the red velvet's rose, the black forest's
 * blue chairs), with #0137 Rose Hiker Night, the other films' hero, on key 2, and #0020
 * Earthshine, a Legendary, on 0, the last key, as the reference ends on its best cake.
 */
export const dialSneakers: Record<DialShotName, DialSneaker> = {
  honey: {
    key: '1',
    designNumber: 49,
    name: 'Gold Skate Night',
    placement: { x: 350, y: 815, width: 640 },
  },
  redVelvet: {
    key: '2',
    designNumber: 137,
    name: 'Rose Hiker Night',
    placement: { x: 380, y: 985, width: 640 },
  },
  napoleon: {
    key: '3',
    designNumber: 868,
    name: 'Ember Court Night',
    placement: { x: 385, y: 800, width: 640 },
  },
  cloud: {
    key: '4',
    designNumber: 429,
    name: 'Clay Sock Frost',
    placement: { x: 380, y: 950, width: 620 },
  },
  blackForest: {
    key: '5',
    designNumber: 289,
    name: 'Cobalt Spike Dusk',
    placement: { x: 360, y: 1010, width: 660 },
  },
  redBerry: {
    key: '6',
    designNumber: 498,
    name: 'Glory',
    placement: { x: 375, y: 855, width: 640 },
  },
  caramel: {
    key: '7',
    designNumber: 224,
    name: 'Clay Racer Dusk',
    placement: { x: 360, y: 835, width: 640 },
  },
  strawberry: {
    key: '8',
    designNumber: 542,
    name: 'Nacreous',
    placement: { x: 360, y: 905, width: 600 },
  },
  carrot: {
    key: '9',
    designNumber: 184,
    name: 'Gold Trail Eclipse',
    placement: { x: 380, y: 1150, width: 700 },
  },
  cheesecake: {
    key: '0',
    designNumber: 20,
    name: 'Earthshine',
    placement: { x: 370, y: 845, width: 640 },
  },
}

export function formatDesignNumber(designNumber: number): string {
  return `#${String(designNumber).padStart(4, '0')}`
}

export const dialContent = {
  /** Under the lockup on the keypad, where the reference has "Dial a slice". */
  tagline: 'Dial a Sneaker',
  wordmark: 'StrideMon',
  /** The end card's waitlist line (Yash's ask: simple). The window is 48 hours (founding-pass.ts). */
  headline: 'Want a Founding Pass?',
  /** A no-break space keeps "48 hours" on one line. */
  body: 'Join the waitlist and mint it free, 48\u00A0hours before everyone else.',
  link: 'stridemon.xyz/pass',
} as const

/** The letters under each digit, as a phone's keypad. */
export const keyLetters: Record<DialKey, string> = {
  '1': '',
  '2': 'ABC',
  '3': 'DEF',
  '4': 'GHI',
  '5': 'JKL',
  '6': 'MNO',
  '7': 'PQRS',
  '8': 'TUV',
  '9': 'WXYZ',
  '0': '+',
}
