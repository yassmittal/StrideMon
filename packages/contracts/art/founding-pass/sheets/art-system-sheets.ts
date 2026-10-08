import { COLOR_FAMILIES, readColorFamily } from '../art-system/color-families'
import { COLORWAYS, readColorway } from '../art-system/colorways'
import { readSneakerTemplate, SNEAKER_TEMPLATES } from '../art-system/templates'
import type { ColorFamilyKey, DesignLayers, Rarity, SneakerTemplate } from '../art-system/types'
import { buildSneakerRequest } from './rendered-art'
import { buildSneakerSheet } from './sheet-layout'
import {
  buildShowcaseLayers,
  formatShowcaseLook,
  type PreviewPlan,
  readFirstValueKeys,
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

type PlannedSneakerCell = { layers: DesignLayers; isLaced: boolean; caption: string }

/** Every template in one family, unlaced (as minted) beside laced (after the first walk). */
export function planTemplatesSheet(): PreviewPlan {
  return planSneakerSheet({
    fileName: '1-templates-in-one-family',
    requestPrefix: 'templates',
    pngWidthPixels: SHEET_PNG_WIDTH_PIXELS,
    title: `EVERY TEMPLATE · ${formatShowcaseLook()}`,
    subtitle: 'Ten silhouettes, each unlaced (at mint) and laced (after the first walk).',
    columnCount: 4,
    cells: SNEAKER_TEMPLATES.flatMap((template) =>
      [false, true].map((isLaced) => ({
        layers: buildShowcaseLayers({ template }),
        isLaced,
        caption: `${template.label} · ${isLaced ? 'laced' : 'unlaced'}`.toUpperCase(),
      })),
    ),
  })
}

/** The Runner in all fourteen families, laced, in one colourway. */
export function planFamiliesSheet(): PreviewPlan {
  const runner = readSneakerTemplate('runner')
  return planSneakerSheet({
    fileName: '2-one-template-in-every-family',
    requestPrefix: 'families',
    pngWidthPixels: SHEET_PNG_WIDTH_PIXELS,
    title: `EVERY FAMILY · RUNNER ${readColorway(SHOWCASE_COLORWAY_KEY).label.toUpperCase()}`,
    subtitle: 'Eleven everyday families, then the rare Gold and Chrome and the Legendary Prism.',
    columnCount: 4,
    cells: COLOR_FAMILIES.map((colorFamily) => ({
      layers: buildShowcaseLayers({ template: runner, colorFamilyKey: colorFamily.key }),
      isLaced: true,
      caption: (colorFamily.rarity === 'common'
        ? colorFamily.label
        : `${colorFamily.label} · ${colorFamily.rarity}`
      ).toUpperCase(),
    })),
  })
}

/** The Runner in one family through all ten colourways. */
export function planColorwaysSheet(): PreviewPlan {
  const runner = readSneakerTemplate('runner')
  return planSneakerSheet({
    fileName: '5-colourways',
    requestPrefix: 'colourways',
    pngWidthPixels: SHEET_PNG_WIDTH_PIXELS,
    title: `TEN COLOURWAYS · ${readColorFamily(COLORWAYS_SHEET_FAMILY_KEY).label.toUpperCase()} RUNNER`,
    subtitle:
      'Each colourway maps panel roles to the family’s five shades. The collar and sole stay dark.',
    columnCount: 5,
    cells: COLORWAYS.map((colorway) => ({
      layers: buildShowcaseLayers({
        template: runner,
        colorFamilyKey: COLORWAYS_SHEET_FAMILY_KEY,
        colorwayKey: colorway.key,
      }),
      isLaced: true,
      caption: colorway.label.toUpperCase(),
    })),
  })
}

/** Each template's options: its first look, then one slot changed at a time. */
export function planOptionsSheet(): PreviewPlan {
  const rows = SNEAKER_TEMPLATES.map(buildOptionRow)
  const columnCount = Math.max(...rows.map((row) => row.length))
  return planSneakerSheet({
    fileName: '6-options',
    requestPrefix: 'options',
    pngWidthPixels: OPTIONS_SHEET_PNG_WIDTH_PIXELS,
    title: `EVERY OPTION · ${formatShowcaseLook()}`,
    subtitle:
      'Each row: the template’s first look, then one slot changed at a time. (U) uncommon, (R) rare.',
    columnCount,
    cells: rows.flatMap((row) => [...row, ...Array<null>(columnCount - row.length).fill(null)]),
  })
}

function buildOptionRow(template: SneakerTemplate): PlannedSneakerCell[] {
  const baseValueKeys = readFirstValueKeys(template)
  const variations = template.optionSlots.flatMap((optionSlot) =>
    optionSlot.values.slice(1).map((optionValue) => ({
      layers: buildShowcaseLayers({
        template,
        optionValueKeys: { ...baseValueKeys, [optionSlot.key]: optionValue.key },
      }),
      isLaced: true,
      caption:
        `${optionSlot.label}: ${optionValue.label}`.toUpperCase() +
        RARITY_MARKS[optionValue.rarity],
    })),
  )
  const firstLabels = template.optionSlots.map((optionSlot) => optionSlot.values[0]?.label)
  const firstLook = {
    layers: buildShowcaseLayers({ template }),
    isLaced: true,
    caption: `${template.label}: ${firstLabels.join(' / ')}`.toUpperCase(),
  }
  return [firstLook, ...variations]
}

/** Asks the renderer for each cell's Sneaker, then lays the drawn Sneakers out as a sheet. */
function planSneakerSheet({
  fileName,
  requestPrefix,
  pngWidthPixels,
  title,
  subtitle,
  columnCount,
  cells,
}: {
  fileName: string
  /** Names the requests' files and clip paths, so it must be unique across the previews. */
  requestPrefix: string
  pngWidthPixels: number
  title: string
  subtitle: string
  columnCount: number
  cells: readonly (PlannedSneakerCell | null)[]
}): PreviewPlan {
  const requestedCells = cells.map((cell, cellIndex) =>
    cell === null
      ? null
      : {
          caption: cell.caption,
          request: buildSneakerRequest({
            layers: cell.layers,
            isLaced: cell.isLaced,
            fileName: `${requestPrefix}${cellIndex}`,
          }),
        },
  )
  return {
    fileName,
    pngWidthPixels,
    cardRequests: [],
    sneakerRequests: requestedCells.flatMap((cell) => (cell === null ? [] : [cell.request])),
    composeSvg: (renderedArt) =>
      buildSneakerSheet({
        title,
        subtitle,
        columnCount,
        cells: requestedCells.map((cell) =>
          cell === null
            ? null
            : {
                markup: renderedArt.readSneakerMarkup(cell.request.fileName),
                caption: cell.caption,
              },
        ),
      }),
  }
}
