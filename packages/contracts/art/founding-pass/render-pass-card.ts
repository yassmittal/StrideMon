import { INK, LIME, SNEAKER_WIDTH_UNITS } from './art-system/frame'
import type { Rarity } from './art-system/types'
import { renderSneakerMarkup, type SneakerArtwork } from './render-sneaker'

/**
 * The Founding Pass: the Sneaker on a quiet square card, as the NFT image and the gallery's art.
 * The card stays calm (the site's off-white, ink type, Lusion's "+" corner marks) so the shoe
 * carries the picture. Text uses IBM Plex Mono like the Sneaker card, and falls back to any
 * monospace where it isn't installed (wallets, explorers).
 */
export type PassCard = {
  designNumber: number
  name: string
  rarity: Rarity
  artwork: SneakerArtwork
  /** The mint order, or `null` while the design is still available. */
  founderNumber: number | null
  hasGoldFrame: boolean
}

const CARD_SIZE_UNITS = 1000
const CARD_BACKGROUND = '#F0F1FA'
/** Lusion's 0.1 black hairline, pre-mixed onto the background so no opacity is needed. */
const HAIRLINE_COLOR = '#D8D9E1'
const HAIRLINE_WIDTH_UNITS = 2
const SHADOW_COLOR = '#E0E2EC'
const MUTED_INK_OPACITY = '0.5'

const MARGIN_UNITS = 64
const HEADER_BASELINE_Y = 98
const HEADER_HAIRLINE_Y = 130
const FOOTER_HAIRLINE_Y = 802
const NAME_BASELINE_Y = 878
const META_BASELINE_Y = 926
const LABEL_FONT_SIZE = 28
const NAME_FONT_SIZE = 44
const LABEL_LETTER_SPACING = 2.5

const SNEAKER_SCALE = 0.94
/** The shoe sits centred between the header and the footer, whatever its height. */
const SNEAKER_AREA_CENTER_Y = 476
const SNEAKER_GROUND_Y = 520
const SHADOW_HALF_WIDTH_UNITS = 400
const SHADOW_HALF_HEIGHT_UNITS = 22
/** The shadow sits a little below the sole, so a sliver shows under the outline. */
const SHADOW_DROP_UNITS = 10

const CROSS_MARK_ARM_UNITS = 12
const CROSS_MARK_INSET_UNITS = 32
const CROSS_MARK_OPACITY = '0.3'

/** The lime "LACED" pill, right-aligned on the meta line. */
const LACED_PILL_WIDTH_UNITS = 124
const LACED_PILL_HEIGHT_UNITS = 40
const LACED_PILL_RISE_UNITS = 30
const LACED_PILL_TEXT_DROP_UNITS = 29
const LACED_PILL_FONT_SIZE = 24
const LACED_PILL_LETTER_SPACING = 2

const GOLD_FRAME_COLOR = '#C9971C'
/** A thick band at the edge and a thin line inside it. */
const GOLD_FRAME_BAND_INSET_UNITS = 14
const GOLD_FRAME_BAND_WIDTH_UNITS = 14
const GOLD_FRAME_LINE_INSET_UNITS = 38
const GOLD_FRAME_LINE_WIDTH_UNITS = 3

const DESIGN_NUMBER_DIGITS = 4
const FOUNDER_NUMBER_DIGITS = 3

const FONT_FAMILY = `'IBM Plex Mono',ui-monospace,monospace`

/**
 * `clipPathId` must be unique on the page that shows the card: inline SVGs on one page share
 * their ids. The token's own image uses `pass` + the design number.
 */
export function renderPassCardSvg(
  card: PassCard,
  clipPathId: string = `pass${card.designNumber}`,
): string {
  return [
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${CARD_SIZE_UNITS} ${CARD_SIZE_UNITS}" font-family="${FONT_FAMILY}">`,
    `<rect width="${CARD_SIZE_UNITS}" height="${CARD_SIZE_UNITS}" fill="${CARD_BACKGROUND}"/>`,
    card.hasGoldFrame ? renderGoldFrame() : renderCrossMarks(),
    renderHeader(card.designNumber),
    renderSneaker(card, clipPathId),
    renderFooter(card),
    '</svg>',
  ].join('')
}

function renderHeader(designNumber: number): string {
  return [
    `<g fill="${INK}" font-size="${LABEL_FONT_SIZE}" letter-spacing="${LABEL_LETTER_SPACING}">`,
    `<text x="${MARGIN_UNITS}" y="${HEADER_BASELINE_Y}">FOUNDING PASS</text>`,
    `<text x="${CARD_SIZE_UNITS - MARGIN_UNITS}" y="${HEADER_BASELINE_Y}" text-anchor="end">#${padWithZeros(designNumber, DESIGN_NUMBER_DIGITS)}</text>`,
    '</g>',
    renderHairline(HEADER_HAIRLINE_Y),
  ].join('')
}

