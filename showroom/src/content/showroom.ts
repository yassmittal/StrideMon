// The showroom's own words and links. Every link out to stridemon.xyz carries `?source=showroom`
// (brief §7.7).

export const showroomUrl = 'https://showroom.stridemon.xyz'
export const showroomTitle = 'StrideMon Showroom'
export const showroomDescription =
  'Walk into the StrideMon store after hours and see the 1,000 Founding Pass Sneakers on its walls.'

export const helpUrl = 'https://stridemon.xyz/help?source=showroom'

export const storeStatusCopy = {
  loading: 'Opening the store',
  failed: "The store couldn't load. Check your connection and reload the page.",
  reload: 'Reload',
  help: 'Get help',
} as const

export const foundingPassUrl = 'https://stridemon.xyz/pass?source=showroom'
export const waitlistUrl = 'https://stridemon.xyz/waitlist?source=showroom'

/** The header: always on screen (brief §4, Leave). */
export const headerCopy = {
  wordmark: 'StrideMon',
  place: 'Showroom',
  foundingPass: 'Get your Founding Pass',
  foundingPassNote: "Free. Can't be sent or sold.",
  waitlist: 'Join the waitlist',
  help: 'Help',
} as const

/** The street, before stepping inside. */
export const arrivalCopy = {
  lightsComingOn: 'Outside the StrideMon store. The lights are coming on.',
  where: 'Outside the store',
  line: "The StrideMon store. 1,000 Founding Pass Sneakers, free to mint, can't be sent or sold.",
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
  hint: 'Scroll or swipe to walk',
  /** "Swipe for the Rare wall", lower-casing the stop's "The". */
  nextStep: (isTouchFirst: boolean, nextStopName: string) =>
    `${isTouchFirst ? 'Swipe' : 'Scroll'} for ${nextStopName.replace(/^The /, 'the ')}`,
  lastStop: "That's the whole store. Go back to the start, or walk back the way you came.",
  /** The next step, then "Tap a Sneaker to look closer." */
  withLookCloserHint: (nextStep: string, lookCloserHint: string) =>
    `${nextStep.replace(/\.$/, '')}. ${lookCloserHint}.`,
  backToStart: 'Back to the start',
  previousStop: 'Previous stop',
  nextStop: 'Next stop',
  stopsLabel: 'Stops in the store',
  goToStop: (stopNumber: number, stopCount: number, stopName: string) =>
    `Go to ${stopNumber} of ${stopCount}: ${stopName}`,
  whereYouAre: (stopNumber: number, stopCount: number, stopName: string) =>
    `${stopNumber} of ${stopCount} · ${stopName}`,
} as const

/**
 * The API, for the minted state (D-066). `NEXT_PUBLIC_API_BASE_URL` points it at the local stack
 * (`cd apps/api && bun run pass:local-stack`): never the local API against testnet.
 */
export const apiBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL ?? 'https://api.stridemon.xyz'
export const passCollectionApiUrl = `${apiBaseUrl}/v1/pass/collection`

/** A design's page on the website: its own path, no leading zeros (D-066). */
export function buildPassPageUrl(designNumber: number): string {
  return `https://stridemon.xyz/pass/${designNumber}?source=showroom`
}

/** The quiet line when the minted state can't be read. */
export const collectionCopy = {
  unavailable: "We can't check which Sneakers are minted right now. Trying again.",
} as const

/** The card of look closer (brief §6.4). */
export const lookCloserCopy = {
  promise: "Free to mint. Can't be sent or sold.",
  available: 'Available',
  pending: 'Being minted',
  minted: 'Minted',
  mintedByFounder: (founderNumber: number) => `Minted · Founder ${founderNumber}`,
  checking: 'Checking if it’s minted',
  unknown: "Couldn't check if it's minted",
  seeIt: 'See it on stridemon.xyz',
  mintIt: 'Mint it on stridemon.xyz',
  back: 'Back',
  previous: 'Previous Sneaker',
  next: 'Next Sneaker',
  /** "The Rare wall · 3 of 20". */
  where: (placeName: string, position: number, count: number) =>
    count > 1 ? `${placeName} · ${position} of ${count}` : placeName,
  standPlace: 'On the stand',
  counterScreenPlace: 'The counter’s screen',
  windowPlace: 'In the window',
  /** The visually hidden list of the Sneakers at a stop. */
  listLabel: 'Sneakers here',
  listItem: (passNumber: string, name: string, rarity: string) =>
    `${passNumber} ${name}, ${rarity}. Look closer`,
  tapHint: 'Tap a Sneaker to look closer',
  clickHint: 'Click a Sneaker to look closer',
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
