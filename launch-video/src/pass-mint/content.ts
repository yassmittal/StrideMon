import type { PassMintStepName } from './timeline'

// Every word on screen in the Pass mint film. FACTS.md §19 sources each line.

export const hookLines = {
  title: 'This Sneaker exists once.',
  subtitle: 'Here’s the whole mint. It’s free.',
} as const

export const rewindLabel = 'Rewind'

export const stepContent: Record<
  PassMintStepName,
  { number: string; trackerLabel: string; title: string; subtitle: string }
> = {
  pick: {
    number: '01',
    trackerLabel: 'Pick',
    title: 'Pick one of 1,000',
    subtitle: 'Each design exists once.',
  },
  email: {
    number: '02',
    trackerLabel: 'Email',
    title: 'Check your email',
    subtitle: 'A 6-digit code. One pass per person.',
  },
  wallet: {
    number: '03',
    trackerLabel: 'Wallet',
    title: 'Sign in with your wallet',
    subtitle: 'A free signature. Nothing is sent on-chain.',
  },
  mint: {
    number: '04',
    trackerLabel: 'Mint',
    title: 'Mint it',
    subtitle: 'No gas to pay. StrideMon pays it.',
  },
}

/** On the email cut, where the recording skips the wait for the code. */
export const emailCutLabel = 'Code from your inbox'

export const revealLines = {
  title: 'One of one. Mine.',
  subtitle: 'The app gives me a Founder Sneaker in the same design.',
} as const

export const endCardLines = {
  headline: ['1,000 Founding Passes.', 'Free. Each one exists once.'],
  waitlist: 'The waitlist mints 48 hours before everyone else.',
  url: 'stridemon.xyz/pass',
} as const
