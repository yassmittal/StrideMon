import {
  CREAM,
  EYELET_RADIUS_UNITS,
  HEEL_TAB_LINE_WIDTH_UNITS,
  INK,
  LACE_LINE_WIDTH_UNITS,
  LIME,
  OUTLINE_WIDTH_UNITS,
  PANEL_LINE_WIDTH_UNITS,
} from './art-system/frame'
import { formatPathData } from './art-system/geometry'
import { placeHeelTab } from './art-system/heel-tab'
import { calculateEyeletCenters, calculateLaceSlatShapes } from './art-system/lacing'
import type {
  ColorFamily,
  Colorway,
  LaceColor,
  LacingStage,
  OptionLayer,
  OptionValue,
  Panel,
  PanelRole,
  ShadeIndex,
  SneakerTemplate,
} from './art-system/types'

export type SneakerArtwork = {
  template: SneakerTemplate
  colorFamily: ColorFamily
  colorway: Colorway
  /** One value per option slot, in the template's slot order. */
  optionValues: readonly OptionValue[]
  laceColor: LaceColor
  lacingStage: LacingStage
}

/**
 * The Sneaker's elements in its 1000 × 600 space, back to front: the heel tab, the panels clipped
 * to the silhouette, the outline, then the eyelets or the lace slats on top. `clipPathId` must be
 * unique within the page that shows it, because inline SVGs on one page share their ids.
 */
export function renderSneakerMarkup(artwork: SneakerArtwork, clipPathId: string): string {
  const { template } = artwork
  const silhouettePathData = formatPathData([template.silhouette])
  return [
    `<defs><clipPath id="${clipPathId}"><path d="${silhouettePathData}"/></clipPath></defs>`,
    renderHeelTab(template),
    `<g clip-path="url(#${clipPathId})" stroke="${INK}" stroke-width="${PANEL_LINE_WIDTH_UNITS}" stroke-linejoin="round">`,
    renderPanels(collectPanels(artwork), artwork),
    renderSheen(artwork),
    '</g>',
    `<path d="${silhouettePathData}" fill="none" stroke="${INK}" stroke-width="${OUTLINE_WIDTH_UNITS}" stroke-linejoin="round"/>`,
    renderLacing(artwork),
  ].join('')
}

function collectPanels({ template, optionValues }: SneakerArtwork): Panel[] {
  const readOptionPanels = (layer: OptionLayer): Panel[] =>
    optionValues.filter((value) => value.layer === layer).flatMap((value) => value.panels)
  return [
    ...template.upperPanels,
    ...readOptionPanels('quarter'),
    ...template.framingPanels,
    ...readOptionPanels('top'),
    ...template.solePanels,
    ...readOptionPanels('sole'),
  ]
}

function renderPanels(panels: readonly Panel[], artwork: SneakerArtwork): string {
  return panels
    .map(
      (panel) =>
        `<path d="${formatPathData(panel.shapes)}" fill="${resolvePanelColor(panel.role, artwork)}"/>`,
    )
    .join('')
}

function resolvePanelColor(role: PanelRole, { colorFamily, colorway }: SneakerArtwork): string {
  if (role === 'midsole') return CREAM
  if (role === 'ink') return INK
  return colorFamily.shades[colorway.shadeByRole[role]]
}

/** Gold and Chrome only: flat light shards, with no outline, that read as a metal sheen. */
function renderSheen({ template, colorFamily }: SneakerArtwork): string {
  if (colorFamily.sheenColor === null || template.sheenShapes.length === 0) return ''
  return `<path d="${formatPathData(template.sheenShapes)}" fill="${colorFamily.sheenColor}" stroke="none"/>`
}

function renderHeelTab({ heelTab }: SneakerTemplate): string {
  const { tabShape, markShape } = placeHeelTab(heelTab)
  return [
    `<path d="${formatPathData([tabShape])}" fill="${LIME}" stroke="${INK}" stroke-width="${HEEL_TAB_LINE_WIDTH_UNITS}" stroke-linejoin="round"/>`,
    `<path d="${formatPathData([markShape])}" fill="${INK}"/>`,
  ].join('')
}

function renderLacing(artwork: SneakerArtwork): string {
  const { laceLine } = artwork.template
  if (artwork.lacingStage === 'unlaced') {
    const eyelets = calculateEyeletCenters(laceLine)
      .map(([x, y]) => `<circle cx="${x}" cy="${y}" r="${EYELET_RADIUS_UNITS}"/>`)
      .join('')
    return `<g fill="${INK}">${eyelets}</g>`
  }
  const slatPathData = formatPathData(calculateLaceSlatShapes(laceLine))
  return `<path d="${slatPathData}" fill="${resolveLaceColor(artwork)}" stroke="${INK}" stroke-width="${LACE_LINE_WIDTH_UNITS}" stroke-linejoin="round"/>`
}

/** Tonal laces take the family shade two steps from the eyestay's, so they never melt into it. */
const TONAL_LACE_SHADE_BY_EYESTAY_SHADE: Readonly<Record<ShadeIndex, ShadeIndex>> = {
  0: 2,
  1: 3,
  2: 0,
  3: 1,
  4: 2,
}

function resolveLaceColor({ laceColor, colorFamily, colorway }: SneakerArtwork): string {
  switch (laceColor.key) {
    case 'cream':
      return CREAM
    case 'ink':
      return INK
    case 'lime':
      return LIME
    case 'tonal':
      return colorFamily.shades[TONAL_LACE_SHADE_BY_EYESTAY_SHADE[colorway.shadeByRole.eyestay]]
    default: {
      const unhandledLaceColor: never = laceColor.key
      throw new Error(`Unknown lace colour: ${String(unhandledLaceColor)}`)
    }
  }
}
