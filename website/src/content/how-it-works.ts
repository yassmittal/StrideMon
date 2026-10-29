import { walkLoopVideoPath } from './demo-video'
import { type Screenshot, screenshots } from './screenshots'

export type HowItWorksStep = {
  title: string
  description: string
  screenshots: readonly Screenshot[]
  // A silent loop that replaces the (single) screenshot while on screen, when motion is allowed.
  loopVideoPath?: string
}

export const howItWorksContent = {
  heading: 'How it works',
} as const

// Four steps, one short line each (D-073). Energy lives in Under the hood → The rules.
export const howItWorksSteps: readonly HowItWorksStep[] = [
  {
    title: 'Get a Sneaker',
    description: 'Sign in with your wallet. Your first Sneaker NFT is free, and it’s yours.',
    screenshots: [screenshots.home],
  },
  {
    title: 'Walk or run',
    description: 'Press START and go. Your reward counts up as you move.',
    screenshots: [screenshots.activeRun],
    loopVideoPath: walkLoopVideoPath,
  },
  {
    title: 'Earn STRIDE',
    description: 'Press STOP. STRIDE lands in your wallet in seconds.',
    screenshots: [screenshots.runSummary],
  },
  {
    title: 'Level up',
    description: 'Spend STRIDE to repair and upgrade. A better Sneaker earns more.',
    screenshots: [screenshots.sneakerTab, screenshots.repairReview],
  },
]
