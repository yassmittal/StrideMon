import type { PassGallerySort } from '@/lib/founding-pass/pass-gallery-view'
import type { PassSchedulePhase, PassScheduleTimes } from '@/lib/founding-pass/pass-schedule'
import { helpPath, sectionIds, supportEmail, xAccountHandle, xAccountUrl } from './site'

// The Founding Pass gallery at /pass (D-041, D-044). Words: Founding Pass, founder, waitlist,
// waitlist window, open mint, one of one, and "all minted" (docs/founding-pass/README.md).

/**
 * The planned times (D-041), shown until the API answers with its own. Part 10 sets the exact
 * times in the API's config: change them here too.
 */
export const plannedPassScheduleTimes: PassScheduleTimes = {
  waitlistWindowStartsAt: '2026-11-28T14:30:00.000Z',
  openMintStartsAt: '2026-11-30T14:30:00.000Z',
  backupOpeningAt: '2026-12-14T14:30:00.000Z',
}

/**
 * The day early access is planned to start (D-049): the game starts over on fresh contracts and
 * only Founding Pass holders get a Sneaker. Yash switches it on by hand (Part 10), so it's a date
 * in words, not a time. Keep it in step with Part 10's date.
 */
export const plannedEarlyAccessStartDateText = 'Saturday 21 November'

/** The `/pass` page's sections, for in-page links. */
export const passSectionIds = {
  find: 'find',
  gallery: 'gallery',
  howItWorks: 'how-it-works',
  questions: 'questions',
} as const

/** Every surface with the pass says this (brief §9). */
export const passPromiseLine =
  'Free. It can’t be sent or sold. It isn’t a token and never turns into one.'

export const passPageContent = {
  title: 'Founding Pass: 1,000 one-of-one Sneakers',
  description:
    '1,000 Founding Passes, each a different Sneaker design and each one of one. Mint yours free on Monad testnet. It’s your early access to StrideMon.',
  metaLabels: ['Founding Pass', '1,000 designs', 'Free'],
  headlineWords: ['Founding', 'Pass'],
  intro:
    '1,000 Sneaker designs, and each one exists once. Pick yours and mint it free. It’s your early access to StrideMon, and the app gives you a Founder Sneaker in the same design.',
} as const

export type PassPhaseContent = {
  label: string
  /** What's happening now. */
  headline: string
  /** What the countdown counts to, when there is one. */
  countdownLabel: string | null
  /** What to do meanwhile. */
  nextStep: string
}

export const passPhaseContent: Record<PassSchedulePhase, PassPhaseContent> = {
  preview: {
    label: 'Preview',
    headline: 'Browse all 1,000 and pick your favourites. Minting hasn’t started.',
    countdownLabel: 'The waitlist window opens in',
    nextStep: 'Join the waitlist to mint 48 hours before everyone else.',
  },
  waitlistWindow: {
    label: 'Waitlist window',
    headline: 'People on the waitlist are minting now.',
    countdownLabel: 'The open mint starts in',
    nextStep:
      'Not on the waitlist? Heart the passes you like. Anyone can mint what’s left when the open mint starts.',
  },
  openMint: {
    label: 'Open mint',
    headline: 'Anyone can mint what’s left.',
    countdownLabel: null,
    nextStep: 'Find a pass you love before someone else does.',
  },
  allMinted: {
    label: 'All minted',
    headline: 'All 1,000 Founding Passes are minted.',
    countdownLabel: null,
    nextStep: 'StrideMon is open to everyone now, with a free Sneaker. No new passes, ever.',
  },
  openToAll: {
    label: 'Minting closed',
    headline: 'Minting has closed.',
    countdownLabel: null,
    nextStep: 'StrideMon is open to everyone now, with a free Sneaker. No new passes, ever.',
  },
}

export const passScheduleContent = {
  heading: 'The schedule',
  /** Shown when the API can't be reached: the planned times still stand. */
  unavailableLine: 'We can’t load which passes are minted right now. The gallery still works.',
  staleLine: 'We couldn’t refresh which passes are minted. What you see may be a minute old.',
  retryLabel: 'Try again',
  retryingLabel: 'Trying',
  mintedCountLabel: 'minted',
  liveLinePrefix: 'Latest',
  joinWaitlistLabel: 'Join the waitlist',
  getAppLabel: 'Get the app',
  browseLabel: 'Browse all 1,000',
  openMintUntilPrefix: 'Open until all 1,000 are minted, or until',
  steps: [
    {
      phase: 'preview',
      title: 'Preview',
      description: 'Browse, take the quiz, heart your favourites.',
      timeKey: null,
    },
    {
      phase: 'waitlistWindow',
      title: 'Waitlist window',
      description: '48 hours. People on the waitlist mint first.',
      timeKey: 'waitlistWindowStartsAt',
    },
    {
      phase: 'openMint',
      title: 'Open mint',
      description: 'Anyone mints what’s left.',
      timeKey: 'openMintStartsAt',
    },
    {
      phase: 'openToAll',
      title: 'Open to all',
      description: 'When all 1,000 are minted, or on this date at the latest.',
      timeKey: 'backupOpeningAt',
    },
  ] satisfies readonly {
    phase: PassSchedulePhase
    title: string
    description: string
    timeKey: keyof PassScheduleTimes | null
  }[],
} as const

