// Android screenshots from the demo build, 1080 × 2340, in public/screenshots/. Status bars are
// painted out, and the two long scrolling captures (Home, Sneaker tab) are cut to one screen.
// The build fails if a file listed here is missing.
export const screenshotWidthPixels = 1080
export const screenshotHeightPixels = 2340

export type Screenshot = {
  fileName: string
  alt: string
}

export const screenshots = {
  welcome: {
    fileName: '01-welcome.png',
    alt: 'StrideMon welcome screen: the headline “Walk. Earn. Upgrade.”, a line on how the game works, and a Connect wallet button.',
  },
  home: {
    fileName: '02-home.png',
    alt: 'StrideMon Home screen: Sneaker #0002’s on-chain picture at level 2, efficiency 12, energy 1 of 10 with the next point in 26 minutes, and a balance of 84.6 SOLE.',
  },
  activeRun: {
    fileName: '03-active-run.png',
    alt: 'Active run screen on black: 2:52 elapsed, 132 m walked at 3.6 km/h, 8 of 10 energy left, an estimated reward of 10 SOLE, and a STOP button.',
  },
  runSummary: {
    fileName: '04-run-summary.png',
    alt: 'Run summary: 10 SOLE earned and settled, 2 rewarded minutes, 1 durability lost, a link to the transaction, and the run’s duration, distance and average speed.',
  },
  sneakerTab: {
    fileName: '05-sneaker-tab.png',
    alt: 'Sneaker tab: repair from durability 96 to 100 for 3.2 SOLE, and upgrade from level 2 to 3, efficiency 12 to 14, for 100 SOLE.',
  },
  repairReview: {
    fileName: '06-repair-review.png',
    alt: 'Review sheet before a repair: durability 94 to 100 for 4.8 SOLE, with Confirm in wallet and Not now buttons.',
  },
  transfer: {
    fileName: '07-transfer.png',
    alt: 'Send Sneaker #2 screen: the Sneaker’s level, efficiency and durability, the recipient wallet address, and a Review transfer button.',
  },
  explorerNft: {
    fileName: '09-explorer-nft.png',
    alt: 'MonadVision explorer page for a StrideMon Sneaker NFT (ERC-721), showing the same on-chain picture as the app.',
  },
} as const satisfies Record<string, Screenshot>

export const demoVideo = {
  fileName: 'demo-walk.mp4',
  posterFileName: 'demo-walk-poster.png',
  heading: 'A real walk, start to finish',
  description: 'Recorded on the Android demo build: START, a short walk, STOP, and SOLE on-chain.',
} as const
