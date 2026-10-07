// Site-wide facts. `siteUrl` is the one place the domain lives (D-035, D-040). Vercel's domain
// redirects send `www.stridemon.xyz` and the old `stridemon.yashmittal.xyz` here.
export const siteUrl = 'https://stridemon.xyz'

/**
 * Where the waitlist form posts (D-037): the hosted StrideMon API, which allows this site's origin.
 * `NEXT_PUBLIC_WAITLIST_API_URL` overrides it for a local run (website/README.md → Waitlist).
 */
export const waitlistApiUrl =
  process.env.NEXT_PUBLIC_WAITLIST_API_URL ?? 'https://api.stridemon.xyz/v1/waitlist'

export const siteName = 'StrideMon'

/** The public contact for privacy and account deletion (D-039), also on the Play listing. */
export const supportEmail = 'yashmittalmm@gmail.com'

/** Google Play asks for both pages (D-039). The app links to the privacy policy. */
export const legalPagePaths = {
  privacyPolicy: '/privacy',
  deleteAccount: '/delete-account',
} as const

export const githubRepositoryUrl = 'https://github.com/yassmittal/StrideMon'

// The product's X account and the builder's (D-036). Handles keep their `@`.
export const xAccountHandle = '@stridemon'
export const xAccountUrl = 'https://x.com/stridemon'
export const xCreatorHandle = '@yash_mittal_dev'

export const siteTitle = 'StrideMon: walk, earn and upgrade a Sneaker NFT on Monad'

export const siteDescription =
  'A move-to-earn game on Monad. Own a Sneaker NFT, walk or run to earn STRIDE, and spend it to repair and level up your Sneaker.'

export const siteMetaLabels = ['StrideMon', 'Move to earn', 'Monad'] as const

// Links start at `/` so they also work from the privacy and delete-account pages.
export type NavigationLink = {
  label: string
  href: `/#${string}`
}

export const sectionIds = {
  howItWorks: 'how-it-works',
  rules: 'rules',
  fairPlay: 'fair-play',
  onChain: 'on-chain',
  whyMonad: 'why-monad',
  waitlist: 'waitlist',
  faq: 'faq',
} as const

export const navigationLinks: readonly NavigationLink[] = [
  { label: 'How it works', href: `/#${sectionIds.howItWorks}` },
  { label: 'Rules', href: `/#${sectionIds.rules}` },
  { label: 'Fair play', href: `/#${sectionIds.fairPlay}` },
  { label: 'On-chain', href: `/#${sectionIds.onChain}` },
  { label: 'Waitlist', href: `/#${sectionIds.waitlist}` },
  { label: 'FAQ', href: `/#${sectionIds.faq}` },
]

export const headerContent = {
  followLabel: 'Follow',
  followAccessibleLabel: `Follow StrideMon on X (${xAccountHandle})`,
  waitlistLabel: 'Join waitlist',
} as const

export const footerContent = {
  builtOnLine: 'Built on Monad testnet for a hackathon.',
  noValueLine: 'STRIDE has no monetary value.',
  githubLabel: 'GitHub',
  privacyPolicyLabel: 'Privacy',
  deleteAccountLabel: 'Delete account',
} as const
