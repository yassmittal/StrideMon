import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { buildHelpUrl, helpTopicIds } from './website-urls'

// The website isn't a workspace (D-035), so read its help content as text (D-047).
const WEBSITE_HELP_CONTENT_PATH = join(__dirname, '../../../../website/src/content/help.ts')

describe('help links', () => {
  it('points every help id the app uses at an answer on the website', () => {
    const websiteHelpContent = readFileSync(WEBSITE_HELP_CONTENT_PATH, 'utf8')
    const missingHelpTopicIds = helpTopicIds.filter(
      (helpTopicId) => !websiteHelpContent.includes(`id: '${helpTopicId}'`),
    )
    expect(missingHelpTopicIds).toEqual([])
  })

  it('builds an anchor on the help page', () => {
    expect(buildHelpUrl('app-no-pass')).toBe('https://stridemon.xyz/help#app-no-pass')
  })
})
