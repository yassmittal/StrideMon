import { SNEAKER_TEMPLATES } from '../art-system/templates'
import type { Design, TemplateKey } from '../art-system/types'
import type { SneakerPictureRequest } from './rendered-art'
import { buildCardSheet } from './sheet-layout'
import { formatDesignNumber, type PreviewPlan } from './showcase'

/**
 * The Founder Sneaker (D-042): a pass holder's Sneaker, drawn by `SneakerArtRenderer` in the
 * pass's design on the app's dark panel. Part 2 shows these to Yash before the deploy.
 */
const SHEET_PNG_WIDTH_PIXELS = 2400
/** About a phone's width at 3×, to check the picture as the app's hero panel shows it. */
const SINGLE_PICTURE_PNG_WIDTH_PIXELS = 1080
const COLUMN_COUNT = 5
const SHOWCASE_DESIGN_NUMBER = 137
/** A normal Sneaker keeps D-030's line art, shown beside the founders for comparison. */
const NORMAL_SNEAKER_TOKEN_ID = 4
/** Founder Sneakers' ids on the sheet: each cell its own, so no two share a clip path id. */
const FIRST_FOUNDER_TOKEN_ID = 101

/** A design per template that tests the dark panel: a dark colourway, or a metal family. */
const DARK_COLORWAY_KEYS: readonly string[] = ['night', 'eclipse', 'storm']
const METAL_FAMILY_KEYS: readonly string[] = ['chrome', 'gold']

const MINTED_STATS = { level: 1, durability: 100 }
const PLAYED_STATS = { level: 6, durability: 64 }

type PictureCell = { request: SneakerPictureRequest; caption: string }

export function planFounderSneakerFiles(designs: readonly Design[]): PreviewPlan[] {
  const showcaseDesign = findDesign(designs, SHOWCASE_DESIGN_NUMBER)
  const legendaryDesign = designs.find((design) => design.rarity === 'legendary')
  if (legendaryDesign === undefined) throw new Error('No Legendary design')
  let nextTokenId = FIRST_FOUNDER_TOKEN_ID
  const buildFounderCell = (
    design: Design,
    { isLaced, hasGoldFrame }: { isLaced: boolean; hasGoldFrame: boolean },
  ): PictureCell => {
    const stats = isLaced ? PLAYED_STATS : MINTED_STATS
    const sneakerTokenId = nextTokenId++
    return {
      request: {
        fileName: `founder-sneaker-${formatDesignNumber(design.designNumber)}-${sneakerTokenId}`,
        designNumber: design.designNumber,
        sneakerTokenId,
        ...stats,
        isLaced,
        hasGoldFrame,
      },
      caption: [
        `#${formatDesignNumber(design.designNumber)}`,
        isLaced ? 'LACED' : 'MINTED',
        `LV ${stats.level}`,
        ...(hasGoldFrame ? ['GOLD'] : []),
      ].join(' · '),
    }
  }

  const templateDesigns = SNEAKER_TEMPLATES.map((template, templateIndex) =>
    pickDarkPanelDesign(designs, template.key, templateIndex),
  )
  const templateRows = [templateDesigns.slice(0, COLUMN_COUNT), templateDesigns.slice(COLUMN_COUNT)]
  const cells: PictureCell[] = templateRows.flatMap((rowDesigns) => [
    ...rowDesigns.map((design) =>
      buildFounderCell(design, { isLaced: false, hasGoldFrame: false }),
    ),
    ...rowDesigns.map((design, columnIndex) =>
      buildFounderCell(design, { isLaced: true, hasGoldFrame: columnIndex % 2 === 1 }),
    ),
  ])
  const normalSneakerCell: PictureCell = {
    request: {
      fileName: 'normal-sneaker',
      designNumber: 0,
      sneakerTokenId: NORMAL_SNEAKER_TOKEN_ID,
      ...MINTED_STATS,
      isLaced: false,
      hasGoldFrame: false,
    },
    caption: 'NORMAL SNEAKER · UNCHANGED',
  }
  const showcaseMinted = buildFounderCell(showcaseDesign, { isLaced: false, hasGoldFrame: false })
  const showcaseLaced = buildFounderCell(showcaseDesign, { isLaced: true, hasGoldFrame: false })
  cells.push(
    normalSneakerCell,
    showcaseMinted,
    showcaseLaced,
    buildFounderCell(showcaseDesign, { isLaced: true, hasGoldFrame: true }),
    buildFounderCell(legendaryDesign, { isLaced: true, hasGoldFrame: false }),
  )

  const sheet: PreviewPlan = {
    fileName: '8-founder-sneakers',
    pngWidthPixels: SHEET_PNG_WIDTH_PIXELS,
    cardRequests: [],
    sneakerRequests: [],
    sneakerPictureRequests: cells.map((cell) => cell.request),
    composeSvg: (renderedArt) =>
      buildCardSheet({
        title: 'FOUNDER SNEAKERS · ON THE DARK PANEL',
        subtitle:
          'Each pass gives one, drawn in its design. Rows of five: as minted, then laced after the first walk (some with a gold-framed pass).',
        cells: cells.map((cell) => ({
          svg: renderedArt.readSneakerPictureSvg(cell.request.fileName),
          caption: cell.caption,
        })),
        columnCount: COLUMN_COUNT,
      }),
  }
  const singlePictures = [showcaseMinted, showcaseLaced].map(
    (cell, cellIndex): PreviewPlan => ({
      fileName: `founder-sneaker-${formatDesignNumber(SHOWCASE_DESIGN_NUMBER)}-${cellIndex === 0 ? 'minted' : 'laced'}`,
      pngWidthPixels: SINGLE_PICTURE_PNG_WIDTH_PIXELS,
      cardRequests: [],
      sneakerRequests: [],
      composeSvg: (renderedArt) => renderedArt.readSneakerPictureSvg(cell.request.fileName),
    }),
  )
  return [sheet, ...singlePictures]
}

/**
 * Even templates take a dark colourway and odd ones a metal family, the looks most likely to
 * melt into the dark panel.
 */
function pickDarkPanelDesign(
  designs: readonly Design[],
  templateKey: TemplateKey,
  templateIndex: number,
): Design {
  const templateDesigns = designs.filter((design) => design.layers.templateKey === templateKey)
  const pickedDesign =
    templateIndex % 2 === 0
      ? templateDesigns.find((design) => DARK_COLORWAY_KEYS.includes(design.layers.colorwayKey))
      : templateDesigns.find((design) => METAL_FAMILY_KEYS.includes(design.layers.colorFamilyKey))
  if (pickedDesign === undefined) throw new Error(`No dark-panel design for ${templateKey}`)
  return pickedDesign
}

function findDesign(designs: readonly Design[], designNumber: number): Design {
  const design = designs.find((candidate) => candidate.designNumber === designNumber)
  if (design === undefined) throw new Error(`No design #${designNumber}`)
  return design
}
