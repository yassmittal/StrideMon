// Android screenshots from the demo build, 1080 × 2340, in public/screenshots/. Status bars are
// painted out. Retaken for STRIDE (2026-10-07): 03 and 05 are frames from the demo recording
// (media-source/video3.mp4), Home is cut from a long scrolling capture to one screen.
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
    alt: 'StrideMon Home screen: Sneaker #0002’s on-chain picture at level 1 with durability 99, efficiency 10, energy 7 of 10 with the next point in 27 minutes, and a balance of 30 STRIDE.',
  },
  activeRun: {
    fileName: '03-active-run.png',
    alt: 'Active run screen on black: 2:14 elapsed, 166 m walked at 3.9 km/h, 8 of 10 energy left, an estimated reward of 10 STRIDE, and a STOP button.',
  },
  runSummary: {
    fileName: '04-run-summary.png',
    alt: 'Run summary: 15 STRIDE earned and settled, 3 rewarded minutes, 1 durability lost, a link to the transaction, and the run’s 3:27 duration, 197 m distance and 3.9 km/h average speed.',
  },
  sneakerTab: {
    fileName: '05-sneaker-tab.png',
    alt: 'Sneaker tab: repair from durability 99 to 100 for 0.7 STRIDE, and upgrade from level 1 to 2, efficiency 10 to 12, for 50 STRIDE, not yet affordable with 15 STRIDE.',
  },
  repairReview: {
    fileName: '06-repair-review.png',
    alt: 'Review sheet before a repair: durability 98 to 100, the STRIDE balance going from 45 to 43.6, with Confirm in wallet and Not now buttons.',
  },
  transfer: {
    fileName: '07-transfer.png',
    alt: 'Send Sneaker #2 screen: the Sneaker’s level, efficiency and durability, the recipient wallet address, and a Review transfer button.',
  },
  explorerNft: {
    fileName: '09-explorer-nft.png',
    alt: 'MonadVision explorer page for StrideMon Sneaker #0002 (ERC-721), showing the same on-chain picture as the app.',
  },
} as const satisfies Record<string, Screenshot>
