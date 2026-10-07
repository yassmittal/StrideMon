import type { WaitlistPhonePlatform } from '@/lib/waitlist-request'

// The waitlist section (D-037), a line for the 1,000 Founding Passes since D-041. Email only,
// never a wallet: the pass is claimed in the app.
export const waitlistContent = {
  metaLabels: ['Founding Pass', 'Android first'],
  heading: 'Get one of 1,000 Founding Passes.',
  intro:
    'The first 1,000 players get a free, numbered Founding Pass on Monad testnet and play before everyone else. Verify your email to take your place in line. We open the line in waves.',
  followPrompt: 'Or follow along on X:',
  emailLabel: 'Email',
  emailPlaceholder: 'you@example.com',
  phonePlatformLabel: 'Your phone (optional)',
  submitLabel: 'Get my place',
  submittingLabel: 'Sending',
  promise:
    'Free. The pass can’t be sold or transferred, and it isn’t a token. No token sale, no airdrop. STRIDE has no monetary value. Ask and we’ll delete your email.',
  invalidEmailError: 'That doesn’t look like an email.',
  requestFailedError: 'Something went wrong. Try again in a minute.',
} as const

export const waitlistCodeContent = {
  codeLabel: 'Code from your email',
  buildIntro: (email: string) =>
    `We sent a 6-digit code to ${email}. It works for 10 minutes. Check your spam folder if it isn’t there.`,
  verifyLabel: 'Verify',
  verifyingLabel: 'Checking',
  resendLabel: 'Send a new code',
  resentNote: 'A new code is on its way. Only one is sent a minute.',
  changeEmailLabel: 'Use a different email',
  incompleteCodeError: 'Enter the 6 digits from the email.',
  invalidCodeError: 'That code is wrong or has expired. Send a new one.',
} as const

export const waitlistPlaceContent = {
  placeLabel: 'Your place in line',
  buildReferralLine: (referralCount: number) =>
    referralCount === 1
      ? '1 friend joined with your link.'
      : `${referralCount} friends joined with your link.`,
  shareIntro: 'Each friend who verifies their email with your link moves you up 10 places.',
  shareLinkLabel: 'Your link',
  copyLabel: 'Copy',
  copiedLabel: 'Copied',
  shareLabel: 'Share',
  shareText:
    'I’m in line for a StrideMon Founding Pass: walk, earn and upgrade a Sneaker on Monad.',
  waveNote: 'We open the line in waves and email you when it’s your turn.',
  notYouLabel: 'Not you? Use a different email',
} as const

export const waitlistPhonePlatformOptions: readonly {
  value: WaitlistPhonePlatform
  label: string
}[] = [
  { value: 'android', label: 'Android' },
  { value: 'ios', label: 'iPhone' },
]
