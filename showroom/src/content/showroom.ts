// The showroom's own words and links. Every link out to stridemon.xyz carries `?source=showroom`
// (brief §7.7).

export const showroomUrl = 'https://showroom.stridemon.xyz'
export const showroomSiteName = 'StrideMon'
export const showroomTitle = 'StrideMon Showroom'
export const showroomDescription =
  "Walk into the StrideMon store after hours. Look closer at any of the 1,000 Founding Pass Sneakers: free to mint, can't be sent or sold."

/** The share card's X fields, as the website's `site.ts` sets them. */
export const xCardMetadata = {
  card: 'summary_large_image',
  site: '@stridemon',
  creator: '@yash_mittal_dev',
} as const

export const helpUrl = 'https://stridemon.xyz/help?source=showroom'

export const foundingPassUrl = 'https://stridemon.xyz/pass?source=showroom'
/** The whole collection, with its own finder: the same page as the Founding Pass. */
export const passCollectionUrl = foundingPassUrl
export const waitlistUrl = 'https://stridemon.xyz/waitlist?source=showroom'

/** The loader (Part 4). */
export const loaderCopy = {
  label: 'Opening the store',
  slow: 'Still loading… the collection is also at',
  slowLink: 'stridemon.xyz/pass',
} as const

/**
 * When the 3D store can't run (Part 4): no WebGL, a lost context, or files that didn't come. A still
 * of the lit store, and the same ways on.
 */
export const fallbackCopy = {
  noWebgl: {
    title: "Your browser can't show the 3D store",
    line: 'All 1,000 Founding Pass Sneakers are on stridemon.xyz, each with its own page.',
  },
  contextLost: {
    title: 'The 3D store stopped',
    line: 'Your device paused the 3D view. Try again, or see all 1,000 Sneakers on stridemon.xyz.',
  },
  filesFailed: {
    title: "The store couldn't load",
    line: 'Check your connection and try again, or see all 1,000 Sneakers on stridemon.xyz.',
  },
  browse: 'See all 1,000 on stridemon.xyz',
  tryAgain: 'Try again',
  help: 'Get help',
  stillAlt: 'The StrideMon store at night, its lights on, seen from the street.',
} as const

/** The lit store, rendered from the showroom itself by `bun run render-stills`. */
export const storeStills = {
  portrait: '/stills/store-portrait.webp',
  landscape: '/stills/store-landscape.webp',
  shareCard: '/stills/share-card.jpg',
} as const

/** The street, before stepping inside: said to screen readers (the store says it to the eye). */
export const arrivalCopy = {
  lightsComingOn: 'Outside the StrideMon store. The lights are coming on.',
  where:
    "Outside the StrideMon store. 1,000 Founding Pass Sneakers, free to mint, can't be sent or sold.",
  stepInside: 'Step inside',
} as const

/** Each stop's name, in walk order (the street first, then stops 1 to 5). */
export const stopNames = [
  'The street',
  'The #0137 lightbox',
  'The Rare wall',
  'The Legendary corner',
  'The Founding Pass wall',
  'The Sneaker wall',
] as const

export const walkCopy = {
  /** The one-time hint (D-068: the only words over the walk). */
  touchHint: 'Swipe up to walk',
  pointerHint: 'Scroll to walk',
  previousStop: 'Previous stop',
  nextStop: 'Next stop',
  stopsLabel: 'Stops in the store',
  goToStop: (stopNumber: number, stopCount: number, stopName: string) =>
    `Go to ${stopNumber} of ${stopCount}: ${stopName}`,
  whereYouAre: (stopNumber: number, stopCount: number, stopName: string) =>
    `${stopNumber} of ${stopCount} · ${stopName}`,
} as const

/** A design's page on the website: its own path, no leading zeros (D-066). */
export function buildPassPageUrl(designNumber: number): string {
  return `https://stridemon.xyz/pass/${designNumber}?source=showroom`
}

/** Look closer (D-068): the store's tag shows it; these are for the controls and screen readers. */
export const lookCloserCopy = {
  promise: "Free to mint. Can't be sent or sold.",
  seeIt: 'See it on stridemon.xyz',
  back: 'Back to the stop',
  previous: 'Previous Sneaker',
  next: 'Next Sneaker',
  /** "#0137 Rose Hiker Night, Common". */
  where: (passNumber: string, name: string, rarity: string) => `${passNumber} ${name}, ${rarity}`,
  /** The visually hidden list of what's at a stop. */
  listLabel: 'Here in the store',
  listItem: (passNumber: string, name: string, rarity: string) =>
    `${passNumber} ${name}, ${rarity}. Look closer`,
} as const

/** The store's own buttons (D-068), as the hidden list names them. */
export const storeButtonCopy = {
  stepInside: 'Step inside',
  foundingPass: "Get your Founding Pass. Free, can't be sent or sold",
  waitlist: 'Join the waitlist',
  find: 'Find a Sneaker',
} as const

/** Find a Sneaker (brief §10): a number or a name, or "Surprise me". */
export const findCopy = {
  open: 'Find a Sneaker',
  title: 'Find a Sneaker',
  fieldLabel: 'A number from 1 to 1,000, or a name',
  placeholder: '137, or Rose Hiker',
  surprise: 'Surprise me',
  close: 'Close',
  noMatch: (query: string) =>
    `No Sneaker matches “${query}”. Try a number from 1 to 1,000, or let us pick one.`,
  resultsLabel: 'Matching Sneakers',
  putOnStand: 'Puts it on the stand',
} as const

/** The deep link, `?pass=137` (brief §10). */
export const deepLinkCopy = {
  notFound: (text: string) =>
    `There's no Sneaker “${text}” in the collection. Walk in, and find one from 1 to 1,000.`,
} as const
