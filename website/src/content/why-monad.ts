export type WhyMonadPoint = {
  title: string
  description: string
}

export const whyMonadContent = {
  heading: 'Why Monad',
} as const

export const whyMonadPoints: readonly WhyMonadPoint[] = [
  {
    title: 'Fast settlement',
    description:
      'Every run settles as its own transaction, fast enough that the reward shows on the summary screen seconds after STOP.',
  },
  {
    title: 'Cheap gas',
    description:
      'Gas is cheap enough to give each new player a drip, so they can repair, upgrade and transfer from their own wallet.',
  },
  {
    title: 'Plain EVM',
    description: 'Standard ERC-721 and ERC-20 contracts work in standard wallets like MetaMask.',
  },
]
