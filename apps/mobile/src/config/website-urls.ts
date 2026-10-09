/** The landing page (D-035). It hosts the pages Google Play asks the app to link to (D-039). */
const WEBSITE_URL = 'https://stridemon.xyz'

export const privacyPolicyUrl = `${WEBSITE_URL}/privacy`

/** The Founding Pass gallery, where passes are minted (D-041). */
export const foundingPassGalleryUrl = `${WEBSITE_URL}/pass`

/** The website's Founding Pass questions, the help page until Part 7 builds `/help` (D-046). */
export const foundingPassHelpUrl = `${WEBSITE_URL}/pass#questions`

/** A pass's own page on the website (`/pass/137`). */
export function buildFoundingPassPageUrl(designNumber: number): string {
  return `${WEBSITE_URL}/pass/${designNumber}`
}
