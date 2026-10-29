import { sectionIds } from './site'

export type WhyMonadPoint = {
  icon: 'fast' | 'cheap' | 'wallet'
  title: string
  description: string
}

/** Its own section, always shown (D-073). */
export const whyMonadContent = {
  id: sectionIds.whyMonad,
  heading: 'Why Monad',
} as const

export const whyMonadPoints: readonly WhyMonadPoint[] = [
  {
    icon: 'fast',
    title: 'Settles in seconds',
    description: 'Every run is its own transaction. Your STRIDE shows up right after STOP.',
  },
  {
    icon: 'cheap',
    title: 'Gas is almost free',
    description:
      'So every new player gets some free, to repair, upgrade and send from their wallet.',
  },
  {
    icon: 'wallet',
    title: 'Works with MetaMask',
    description: 'Plain ERC-721 and ERC-20 contracts. No new wallet to learn.',
  },
]
