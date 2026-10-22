import type { Texture } from 'three'
import { formatPassNumber } from '@/lib/sneaker-design'
import type { SneakerImages } from './load-sneaker-images'
import { HERO_DESIGN_NUMBER, LEGENDARY_DESIGN_NUMBER } from './sneaker-placements'
import { type PrintSpot, printSpots } from './sneaker-spots'
import { drawCanvasTexture, drawSneaker, type PrintCanvasOptions } from './textures'
import { themeColors } from './theme-colors'

// The prints: the film's lightboxes and posters with a Sneaker painted in (brief §5.2), ported from
// `launch-video/src/showroom/textures.ts`, at the film's sizes times the tier's print scale. The Sneaker is the laced art as it is, never recoloured.

const SIGN_WHITE = '#F4F6FF'

export type PrintOptions = PrintCanvasOptions & { sneakerImages: SneakerImages }

function readSneakerImage(sneakerImages: SneakerImages, designNumber: number): HTMLImageElement {
  const image = sneakerImages.get(designNumber)
  if (image === undefined) throw new Error(`Sneaker #${designNumber} isn't loaded`)
  return image
}

/** A print's Sneakers at their film places, in order. `designNumber` swaps a one-Sneaker print's. */
function drawPrintSneakers(
  context: CanvasRenderingContext2D,
  spot: PrintSpot,
  sneakerImages: SneakerImages,
  designNumber?: number,
): void {
  for (const sneaker of spot.sneakers) {
    drawSneaker({
      context,
      image: readSneakerImage(sneakerImages, designNumber ?? sneaker.designNumber),
      centerX: sneaker.centerX,
      centerY: sneaker.centerY,
      width: sneaker.width,
      rotationDegrees: sneaker.rotationDegrees,
    })
  }
}

/** The big portrait lightbox: #0137 on a deep violet field, its name at the top. */
export function createHeroLightboxTexture({
  fontFamilies,
  printScale,
  sneakerImages,
}: PrintOptions): Texture {
  return drawCanvasTexture({
    width: printSpots.heroLightbox.canvasWidth,
    height: printSpots.heroLightbox.canvasHeight,
    scale: printScale,
    draw: (context, width, height) => {
      const gradient = context.createLinearGradient(0, 0, width, height)
      gradient.addColorStop(0, '#2A1A6E')
      gradient.addColorStop(0.55, '#5B3FE0')
      gradient.addColorStop(1, '#B48CFF')
      context.fillStyle = gradient
      context.fillRect(0, 0, width, height)
      context.fillStyle = SIGN_WHITE
      context.font = `700 104px ${fontFamilies.satoshi}`
      context.fillText('Rose Hiker Night', 90, 250)
      context.font = `500 56px ${fontFamilies.mono}`
      context.fillStyle = 'rgba(244, 246, 255, 0.75)'
      context.fillText(`${formatPassNumber(HERO_DESIGN_NUMBER)} · FOUNDING PASS`, 94, 340)
      drawPrintSneakers(context, printSpots.heroLightbox, sneakerImages)
    },
  })
}

/** The corner poster: LEGENDARY up the side, #0020 over it. */
export function createLegendaryPosterTexture({
  fontFamilies,
  printScale,
  sneakerImages,
}: PrintOptions): Texture {
  return drawCanvasTexture({
    width: printSpots.legendaryPoster.canvasWidth,
    height: printSpots.legendaryPoster.canvasHeight,
    scale: printScale,
    draw: (context, width, height) => {
      context.fillStyle = '#07080C'
      context.fillRect(0, 0, width, height)
      const prism = context.createLinearGradient(0, 300, 0, 1800)
      prism.addColorStop(0, '#FF7AD9')
      prism.addColorStop(0.35, '#8C7BFF')
      prism.addColorStop(0.7, '#3FE0D0')
      prism.addColorStop(1, '#F7FF8A')
      context.save()
      context.translate(330, 1900)
      context.rotate(-Math.PI / 2)
      context.fillStyle = prism
      context.font = `700 300px ${fontFamilies.satoshi}`
      context.letterSpacing = '6px'
      context.fillText('LEGENDARY', 0, 0)
      context.restore()
      drawPrintSneakers(context, printSpots.legendaryPoster, sneakerImages)
      context.fillStyle = SIGN_WHITE
      context.font = `700 76px ${fontFamilies.satoshi}`
      context.fillText('Earthshine', 420, 1720)
      context.font = `500 48px ${fontFamilies.mono}`
      context.fillStyle = 'rgba(244, 246, 255, 0.7)'
      context.fillText(`${formatPassNumber(LEGENDARY_DESIGN_NUMBER)} · 1 OF 1`, 424, 1800)
    },
  })
}

