import { CanvasTexture, SRGBColorSpace, type Texture } from 'three'
import { formatPassNumber } from '@/lib/sneaker-design'
import type { StoreFontFamilies } from './store-fonts'
import { themeColors } from './theme-colors'

// The store's flat pictures without a Sneaker, drawn on a 2D canvas: the signs, the stand's card,
// the paving and the glow (the prints are in print-textures.ts). Ported from the film's
// `launch-video/src/showroom/textures.ts`, at the film's sizes.

export const SNEAKER_ASPECT = 600 / 1000

const SIGN_WHITE = '#F4F6FF'
const TEXTURE_ANISOTROPY = 8

export type PrintCanvasOptions = { fontFamilies: StoreFontFamilies; printScale: number }

type CanvasDrawing = (context: CanvasRenderingContext2D, width: number, height: number) => void

/**
 * A canvas of the film's size times `scale`, drawn in the film's coordinates, as a texture. Each
 * call to `draw` gets the film's width and height.
 */
export function drawCanvasTexture({
  width,
  height,
  scale = 1,
  draw,
}: {
  width: number
  height: number
  scale?: number
  draw: CanvasDrawing
}): Texture {
  const canvas = document.createElement('canvas')
  canvas.width = Math.round(width * scale)
  canvas.height = Math.round(height * scale)
  const context = canvas.getContext('2d')
  if (context === null) throw new Error('No 2D canvas context')
  context.scale(canvas.width / width, canvas.height / height)
  draw(context, width, height)
  const texture = new CanvasTexture(canvas)
  texture.colorSpace = SRGBColorSpace
  texture.anisotropy = TEXTURE_ANISOTROPY
  return texture
}

export function drawSneaker({
  context,
  image,
  centerX,
  centerY,
  width,
  rotationDegrees = 0,
}: {
  context: CanvasRenderingContext2D
  image: CanvasImageSource
  centerX: number
  centerY: number
  width: number
  rotationDegrees?: number
}): void {
  context.save()
  context.translate(centerX, centerY)
  context.rotate((rotationDegrees * Math.PI) / 180)
  context.drawImage(image, -width / 2, (-width * SNEAKER_ASPECT) / 2, width, width * SNEAKER_ASPECT)
  context.restore()
}

/** The fascia's lit letters, white on nothing, with the mark's line Sneaker before them. */
export function createStoreSignTexture({ fontFamilies }: PrintCanvasOptions): Texture {
  return drawCanvasTexture({
    width: 2048,
    height: 320,
    draw: (context, width, height) => {
      context.fillStyle = SIGN_WHITE
      context.font = `700 220px ${fontFamilies.satoshi}`
      context.textBaseline = 'middle'
      context.letterSpacing = '18px'
      const text = 'STRIDEMON'
      const textWidth = context.measureText(text).width
      const markSize = 230
      const gap = 70
      const left = (width - (markSize + gap + textWidth)) / 2
      drawMark(context, left, (height - markSize) / 2, markSize)
      context.fillText(text, left + markSize + gap, height / 2 + 8)
    },
  })
}

/** The StrideMon mark's three strokes, on its 64-unit grid. */
function drawMark(context: CanvasRenderingContext2D, left: number, top: number, size: number) {
  context.save()
  context.translate(left, top)
  context.scale(size / 64, size / 64)
  context.lineJoin = 'round'
  context.lineCap = 'round'
  context.lineWidth = 3
  context.strokeStyle = SIGN_WHITE
  context.stroke(new Path2D('M13 43h30c5 0 9-1 10-3 1-1 0-2-1-2L26 37c-5 0-9-1-12-1-1 3-1 6-1 7Z'))
  context.stroke(new Path2D('M14 36c-2-5-2-10-1-15 4 2 8 3 11 3l3-6 15 10c7 2 10 6 11 10'))
  context.strokeStyle = themeColors.highlight
  context.lineWidth = 3.5
  context.stroke(new Path2D('M15 32c8 1 16-2 22-6'))
  context.restore()
}

/** The blade sign that sticks out from the front: a lit dark panel. */
export function createBladeSignTexture({ fontFamilies }: PrintCanvasOptions): Texture {
  return drawCanvasTexture({
    width: 1024,
    height: 512,
    draw: (context, width, height) => {
      context.fillStyle = '#10131C'
      context.fillRect(0, 0, width, height)
      context.fillStyle = SIGN_WHITE
      context.textAlign = 'center'
      context.textBaseline = 'middle'
      context.font = `700 168px ${fontFamilies.satoshi}`
      context.letterSpacing = '8px'
      context.fillText('STRIDEMON', width / 2, 210)
      context.font = `500 72px ${fontFamilies.mono}`
      context.letterSpacing = '6px'
      context.fillStyle = themeColors.highlight
      context.fillText('FOUNDING PASS', width / 2, 370)
    },
  })
}

