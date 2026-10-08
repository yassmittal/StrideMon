import type { WaitlistPhonePlatform } from '@/lib/waitlist-request'

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
  joinedMessage: 'You’re on the list. We’ll email you once, when the waitlist window opens.',
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

export const waitlistPhonePlatformOptions: readonly {
  value: WaitlistPhonePlatform
  label: string
}[] = [
  { value: 'android', label: 'Android' },
  { value: 'ios', label: 'iPhone' },
]