/** Where the app stands, in the schedule panel (D-049). From the API's `isEarlyAccessGateOn`. */
export const passAppAccessContent = {
  label: 'The app',
  testPeriodText: `Anyone can try it now with a free Sneaker. On ${plannedEarlyAccessStartDateText}, early access starts: the game starts over, and only founders can play. Sneakers and STRIDE from before then don’t carry over.`,
  getAppLabel: 'Get the app',
  foundersOnlyPrefix:
    'Founders only, each with a Founder Sneaker. It opens to everyone when all 1,000 are minted, or on',
} as const

export const passFindContent = {
  metaLabels: ['Find yours', '1,000 designs'],
  heading: 'Find the one.',
  quizTitle: 'Find your match',
  quizDescription: 'Three quick questions, six passes that fit you.',
  quizStartLabel: 'Start the quiz',
  surpriseTitle: 'Surprise me',
  surpriseDescription: 'One random pass nobody has minted yet.',
  surpriseLabel: 'Surprise me',
  surpriseNoneLeft: 'There’s no pass left to pick.',
  searchTitle: 'Search by number',
  searchDescription: 'Know the one you want? Jump straight to it.',
  searchLabel: 'Pass number',
  searchPlaceholder: '#0137',
  searchSubmitLabel: 'Go',
  searchInvalid: 'Pick a number from 1 to 1,000.',
} as const

export type PassQuizOption = {
  key: string
  label: string
  /** Layer keys this answer matches (D-044). */
  matchKeys: readonly string[]
  /** The families whose swatches show beside a colour answer, when not its own. */
  swatchFamilyKeys?: readonly string[]
}

export type PassQuizQuestion = {
  key: 'walkTime' | 'color' | 'style'
  question: string
  options: readonly PassQuizOption[]
}

// The match quiz (D-041, D-044). Walk time picks colourways, colour picks families, style picks
// templates.
export const passQuizQuestions: readonly PassQuizQuestion[] = [
  {
    key: 'walkTime',
    question: 'When do you usually walk?',
    options: [
      { key: 'morning', label: 'Early morning', matchKeys: ['dawn', 'frost', 'haze'] },
      { key: 'daytime', label: 'In the day', matchKeys: ['day', 'flare', 'drift'] },
      { key: 'evening', label: 'In the evening', matchKeys: ['dusk', 'storm'] },
      { key: 'night', label: 'At night', matchKeys: ['night', 'eclipse'] },
    ],
  },
  {
    key: 'color',
    question: 'Pick a colour.',
    options: [
      { key: 'warm', label: 'Warm', matchKeys: ['ember', 'cherry', 'clay'] },
      { key: 'pink', label: 'Pink and purple', matchKeys: ['rose', 'plum'] },
      { key: 'blue', label: 'Blue', matchKeys: ['cobalt', 'ocean', 'lagoon'] },
      { key: 'green', label: 'Green', matchKeys: ['jade', 'moss', 'lime'] },
      { key: 'metal', label: 'Gold or chrome', matchKeys: ['gold', 'chrome'] },
      {
        key: 'prism',
        label: 'Every colour',
        matchKeys: ['prism'],
        swatchFamilyKeys: ['ember', 'lime', 'lagoon', 'plum'],
      },
    ],
  },
  {
    key: 'style',
    question: 'Pick a style.',
    options: [
      { key: 'everyday', label: 'Everyday', matchKeys: ['runner', 'court', 'sock'] },
      { key: 'fast', label: 'Fast', matchKeys: ['racer', 'spike'] },
      { key: 'outdoors', label: 'Outdoors', matchKeys: ['trail', 'hiker'] },
      { key: 'street', label: 'Street', matchKeys: ['hoop', 'chunky', 'skate'] },
    ],
  },
]

export const passQuizContent = {
  stepLabel: 'Question',
  backLabel: 'Back',
  closeLabel: 'Close the quiz',
  resultsHeading: 'Your six',
  resultsIntro: 'The passes nobody has minted yet that fit your answers best.',
  moreLabel: 'Show me six more',
  restartLabel: 'Start over',
  noneLeft: 'There’s no pass left to suggest.',
} as const

