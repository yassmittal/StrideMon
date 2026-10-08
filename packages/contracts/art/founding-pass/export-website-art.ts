/**
 * Exports the Founding Pass collection to the website (docs/founding-pass/part-4-website-gallery.md,
 * D-044):
 * 1. runs `script/RenderPassArt.s.sol`'s `exportWebsiteArt()` (a simulation, never broadcast), so
 *    the Solidity renderer draws every design's card and its laced Sneaker into `rendered/website/`
 * 2. copies them to `website/public/pass-art/cards/` and `website/public/pass-art/laced/`
 * 3. writes the site's design table, `website/src/content/founding-pass-designs.ts`: the layer
 *    labels and one compact row per design. Each row's name is checked against `designs.json`
 *    and against the name the renderer drew on the card.
 *
 * Run from the repo root: `bun run website:export-pass-art`. Needs Foundry. The site never imports
 * `@stridemon/*` (D-035), so this copy is how it gets the collection.
 */
import { cp, mkdir, readdir, readFile, rm, writeFile } from 'node:fs/promises'
import { join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { COLOR_FAMILIES } from './art-system/color-families'
import { COLORWAYS } from './art-system/colorways'
import { LACE_COLORS } from './art-system/lace-colors'
import { buildDesignName, calculateDesignRarity } from './art-system/resolve-design'
import { SNEAKER_TEMPLATES } from './art-system/templates'
import type { Design, Rarity } from './art-system/types'
import { DESIGNS_FROZEN_ON } from './generator/review-rounds'
import { RENDERED_DIRECTORY } from './sheets/rendered-art'
import { runInContracts } from './solidity/write-solidity-sources'

const DESIGN_COUNT = 1000
const DESIGNS_FILE = fileURLToPath(new URL('previews/designs.json', import.meta.url))
const WEBSITE_DIRECTORY = fileURLToPath(new URL('../../../../website/', import.meta.url))
const WEBSITE_PASS_ART_DIRECTORY = join(WEBSITE_DIRECTORY, 'public/pass-art')
const WEBSITE_DESIGN_TABLE_FILE = join(WEBSITE_DIRECTORY, 'src/content/founding-pass-designs.ts')
const RENDERED_WEBSITE_DIRECTORY = join(RENDERED_DIRECTORY, 'website')
const ART_FOLDERS = ['cards', 'laced'] as const
const RARITIES: readonly Rarity[] = ['common', 'uncommon', 'rare', 'legendary']
/** The family shade the site uses for a family's swatch: the middle of its five. */
const SWATCH_SHADE_INDEX = 2
/** The name on a card, as the renderer writes it: `<text x="64" y="878" … font-size="44">`. */
const CARD_NAME_PATTERN = /<text x="64" y="878"[^>]*>([^<]+)<\/text>/

if (DESIGNS_FROZEN_ON === null) {
  throw new Error('The designs are not frozen yet: the website only shows the frozen collection')
}

const designs = await readDesigns()
const scriptOutput = runInContracts([
  'forge',
  'script',
  'script/RenderPassArt.s.sol:RenderPassArt',
  '--sig',
  'exportWebsiteArt()',
])
for (const outputLine of scriptOutput.split('\n')) {
  if (outputLine.includes('written')) console.log(`solidity: ${outputLine.trim()}`)
}

await checkRenderedNames(designs)
await copyArtToWebsite()
await writeFile(WEBSITE_DESIGN_TABLE_FILE, buildDesignTableSource(designs))
console.log(`website: ${designs.length} designs → src/content/founding-pass-designs.ts`)

async function readDesigns(): Promise<Design[]> {
  const parsedDesigns: Design[] = JSON.parse(await readFile(DESIGNS_FILE, 'utf8'))
  if (parsedDesigns.length !== DESIGN_COUNT) {
    throw new Error(`designs.json must list all ${DESIGN_COUNT} designs`)
  }
  for (const [designIndex, design] of parsedDesigns.entries()) {
    if (design.designNumber !== designIndex + 1) {
      throw new Error(`designs.json is out of order at design ${designIndex + 1}`)
    }
    if (buildDesignName(design.layers) !== design.name) {
      throw new Error(`design ${design.designNumber}'s name doesn't follow from its layers`)
    }
    if (calculateDesignRarity(design.layers) !== design.rarity) {
      throw new Error(`design ${design.designNumber}'s rarity doesn't follow from its layers`)
    }
  }
  return parsedDesigns
}

/** The card the Solidity renderer drew must carry the same name as the table's row. */
async function checkRenderedNames(designsToCheck: readonly Design[]): Promise<void> {
  for (const design of designsToCheck) {
    const cardSvg = await readFile(
      join(RENDERED_WEBSITE_DIRECTORY, 'cards', `${formatDesignNumber(design.designNumber)}.svg`),
      'utf8',
    )
    const renderedName = cardSvg.match(CARD_NAME_PATTERN)?.[1]
    if (renderedName !== design.name) {
      throw new Error(
        `design ${design.designNumber}: the card says "${renderedName}", the table "${design.name}"`,
      )
    }
  }
}

async function copyArtToWebsite(): Promise<void> {
  for (const artFolder of ART_FOLDERS) {
    const sourceDirectory = join(RENDERED_WEBSITE_DIRECTORY, artFolder)
    const targetDirectory = join(WEBSITE_PASS_ART_DIRECTORY, artFolder)
    const fileNames = (await readdir(sourceDirectory)).filter((fileName) =>
      fileName.endsWith('.svg'),
    )
    if (fileNames.length !== DESIGN_COUNT) {
      throw new Error(`rendered/website/${artFolder} has ${fileNames.length} files, not 1,000`)
    }
    await rm(targetDirectory, { recursive: true, force: true })
    await mkdir(targetDirectory, { recursive: true })
    await cp(sourceDirectory, targetDirectory, { recursive: true })
    console.log(`website: ${fileNames.length} SVGs → public/pass-art/${artFolder}/`)
  }
}

function buildDesignTableSource(designsToWrite: readonly Design[]): string {
  const templates = SNEAKER_TEMPLATES.map((template) => ({
    key: template.key,
    label: template.label,
    legendaryName: template.legendaryName,
    description: template.description,
    optionSlots: template.optionSlots.map((optionSlot) => ({
      key: optionSlot.key,
      label: optionSlot.label,
      values: optionSlot.values.map((optionValue) => ({
        key: optionValue.key,
        label: optionValue.label,
        rarity: optionValue.rarity,
      })),
    })),
  }))
  const colorFamilies = COLOR_FAMILIES.map((colorFamily) => ({
    key: colorFamily.key,
    label: colorFamily.label,
    rarity: colorFamily.rarity,
    swatchColor: colorFamily.shades[SWATCH_SHADE_INDEX],
  }))
  const colorways = COLORWAYS.map((colorway) => ({ key: colorway.key, label: colorway.label }))
  const laceColors = LACE_COLORS.map((laceColor) => ({
    key: laceColor.key,
    label: laceColor.label,
    rarity: laceColor.rarity,
  }))
  const designRows = designsToWrite.map((design) => JSON.stringify(toDesignRow(design)))

  return [
    '// GENERATED by `bun run website:export-pass-art`',
    '// (packages/contracts/art/founding-pass/export-website-art.ts) from the design table frozen on',
    `// ${DESIGNS_FROZEN_ON}. Do not edit: D-044.`,
    "import type { PassDesignTables } from '@/lib/founding-pass/pass-design'",
    '',
    'export const passDesignTables: PassDesignTables = {',
    `  templates: ${JSON.stringify(templates)},`,
    `  colorFamilies: ${JSON.stringify(colorFamilies)},`,
    `  colorways: ${JSON.stringify(colorways)},`,
    `  laceColors: ${JSON.stringify(laceColors)},`,
    '  // One row per design, index n - 1 is design n: template, colour family, colourway, the',
    '  // three option values (each an index into its slot), lace colour and rarity, as indexes.',
    '  designRows: [',
    ...designRows.map((designRow) => `    ${designRow},`),
    '  ],',
    '}',
    '',
  ].join('\n')
}

function toDesignRow(design: Design): number[] {
  const { layers } = design
  const templateIndex = SNEAKER_TEMPLATES.findIndex(
    (template) => template.key === layers.templateKey,
  )
  const template = SNEAKER_TEMPLATES[templateIndex]
  if (template === undefined) throw new Error(`design ${design.designNumber}: unknown template`)
  const optionValueIndexes = template.optionSlots.map((optionSlot) => {
    const valueIndex = optionSlot.values.findIndex(
      (optionValue) => optionValue.key === layers.optionValueKeys[optionSlot.key],
    )
    if (valueIndex === -1) throw new Error(`design ${design.designNumber}: unknown option value`)
    return valueIndex
  })
  return [
    templateIndex,
    findIndexOrThrow(COLOR_FAMILIES, layers.colorFamilyKey, design.designNumber),
    findIndexOrThrow(COLORWAYS, layers.colorwayKey, design.designNumber),
    ...optionValueIndexes,
    findIndexOrThrow(LACE_COLORS, layers.laceColorKey, design.designNumber),
    RARITIES.indexOf(design.rarity),
  ]
}

function findIndexOrThrow(
  entries: readonly { key: string }[],
  key: string,
  designNumber: number,
): number {
  const index = entries.findIndex((entry) => entry.key === key)
  if (index === -1) throw new Error(`design ${designNumber}: unknown layer "${key}"`)
  return index
}

function formatDesignNumber(designNumber: number): string {
  return String(designNumber).padStart(4, '0')
}
