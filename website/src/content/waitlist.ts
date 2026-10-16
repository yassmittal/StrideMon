import type { WaitlistPhonePlatform } from '@/lib/waitlist-request'
import { siteUrl, waitlistPagePath, xAccountHandle } from './site'

// The waitlist section (D-037), on the landing page and /pass. Email only, never a wallet. Its
// promise (D-041, D-043): one email, when the Founding Pass waitlist window opens, and nothing else.
export const waitlistContent = {
  metaLabels: ['Waitlist', 'Founding Pass'],
  heading: 'Join the waitlist to mint 48 hours before everyone else.',
  intro:
    'The Founding Pass mint opens with a 48-hour waitlist window, only for people on the waitlist. Leave your email and we’ll write once, when the window opens.',
  followPrompt: 'Or follow along on X:',
  emailLabel: 'Email',
  emailPlaceholder: 'you@example.com',
  phonePlatformLabel: 'Your phone (optional)',
  submitLabel: 'Join the waitlist',
  submittingLabel: 'Joining',
  promise:
    'One email, when the waitlist window opens, and nothing else. Nothing is for sale. STRIDE has no monetary value. Ask and we’ll delete your email.',
  invalidEmailError: 'That doesn’t look like an email.',
  requestFailedError: 'Something went wrong. Try again in a minute.',
  /** After the window opens, joining no longer gets anyone into it (D-043). */
  closedHeading: 'The waitlist window has opened.',
  closedTextPrefix:
    'Joining now doesn’t get you into it. Anyone can mint what’s left in the open mint, from',
  closedOpenMintText: 'The open mint is on: anyone can mint a pass nobody has taken.',
  closedOpenToAllHeading: 'Minting has closed.',
  closedOpenToAllText: 'StrideMon is open to everyone now, with a free Sneaker.',
  closedGalleryLabel: 'See the passes',
} as const

/** The card that replaces the form after joining (D-055). New and repeat emails both see it. */
export const waitlistJoinedContent = {
  ticketLabel: 'Waitlist',
  ticketStatus: 'Joined',
  heading: 'You’re on the list.',
  windowLabel: 'Window opens',
  headStartLabel: 'Head start',
  headStartValue: '48 hours',
  promise: 'We’ll email you once, when the waitlist window opens.',
  sharePrompt: 'Anyone who joins gets the same 48 hours.',
  postOnXLabel: 'Post on X',
  postOnXAccessibleLabel: 'Post on X (opens in a new tab)',
  favouritesLabel: 'Heart your favourites',
  useAnotherEmailLabel: 'Use a different email',
} as const

/** Where a shared post sends people: the waitlist page, with a source the form stores (D-037). */
export const waitlistShareUrl = `${siteUrl}${waitlistPagePath}?source=x-waitlist`

/**
 * The post X opens with (D-055, `social/voice.md`): what StrideMon is, why join, one tag. With
 * the link (23 characters on X) it stays under 280.
 */
export const waitlistShareText = [
  `I joined the ${xAccountHandle} waitlist.`,
  'StrideMon: walk with a Sneaker NFT on Monad testnet, earn STRIDE, and spend it to level the Sneaker up.',
  'People on the waitlist mint a free Founding Pass 48 hours before everyone else.',
].join('\n\n')

/** `/waitlist`, the page a shared post links to, and its share image (D-055). */
export const waitlistPageContent = {
  title: 'Join the waitlist',
  description:
    'Leave your email to mint a free StrideMon Founding Pass 48 hours before everyone else. One email, when the waitlist window opens, and nothing else.',
  shareImageAlt:
    'Join the StrideMon waitlist: mint a free Founding Pass 48 hours before everyone else.',
  shareImageMetaLabels: ['StrideMon', 'Waitlist', 'Founding Pass'],
  shareImageHeadlineWords: ['Join the', 'waitlist'],
  shareImageSubline: 'Mint a free Founding Pass 48 hours before everyone else.',
  shareImageFacts: [
    { label: 'Head start', value: '48 hours' },
    { label: 'Founding Pass', value: 'Free' },
  ],
  /** Shoes on the joined card and the share image: four of the six on the landing page. */
  showcaseDesignNumbers: [155, 185, 137, 200],
} as const

export const waitlistPhonePlatformOptions: readonly {
  value: WaitlistPhonePlatform
  label: string
}[] = [
  { value: 'android', label: 'Android' },
  { value: 'ios', label: 'iPhone' },
]