/** Scaled into the card, centred on its own height so low and tall shoes both sit in the middle. */
function renderSneaker(card: PassCard, clipPathId: string): string {
  const silhouetteTopY = Math.min(...card.artwork.template.silhouette.map(([, y]) => y))
  const sneakerMiddleY = (silhouetteTopY + SNEAKER_GROUND_Y) / 2
  const offsetX = (CARD_SIZE_UNITS - SNEAKER_WIDTH_UNITS * SNEAKER_SCALE) / 2
  const offsetY = Math.round(SNEAKER_AREA_CENTER_Y - sneakerMiddleY * SNEAKER_SCALE)
  const groundY = offsetY + SNEAKER_GROUND_Y * SNEAKER_SCALE
  return [
    `<ellipse cx="${CARD_SIZE_UNITS / 2}" cy="${Math.round(groundY + SHADOW_DROP_UNITS)}" rx="${SHADOW_HALF_WIDTH_UNITS}" ry="${SHADOW_HALF_HEIGHT_UNITS}" fill="${SHADOW_COLOR}"/>`,
    `<g transform="translate(${offsetX} ${offsetY}) scale(${SNEAKER_SCALE})">`,
    renderSneakerMarkup(card.artwork, clipPathId),
    '</g>',
  ].join('')
}

function renderFooter(card: PassCard): string {
  const rightEdgeX = CARD_SIZE_UNITS - MARGIN_UNITS
  return [
    renderHairline(FOOTER_HAIRLINE_Y),
    `<text x="${MARGIN_UNITS}" y="${NAME_BASELINE_Y}" fill="${INK}" font-size="${NAME_FONT_SIZE}">${escapeText(card.name)}</text>`,
    `<g fill="${INK}" font-size="${LABEL_FONT_SIZE}" letter-spacing="${LABEL_LETTER_SPACING}">`,
    `<text x="${MARGIN_UNITS}" y="${META_BASELINE_Y}" fill-opacity="${MUTED_INK_OPACITY}">${card.rarity.toUpperCase()} · 1 OF 1</text>`,
    card.founderNumber === null
      ? ''
      : `<text x="${rightEdgeX}" y="${NAME_BASELINE_Y}" text-anchor="end">FOUNDER ${padWithZeros(card.founderNumber, FOUNDER_NUMBER_DIGITS)}</text>`,
    '</g>',
    card.artwork.lacingStage === 'laced' ? renderLacedPill(rightEdgeX) : '',
  ].join('')
}

/** A lime pill with ink text: lime only ever sits behind black text on a light card. */
function renderLacedPill(rightEdgeX: number): string {
  const pillLeftX = rightEdgeX - LACED_PILL_WIDTH_UNITS
  const pillTopY = META_BASELINE_Y - LACED_PILL_RISE_UNITS
  return [
    `<rect x="${pillLeftX}" y="${pillTopY}" width="${LACED_PILL_WIDTH_UNITS}" height="${LACED_PILL_HEIGHT_UNITS}" rx="${LACED_PILL_HEIGHT_UNITS / 2}" fill="${LIME}"/>`,
    `<text x="${pillLeftX + LACED_PILL_WIDTH_UNITS / 2}" y="${pillTopY + LACED_PILL_TEXT_DROP_UNITS}" fill="${INK}" font-size="${LACED_PILL_FONT_SIZE}" letter-spacing="${LACED_PILL_LETTER_SPACING}" text-anchor="middle">LACED</text>`,
  ].join('')
}

function renderHairline(lineY: number): string {
  return `<path d="M${MARGIN_UNITS} ${lineY}H${CARD_SIZE_UNITS - MARGIN_UNITS}" stroke="${HAIRLINE_COLOR}" stroke-width="${HAIRLINE_WIDTH_UNITS}"/>`
}

/** Lusion's "+" marks in the four corners. */
function renderCrossMarks(): string {
  const near = CROSS_MARK_INSET_UNITS
  const far = CARD_SIZE_UNITS - CROSS_MARK_INSET_UNITS
  const arm = CROSS_MARK_ARM_UNITS
  const pathData = [near, far]
    .flatMap((x) =>
      [near, far].map((y) => `M${x - arm} ${y}h${arm * 2}M${x} ${y - arm}v${arm * 2}`),
    )
    .join('')
  return `<path d="${pathData}" stroke="${INK}" stroke-opacity="${CROSS_MARK_OPACITY}" stroke-width="${HAIRLINE_WIDTH_UNITS}"/>`
}

function renderGoldFrame(): string {
  return [
    renderSquareOutline(GOLD_FRAME_BAND_INSET_UNITS, GOLD_FRAME_BAND_WIDTH_UNITS),
    renderSquareOutline(GOLD_FRAME_LINE_INSET_UNITS, GOLD_FRAME_LINE_WIDTH_UNITS),
  ].join('')
}

/** A square outline whose outer edge sits `insetUnits` in from the card's edge. */
function renderSquareOutline(insetUnits: number, widthUnits: number): string {
  const strokeCenterInset = insetUnits + widthUnits / 2
  const size = CARD_SIZE_UNITS - strokeCenterInset * 2
  return `<rect x="${strokeCenterInset}" y="${strokeCenterInset}" width="${size}" height="${size}" fill="none" stroke="${GOLD_FRAME_COLOR}" stroke-width="${widthUnits}"/>`
}

function padWithZeros(value: number, digitCount: number): string {
  return String(value).padStart(digitCount, '0')
}

function escapeText(text: string): string {
  return text.replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;')
}
