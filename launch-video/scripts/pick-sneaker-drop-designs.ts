// Picks the Sneaker drop film's designs and writes src/sneaker-drop/sneakers.ts (generated).
// Run from launch-video/, after `bash scripts/copy-sneaker-drop-art.sh`:
//
//   bun scripts/pick-sneaker-drop-designs.ts
//
// Reads the frozen design table (../website/src/content/founding-pass-designs.ts) and the flood's
// atlas (public/pass-art/atlas/laced-atlas.png, for each design's lightness). Read only. Seeded, so
// it always picks the same designs. The rules (docs/sneaker-drop-video-prompt.md §3):
//
// - The sequence (every single shoe and split cell, in the order they appear): a template stays
//   away for two cuts and a family for three, light and dark alternate, and the rarer designs come later
//   (Common, then Uncommon, then Rare: the metals land in the last split). It opens on the hero.
// - The ten Legendaries (the Prism family) stay out of the sequence: scene 6 has #0020.
// - The flood: all 1,000, in a 25 × 40 grid (4:5) and a 20 × 50 grid (9:16), with no two
//   neighbours (left, above) sharing a template or a family, and #0020 in the cell the flood
//   centres on.

const DESIGN_TABLE_FILE = '../website/src/content/founding-pass-designs.ts'
const ATLAS_FILE = 'public/pass-art/atlas/laced-atlas.png'
const OUTPUT_FILE = 'src/sneaker-drop/sneakers.ts'

const SEED = 20261014
const ATLAS_COLUMN_COUNT = 40
const ATLAS_TILE_WIDTH = 160
const ATLAS_TILE_HEIGHT = 96

/** #0137 Rose Hiker Night: the waitlist film's hero and the first Founder Sneaker minted. */
const HERO_DESIGN_NUMBER = 137
/** #0020 Earthshine: the Runner's Legendary, the only one with a committed Founder Sneaker picture. */
const LEGENDARY_DESIGN_NUMBER = 20

/** How many shoes each part of the sequence takes, in order (content.ts uses the same counts). */
const SEQUENCE_PARTS = [
  { name: 'phrase 1: the hero bar, then one shoe per kick', count: 13, rarity: 'common' },
  { name: 'the 2-up split', count: 9, rarity: 'uncommon' },
  { name: 'the 4-up split', count: 11, rarity: 'uncommon' },
  { name: 'the 9-up split', count: 16, rarity: 'rare' },
] as const

/** Each format's flood grid, and the cell every step centres on (0-based): #0020's. */
const FLOOD_GRIDS = [
  { format: '4x5', columnCount: 25, rowCount: 40, centre: { column: 12, row: 20 } },
  { format: '9x16', columnCount: 20, rowCount: 50, centre: { column: 10, row: 25 } },
] as const
type FloodGrid = (typeof FLOOD_GRIDS)[number]

type Rarity = 'common' | 'uncommon' | 'rare' | 'legendary'
type Design = {
  designNumber: number
  template: string
  family: string
  name: string
  rarity: Rarity
  /** Alpha-weighted relative luminance of the drawn shoe, 0–1. */
  lightness: number
}

const RARITIES: readonly Rarity[] = ['common', 'uncommon', 'rare', 'legendary']

const designs = await readDesigns()
const medianLightness = median(designs.map((design) => design.lightness))
const isLight = (design: Design) => design.lightness >= medianLightness
const random = createRandom(SEED)

const sequence = pickSequence()
const floodOrders = FLOOD_GRIDS.map(pickFloodOrder)
await writeSneakersFile()

function pickSequence(): Design[] {
  const hero = findDesign(HERO_DESIGN_NUMBER)
  const picked: Design[] = [hero]
  const used = new Set([hero.designNumber])
  let position = 1
  for (const part of SEQUENCE_PARTS) {
    const partCount = part === SEQUENCE_PARTS[0] ? part.count - 1 : part.count
    for (let index = 0; index < partCount; index += 1) {
      const previous = picked[picked.length - 1] as Design
      const wantsLight = !isLight(previous)
      const candidates = shuffle(
        designs.filter(
          (design) =>
            !used.has(design.designNumber) &&
            design.rarity === part.rarity &&
            design.family !== 'prism' &&
            isLight(design) === wantsLight &&
            // A template stays away for two cuts and a family for three, so neither repeats soon.
            picked.slice(-2).every((recent) => recent.template !== design.template) &&
            picked.slice(-3).every((recent) => recent.family !== design.family),
        ),
      )
      const next = candidates[0]
      if (next === undefined) throw new Error(`No design for position ${position}`)
      picked.push(next)
      used.add(next.designNumber)
      position += 1
    }
  }
  return picked
}

