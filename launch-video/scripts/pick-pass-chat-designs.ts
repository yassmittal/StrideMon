// Picks the Pass chat film's ten burst designs and writes src/pass-chat/sneakers.ts (generated).
// Run from launch-video/, after `bash scripts/copy-pass-chat-art.sh`:
//
//   bun scripts/pick-pass-chat-designs.ts
//
// Reads the frozen design table (../website/src/content/founding-pass-designs.ts), the cropped
// shoes (public/pass-chat/shoes/, for each pick's lightness) and which passes are minted or
// pending (a read-only GET of the API's collection). Seeded, so it always picks the same designs
// while the collection allows. The rules (docs/pass-chat-video-prompt.md §4):
//
// - Ten designs, none of them the hero (#0627), none minted or pending.
// - No two share a template, so all ten templates burst out once.
// - No two share a family. Ten families qualify, so each is used once: Cobalt and Ocean are out
//   (they vanish against the sky), Lime is out (the hero's own family, so #0627 stays the only lime
//   shoe in the sky), and Plum is out (blue-violet, the next closest to the sky, and the film keeps
//   purple to the one Legendary's own panels).
// - At most one Legendary: the Prism family is the Legendaries, so its one design is one.
// - Around the circle, warm and cool families alternate, and so do light and dark shoes where
//   the warm/cool order allows.

const DESIGN_TABLE_FILE = '../website/src/content/founding-pass-designs.ts'
const SHOE_DIRECTORY = 'public/pass-chat/shoes'
const OUTPUT_FILE = 'src/pass-chat/sneakers.ts'
const COLLECTION_URL = 'https://api.stridemon.xyz/v1/pass/collection'

const SEED = 20261016
/** #0627 Lime Runner Day: the chat's pick, unlaced, as the gallery shows it. */
const HERO_DESIGN_NUMBER = 627

const BURST_FAMILIES = {
  warm: ['ember', 'cherry', 'rose', 'clay', 'gold'],
  cool: ['jade', 'lagoon', 'moss', 'chrome', 'prism'],
} as const
type BurstFamily = (typeof BURST_FAMILIES)[keyof typeof BURST_FAMILIES][number]
const ALL_BURST_FAMILIES: readonly BurstFamily[] = [...BURST_FAMILIES.warm, ...BURST_FAMILIES.cool]

type Rarity = 'common' | 'uncommon' | 'rare' | 'legendary'
type Design = {
  designNumber: number
  template: string
  family: string
  name: string
  rarity: Rarity
}
type PickedDesign = Design & { lightness: number }

const RARITIES: readonly Rarity[] = ['common', 'uncommon', 'rare', 'legendary']

const random = createRandom(SEED)
const designs = await readDesigns()
const takenDesignNumbers = await readTakenDesignNumbers()
const picks = await pickBurst()
await writeSneakersFile(orderAroundCircle(picks))

async function pickBurst(): Promise<PickedDesign[]> {
  const isAvailable = (design: Design) =>
    design.designNumber !== HERO_DESIGN_NUMBER && !takenDesignNumbers.has(design.designNumber)
  const templates = [...new Set(designs.map((design) => design.template))]
  if (templates.length !== ALL_BURST_FAMILIES.length) {
    throw new Error(`Expected ${ALL_BURST_FAMILIES.length} templates, found ${templates.length}`)
  }
  // Each family gets a different template: try seeded assignments until every pair has a design.
  for (let attempt = 0; attempt < 500; attempt += 1) {
    const shuffledTemplates = shuffle(templates)
    const pairs = ALL_BURST_FAMILIES.map((family, familyIndex) => {
      const template = shuffledTemplates[familyIndex] as string
      const candidates = designs.filter(
        (design) => design.family === family && design.template === template && isAvailable(design),
      )
      return shuffle(candidates)[0]
    })
    if (pairs.every((design) => design !== undefined)) {
      const picked = pairs as Design[]
      if (picked.filter((design) => design.rarity === 'legendary').length > 1) continue
      return Promise.all(
        picked.map(async (design) => ({ ...design, lightness: await readLightness(design) })),
      )
    }
  }
  throw new Error('No assignment of templates to families has a free design for every pair')
}

/** Warm and cool alternate; within each, light and dark alternate as far as they can. */
function orderAroundCircle(picked: readonly PickedDesign[]): PickedDesign[] {
  const median = [...picked].map((design) => design.lightness).sort((a, b) => a - b)[5] ?? 0
  const sortByLightness = (family: readonly string[]) =>
    picked
      .filter((design) => family.includes(design.family))
      .sort((first, second) => second.lightness - first.lightness)
  const interleave = (sorted: PickedDesign[]) => {
    // Light, dark, light, dark… from the two ends of the sorted list.
    const result: PickedDesign[] = []
    while (sorted.length > 0) {
      const next = result.length % 2 === 0 ? sorted.shift() : sorted.pop()
      if (next !== undefined) result.push(next)
    }
    return result
  }
  const warm = interleave(sortByLightness(BURST_FAMILIES.warm))
  // Start the cool row on the opposite lightness, so neighbours differ in both.
  const coolSorted = sortByLightness(BURST_FAMILIES.cool)
  const cool = interleave((warm[0]?.lightness ?? 0) >= median ? coolSorted.reverse() : coolSorted)
  return warm.flatMap((warmDesign, index) => [warmDesign, cool[index] as PickedDesign])
}

