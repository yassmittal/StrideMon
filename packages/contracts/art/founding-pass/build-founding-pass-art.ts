/**
 * Builds the Founding Pass art (docs/founding-pass/part-1b-art-on-chain.md):
 * 1. picks the 1,000 designs, applies Yash's review rounds (re-rolls) and checks the rules
 * 2. writes the generated Solidity: the art data and the design table (`src/founding-pass-art/`)
 * 3. runs `script/RenderPassArt.s.sol` (simulation only), so the Solidity renderer draws every
 *    design and every preview cell into `rendered/`
 * 4. lays the drawings out as the review sheets in previews/, as SVG and PNG
 *
 * Run from the repo root: `bun packages/contracts/art/founding-pass/build-founding-pass-art.ts`
 * Needs Foundry and rsvg-convert (`brew install librsvg`). Text uses IBM Plex Mono from the
 * app's node_modules when it's there, and a fallback monospace otherwise.
 */
import { existsSync } from 'node:fs'
import { mkdir, mkdtemp, rm, writeFile } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { fileURLToPath } from 'node:url'
import type { Design } from './art-system/types'
import { checkDesigns } from './generator/check-designs'
import { generateDesigns } from './generator/generate-designs'
import { applyReviewRounds } from './generator/reroll-designs'
import { DESIGNS_FROZEN_ON, REVIEW_ROUNDS } from './generator/review-rounds'
import { type PreviewPlan, planPreviewFiles, type ReviewStatus } from './sheets/build-preview-files'
import { RENDERED_DIRECTORY, renderedArt } from './sheets/rendered-art'
import { runInContracts, writeSoliditySources } from './solidity/write-solidity-sources'

const PREVIEWS_DIRECTORY = fileURLToPath(new URL('previews/', import.meta.url))
const PLEX_MONO_FONT_DIRECTORY = fileURLToPath(
  new URL('../../../../node_modules/@expo-google-fonts/ibm-plex-mono/400Regular/', import.meta.url),
)
/** Satoshi, for the X teaser's text (the app's own copy of the font). */
const SATOSHI_FONT_DIRECTORY = fileURLToPath(
  new URL('../../../../apps/mobile/assets/fonts/', import.meta.url),
)
const SYSTEM_FONTCONFIG_FILE = '/opt/homebrew/etc/fonts/fonts.conf'

const generatedDesigns = generateDesigns()
const designs = applyReviewRounds(generatedDesigns)
for (const reportLine of checkDesigns(designs)) console.log(reportLine)
const reviewStatus = describeReviewStatus(generatedDesigns, designs)
console.log(
  `review: ${reviewStatus.roundCount} rounds, ${reviewStatus.rerolledInLatestRound.size} re-rolled in the latest`,
)

await mkdir(PREVIEWS_DIRECTORY, { recursive: true })
await writeFile(join(PREVIEWS_DIRECTORY, 'designs.json'), `${JSON.stringify(designs, null, 2)}\n`)
await writeSoliditySources({
  designs,
  statusLine:
    DESIGNS_FROZEN_ON === null
      ? `A draft under review (Part 1b), after ${REVIEW_ROUNDS.length} review rounds: not frozen yet.`
      : `Frozen on ${DESIGNS_FROZEN_ON}, after ${REVIEW_ROUNDS.length} review rounds: approved by Yash.`,
})

const previewPlans = planPreviewFiles(designs, reviewStatus)
await renderWithSolidity(previewPlans)
for (const previewPlan of previewPlans) {
  await writeFile(
    join(PREVIEWS_DIRECTORY, `${previewPlan.fileName}.svg`),
    previewPlan.composeSvg(renderedArt),
  )
}
await renderPngs(previewPlans)
console.log(`previews: ${previewPlans.length} SVGs and PNGs in ${PREVIEWS_DIRECTORY}`)

