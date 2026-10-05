// Site-wide facts. `siteUrl` is the one place the domain lives (D-035): it may move to
// stridemon.com later.
export const siteUrl = 'https://stridemon.yashmittal.xyz'

export const siteName = 'StrideMon'

/**
 * PLACEHOLDER: confirm before launch. Read from this checkout's `origin` remote; Yash fills in the
 * final public URL (the link 404s if the repository is private).
 */
export const githubRepositoryUrl = 'https://github.com/yassmittal/StrideMon'

export const siteTitle = 'StrideMon: walk, earn and upgrade a Sneaker NFT on Monad'

export const siteDescription =
  'A move-to-earn game on Monad. Own a Sneaker NFT, walk or run to earn SOLE, and spend it to repair and level up your Sneaker.'

export const siteMetaLabels = ['StrideMon', 'Move to earn', 'Monad'] as const

export type NavigationLink = {
  label: string
  href: `#${string}`
}

export const sectionIds = {
  howItWorks: 'how-it-works',
  demo: 'demo',
  rules: 'rules',
  fairPlay: 'fair-play',
  onChain: 'on-chain',
  whyMonad: 'why-monad',
  faq: 'faq',
} as const

export const navigationLinks: readonly NavigationLink[] = [
  { label: 'How it works', href: `#${sectionIds.howItWorks}` },
  { label: 'Rules', href: `#${sectionIds.rules}` },
  { label: 'Fair play', href: `#${sectionIds.fairPlay}` },
  { label: 'On-chain', href: `#${sectionIds.onChain}` },
  { label: 'FAQ', href: `#${sectionIds.faq}` },
]

export const footerContent = {
  builtOnLine: 'Built on Monad testnet for a hackathon.',
  noValueLine: 'SOLE has no monetary value.',
  githubLabel: 'GitHub',
} as const
