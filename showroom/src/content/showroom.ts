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
  backToStart: 'Back to the start',
  previousStop: 'Previous stop',
  nextStop: 'Next stop',
  stopsLabel: 'Stops in the store',
  goToStop: (stopNumber: number, stopCount: number, stopName: string) =>
    `Go to ${stopNumber} of ${stopCount}: ${stopName}`,
  whereYouAre: (stopNumber: number, stopCount: number, stopName: string) =>
    `${stopNumber} of ${stopCount} · ${stopName}`,
} as const
