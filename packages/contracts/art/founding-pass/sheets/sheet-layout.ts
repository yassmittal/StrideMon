import { SNEAKER_HEIGHT_UNITS, SNEAKER_WIDTH_UNITS } from '../art-system/frame'

/**
 * Review sheets: many Sneakers or cards on one page, under a title. Every cell is a nested
 * `<svg>` holding what the Solidity renderer drew, so one page can hold a hundred designs, each
 * with its own clip path id.
 */
type SneakerCell = {
  /** The Sneaker's markup in its 1000 × 600 space, from `renderSneakerMarkup`. */
  markup: string
  caption: string
}
/** `caption` is `null` on cells where the card says it all. */
type CardCell = { svg: string; caption: string | null }

const INK = '#141515'
const SHEET_BACKGROUND = '#FFFFFF'
const SNEAKER_CELL_BACKGROUND = '#F0F1FA'
const SHEET_MARGIN_UNITS = 80
const CELL_GAP_UNITS = 32
const HEADER_HEIGHT_UNITS = 240
const TITLE_BASELINE_Y = 120
const TITLE_FONT_SIZE = 56
const TITLE_LETTER_SPACING = 2
const SUBTITLE_BASELINE_Y = 180
const SUBTITLE_FONT_SIZE = 32
const SUBTITLE_OPACITY = '0.5'
const CAPTION_HEIGHT_UNITS = 64
const CAPTION_INSET_UNITS = 8
const CAPTION_BASELINE_DROP_UNITS = 44
const CAPTION_FONT_SIZE = 30
const CAPTION_LETTER_SPACING = 1.5
const CARD_SIZE_UNITS = 1000
const FONT_FAMILY = `'IBM Plex Mono',ui-monospace,monospace`

/** `null` cells leave a gap, so rows can line up. */
export function buildSneakerSheet({
  title,
  subtitle,
  cells,
  columnCount,
}: {
  title: string
  subtitle: string
  cells: readonly (SneakerCell | null)[]
  columnCount: number
}): string {
  return buildSheet({
    title,
    subtitle,
    columnCount,
    cellWidth: SNEAKER_WIDTH_UNITS,
    cellHeight: SNEAKER_HEIGHT_UNITS + CAPTION_HEIGHT_UNITS,
    cellMarkups: cells.map((cell) =>
      cell === null
        ? ''
        : [
            `<rect width="${SNEAKER_WIDTH_UNITS}" height="${SNEAKER_HEIGHT_UNITS}" fill="${SNEAKER_CELL_BACKGROUND}"/>`,
            `<svg width="${SNEAKER_WIDTH_UNITS}" height="${SNEAKER_HEIGHT_UNITS}" viewBox="0 0 ${SNEAKER_WIDTH_UNITS} ${SNEAKER_HEIGHT_UNITS}">`,
            cell.markup,
            '</svg>',
            renderCaption(cell.caption, SNEAKER_HEIGHT_UNITS),
          ].join(''),
    ),
  })
}

export function buildCardSheet({
  title,
  subtitle,
  cells,
  columnCount,
}: {
  title: string
  subtitle: string
  cells: readonly CardCell[]
  columnCount: number
}): string {
  const hasCaptions = cells.some((cell) => cell.caption !== null)
  return buildSheet({
    title,
    subtitle,
    columnCount,
    cellWidth: CARD_SIZE_UNITS,
    cellHeight: CARD_SIZE_UNITS + (hasCaptions ? CAPTION_HEIGHT_UNITS : 0),
    cellMarkups: cells.map(({ svg, caption }) =>
      [
        svg.replace('<svg ', `<svg width="${CARD_SIZE_UNITS}" height="${CARD_SIZE_UNITS}" `),
        caption === null ? '' : renderCaption(caption, CARD_SIZE_UNITS),
      ].join(''),
    ),
  })
}

function buildSheet({
  title,
  subtitle,
  columnCount,
  cellWidth,
  cellHeight,
  cellMarkups,
}: {
  title: string
  subtitle: string
  columnCount: number
  cellWidth: number
  cellHeight: number
  cellMarkups: readonly string[]
}): string {
  const rowCount = Math.ceil(cellMarkups.length / columnCount)
  const sheetWidth =
    SHEET_MARGIN_UNITS * 2 + columnCount * cellWidth + (columnCount - 1) * CELL_GAP_UNITS
  const sheetHeight =
    HEADER_HEIGHT_UNITS +
    SHEET_MARGIN_UNITS +
    rowCount * cellHeight +
    (rowCount - 1) * CELL_GAP_UNITS
  const placedCells = cellMarkups.map((cellMarkup, cellIndex) => {
    const cellX = SHEET_MARGIN_UNITS + (cellIndex % columnCount) * (cellWidth + CELL_GAP_UNITS)
    const cellY =
      HEADER_HEIGHT_UNITS + Math.floor(cellIndex / columnCount) * (cellHeight + CELL_GAP_UNITS)
    return `<g transform="translate(${cellX} ${cellY})">${cellMarkup}</g>`
  })
  return [
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${sheetWidth} ${sheetHeight}" font-family="${FONT_FAMILY}">`,
    `<rect width="${sheetWidth}" height="${sheetHeight}" fill="${SHEET_BACKGROUND}"/>`,
    `<text x="${SHEET_MARGIN_UNITS}" y="${TITLE_BASELINE_Y}" fill="${INK}" font-size="${TITLE_FONT_SIZE}" letter-spacing="${TITLE_LETTER_SPACING}">${escapeText(title)}</text>`,
    `<text x="${SHEET_MARGIN_UNITS}" y="${SUBTITLE_BASELINE_Y}" fill="${INK}" fill-opacity="${SUBTITLE_OPACITY}" font-size="${SUBTITLE_FONT_SIZE}">${escapeText(subtitle)}</text>`,
    ...placedCells,
    '</svg>',
  ].join('')
}

function renderCaption(caption: string, topY: number): string {
  return `<text x="${CAPTION_INSET_UNITS}" y="${topY + CAPTION_BASELINE_DROP_UNITS}" fill="${INK}" font-size="${CAPTION_FONT_SIZE}" letter-spacing="${CAPTION_LETTER_SPACING}">${escapeText(caption)}</text>`
}

function escapeText(text: string): string {
  return text.replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;')
}
