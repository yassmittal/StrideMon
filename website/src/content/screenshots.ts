// Android screenshots, 1080 × 2340, from the demo build. Yash drops the PNGs into
// public/screenshots/; a missing one shows a labelled placeholder of the same size.
export const screenshotWidthPixels = 1080
export const screenshotHeightPixels = 2340

export type Screenshot = {
  fileName: string
  screenName: string
  alt: string
}

function defineScreenshot(fileName: string, screenName: string, alt: string): Screenshot {
  return { fileName, screenName, alt }
}

export const screenshots = {
  welcome: defineScreenshot(
    '01-welcome.png',
    'Welcome',
    'StrideMon welcome screen with the headline “Walk. Earn. Upgrade.” and a button to connect a wallet.',
  ),
  home: defineScreenshot(
    '02-home.png',
    'Home',
    'StrideMon Home screen: the Sneaker card with its on-chain picture, energy left, and the SOLE balance.',
  ),
  activeRun: defineScreenshot(
    '03-active-run.png',
    'Active run',
    'Dark active run screen showing elapsed time, distance, speed and the estimated SOLE reward, with a STOP button.',
  ),
  runSummary: defineScreenshot(
    '04-run-summary.png',
    'Run summary',
    'Run summary screen showing the SOLE earned, the rewarded minutes and the durability lost.',
  ),
  sneakerTab: defineScreenshot(
    '05-sneaker-tab.png',
    'Sneaker tab',
    'Sneaker tab with the Sneaker’s stats and the repair and upgrade panels with their SOLE costs.',
  ),
  levelUp: defineScreenshot(
    '06-level-up.png',
    'Level up',
    'Sheet confirming “Level 2 reached” after an upgrade, with the Sneaker’s new efficiency.',
  ),
  transfer: defineScreenshot(
    '07-transfer.png',
    'Send Sneaker',
    'Send Sneaker screen with a recipient wallet address entered and a review of the transfer.',
  ),
  history: defineScreenshot(
    '08-history.png',
    'History',
    'History list of past runs, each with its date, rewarded minutes and SOLE earned.',
  ),
  explorerNft: defineScreenshot(
    '09-explorer-nft.png',
    'MonadVision NFT page',
    'MonadVision explorer page for a StrideMon Sneaker NFT, showing the same on-chain picture as the app.',
  ),
} as const satisfies Record<string, Screenshot>

export const demoVideo = {
  fileName: 'demo-walk.mp4',
  posterFileName: 'demo-walk-poster.png',
  heading: 'A real walk, start to finish',
  description: 'Recorded on the Android demo build: START, a short walk, STOP, and SOLE on-chain.',
} as const