/** The dark panel beside the lightbox: the tagline. */
export function createTaglinePanelTexture({ fontFamilies }: PrintCanvasOptions): Texture {
  return drawCanvasTexture({
    width: 800,
    height: 1000,
    draw: (context, width, height) => {
      context.fillStyle = '#0B0C10'
      context.fillRect(0, 0, width, height)
      context.fillStyle = SIGN_WHITE
      context.font = `700 96px ${fontFamilies.satoshi}`
      for (const [lineIndex, line] of ['Walk.', 'Earn.', 'Upgrade.'].entries()) {
        context.fillText(line, 70, 200 + lineIndex * 120)
      }
      context.fillStyle = themeColors.highlight
      context.fillRect(70, 600, 180, 12)
    },
  })
}

/** Lit words on the walls, on nothing: "Founding Pass", "Sneakers", "Rare". */
export function createWallTitleTexture({
  fontFamilies,
  text,
  color = SIGN_WHITE,
}: PrintCanvasOptions & { text: string; color?: string }): Texture {
  return drawCanvasTexture({
    width: 2048,
    height: 400,
    draw: (context, width, height) => {
      context.fillStyle = color
      context.textAlign = 'center'
      context.textBaseline = 'middle'
      context.font = `700 280px ${fontFamilies.satoshi}`
      context.fillText(text, width / 2, height / 2 + 10)
    },
  })
}

/** The small printed card beside the stand: the Sneaker's number and name. */
export function createStandCardTexture({
  fontFamilies,
  designNumber,
  name,
}: PrintCanvasOptions & { designNumber: number; name: string }): Texture {
  return drawCanvasTexture({
    width: 600,
    height: 360,
    draw: (context, width, height) => {
      context.fillStyle = '#FFFFFF'
      context.fillRect(0, 0, width, height)
      context.fillStyle = themeColors.textPrimary
      context.font = `500 48px ${fontFamilies.mono}`
      context.fillText(formatPassNumber(designNumber), 50, 110)
      context.font = `700 50px ${fontFamilies.satoshi}`
      context.fillText(name, 50, 205, width - 100)
      context.fillStyle = 'rgba(0, 0, 0, 0.5)'
      context.font = `500 34px ${fontFamilies.mono}`
      context.fillText('FOUNDING PASS', 50, 290)
    },
  })
}

/** Paving slabs for the pavement, with a little noise so it isn't flat. */
export function createPavingTexture(): Texture {
  return drawCanvasTexture({
    width: 1024,
    height: 1024,
    draw: (context, width, height) => {
      context.fillStyle = '#4A4A4C'
      context.fillRect(0, 0, width, height)
      let seed = 7
      const random = () => {
        seed = (seed * 16807) % 2147483647
        return seed / 2147483647
      }
      const slab = 128
      for (let row = 0; row < height / slab; row += 1) {
        for (let column = 0; column < width / slab; column += 1) {
          const shade = 62 + Math.floor(random() * 22)
          context.fillStyle = `rgb(${shade}, ${shade - 1}, ${shade - 3})`
          context.fillRect(column * slab + 3, row * slab + 3, slab - 6, slab - 6)
        }
      }
      for (let speck = 0; speck < 9000; speck += 1) {
        const shade = Math.floor(random() * 255)
        context.fillStyle = `rgba(${shade}, ${shade}, ${shade}, 0.08)`
        context.fillRect(random() * width, random() * height, 2, 2)
      }
    },
  })
}

/** A soft round glow, drawn additively behind every light. */
export function createGlowTexture(): Texture {
  return drawCanvasTexture({
    width: 256,
    height: 256,
    draw: (context) => {
      const gradient = context.createRadialGradient(128, 128, 0, 128, 128, 128)
      gradient.addColorStop(0, 'rgba(255, 255, 255, 1)')
      gradient.addColorStop(0.25, 'rgba(255, 255, 255, 0.45)')
      gradient.addColorStop(1, 'rgba(255, 255, 255, 0)')
      context.fillStyle = gradient
      context.fillRect(0, 0, 256, 256)
    },
  })
}

/** A neighbouring shop's lit sign: plain coloured blocks, no words and no brand. */
export function createNeighbourSignTexture(fill: string, accent: string): Texture {
  return drawCanvasTexture({
    width: 512,
    height: 128,
    draw: (context, width, height) => {
      context.fillStyle = fill
      context.fillRect(0, 0, width, height)
      context.fillStyle = accent
      context.fillRect(40, 44, 260, 18)
      context.fillRect(40, 74, 160, 12)
      context.fillRect(380, 30, 80, 68)
    },
  })
}