/** Which designs the latest round changed, so the sheets can point Yash at them. */
function describeReviewStatus(
  generated: readonly Design[],
  reviewed: readonly Design[],
): ReviewStatus {
  const beforeLatestRound = applyReviewRounds(generated, REVIEW_ROUNDS.slice(0, -1))
  const rerolledInLatestRound = new Set(
    reviewed
      .filter(
        (design, index) => JSON.stringify(design) !== JSON.stringify(beforeLatestRound[index]),
      )
      .map((design) => design.designNumber),
  )
  return { roundCount: REVIEW_ROUNDS.length, rerolledInLatestRound, frozenOn: DESIGNS_FROZEN_ON }
}

/** Writes the previews' requests, then has the Solidity renderer draw them (no broadcast). */
async function renderWithSolidity(previewPlans: readonly PreviewPlan[]): Promise<void> {
  for (const renderedFolder of ['designs', 'cards', 'sneakers']) {
    await rm(join(RENDERED_DIRECTORY, renderedFolder), { recursive: true, force: true })
  }
  await mkdir(RENDERED_DIRECTORY, { recursive: true })
  const renderRequests = {
    cards: previewPlans.flatMap((previewPlan) => previewPlan.cardRequests),
    sneakers: previewPlans.flatMap((previewPlan) => previewPlan.sneakerRequests),
  }
  await writeFile(
    join(RENDERED_DIRECTORY, 'render-requests.json'),
    `${JSON.stringify(renderRequests, null, 2)}\n`,
  )
  const scriptOutput = runInContracts([
    'forge',
    'script',
    'script/RenderPassArt.s.sol:RenderPassArt',
  ])
  for (const outputLine of scriptOutput.split('\n')) {
    if (outputLine.includes('written')) console.log(`solidity: ${outputLine.trim()}`)
  }
}

async function renderPngs(previewPlans: readonly PreviewPlan[]): Promise<void> {
  if (Bun.which('rsvg-convert') === null) {
    throw new Error('rsvg-convert is missing: brew install librsvg (the SVGs are written already)')
  }
  const fontconfigDirectory = await mkdtemp(join(tmpdir(), 'founding-pass-fonts-'))
  try {
    const environment = await buildFontEnvironment(fontconfigDirectory)
    for (const { fileName, pngWidthPixels } of previewPlans) {
      const conversion = Bun.spawnSync(
        [
          'rsvg-convert',
          '--width',
          String(pngWidthPixels),
          join(PREVIEWS_DIRECTORY, `${fileName}.svg`),
          '--output',
          join(PREVIEWS_DIRECTORY, `${fileName}.png`),
        ],
        { env: environment },
      )
      if (conversion.exitCode !== 0) {
        throw new Error(`rsvg-convert failed on ${fileName}: ${conversion.stderr.toString()}`)
      }
    }
  } finally {
    await rm(fontconfigDirectory, { recursive: true, force: true })
  }
}

/** Points fontconfig at IBM Plex Mono and Satoshi, so the PNGs show the app's and website's type. */
async function buildFontEnvironment(fontconfigDirectory: string): Promise<Record<string, string>> {
  const environment: Record<string, string> = {}
  for (const [name, value] of Object.entries(process.env)) {
    if (value !== undefined) environment[name] = value
  }
  if (!existsSync(PLEX_MONO_FONT_DIRECTORY)) {
    console.warn('IBM Plex Mono not found in node_modules: the PNGs use a fallback monospace')
    return environment
  }
  const fontconfigFile = join(fontconfigDirectory, 'fonts.conf')
  await writeFile(
    fontconfigFile,
    [
      '<?xml version="1.0"?>',
      '<!DOCTYPE fontconfig SYSTEM "urn:fontconfig:fonts.dtd">',
      '<fontconfig>',
      `  <include ignore_missing="yes">${SYSTEM_FONTCONFIG_FILE}</include>`,
      `  <dir>${PLEX_MONO_FONT_DIRECTORY}</dir>`,
      `  <dir>${SATOSHI_FONT_DIRECTORY}</dir>`,
      `  <cachedir>${join(fontconfigDirectory, 'cache')}</cachedir>`,
      '</fontconfig>',
      '',
    ].join('\n'),
  )
  environment.FONTCONFIG_FILE = fontconfigFile
  return environment
}
