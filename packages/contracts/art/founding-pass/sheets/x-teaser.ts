import { SNEAKER_HEIGHT_UNITS, SNEAKER_WIDTH_UNITS } from '../art-system/frame'
import { readSneakerTemplate } from '../art-system/templates'
import type { ColorFamilyKey, TemplateKey } from '../art-system/types'
import { buildSneakerRequest } from './rendered-art'
import { buildShowcaseLayers, type PreviewPlan } from './showcase'

/**
 * The first X teaser for the Founding Pass (`social/posts/`): six silhouettes in six families on
 * the site's off-white, 4:5 as `social/voice.md` §6 asks. Shoes only, with no pass numbers, since
 * Part 1b's review can still re-roll any design. No purple (voice.md bans it in images).
 */
const TEASER_SHOES: readonly {
  templateKey: TemplateKey
  colorFamilyKey: ColorFamilyKey
  colorwayKey: string
}[] = [
  { templateKey: 'runner', colorFamilyKey: 'ember', colorwayKey: 'flare' },
  { templateKey: 'hoop', colorFamilyKey: 'ocean', colorwayKey: 'dusk' },
  { templateKey: 'trail', colorFamilyKey: 'lime', colorwayKey: 'day' },
  { templateKey: 'racer', colorFamilyKey: 'gold', colorwayKey: 'storm' },
  { templateKey: 'chunky', colorFamilyKey: 'jade', colorwayKey: 'haze' },
  { templateKey: 'skate', colorFamilyKey: 'cherry', colorwayKey: 'day' },
]

const INK = '#141515'
const IMAGE_WIDTH_PIXELS = 1080
const IMAGE_HEIGHT_PIXELS = 1350
const BACKGROUND = '#F0F1FA'
const SHADOW_COLOR = '#E0E2EC'
const MARGIN_PIXELS = 64
const COLUMN_COUNT = 2
const SHOE_SCALE = 0.48
const ROW_PITCH_PIXELS = 318
const GRID_TOP_PIXELS = 236
/** Where each row's ground line sits, below the row's top. */
const ROW_GROUND_OFFSET_PIXELS = 256
const COLUMN_GAP_PIXELS = 32
const SHOE_GROUND_Y = 520
const SHADOW_HALF_WIDTH_PIXELS = 200
const SHADOW_HALF_HEIGHT_PIXELS = 10
const CROSS_MARK_INSET_PIXELS = 30
const CROSS_MARK_ARM_PIXELS = 11
const CROSS_MARK_WIDTH_PIXELS = 2
const CROSS_MARK_COLOR = '#999999'
const SATOSHI = `Satoshi,ui-sans-serif,sans-serif`
const PLEX_MONO = `'IBM Plex Mono',ui-monospace,monospace`

export function planXTeaserFile(): PreviewPlan {
  const sneakerRequests = TEASER_SHOES.map(
    ({ templateKey, colorFamilyKey, colorwayKey }, shoeIndex) =>
      buildSneakerRequest({
        layers: buildShowcaseLayers({
          template: readSneakerTemplate(templateKey),
          colorFamilyKey,
          colorwayKey,
        }),
        isLaced: true,
        fileName: `teaser${shoeIndex}`,
      }),
  )
  return {
    fileName: 'x-founding-pass-teaser',
    pngWidthPixels: IMAGE_WIDTH_PIXELS,
    cardRequests: [],
    sneakerRequests,
    composeSvg: (renderedArt) =>
      [
        `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${IMAGE_WIDTH_PIXELS} ${IMAGE_HEIGHT_PIXELS}">`,
        `<rect width="${IMAGE_WIDTH_PIXELS}" height="${IMAGE_HEIGHT_PIXELS}" fill="${BACKGROUND}"/>`,
        renderCrossMarks(),
        renderHeader(),
        ...sneakerRequests.map((sneakerRequest, shoeIndex) =>
          renderShoe(renderedArt.readSneakerMarkup(sneakerRequest.fileName), shoeIndex),
        ),
        renderFooter(),
        '</svg>',
      ].join(''),
  }
}

function renderHeader(): string {
  return [
    `<text x="${MARGIN_PIXELS}" y="116" fill="${INK}" font-family="${SATOSHI}" font-weight="500" font-size="22" letter-spacing="2.5">STRIDEMON · FOUNDING PASS</text>`,
    `<text x="${MARGIN_PIXELS}" y="176" fill="${INK}" font-family="${SATOSHI}" font-size="46">1,000 designs. Each one minted once.</text>`,
  ].join('')
}

function renderFooter(): string {
  const footerY = IMAGE_HEIGHT_PIXELS - 92
  return `<text x="${MARGIN_PIXELS}" y="${footerY}" fill="${INK}" fill-opacity="0.5" font-family="${PLEX_MONO}" font-size="20" letter-spacing="1.5">MONAD TESTNET · FREE · CAN’T BE SOLD OR SENT</text>`
}

function renderShoe(sneakerMarkup: string, shoeIndex: number): string {
  const cellWidth = (IMAGE_WIDTH_PIXELS - MARGIN_PIXELS * 2 - COLUMN_GAP_PIXELS) / COLUMN_COUNT
  const shoeWidth = SNEAKER_WIDTH_UNITS * SHOE_SCALE
  const columnIndex = shoeIndex % COLUMN_COUNT
  const rowIndex = Math.floor(shoeIndex / COLUMN_COUNT)
  const cellLeft = MARGIN_PIXELS + columnIndex * (cellWidth + COLUMN_GAP_PIXELS)
  const offsetX = Math.round(cellLeft + (cellWidth - shoeWidth) / 2)
  // Each shoe stands on its row's ground line, whatever its height.
  const groundY = GRID_TOP_PIXELS + rowIndex * ROW_PITCH_PIXELS + ROW_GROUND_OFFSET_PIXELS
  const offsetY = Math.round(groundY - SHOE_GROUND_Y * SHOE_SCALE)
  const shadowCenterX = Math.round(cellLeft + cellWidth / 2)
  return [
    `<ellipse cx="${shadowCenterX}" cy="${Math.round(groundY + 6)}" rx="${SHADOW_HALF_WIDTH_PIXELS}" ry="${SHADOW_HALF_HEIGHT_PIXELS}" fill="${SHADOW_COLOR}"/>`,
    `<svg x="${offsetX}" y="${offsetY}" width="${Math.round(shoeWidth)}" height="${Math.round(SNEAKER_HEIGHT_UNITS * SHOE_SCALE)}" viewBox="0 0 ${SNEAKER_WIDTH_UNITS} ${SNEAKER_HEIGHT_UNITS}">`,
    sneakerMarkup,
    '</svg>',
  ].join('')
}

/** The "+" marks in the corners, at least 2 px wide at 1080 px (voice.md §6). */
function renderCrossMarks(): string {
  const near = CROSS_MARK_INSET_PIXELS
  const farX = IMAGE_WIDTH_PIXELS - CROSS_MARK_INSET_PIXELS
  const farY = IMAGE_HEIGHT_PIXELS - CROSS_MARK_INSET_PIXELS
  const arm = CROSS_MARK_ARM_PIXELS
  const pathData = [near, farX]
    .flatMap((x) =>
      [near, farY].map((y) => `M${x - arm} ${y}h${arm * 2}M${x} ${y - arm}v${arm * 2}`),
    )
    .join('')
  return `<path d="${pathData}" stroke="${CROSS_MARK_COLOR}" stroke-width="${CROSS_MARK_WIDTH_PIXELS}"/>`
}
