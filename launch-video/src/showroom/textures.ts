import { CanvasTexture, SRGBColorSpace, Texture } from 'three'
import { colors, fontFamilies } from '../theme'
import {
  FOUNDING_PASS_WALL_DESIGN_NUMBERS,
  HERO_DESIGN_NUMBER,
  LEGENDARY_DESIGN_NUMBER,
} from './sneakers'

// Every flat picture in the store, drawn once on a 2D canvas: the signs, the lightboxes' posters,
// the paving and the glows. The Sneakers are the rasterised laced art (sneakers.ts), drawn as they
// are, never recoloured. Text is the film's own fonts (fonts.ts), loaded before this runs.

export type SneakerImages = ReadonlyMap<number, HTMLImageElement>

/** The laced art's own aspect: 1000 × 600. */
export const SNEAKER_ASPECT = 600 / 1000

const SIGN_WHITE = '#F4F6FF'

function createCanvas(width: number, height: number): [HTMLCanvasElement, CanvasRenderingContext2D] {
  const canvas = document.createElement('canvas')
  canvas.width = width
  canvas.height = height
  const context = canvas.getContext('2d')
  if (context === null) throw new Error('No 2D canvas context')
  return [canvas, context]
}

function toTexture(canvas: HTMLCanvasElement): Texture {
  const texture = new CanvasTexture(canvas)
  texture.colorSpace = SRGBColorSpace
  texture.anisotropy = 8
  return texture
}

function readSneaker(sneakerImages: SneakerImages, designNumber: number): HTMLImageElement {
  const image = sneakerImages.get(designNumber)
  if (image === undefined) throw new Error(`Sneaker #${designNumber} isn't loaded`)
  return image
}

function drawSneaker(
  context: CanvasRenderingContext2D,
  image: HTMLImageElement,
  centerX: number,
  centerY: number,
  width: number,
  rotationDegrees = 0,
): void {
  context.save()
  context.translate(centerX, centerY)
  context.rotate((rotationDegrees * Math.PI) / 180)
  context.drawImage(image, -width / 2, (-width * SNEAKER_ASPECT) / 2, width, width * SNEAKER_ASPECT)
  context.restore()
}

function toDesignLabel(designNumber: number): string {
  return `#${String(designNumber).padStart(4, '0')}`
}

/** One Sneaker as its own texture, for the walls and the stand. */
export function createSneakerTexture(image: HTMLImageElement): Texture {
  const texture = new Texture(image)
  texture.colorSpace = SRGBColorSpace
  texture.anisotropy = 8
  texture.needsUpdate = true
  return texture
}

/** The fascia's lit letters, white on nothing, with the mark's line Sneaker before them. */
export function createStoreSignTexture(): Texture {
  const [canvas, context] = createCanvas(2048, 320)
  context.fillStyle = SIGN_WHITE
  context.font = `700 220px ${fontFamilies.satoshi}`
  context.textBaseline = 'middle'
  context.letterSpacing = '18px'
  const text = 'STRIDEMON'
  const textWidth = context.measureText(text).width
  const markSize = 230
  const gap = 70
  const left = (canvas.width - (markSize + gap + textWidth)) / 2
  drawMark(context, left, (canvas.height - markSize) / 2, markSize)
  context.fillText(text, left + markSize + gap, canvas.height / 2 + 8)
  return toTexture(canvas)
}

/** The StrideMon mark's three strokes (StrideMonMark.tsx), on its 64-unit grid. */
function drawMark(context: CanvasRenderingContext2D, left: number, top: number, size: number): void {
  context.save()
  context.translate(left, top)
  context.scale(size / 64, size / 64)
  context.lineJoin = 'round'
  context.lineCap = 'round'
  context.lineWidth = 3
  context.strokeStyle = SIGN_WHITE
  context.stroke(new Path2D('M13 43h30c5 0 9-1 10-3 1-1 0-2-1-2L26 37c-5 0-9-1-12-1-1 3-1 6-1 7Z'))
  context.stroke(new Path2D('M14 36c-2-5-2-10-1-15 4 2 8 3 11 3l3-6 15 10c7 2 10 6 11 10'))
  context.strokeStyle = colors.highlight
  context.lineWidth = 3.5
  context.stroke(new Path2D('M15 32c8 1 16-2 22-6'))
  context.restore()
}

/** The blade sign that sticks out from the front: a lit dark panel, as the reference's blue one. */
export function createBladeSignTexture(): Texture {
  const [canvas, context] = createCanvas(1024, 512)
  context.fillStyle = '#10131C'
  context.fillRect(0, 0, canvas.width, canvas.height)
  context.fillStyle = SIGN_WHITE
  context.textAlign = 'center'
  context.textBaseline = 'middle'
  context.font = `700 168px ${fontFamilies.satoshi}`
  context.letterSpacing = '8px'
  context.fillText('STRIDEMON', canvas.width / 2, 210)
  context.font = `500 72px ${fontFamilies.mono}`
  context.letterSpacing = '6px'
  context.fillStyle = colors.highlight
  context.fillText('FOUNDING PASS', canvas.width / 2, 370)
  return toTexture(canvas)
}

