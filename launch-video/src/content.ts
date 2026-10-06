// Every word, number, address and hash in the film, mirrored from FACTS.md. Nothing goes on
// screen from anywhere else. Times in source seconds refer to website/media-source/video2.mp4.

export const contracts = [
  { name: 'SneakerNft', address: '0xC116917b06BD9079C87334ED5499054b1B54Fa80' },
  { name: 'SoleToken', address: '0xe52DC9df236a6A4F8653432cE6Fd94Dd41e76CC0' },
  { name: 'SneakerGame', address: '0x36cf91880F0fb41Eeda9fe79e7C5c2BE953f45B9' },
  { name: 'SneakerArtRenderer', address: '0x7e01732461C1879915C35E56e73Fd8569B289ADa' },
] as const

export const walletAddresses = {
  playerA: { short: '0xdfAb…1465', full: '0xdfAb550B4D28cD040Cf79Bf350Ac3017923C1465' },
  playerB: { short: '0xe4ae…356f', full: '0xe4ae33003C3fF8afd68fa65Fafa97F6206c3356f' },
} as const

/** The +10 SOLE run's settlement: FACTS.md §4, decoded from the chain. */
export const settlement = {
  transactionHash: '0x4c614ce4b86203d066da45dda51b8a4632d71326b9e79db4f5ac2d529a233a1b',
  blockNumber: '68183542',
  eventName: 'SessionSettled',
  rewardSole: 10,
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

/** The walk, video2 184.0–212.0 s (timer 1:53 → 2:20). */
export const liveRunReadouts: readonly LiveRunReadout[] = [
  {
    sourceSeconds: 184.0,
    distanceText: '64 m',
    speedText: '4.0 KM/H',
    energyLeft: 9,
    estimatedRewardText: '+5 SOLE',
  },
  {
    sourceSeconds: 188.5,
    distanceText: '64 m',
    speedText: '3.2 KM/H',
    energyLeft: 9,
    estimatedRewardText: '+5 SOLE',
  },
  {
    sourceSeconds: 188.75,
    distanceText: '70 m',
    speedText: '3.2 KM/H',
    energyLeft: 9,
    estimatedRewardText: '+5 SOLE',
  },
  {
    sourceSeconds: 190.9,
    distanceText: '70 m',
    speedText: '3.2 KM/H',
    energyLeft: 8,
    estimatedRewardText: '+10 SOLE',
  },
  {
    sourceSeconds: 194.9,
    distanceText: '77 m',
    speedText: '3.9 KM/H',
    energyLeft: 8,
    estimatedRewardText: '+10 SOLE',
  },
  {
    sourceSeconds: 198.5,
    distanceText: '77 m',
    speedText: '4.1 KM/H',
    energyLeft: 8,
    estimatedRewardText: '+10 SOLE',
  },
  {
    sourceSeconds: 199.0,
    distanceText: '82 m',
    speedText: '4.1 KM/H',
    energyLeft: 8,
    estimatedRewardText: '+10 SOLE',
  },
  {
    sourceSeconds: 205.0,
    distanceText: '87 m',
    speedText: '3.7 KM/H',
    energyLeft: 8,
    estimatedRewardText: '+10 SOLE',
  },
  {
    sourceSeconds: 210.75,
    distanceText: '93 m',
    speedText: '3.2 KM/H',
    energyLeft: 8,
    estimatedRewardText: '+10 SOLE',
  },
]

/** The cold open's rebuilt run screen: timer 1:53 → 1:56 (video2 184.25–188.0). */
export const coldOpenRunScreen = {
  metaItems: ['Run in progress', 'Sneaker #2'],
  timerTexts: ['1:53', '1:54', '1:55', '1:56'],
  distanceText: '64 m',
  speedText: '4.0 KM/H',
  energyLeft: 9,
  estimatedRewardText: '+5 SOLE',
  // Wrapped where the phone wraps it (screenshot 03).
  estimateNoteLines: [
    'Estimates assume every minute counts. The server checks',
    'your GPS when you stop.',
  ],
  gpsStatus: '19 GPS points recorded. 1 waiting to upload.',
  stopLabel: 'Stop',
} as const

/** Screenshot 03 (timer 2:52), for the rebuild's overlay check against the PNG. */
export const screenshotRunScreen = {
  timerText: '2:52',
  distanceText: '132 m',
  speedText: '3.6 KM/H',
  energyLeft: 8,
  estimatedRewardText: '+10 SOLE',
  gpsStatus: '31 GPS points recorded. 1 waiting to upload.',
} as const

export const coldOpenContent = {
  headline: 'Walk.',
} as const

export const walkContent = {
  caption: ['1–20 km/h counts.', 'Cars don’t.'],
} as const

export const earnContent = {
  metaItems: ['You earned', 'Run settled'],
  rewardNumber: 10,
  rewardSymbol: 'SOLE',
  proofMetaItems: ['Settled on Monad testnet', 'Block 68183542'],
  /** The settle transaction's hash, split where it fits two lines of mono. */
  transactionHashLines: ['0x4c614ce4b86203d066da45dda51b8a4', '632d71326b9e79db4f5ac2d529a233a1b'],
  /** The decoded SessionSettled log (FACTS.md §4). */
  eventLines: ['event SessionSettled', 'tokenId 2 · rewardedMinutes 2 · 10 SOLE'],
  transactionLinkLabel: 'View transaction',
  headline: 'Earn.',
} as const

/** Level → efficiency (10 + 2 per level) and SOLE per rewarded minute (0.5 × efficiency). */
export const upgradeLevels = [
  { level: 1, efficiency: 10, solePerMinute: 5 },
  { level: 2, efficiency: 12, solePerMinute: 6 },
  { level: 3, efficiency: 14, solePerMinute: 7 },
  { level: 4, efficiency: 16, solePerMinute: 8 },
  { level: 5, efficiency: 18, solePerMinute: 9 },
] as const

export const upgradeContent = {
  metaItems: ['Sneaker #0002', 'Drawn on-chain'],
  repairDurabilityFrom: 60,
  repairDurabilityTo: 100,
  repairCaption: 'Repair it with SOLE.',
  signCaption: 'Your wallet signs it.',
  levelCaption: 'Each level pays more.',
  efficiencyLabel: 'Efficiency',
  solePerMinuteLabel: 'SOLE / min',
  headline: 'Upgrade.',
} as const

export const ownItContent = {
  statement: ['Not points in an app.', 'An NFT in your wallet.'],
  appFrameLabel: 'In the app',
  explorerFrameLabel: 'On MonadVision',
  framesMetaItems: ['ERC-721', 'Art drawn by the contract'],
  ownerLabel: 'Owner',
  lockedStatsItems: ['Level 02', 'Efficiency 12', 'Durability 100'],
  transferCaption: ['Send it to any wallet.', 'Its stats go with it.'],
} as const

export const rulesContent = {
  metaItems: ['The rules', 'On-chain'],
  ruleCards: [
    '10 ENERGY',
    '1 POINT = 1 MINUTE',
    '0.5 SOLE × EFFICIENCY / MIN',
    '+2 EFFICIENCY / LEVEL',
    'LEVEL 30 MAX',
  ],
  verifiedMetaItems: ['Verified', 'Monad testnet'],
  closingLine: ['The contract enforces the rules.', 'The app only estimates.'],
} as const

export const endCardContent = {
  headlineLines: ['Walk.', 'Earn.', 'Upgrade.'],
  wordmark: 'StrideMon',
  metaItems: ['Monad testnet', 'Android demo'],
  siteLabel: 'stridemon.yashmittal.xyz',
  disclaimer: 'SOLE is a testnet token with no monetary value.',
} as const