function pickFloodOrder(grid: FloodGrid): number[] {
  const cellCount = grid.columnCount * grid.rowCount
  const centreIndex = grid.centre.row * grid.columnCount + grid.centre.column
  // Greedy fill in reading order from a shuffled pool, retrying with a new shuffle if it sticks.
  for (let attempt = 0; attempt < 200; attempt += 1) {
    const pool = shuffle(
      designs.filter((design) => design.designNumber !== LEGENDARY_DESIGN_NUMBER),
    )
    const cells: Design[] = []
    let isStuck = false
    for (let cellIndex = 0; cellIndex < cellCount; cellIndex += 1) {
      const left = cellIndex % grid.columnCount === 0 ? undefined : cells[cellIndex - 1]
      const above = cells[cellIndex - grid.columnCount]
      const fits = (design: Design) =>
        [left, above].every(
          (neighbour) =>
            neighbour === undefined ||
            (neighbour.template !== design.template && neighbour.family !== design.family),
        )
      if (cellIndex === centreIndex) {
        const legendary = findDesign(LEGENDARY_DESIGN_NUMBER)
        if (!fits(legendary)) {
          isStuck = true
          break
        }
        cells.push(legendary)
        continue
      }
      const poolIndex = pool.findIndex(fits)
      if (poolIndex === -1) {
        isStuck = true
        break
      }
      cells.push(...pool.splice(poolIndex, 1))
    }
    if (!isStuck) return cells.map((design) => design.designNumber)
  }
  throw new Error('Could not lay out the flood')
}

async function writeSneakersFile(): Promise<void> {
  const describe = (design: Design) =>
    `#${String(design.designNumber).padStart(4, '0')} ${design.name} (${design.template}, ${design.family}, ${design.rarity}, ${isLight(design) ? 'light' : 'dark'})`
  let offset = 0
  const partLines = SEQUENCE_PARTS.map((part) => {
    const partDesigns = sequence.slice(offset, offset + part.count)
    offset += part.count
    return [
      `  // ${part.name}:`,
      ...partDesigns.map((design) => `  ${design.designNumber}, // ${describe(design)}`),
    ].join('\n')
  })
  const source = `// GENERATED by scripts/pick-sneaker-drop-designs.ts (seed ${SEED}). Never edit by hand: change the
// script's rules and run it again. Read from the frozen design table and the laced art; the film
// animates these designs and never changes one (DESIGNS_FROZEN_ON).
//
// Why these (docs/sneaker-drop-video-prompt.md §3):
// - The hero is #0137 Rose Hiker Night: the waitlist film's hero and the first Founder Sneaker
//   minted, so the films share one shoe. It draws itself in the cold open and fills on the drop.
// - The sequence follows it, cut by cut: a template stays away for two cuts and a family for
//   three, light and
//   dark alternate (lightness measured from the art, split at the collection's median), and the
//   rarer designs come later: Common in the first phrase, Uncommon in the 2- and 4-up splits,
//   Rare (the Gold and Chrome metals among them) in the 9-up.
// - No Legendary (the Prism family) appears before scene 6, which has #0020 Earthshine, the
//   Runner's: its Founder Sneaker picture is the only Legendary one in a committed file
//   (packages/contracts/art/founding-pass/previews/8-founder-sneakers.svg).
// - The flood is all 1,000, laid out so no two neighbours share a template or a family, with
//   #0020 in its centre cell: every flood step pulls back from it, and the join cuts to it.

export const HERO_DESIGN_NUMBER = ${HERO_DESIGN_NUMBER}
export const LEGENDARY_DESIGN_NUMBER = ${LEGENDARY_DESIGN_NUMBER}

/** Every single shoe and split cell, in the order they appear. */
export const SEQUENCE_DESIGN_NUMBERS: readonly number[] = [
${partLines.join('\n')}
]

/** How many of the sequence each part takes, in order. */
export const sequencePartCounts = {
${SEQUENCE_PARTS.map((part, index) => `  ${['phraseOne', 'twoUp', 'fourUp', 'nineUp'][index]}: ${part.count},`).join('\n')}
} as const

export type FloodGrid = {
  columnCount: number
  rowCount: number
  /** The cell every flood step centres on: #0020's. */
  centre: { column: number; row: number }
  /** All 1,000 designs, the cells in reading order. */
  designNumbers: readonly number[]
}

/** The flood, per format. */
export const floodGrids: Record<'4x5' | '9x16', FloodGrid> = {
${FLOOD_GRIDS.map(
  (grid, gridIndex) => `  '${grid.format}': {
    columnCount: ${grid.columnCount},
    rowCount: ${grid.rowCount},
    centre: { column: ${grid.centre.column}, row: ${grid.centre.row} },
    designNumbers: [
${chunk(floodOrders[gridIndex] ?? [], grid.columnCount)
  .map((row) => `      ${row.join(', ')},`)
  .join('\n')}
    ],
  },`,
).join('\n')}
}
`
  await Bun.write(OUTPUT_FILE, source)
  // Formatted with the repo's Biome config, so the generated file passes `bun run lint` as written.
  await Bun.spawn(['bunx', 'biome', 'format', '--write', OUTPUT_FILE], { stdout: 'ignore' }).exited
  console.log(`Wrote ${OUTPUT_FILE}: ${sequence.length} in the sequence, two floods of 1,000`)
  for (const design of sequence) console.log(describe(design))
}