async function writeSneakersFile(ordered: readonly PickedDesign[]): Promise<void> {
  const describe = (design: PickedDesign) =>
    `#${String(design.designNumber).padStart(4, '0')} ${design.name} (${design.template}, ${design.family}, ${design.rarity}, lightness ${design.lightness.toFixed(2)})`
  const source = `// GENERATED by scripts/pick-pass-chat-designs.ts (seed ${SEED}). Never edit by hand: change the
// script's rules and run it again. Read from the frozen design table, the cropped gallery shoes and
// the API's collection (every pick unminted and not pending when it ran). The film places, scales,
// spins and blurs these shoes and never changes one (DESIGNS_FROZEN_ON).
//
// Why these (docs/pass-chat-video-prompt.md §4):
// - The hero is #0627 Lime Runner Day, unlaced, as the gallery shows it: a lime shoe in a blue
//   sky, like the reference's lime balloon, picked by rendering candidates on sky blue.
// - The burst is ten other designs, one per template (all ten templates) and one per family. Ten
//   families qualify: Cobalt and Ocean vanish against the sky, Lime is the hero's own, and Plum is
//   the next closest to the sky's blue (and keeps purple to the one Legendary's own panels).
// - The Prism family is the Legendaries, so exactly one Legendary bursts out.
// - Around the circle, warm (Ember, Cherry, Rose, Clay, Gold) and cool (Jade, Lagoon, Moss, Chrome,
//   Prism) alternate, and so do light and dark shoes as far as that order allows. Lightness is the
//   shoe's alpha-weighted luminance, 0 to 1.

export const HERO_DESIGN_NUMBER = ${HERO_DESIGN_NUMBER}

/** The ten burst shoes, clockwise from the top. */
export const BURST_DESIGN_NUMBERS: readonly number[] = [
${ordered.map((design) => `  ${design.designNumber}, // ${describe(design)}`).join('\n')}
]
`
  await Bun.write(OUTPUT_FILE, source)
  // Formatted with the repo's Biome config, so the generated file passes `bun run lint` as written.
  await Bun.spawn(['bunx', 'biome', 'format', '--write', OUTPUT_FILE], { stdout: 'ignore' }).exited
  console.log(`Wrote ${OUTPUT_FILE}`)
  for (const design of ordered) console.log(describe(design))
}

async function readTakenDesignNumbers(): Promise<Set<number>> {
  const response = await fetch(COLLECTION_URL)
  if (!response.ok) throw new Error(`GET ${COLLECTION_URL}: ${response.status}`)
  const collection = (await response.json()) as {
    mintedDesignNumbers: number[]
    pendingDesignNumbers: number[]
  }
  const taken = new Set([...collection.mintedDesignNumbers, ...collection.pendingDesignNumbers])
  if (taken.has(HERO_DESIGN_NUMBER)) {
    throw new Error(
      `#${HERO_DESIGN_NUMBER} is minted or pending: the hero has to change (ask Yash)`,
    )
  }
  return taken
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
  return rows.map((row, rowIndex) => {
    const [templateIndex, familyIndex, colorwayIndex, , , , , rarityIndex] = row as number[]
    const template = templates[templateIndex ?? -1]
    const family = families[familyIndex ?? -1]
    const colorway = colorways[colorwayIndex ?? -1]
    const rarity = RARITIES[rarityIndex ?? -1]
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
    }
  })
}

/** The cropped shoe's alpha-weighted relative luminance, rasterised small by rsvg-convert. */
async function readLightness(design: Design): Promise<number> {
  const file = `${SHOE_DIRECTORY}/${String(design.designNumber).padStart(4, '0')}.svg`
  const raster = Bun.spawn(
    [
      'sh',
      '-c',
      `rsvg-convert -w 160 "${file}" | ffmpeg -v error -i - -f rawvideo -pix_fmt rgba -`,
    ],
    { stdout: 'pipe' },
  )
  const pixels = new Uint8Array(await new Response(raster.stdout).arrayBuffer())
  const toLinear = (channel: number) => {
    const value = channel / 255
    return value <= 0.04045 ? value / 12.92 : ((value + 0.055) / 1.055) ** 2.4
  }
  let weightedLuminance = 0
  let totalAlpha = 0
  for (let offset = 0; offset < pixels.length; offset += 4) {
    const alpha = (pixels[offset + 3] ?? 0) / 255
    weightedLuminance +=
      alpha *
      (0.2126 * toLinear(pixels[offset] ?? 0) +
        0.7152 * toLinear(pixels[offset + 1] ?? 0) +
        0.0722 * toLinear(pixels[offset + 2] ?? 0))
    totalAlpha += alpha
  }
  return totalAlpha === 0 ? 0 : weightedLuminance / totalAlpha
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
