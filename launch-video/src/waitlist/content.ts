// Every word in the waitlist film, mirrored from FACTS.md §12. Nothing goes on screen from anywhere
// else. No dates, prices, counts or STRIDE amounts (docs/waitlist-video-prompt.md §1).

export const hookContent = {
  headlineLines: ['1,000 Founding', 'Passes.'],
} as const

export const collectionContent = {
  headline: 'Each design exists once.',
  legendaryLabel: 'Legendary',
  legendaryCountText: '10 of 1,000',
} as const

export const passContent = {
  passHeadlineLines: ['Your way into', 'StrideMon.'],
  founderSneakerHeadlineLines: ['Your Founder Sneaker,', 'in the same design.'],
} as const

export const promiseContent = {
  lines: ['Free. We pay the gas.', 'Can’t be sold or sent.', 'It stays with you.'],
  metaItems: ['Founding Pass'],
} as const

/** The site's waitlist section (website/src/content/waitlist.ts), word for word. */
export const askContent = {
  metaItems: ['Waitlist', 'Founding Pass'],
  headline: 'Join the waitlist.',
  sentenceLines: ['Mint 48 hours', 'before everyone else.'],
  emailLabel: 'Email',
  emailPlaceholder: 'you@example.com',
  /** The form's own placeholder, typed in: never a real address. */
  emailValue: 'you@example.com',
  submitLabel: 'Join the waitlist',
  submittingLabel: 'Joining',
  promise: 'One email, when the waitlist window opens, and nothing else.',
  joinedHeadline: 'You’re on the list.',
  joinedSentence: 'We’ll email you once, when the waitlist window opens.',
} as const

export const waitlistEndCardContent = {
  siteLabel: 'stridemon.xyz/pass',
  wordmark: 'StrideMon',
  metaItems: ['Monad testnet'],
} as const
