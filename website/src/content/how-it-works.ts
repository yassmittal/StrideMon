import { type Screenshot, screenshots } from './screenshots'

export type HowItWorksStep = {
  title: string
  description: string
  screenshots: readonly Screenshot[]
}

export const howItWorksContent = {
  metaLabels: ['The loop', 'Six steps'],
  heading: 'How it works',
  loopLabels: ['Own', 'Energy', 'Move', 'Earn', 'Upgrade', 'Move again'],
} as const

export const howItWorksSteps: readonly HowItWorksStep[] = [
  {
    title: 'Own',
    description:
      'Sign in with your wallet and get a free starter Sneaker NFT, plus a little test MON for gas.',
    screenshots: [screenshots.welcome],
  },
  {
    title: 'Energy',
    description:
      'Each Sneaker holds up to 10 energy. One point is one rewarded minute, and a point comes back every 30 minutes.',
    screenshots: [screenshots.home],
  },
  {
    title: 'Move',
    description:
      'Press START and walk or run. Time, distance, speed and your estimated reward are live on screen.',
    screenshots: [screenshots.activeRun],
  },
  {
    title: 'Earn',
    description:
      'Press STOP. The run is checked, then settled on Monad in seconds, and SOLE lands in your wallet.',
    screenshots: [screenshots.runSummary],
  },
  {
    title: 'Upgrade',
    description:
      'Spend SOLE to repair durability or to level the Sneaker up. Each level adds efficiency, so the next run pays more.',
    screenshots: [screenshots.sneakerTab, screenshots.repairReview],
  },
  {
    title: 'Own it, really',
    description: 'Send the Sneaker to any wallet. Its level, efficiency and durability go with it.',
    screenshots: [screenshots.transfer],
  },
]