async function readDesigns(): Promise<Design[]> {
  const source = await Bun.file(DESIGN_TABLE_FILE).text()
  const readJson = (key: string) => {
    const match = source.match(new RegExp(`${key}: (\\[.*\\]),\\n`))
    if (match?.[1] === undefined) throw new Error(`No ${key} in the design table`)
    return JSON.parse(match[1])
  }
  const templates: { key: string; label: string; legendaryName: string }[] = readJson('templates')
  const families: { key: string; label: string }[] = readJson('colorFamilies')
  const colorways: { key: string; label: string }[] = readJson('colorways')
  const rowsSource = source.split('designRows: [')[1]?.split('\n  ],')[0]
  if (rowsSource === undefined) throw new Error('No design rows in the design table')
  const rows: number[][] = JSON.parse(`[${rowsSource.trim().replace(/,\s*$/, '')}]`)
  const lightnesses = await readLightnesses(rows.length)
  return rows.map((row, rowIndex) => {
    const [templateIndex, familyIndex, colorwayIndex, , , , , rarityIndex] = row as [
      number,
      number,
      number,
      number,
      number,
      number,
      number,
      number,
    ]
    const template = templates[templateIndex]
    const family = families[familyIndex]
    const colorway = colorways[colorwayIndex]
    const rarity = RARITIES[rarityIndex]
    if (!template || !family || !colorway || !rarity) throw new Error(`Bad row ${rowIndex + 1}`)
    return {
      designNumber: rowIndex + 1,
      template: template.key,
      family: family.key,
      name:
        rarity === 'legendary'
          ? template.legendaryName
          : `${family.label} ${template.label} ${colorway.label}`,
      rarity,
      lightness: lightnesses[rowIndex] ?? 0,
    }
  })
}

/** Each tile's alpha-weighted relative luminance, read from the atlas through ffmpeg. */
async function readLightnesses(designCount: number): Promise<number[]> {
  const ffmpeg = Bun.spawn(
    ['ffmpeg', '-v', 'error', '-i', ATLAS_FILE, '-f', 'rawvideo', '-pix_fmt', 'rgba', '-'],
    { stdout: 'pipe' },
  )
  const pixels = new Uint8Array(await new Response(ffmpeg.stdout).arrayBuffer())
  const atlasWidth = ATLAS_COLUMN_COUNT * ATLAS_TILE_WIDTH
  const toLinear = (channel: number) => {
    const value = channel / 255
    return value <= 0.04045 ? value / 12.92 : ((value + 0.055) / 1.055) ** 2.4
  }
  return Array.from({ length: designCount }, (_, designIndex) => {
    const tileLeft = (designIndex % ATLAS_COLUMN_COUNT) * ATLAS_TILE_WIDTH
    const tileTop = Math.floor(designIndex / ATLAS_COLUMN_COUNT) * ATLAS_TILE_HEIGHT
    let weightedLuminance = 0
    let totalAlpha = 0
    for (let y = tileTop; y < tileTop + ATLAS_TILE_HEIGHT; y += 1) {
      for (let x = tileLeft; x < tileLeft + ATLAS_TILE_WIDTH; x += 1) {
        const offset = (y * atlasWidth + x) * 4
        const alpha = (pixels[offset + 3] ?? 0) / 255
        const luminance =
          0.2126 * toLinear(pixels[offset] ?? 0) +
          0.7152 * toLinear(pixels[offset + 1] ?? 0) +
          0.0722 * toLinear(pixels[offset + 2] ?? 0)
        weightedLuminance += luminance * alpha
        totalAlpha += alpha
      }
    }
    return totalAlpha === 0 ? 0 : weightedLuminance / totalAlpha
  })
}

function findDesign(designNumber: number): Design {
  const design = designs.find((candidate) => candidate.designNumber === designNumber)
  if (design === undefined) throw new Error(`No design #${designNumber}`)
  return design
}

/** mulberry32: a small seeded generator, so the picks never change between runs. */
function createRandom(seed: number): () => number {
  let state = seed >>> 0
  return () => {
    state = (state + 0x6d2b79f5) >>> 0
    let value = state
    value = Math.imul(value ^ (value >>> 15), value | 1)
    value ^= value + Math.imul(value ^ (value >>> 7), value | 61)
    return ((value ^ (value >>> 14)) >>> 0) / 4294967296
  }
}

function shuffle<Item>(items: readonly Item[]): Item[] {
  const shuffled = [...items]
  for (let index = shuffled.length - 1; index > 0; index -= 1) {
    const otherIndex = Math.floor(random() * (index + 1))
    ;[shuffled[index], shuffled[otherIndex]] = [
      shuffled[otherIndex] as Item,
      shuffled[index] as Item,
    ]
  }
  return shuffled
}

function median(values: readonly number[]): number {
  const sorted = [...values].sort((first, second) => first - second)
  return sorted[Math.floor(sorted.length / 2)] ?? 0
}

function chunk<Item>(items: readonly Item[], size: number): Item[][] {
  return Array.from({ length: Math.ceil(items.length / size) }, (_, index) =>
    items.slice(index * size, index * size + size),
  )
}