/** The "Founding Pass" wall's lightbox: three Sneakers on the pass cards' own pale field. */
export function createFoundingPassLightboxTexture({
  fontFamilies,
  printScale,
  sneakerImages,
}: PrintOptions): Texture {
  return drawCanvasTexture({
    width: printSpots.foundingPassLightbox.canvasWidth,
    height: printSpots.foundingPassLightbox.canvasHeight,
    scale: printScale,
    draw: (context, width, height) => {
      const gradient = context.createLinearGradient(0, 0, width, height)
      gradient.addColorStop(0, themeColors.background)
      gradient.addColorStop(1, '#D9DCF5')
      context.fillStyle = gradient
      context.fillRect(0, 0, width, height)
      context.fillStyle = themeColors.textPrimary
      context.font = `500 64px ${fontFamilies.mono}`
      context.letterSpacing = '4px'
      context.fillText('FOUNDING PASS', 110, 170)
      context.font = `700 120px ${fontFamilies.satoshi}`
      context.letterSpacing = '0px'
      context.fillText('1,000 one-of-ones.', 104, 310)
      drawPrintSneakers(context, printSpots.foundingPassLightbox, sneakerImages)
    },
  })
}

/**
 * The upright screen on the counter: one Sneaker on black, its number under it. Once minting has
 * started it shows the newest mint, with "Just minted" and its founder number (brief §10, #2).
 */
export function createCounterScreenTexture({
  fontFamilies,
  printScale,
  sneakerImages,
  designNumber = HERO_DESIGN_NUMBER,
  founderNumber = null,
}: PrintOptions & { designNumber?: number; founderNumber?: number | null }): Texture {
  const { counterScreen } = printSpots
  return drawCanvasTexture({
    width: counterScreen.canvasWidth,
    height: counterScreen.canvasHeight,
    scale: printScale,
    draw: (context, width, height) => {
      context.fillStyle = '#0D0E14'
      context.fillRect(0, 0, width, height)
      drawPrintSneakers(context, counterScreen, sneakerImages, designNumber)
      context.fillStyle = SIGN_WHITE
      context.textAlign = 'center'
      context.font = `500 44px ${fontFamilies.mono}`
      context.fillText(formatPassNumber(designNumber), 300, 760)
      if (founderNumber !== null) {
        context.font = `500 30px ${fontFamilies.mono}`
        context.letterSpacing = '3px'
        context.fillStyle = 'rgba(244, 246, 255, 0.7)'
        context.fillText('JUST MINTED', 300, 170)
        context.fillText(`FOUNDER ${founderNumber}`, 300, 830)
      }
    },
  })
}

/** The poster in the window, seen from the street: one Sneaker on the pale field. */
export function createWindowPosterTexture({
  fontFamilies,
  printScale,
  sneakerImages,
}: PrintOptions): Texture {
  return drawCanvasTexture({
    width: printSpots.windowPoster.canvasWidth,
    height: printSpots.windowPoster.canvasHeight,
    scale: printScale,
    draw: (context, width, height) => {
      context.fillStyle = themeColors.background
      context.fillRect(0, 0, width, height)
      drawPrintSneakers(context, printSpots.windowPoster, sneakerImages)
      context.fillStyle = themeColors.textPrimary
      context.font = `700 84px ${fontFamilies.satoshi}`
      context.fillText('Walk.', 70, 170)
    },
  })
}
