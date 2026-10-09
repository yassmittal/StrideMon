/** The landing page (D-035). It hosts the pages Google Play asks the app to link to (D-039). */
const WEBSITE_URL = 'https://stridemon.xyz'

export const privacyPolicyUrl = `${WEBSITE_URL}/privacy`

/** The Founding Pass gallery, where passes are minted (D-041). */
export const foundingPassGalleryUrl = `${WEBSITE_URL}/pass`

/** The website's help page (D-047). Profile → Help opens its top. */
export const helpUrl = `${WEBSITE_URL}/help`

/**
 * The help answers the app links to (D-047). Each is an id in the website's
 * `website/src/content/help.ts`; `website-urls.test.ts` checks that it's still there.
 */
export const helpTopicIds = [
  'add-monad-testnet',
  'sign-in-app',
  'sign-in-failed',
  'too-many-tries',
  'cant-reach-stridemon',
  'contact',
  'app-no-pass',
  'app-cant-connect',
  'app-wallet-stopped-answering',
  'app-sign-in-expired',
  'sneaker-not-arriving',
  'app-cant-read-monad',
  'founder-sneaker-cant-send',
  'game-paused',
] as const

export type HelpTopicId = (typeof helpTopicIds)[number]

/** One answer on the help page (`stridemon.xyz/help#app-no-pass`). */
export function buildHelpUrl(helpTopicId: HelpTopicId): string {
  return `${helpUrl}#${helpTopicId}`
}

/** A pass's own page on the website (`/pass/137`). */
export function buildFoundingPassPageUrl(designNumber: number): string {
  return `${WEBSITE_URL}/pass/${designNumber}`
}