export const passGalleryContent = {
  metaLabels: ['The collection', 'One of one each'],
  heading: 'All 1,000',
  filtersLabel: 'Filters',
  hideFiltersLabel: 'Hide filters',
  templateLabel: 'Template',
  colorFamilyLabel: 'Colour family',
  rarityLabel: 'Rarity',
  detailsLabel: 'Details',
  detailsHint: 'Pick one template to filter by its details.',
  availableOnlyLabel: 'Available only',
  availableOnlyUnknown: 'We can’t tell which are available right now.',
  favouritesOnlyLabel: 'Favourites',
  sortLabel: 'Sort',
  clearFiltersLabel: 'Clear filters',
  showAllLabel: 'Show all passes',
  showMoreLabel: 'Show more',
  emptyHeading: 'No pass matches these filters.',
  emptyFavouritesHeading: 'No favourites yet.',
  emptyFavouritesText: 'Tap the heart on a pass to keep it here. Hearts stay in this browser.',
  recentlyMintedUnavailable: 'Recently minted needs the live minted state.',
} as const

export const passGallerySortOptions: readonly { value: PassGallerySort; label: string }[] = [
  { value: 'number', label: 'Number' },
  { value: 'rarity', label: 'Rarity' },
  { value: 'recentlyMinted', label: 'Recently minted' },
]

export const passCardContent = {
  available: 'Available',
  pending: 'Being minted',
  minted: 'Minted',
  mintedByPrefix: 'Minted by',
  addFavouriteLabel: 'Add to favourites',
  removeFavouriteLabel: 'Remove from favourites',
} as const

export const passDetailContent = {
  closeLabel: 'Close',
  oneOfOne: 'One of one',
  layersHeading: 'Layers',
  templateLabel: 'Template',
  colorFamilyLabel: 'Colour family',
  colorwayLabel: 'Colourway',
  lacesLabel: 'Laces',
  rarityHeading: 'Rarity',
  rarityCommonReason: 'Every layer is a common one.',
  rarityReasonJoiner: 'for',
  rarityNote: 'A pass is as rare as its rarest layer. Rarity is only for looks.',
  lacedHeading: 'After your first walk',
  lacedText:
    'Your first walk in the app laces the pass and your Founder Sneaker. The laces go in and the card says LACED.',
  lacedAltSuffix: 'laced after the first walk',
  similarHeading: 'Similar passes',
  similarTakenNote: 'Nobody has minted these yet.',
  openPageLabel: 'Open its page',
  copyLinkLabel: 'Copy link',
  copiedLabel: 'Copied',
  postOnXLabel: 'Post on X',
  explorerLabel: 'See it on MonadVision',
  backToGalleryLabel: 'All 1,000 passes',
  statusUnknown: 'We can’t tell right now whether it’s minted.',
  takenNextStep: 'This one is taken. These look like it and nobody has minted them yet.',
} as const

/** What a pass page or the detail sheet says to do next, by phase. Minting phases add the mint. */
export const passNextStepContent: Record<PassSchedulePhase, string> = {
  preview:
    'Minting hasn’t started. Heart it, and join the waitlist to mint 48 hours before everyone else.',
  waitlistWindow:
    'The waitlist window is open: people on the waitlist mint first. Anyone can mint from the open mint.',
  openMint: 'The open mint is on: anyone can mint a pass nobody has taken.',
  allMinted: 'All 1,000 are minted. StrideMon is open to everyone, with a free Sneaker.',
  openToAll: 'Minting has closed. StrideMon is open to everyone, with a free Sneaker.',
}

/** The X post for sharing a pass before it's minted (D-036: one tag, the site link with a source). */
export function buildPassShareText(passNumberText: string, passName: string): string {
  return `${passNumberText} ${passName}: my pick from the 1,000 one-of-one ${xAccountHandle} Founding Passes.`
}

export const passHowItWorksContent = {
  metaLabels: ['How it works', 'Four steps'],
  heading: 'From waitlist to your first walk',
  helpLabel: 'Read the full help',
  helpPath,
  steps: [
    {
      title: 'Join the waitlist',
      description:
        'Leave your email before the waitlist window opens. We write once, when it opens, and nothing else.',
    },
    {
      title: 'Mint in the waitlist window',
      description:
        'For 48 hours, people on the waitlist mint first. Check your email, connect a wallet and pick a pass. It’s free, with no gas to pay.',
    },
    {
      title: 'Get the app with the same wallet',
      description:
        'Install StrideMon on Android and sign in with the wallet that holds your pass. That’s how the app knows you’re a founder.',
    },
    {
      title: 'Run in your Founder Sneaker',
      description:
        'The app gives you a Founder Sneaker drawn in your pass’s design. Your first walk laces both.',
    },
  ],
} as const

export type PassQuestion = {
  question: string
  answer: string
}