/** The big portrait lightbox: #0137 on a deep violet field, its name at the top. */
export function createHeroLightboxTexture(sneakerImages: SneakerImages): Texture {
  const [canvas, context] = createCanvas(1200, 2000)
  const gradient = context.createLinearGradient(0, 0, canvas.width, canvas.height)
  gradient.addColorStop(0, '#2A1A6E')
  gradient.addColorStop(0.55, '#5B3FE0')
  gradient.addColorStop(1, '#B48CFF')
  context.fillStyle = gradient
  context.fillRect(0, 0, canvas.width, canvas.height)
  context.fillStyle = SIGN_WHITE
  context.font = `700 104px ${fontFamilies.satoshi}`
  context.fillText('Rose Hiker Night', 90, 250)
  context.font = `500 56px ${fontFamilies.mono}`
  context.fillStyle = 'rgba(244, 246, 255, 0.75)'
  context.fillText(`${toDesignLabel(HERO_DESIGN_NUMBER)} · FOUNDING PASS`, 94, 340)
  drawSneaker(context, readSneaker(sneakerImages, HERO_DESIGN_NUMBER), 600, 1200, 960, -28)
  return toTexture(canvas)
}

/** The dark panel beside it, as the reference's "Wearables" box: the tagline. */
export function createTaglinePanelTexture(): Texture {
  const [canvas, context] = createCanvas(800, 1000)
  context.fillStyle = '#0B0C10'
  context.fillRect(0, 0, canvas.width, canvas.height)
  context.fillStyle = SIGN_WHITE
  context.font = `700 96px ${fontFamilies.satoshi}`
  for (const [lineIndex, line] of ['Walk.', 'Earn.', 'Upgrade.'].entries()) {
    context.fillText(line, 70, 200 + lineIndex * 120)
  }
  context.fillStyle = colors.highlight
  context.fillRect(70, 600, 180, 12)
  return toTexture(canvas)
}

/** The corner poster, as the reference's "ULTRA" one: LEGENDARY up the side, #0020 over it. */
export function createLegendaryPosterTexture(sneakerImages: SneakerImages): Texture {
  const [canvas, context] = createCanvas(1200, 2000)
  context.fillStyle = '#07080C'
  context.fillRect(0, 0, canvas.width, canvas.height)
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
  drawSneaker(context, readSneaker(sneakerImages, LEGENDARY_DESIGN_NUMBER), 680, 1050, 880, -18)
  context.fillStyle = SIGN_WHITE
  context.font = `700 76px ${fontFamilies.satoshi}`
  context.fillText('Earthshine', 420, 1720)
  context.font = `500 48px ${fontFamilies.mono}`
  context.fillStyle = 'rgba(244, 246, 255, 0.7)'
  context.fillText(`${toDesignLabel(LEGENDARY_DESIGN_NUMBER)} · 1 OF 1`, 424, 1800)
  return toTexture(canvas)
}

/** The back wall's lit words, white on nothing. */
export function createWallTitleTexture(text: string, color = SIGN_WHITE): Texture {
  const [canvas, context] = createCanvas(2048, 400)
  context.fillStyle = color
  context.textAlign = 'center'
  context.textBaseline = 'middle'
  context.font = `700 280px ${fontFamilies.satoshi}`
  context.fillText(text, canvas.width / 2, canvas.height / 2 + 10)
  return toTexture(canvas)
}

/** The "Founding Pass" wall's lightbox: three Sneakers on the pass cards' own pale field. */
export function createFoundingPassLightboxTexture(sneakerImages: SneakerImages): Texture {
  const [canvas, context] = createCanvas(2000, 1200)
  const gradient = context.createLinearGradient(0, 0, canvas.width, canvas.height)
  gradient.addColorStop(0, colors.background)
  gradient.addColorStop(1, '#D9DCF5')
  context.fillStyle = gradient
  context.fillRect(0, 0, canvas.width, canvas.height)
  context.fillStyle = colors.textPrimary
  context.font = `500 64px ${fontFamilies.mono}`
  context.letterSpacing = '4px'
  context.fillText('FOUNDING PASS', 110, 170)
  context.font = `700 120px ${fontFamilies.satoshi}`
  context.letterSpacing = '0px'
  context.fillText('1,000 one-of-ones.', 104, 310)
  const [leftDesign, middleDesign, rightDesign] = FOUNDING_PASS_WALL_DESIGN_NUMBERS
  drawSneaker(context, readSneaker(sneakerImages, leftDesign ?? 0), 520, 820, 760, -10)
  drawSneaker(context, readSneaker(sneakerImages, rightDesign ?? 0), 1500, 820, 760, 10)
  drawSneaker(context, readSneaker(sneakerImages, middleDesign ?? 0), 1010, 760, 900, -4)
  return toTexture(canvas)
}

