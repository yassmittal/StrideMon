import type { Texture } from 'three'
import { formatPassNumber } from '@/lib/sneaker-design'
import type { SneakerImages } from './load-sneaker-images'
import {
  FOUNDING_PASS_WALL_DESIGN_NUMBERS,
  HERO_DESIGN_NUMBER,
  LEGENDARY_DESIGN_NUMBER,
} from './sneaker-placements'
import { drawCanvasTexture, drawSneaker, type PrintCanvasOptions } from './textures'
import { themeColors } from './theme-colors'

// The prints: the film's lightboxes and posters with a Sneaker painted in (brief §5.2), ported from
// `launch-video/src/showroom/textures.ts`, at the film's sizes times the tier's print scale. The Sneaker is the laced art as it is, never recoloured.

const SIGN_WHITE = '#F4F6FF'

type PrintOptions = PrintCanvasOptions & { sneakerImages: SneakerImages }

function readSneakerImage(sneakerImages: SneakerImages, designNumber: number): HTMLImageElement {
  const image = sneakerImages.get(designNumber)
  if (image === undefined) throw new Error(`Sneaker #${designNumber} isn't loaded`)
  return image
}

/** The big portrait lightbox: #0137 on a deep violet field, its name at the top. */
export function createHeroLightboxTexture({
  fontFamilies,
  printScale,
  sneakerImages,
}: PrintOptions): Texture {
  return drawCanvasTexture({
    width: 1200,
    height: 2000,
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
      drawSneaker({
        context,
        image: readSneakerImage(sneakerImages, HERO_DESIGN_NUMBER),
        centerX: 600,
        centerY: 1200,
        width: 960,
        rotationDegrees: -28,
      })
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
    width: 1200,
    height: 2000,
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
      drawSneaker({
        context,
        image: readSneakerImage(sneakerImages, LEGENDARY_DESIGN_NUMBER),
        centerX: 680,
        centerY: 1050,
        width: 880,
        rotationDegrees: -18,
      })
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
    width: 2000,
    height: 1200,
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
      const [leftDesign, middleDesign, rightDesign] = FOUNDING_PASS_WALL_DESIGN_NUMBERS
      const drawWallSneaker = (
        designNumber: number,
        centerX: number,
        centerY: number,
        sneakerWidth: number,
        rotationDegrees: number,
      ) =>
        drawSneaker({
          context,
          image: readSneakerImage(sneakerImages, designNumber),
          centerX,
          centerY,
          width: sneakerWidth,
          rotationDegrees,
        })
      drawWallSneaker(leftDesign, 520, 820, 760, -10)
      drawWallSneaker(rightDesign, 1500, 820, 760, 10)
      drawWallSneaker(middleDesign, 1010, 760, 900, -4)
    },
  })
}

/** The upright screen on the counter: one Sneaker on black, its number under it (brief §10, #2). */
export function createCounterScreenTexture({
  fontFamilies,
  printScale,
  sneakerImages,
  designNumber = HERO_DESIGN_NUMBER,
}: PrintOptions & { designNumber?: number }): Texture {
  return drawCanvasTexture({
    width: 600,
    height: 1000,
    scale: printScale,
    draw: (context, width, height) => {
      context.fillStyle = '#0D0E14'
      context.fillRect(0, 0, width, height)
      drawSneaker({
        context,
        image: readSneakerImage(sneakerImages, designNumber),
        centerX: 300,
        centerY: 470,
        width: 500,
        rotationDegrees: -6,
      })
      context.fillStyle = SIGN_WHITE
      context.textAlign = 'center'
      context.font = `500 44px ${fontFamilies.mono}`
      context.fillText(formatPassNumber(designNumber), 300, 760)
    },
  })
}

/** The poster in the window, seen from the street: one Sneaker on the pale field. */
export function createWindowPosterTexture({
  fontFamilies,
  printScale,
  sneakerImages,
  designNumber,
}: PrintOptions & { designNumber: number }): Texture {
  return drawCanvasTexture({
    width: 800,
    height: 1200,
    scale: printScale,
    draw: (context, width, height) => {
      context.fillStyle = themeColors.background
      context.fillRect(0, 0, width, height)
      drawSneaker({
        context,
        image: readSneakerImage(sneakerImages, designNumber),
        centerX: 400,
        centerY: 660,
        width: 640,
        rotationDegrees: -24,
      })
      context.fillStyle = themeColors.textPrimary
      context.font = `700 84px ${fontFamilies.satoshi}`
      context.fillText('Walk.', 70, 170)
    },
  })
}