export const passQuestionsContent = {
  metaLabels: ['Questions', 'Founding Pass'],
  heading: 'Questions',
  helpLabel: 'Read the full help',
  helpPath,
  helpPrompt: 'Still stuck? Write to',
  helpOr: 'or ask on X:',
  supportEmail,
  xAccountHandle,
  xAccountUrl,
} as const

export const passQuestions: readonly PassQuestion[] = [
  {
    question: 'Is it free?',
    answer: 'Yes. Minting is free, and there’s no gas to pay: StrideMon pays it.',
  },
  {
    question: 'Can I send or sell my pass?',
    answer:
      'No. The pass and your Founder Sneaker can’t be sent or sold. The pass isn’t a token and never turns into one.',
  },
  {
    question: 'Is the pass my Sneaker?',
    answer:
      'No, they’re two things. The pass is your membership card: you mint it here, and it shows you’re a founder. The Founder Sneaker is the shoe you walk with: the app gives it to you, drawn in your pass’s design, when you sign in with the wallet that holds the pass.',
  },
  {
    question: 'Why does my pass have two numbers?',
    answer:
      'The pass number, like #0137, is the design: which of the 1,000 you picked. The founder number, like Founder 42, is the order you minted in: the 42nd founder to mint.',
  },
  {
    question: 'Can I play the app before I have a pass?',
    answer: `Until early access starts on ${plannedEarlyAccessStartDateText}, anyone can try it with a free Sneaker. Then the game starts over, and only founders can play until all 1,000 are minted or the last date in the schedule. Sneakers and STRIDE from before early access don’t carry over.`,
  },
  {
    question: 'How many can I mint?',
    answer: 'One pass per email and one per wallet.',
  },
  {
    question: 'What is the waitlist window?',
    answer:
      'The first 48 hours of minting. Only emails that joined the waitlist before it opened can mint then, so check the same email you joined with. After that, anyone can mint what’s left.',
  },
  {
    question: 'Do I need a wallet now?',
    answer:
      'Not to browse, heart passes or join the waitlist. To mint, you need a wallet such as MetaMask. You sign a free message to prove it’s yours: there’s no gas to pay.',
  },
  {
    question: 'Which wallet should I use?',
    answer:
      'The one you’ll use in the app. The app knows you’re a founder by the wallet that holds your pass. MetaMask works on Android and as a laptop extension.',
  },
  {
    question: 'The code didn’t arrive.',
    answer:
      'Look in spam and promotions for an email from hello@stridemon.xyz. You can ask for a new code after a minute, and only the newest code works.',
  },
  {
    question: 'My wallet won’t switch to Monad Testnet.',
    answer:
      'Add it by hand in your wallet: network name Monad Testnet, RPC URL https://testnet-rpc.monad.xyz, chain ID 10143, currency MON. Then switch to it. You can sign in and mint without it, but the app needs it.',
  },
  {
    question: 'The robot check won’t load.',
    answer:
      'It’s Cloudflare Turnstile. Content blockers can stop it: allow stridemon.xyz, or try another browser, then reload the page.',
  },
  {
    question: 'Someone minted the pass I wanted.',
    answer:
      'Each pass exists once, and the first mint wins. Nothing is minted for you, and you see three similar passes nobody has yet, each one tap away.',
  },
  {
    question: 'I lost the wallet that holds my pass.',
    answer:
      'Write to us from the email you minted with. Once a code sent to that email checks out, we can move your pass and your Founder Sneaker to a new wallet, by hand. That’s the one way a pass ever moves.',
  },
  {
    question: 'What do rarity and the gold frame mean?',
    answer:
      'A pass is as rare as its rarest layer. About 1 in 10 passes gets a gold frame at random when it’s minted. Both are only for looks.',
  },
  {
    question: 'Where are my favourites saved?',
    answer: 'In this browser only. We never see them, and clearing the site’s data removes them.',
  },
  {
    question: 'What happens after all 1,000 are minted?',
    answer:
      'No new passes, ever. StrideMon opens to everyone with a free normal Sneaker. If they aren’t all minted, it opens on the last date in the schedule anyway.',
  },
]

/** The landing page's section (D-044). */
export const foundingPassSectionContent = {
  id: sectionIds.foundingPass,
  metaLabels: ['Founding Pass', 'Free', 'One of one'],
  heading: '1,000 Sneakers. Each one of one.',
  intro:
    'Before StrideMon opens to everyone, 1,000 Founding Passes go out free. Each is a different Sneaker design and your early access: the app gives you a Founder Sneaker in the same design.',
  galleryLabel: 'See all 1,000',
  waitlistLabel: 'Join the waitlist',
  showcaseDesignNumbers: [137, 185, 162, 153, 155, 200],
} as const