/** The upright screen on the counter: one Sneaker on black, its number under it. */
export function createCounterScreenTexture(sneakerImages: SneakerImages): Texture {
  const [canvas, context] = createCanvas(600, 1000)
  context.fillStyle = '#0D0E14'
  context.fillRect(0, 0, canvas.width, canvas.height)
  drawSneaker(context, readSneaker(sneakerImages, HERO_DESIGN_NUMBER), 300, 470, 500, -6)
  context.fillStyle = SIGN_WHITE
  context.textAlign = 'center'
  context.font = `500 44px ${fontFamilies.mono}`
  context.fillText(toDesignLabel(HERO_DESIGN_NUMBER), 300, 760)
  return toTexture(canvas)
}

/** A window poster seen from the street: one Sneaker on the pale field. */
export function createWindowPosterTexture(sneakerImages: SneakerImages, designNumber: number): Texture {
  const [canvas, context] = createCanvas(800, 1200)
  context.fillStyle = colors.background
  context.fillRect(0, 0, canvas.width, canvas.height)
  drawSneaker(context, readSneaker(sneakerImages, designNumber), 400, 660, 640, -24)
  context.fillStyle = colors.textPrimary
  context.font = `700 84px ${fontFamilies.satoshi}`
  context.fillText('Walk.', 70, 170)
  return toTexture(canvas)
}

/** A small printed card in front of the stand: the Sneaker's number and name. */
export function createStandCardTexture(designNumber: number, name: string): Texture {
  const [canvas, context] = createCanvas(600, 360)
  context.fillStyle = '#FFFFFF'
  context.fillRect(0, 0, canvas.width, canvas.height)
  context.fillStyle = colors.textPrimary
  context.font = `500 48px ${fontFamilies.mono}`
  context.fillText(toDesignLabel(designNumber), 50, 110)
  context.font = `700 50px ${fontFamilies.satoshi}`
  context.fillText(name, 50, 205, canvas.width - 100)
  context.fillStyle = 'rgba(0, 0, 0, 0.5)'
  context.font = `500 34px ${fontFamilies.mono}`
  context.fillText('FOUNDING PASS', 50, 290)
  return toTexture(canvas)
}

/** Paving slabs for the pavement, with a little noise so it isn't flat. */
export function createPavingTexture(): Texture {
  const [canvas, context] = createCanvas(1024, 1024)
  context.fillStyle = '#4A4A4C'
  context.fillRect(0, 0, canvas.width, canvas.height)
  let seed = 7
  const random = () => {
    seed = (seed * 16807) % 2147483647
    return seed / 2147483647
  }
  const slab = 128
  for (let row = 0; row < canvas.height / slab; row += 1) {
    for (let column = 0; column < canvas.width / slab; column += 1) {
      const shade = 62 + Math.floor(random() * 22)
      context.fillStyle = `rgb(${shade}, ${shade - 1}, ${shade - 3})`
      context.fillRect(column * slab + 3, row * slab + 3, slab - 6, slab - 6)
    }
  }
  for (let speck = 0; speck < 9000; speck += 1) {
    const shade = Math.floor(random() * 255)
    context.fillStyle = `rgba(${shade}, ${shade}, ${shade}, 0.08)`
    context.fillRect(random() * canvas.width, random() * canvas.height, 2, 2)
  }
  return toTexture(canvas)
}

/** A soft round glow, drawn additively behind every light. */
export function createGlowTexture(): Texture {
  const [canvas, context] = createCanvas(256, 256)
  const gradient = context.createRadialGradient(128, 128, 0, 128, 128, 128)
  gradient.addColorStop(0, 'rgba(255, 255, 255, 1)')
  gradient.addColorStop(0.25, 'rgba(255, 255, 255, 0.45)')
  gradient.addColorStop(1, 'rgba(255, 255, 255, 0)')
  context.fillStyle = gradient
  context.fillRect(0, 0, canvas.width, canvas.height)
  return toTexture(canvas)
}

/** A neighbouring shop's lit sign: plain coloured blocks, no words and no brand. */
export function createNeighbourSignTexture(fill: string, accent: string): Texture {
  const [canvas, context] = createCanvas(512, 128)
  context.fillStyle = fill
  context.fillRect(0, 0, canvas.width, canvas.height)
  context.fillStyle = accent
  context.fillRect(40, 44, 260, 18)
  context.fillRect(40, 74, 160, 12)
  context.fillRect(380, 30, 80, 68)
  return toTexture(canvas)
}
