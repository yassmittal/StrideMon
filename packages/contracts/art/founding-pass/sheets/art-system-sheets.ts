import { COLOR_FAMILIES, readColorFamily } from '../art-system/color-families'
import { COLORWAYS, readColorway } from '../art-system/colorways'
import { readSneakerTemplate, SNEAKER_TEMPLATES } from '../art-system/templates'
import type { ColorFamilyKey, Rarity, SneakerTemplate } from '../art-system/types'
import { buildSneakerSheet, type SneakerCell } from './sheet-layout'
import {
  buildShowcaseArtwork,
  formatShowcaseLook,
  type PreviewFile,
  readFirstValue,
  SHOWCASE_COLORWAY_KEY,
} from './showcase'

/** The sheets that show the art system itself: templates, families, colourways, options. */
const SHEET_PNG_WIDTH_PIXELS = 2400
const OPTIONS_SHEET_PNG_WIDTH_PIXELS = 3200
const COLORWAYS_SHEET_FAMILY_KEY: ColorFamilyKey = 'ocean'
const RARITY_MARKS: Readonly<Record<Rarity, string>> = {
  common: '',
  uncommon: ' (U)',
  rare: ' (R)',
  legendary: ' (L)',
}

/** Every template in one family, unlaced (as minted) beside laced (after the first walk). */
export function buildTemplatesSheet(): PreviewFile {
  const cells = SNEAKER_TEMPLATES.flatMap((template) =>
    (['unlaced', 'laced'] as const).map((lacingStage) => ({
      artwork: buildShowcaseArtwork({ template, lacingStage }),
      caption: `${template.label} · ${lacingStage}`.toUpperCase(),
    })),
  )
  return {
    fileName: '1-templates-in-one-family',
    pngWidthPixels: SHEET_PNG_WIDTH_PIXELS,
    svg: buildSneakerSheet({
      title: `EVERY TEMPLATE · ${formatShowcaseLook()}`,
      subtitle: 'Ten silhouettes, each unlaced (at mint) and laced (after the first walk).',
      cells,
      columnCount: 4,
    }),
  }
}

/** The Runner in all fourteen families, laced, in one colourway. */
export function buildFamiliesSheet(): PreviewFile {
  const runner = readSneakerTemplate('runner')
  const cells = COLOR_FAMILIES.map((colorFamily) => ({
    artwork: buildShowcaseArtwork({
      template: runner,
      lacingStage: 'laced',
      colorFamilyKey: colorFamily.key,
    }),
    caption: (colorFamily.rarity === 'common'
      ? colorFamily.label
      : `${colorFamily.label} · ${colorFamily.rarity}`
    ).toUpperCase(),
  }))
  return {
    fileName: '2-one-template-in-every-family',
    pngWidthPixels: SHEET_PNG_WIDTH_PIXELS,
    svg: buildSneakerSheet({
      title: `EVERY FAMILY · RUNNER ${readColorway(SHOWCASE_COLORWAY_KEY).label.toUpperCase()}`,
      subtitle: 'Eleven everyday families, then the rare Gold and Chrome and the Legendary Prism.',
      cells,
      columnCount: 4,
    }),
  }
}

/** The Runner in one family through all ten colourways. */
export function buildColorwaysSheet(): PreviewFile {
  const runner = readSneakerTemplate('runner')
  return {
    fileName: '5-colourways',
    pngWidthPixels: SHEET_PNG_WIDTH_PIXELS,
    svg: buildSneakerSheet({
      title: `TEN COLOURWAYS · ${readColorFamily(COLORWAYS_SHEET_FAMILY_KEY).label.toUpperCase()} RUNNER`,
      subtitle:
        'Each colourway maps panel roles to the family’s five shades. The collar and sole stay dark.',
      cells: COLORWAYS.map((colorway) => ({
        artwork: buildShowcaseArtwork({
          template: runner,
          lacingStage: 'laced',
          colorFamilyKey: COLORWAYS_SHEET_FAMILY_KEY,
          colorwayKey: colorway.key,
        }),
        caption: colorway.label.toUpperCase(),
      })),
      columnCount: 5,
    }),
  }
}

/** Each template's options: its first look, then one slot changed at a time. */
export function buildOptionsSheet(): PreviewFile {
  const rows = SNEAKER_TEMPLATES.map(buildOptionRow)
  const columnCount = Math.max(...rows.map((row) => row.length))
  const cells = rows.flatMap((row) => [...row, ...Array<null>(columnCount - row.length).fill(null)])
  return {
    fileName: '6-options',
    pngWidthPixels: OPTIONS_SHEET_PNG_WIDTH_PIXELS,
    svg: buildSneakerSheet({
      title: `EVERY OPTION · ${formatShowcaseLook()}`,
      subtitle:
        'Each row: the template’s first look, then one slot changed at a time. (U) uncommon, (R) rare.',
      cells,
      columnCount,
    }),
  }
}

function buildOptionRow(template: SneakerTemplate): SneakerCell[] {
  const baseValues = template.optionSlots.map((optionSlot) => readFirstValue(optionSlot.values))
  const variations = template.optionSlots.flatMap((optionSlot, slotIndex) =>
    optionSlot.values.slice(1).map((optionValue) => ({
      artwork: buildShowcaseArtwork({
        template,
        lacingStage: 'laced',
        optionValues: baseValues.map((baseValue, index) =>
          index === slotIndex ? optionValue : baseValue,
        ),
      }),
      caption:
        `${optionSlot.label}: ${optionValue.label}`.toUpperCase() +
        RARITY_MARKS[optionValue.rarity],
    })),
  )
  const firstLook = {
    artwork: buildShowcaseArtwork({ template, lacingStage: 'laced' }),
    caption:
      `${template.label}: ${baseValues.map((value) => value.label).join(' / ')}`.toUpperCase(),
  }
  return [firstLook, ...variations]
}
