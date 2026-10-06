// Every word, number and address in the film, mirrored from FACTS.md. Nothing goes on screen from
// anywhere else. Times in source seconds refer to website/media-source/video2.mp4.
//
// The reward token is called STRIDE (Yash, 2026-10-06; FACTS.md §1). The deployed contract and the
// app still say SOLE until the rename ships, so the film never shows footage with the old name.

export const walletAddresses = {
  playerA: { short: '0xdfAb…1465', full: '0xdfAb550B4D28cD040Cf79Bf350Ac3017923C1465' },
  playerB: { short: '0xe4ae…356f', full: '0xe4ae33003C3fF8afd68fa65Fafa97F6206c3356f' },
} as const

/** What the run screen showed, second by second. FACTS.md §3 and FOOTAGE.md. */
export type LiveRunReadout = {
  /** When this readout appears in video2.mp4. */
  sourceSeconds: number
  distanceText: string
  speedText: string
  energyLeft: number
  estimatedRewardText: string
}

export const ENERGY_AT_START = 10

/** The walk, video2 184.0–212.0 s (timer 1:53 → 2:20). The rebuilt run screen shows these. */
export const liveRunReadouts: readonly LiveRunReadout[] = [
  {
    sourceSeconds: 184.0,
    distanceText: '64 m',
    speedText: '4.0 KM/H',
    energyLeft: 9,
    estimatedRewardText: '+5 STRIDE',
  },
  {
    sourceSeconds: 188.5,
    distanceText: '64 m',
    speedText: '3.2 KM/H',
    energyLeft: 9,
    estimatedRewardText: '+5 STRIDE',
  },
  {
    sourceSeconds: 188.75,
    distanceText: '70 m',
    speedText: '3.2 KM/H',
    energyLeft: 9,
    estimatedRewardText: '+5 STRIDE',
  },
  {
    sourceSeconds: 190.9,
    distanceText: '70 m',
    speedText: '3.2 KM/H',
    energyLeft: 8,
    estimatedRewardText: '+10 STRIDE',
  },
  {
    sourceSeconds: 194.9,
    distanceText: '77 m',
    speedText: '3.9 KM/H',
    energyLeft: 8,
    estimatedRewardText: '+10 STRIDE',
  },
  {
    sourceSeconds: 198.5,
    distanceText: '77 m',
    speedText: '4.1 KM/H',
    energyLeft: 8,
    estimatedRewardText: '+10 STRIDE',
  },
  {
    sourceSeconds: 199.0,
    distanceText: '82 m',
    speedText: '4.1 KM/H',
    energyLeft: 8,
    estimatedRewardText: '+10 STRIDE',
  },
  {
    sourceSeconds: 205.0,
    distanceText: '87 m',
    speedText: '3.7 KM/H',
    energyLeft: 8,
    estimatedRewardText: '+10 STRIDE',
  },
  {
    sourceSeconds: 210.75,
    distanceText: '93 m',
    speedText: '3.2 KM/H',
    energyLeft: 8,
    estimatedRewardText: '+10 STRIDE',
  },
]

export const TOKEN_SYMBOL = 'STRIDE'

/** The run screen's fixed text (screenshot 03), for the rebuild. */
export const runScreenContent = {
  metaItems: ['Run in progress', 'Sneaker #2'],
  // Wrapped where the phone wraps it (screenshot 03).
  estimateNoteLines: [
    'Estimates assume every minute counts. The server checks',
    'your GPS when you stop.',
  ],
  stopLabel: 'Stop',
} as const

/** The run's clock: 1:53 shows from 184.25 s of video2 (FACTS.md §3). */
export const RUN_TIMER_SECONDS_AT_SOURCE_ZERO = 113 - 184.25

/**
 * Screenshot 03 (timer 2:52), only for the rebuild's overlay check against the PNG, which still
 * shows the old token name. Never on screen.
 */
export const screenshotRunScreen = {
  timerText: '2:52',
  distanceText: '132 m',
  speedText: '3.6 KM/H',
  energyLeft: 8,
  estimatedRewardText: '+10 SOLE',
  gpsStatus: '31 GPS points recorded. 1 waiting to upload.',
} as const

/** Each step scene: a small step label, one headline and one plain sentence. */
export type StepCopy = {
  stepLabel?: string
  headline: string
  sentenceLines: readonly string[]
}

export const introContent = {
  headlineLines: ['Meet', 'StrideMon.'],
  sentence: 'A move-to-earn game on Monad.',
} as const

export const getSneakerContent: StepCopy = {
  stepLabel: 'Step 1 of 4',
  headline: 'Get a Sneaker.',
  sentenceLines: ['Your Sneaker is an NFT.', 'The first one is free.'],
}

export const walkContent: StepCopy & { distanceLabel: string; rewardLabel: string } = {
  stepLabel: 'Step 2 of 4',
  headline: 'Walk or run.',
  sentenceLines: ['The app tracks your time', 'and distance as you go.'],
  distanceLabel: 'Distance',
  rewardLabel: 'Estimated reward',
}

export const earnContent: StepCopy & {
  metaItems: readonly string[]
  rewardNumber: number
  noteItems: readonly string[]
} = {
  stepLabel: 'Step 3 of 4',
  headline: `Earn ${TOKEN_SYMBOL}.`,
  sentenceLines: [`Stop the run, and ${TOKEN_SYMBOL}`, 'lands in your wallet.'],
  metaItems: ['You earned', 'Run settled'],
  rewardNumber: 10,
  noteItems: ['A 3-minute walk', 'Settled on Monad testnet'],
}

/** Level → STRIDE per rewarded minute (0.5 × efficiency, efficiency 10 + 2 per level). */
export const upgradeLevels = [
  { level: 1, tokensPerMinute: 5 },
  { level: 2, tokensPerMinute: 6 },
  { level: 3, tokensPerMinute: 7 },
  { level: 4, tokensPerMinute: 8 },
  { level: 5, tokensPerMinute: 9 },
] as const

export const upgradeContent: StepCopy & {
  repairDurabilityFrom: number
  repairDurabilityTo: number
  tokensPerMinuteLabel: string
} = {
  stepLabel: 'Step 4 of 4',
  headline: 'Level it up.',
  sentenceLines: [`Spend ${TOKEN_SYMBOL} to repair and`, 'upgrade it. Each level earns more.'],
  repairDurabilityFrom: 60,
  repairDurabilityTo: 100,
  tokensPerMinuteLabel: `${TOKEN_SYMBOL} / min`,
}

export const ownItContent: StepCopy & { ownerLabel: string } = {
  headline: 'It’s really yours.',
  sentenceLines: ['It lives in your wallet. Send it to', 'any wallet, and its stats go with it.'],
  ownerLabel: 'Owner',
}

export const endCardContent = {
  headlineLines: ['Walk.', 'Earn.', 'Upgrade.'],
  wordmark: 'StrideMon',
  metaItems: ['Monad testnet', 'Android demo'],
  siteLabel: 'stridemon.yashmittal.xyz',
  disclaimer: `${TOKEN_SYMBOL} is a testnet token with no monetary value.`,
} as const
