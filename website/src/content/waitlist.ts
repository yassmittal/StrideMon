import type { WaitlistPhonePlatform } from '@/lib/waitlist-request'

// The waitlist section (D-037). One email when StrideMon opens; email only, never a wallet.
export const waitlistContent = {
  metaLabels: ['Waitlist', 'Android first'],
  heading: 'Get notified when StrideMon opens.',
  intro:
    'StrideMon runs on Monad testnet as an Android demo build today. Leave your email and we’ll write once when you can play.',
  emailLabel: 'Email',
  emailPlaceholder: 'you@example.com',
  phonePlatformLabel: 'Your phone (optional)',
  submitLabel: 'Join the waitlist',
  submittingLabel: 'Joining',
  promise:
    'One email when it opens, nothing else. No token sale, no airdrop. STRIDE has no monetary value. Ask and we’ll delete your email.',
  joinedMessage: 'You’re on the list.',
  invalidEmailError: 'That doesn’t look like an email.',
  requestFailedError: 'Something went wrong. Try again in a minute.',
} as const

export const waitlistPhonePlatformOptions: readonly {
  value: WaitlistPhonePlatform
  label: string
}[] = [
  { value: 'android', label: 'Android' },
  { value: 'ios', label: 'iPhone' },
]
