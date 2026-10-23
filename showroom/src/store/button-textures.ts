import type { Texture } from 'three'
import { formatPassNumber, type PassDesign, passRarityLabels } from '@/lib/sneaker-design'
import {
  drawArrow,
  drawCanvasTexture,
  type PrintCanvasOptions,
  SIGN_WHITE,
  setFittedFont,
} from './textures'
import { themeColors } from './theme-colors'

// The store's own buttons and look closer's tag, drawn on canvases like the film's signs (D-068).
// Each canvas has its button's shape in the world (store-buttons.ts): width over height matches.
// Every Founding Pass offer says it's free and can't be sent or sold.

const DECAL_BLACK = 'rgba(10, 11, 14, 0.84)'
const SCREEN_BLACK = '#0D0E14'
const SECONDARY_ON_DARK = 'rgba(244, 246, 255, 0.68)'

/** A rounded rectangle's path, ready to fill. */
function traceRoundedRect(
  context: CanvasRenderingContext2D,
  left: number,
  top: number,
  width: number,
  height: number,
  radius: number,
): void {
  context.beginPath()
  context.roundRect(left, top, width, height, radius)
}

/** A label and an arrow after it, centred on `centerX`. */
function drawLabelWithArrow({
  context,
  label,
  centerX,
  centerY,
  color,
  arrowColor,
  arrowSize,
  gap,
}: {
  context: CanvasRenderingContext2D
  label: string
  centerX: number
  centerY: number
  color: string
  arrowColor: string
  arrowSize: number
  gap: number
}): void {
  const labelWidth = context.measureText(label).width
  const left = centerX - (labelWidth + gap + arrowSize) / 2
  context.fillStyle = color
  context.textAlign = 'left'
  context.textBaseline = 'middle'
  context.fillText(label, left, centerY)
  drawArrow(context, left + labelWidth + gap, centerY, arrowSize, arrowColor)
}

/** "STEP INSIDE →" on the glass door: a dark pill, so it reads against the lit store behind. */
export function createDoorDecalTexture({ fontFamilies, printScale }: PrintCanvasOptions): Texture {
  return drawCanvasTexture({
    width: 1000,
    height: 280,
    scale: printScale,
    draw: (context, width, height) => {
      traceRoundedRect(context, 0, 0, width, height, height / 2)
      context.fillStyle = DECAL_BLACK
      context.fill()
      context.letterSpacing = '6px'
      setFittedFont(context, fontFamilies.satoshi, 700, 104, 'STEP INSIDE', width * 0.62)
      drawLabelWithArrow({
        context,
        label: 'STEP INSIDE',
        centerX: width / 2,
        centerY: height / 2 + 4,
        color: SIGN_WHITE,
        arrowColor: themeColors.highlight,
        arrowSize: 92,
        gap: 34,
      })
    },
  })
}

/** On the window: the Founding Pass, free, can't be sent or sold, and an arrow. */
export function createWindowDecalTexture({
  fontFamilies,
  printScale,
}: PrintCanvasOptions): Texture {
  return drawCanvasTexture({
    width: 1500,
    height: 500,
    scale: printScale,
    draw: (context, width, height) => {
      traceRoundedRect(context, 0, 0, width, height, 44)
      context.fillStyle = DECAL_BLACK
      context.fill()
      const left = 90
      const textWidth = width - left - 290
      context.textAlign = 'left'
      context.textBaseline = 'middle'
      context.fillStyle = SIGN_WHITE
      setFittedFont(context, fontFamilies.satoshi, 700, 116, '1,000 Founding Passes', textWidth)
      context.fillText('1,000 Founding Passes', left, 200)
      context.fillStyle = SECONDARY_ON_DARK
      context.letterSpacing = '4px'
      const promise = "FREE TO MINT · CAN'T BE SENT OR SOLD"
      setFittedFont(context, fontFamilies.mono, 500, 46, promise, textWidth)
      context.fillText(promise, left, 330)
      drawArrow(context, width - 210, height / 2, 120, themeColors.highlight)
    },
  })
}

/** On the black counter's front: a lit white pill, and the promise under it. */
export function createCounterPassTexture({
  fontFamilies,
  printScale,
}: PrintCanvasOptions): Texture {
  return drawCanvasTexture({
    width: 1300,
    height: 360,
    scale: printScale,
    draw: (context, width) => {
      traceRoundedRect(context, 0, 0, width, 230, 115)
      context.fillStyle = SIGN_WHITE
      context.fill()
      context.letterSpacing = '4px'
      setFittedFont(context, fontFamilies.satoshi, 700, 82, 'GET YOUR FOUNDING PASS', width * 0.74)
      drawLabelWithArrow({
        context,
        label: 'GET YOUR FOUNDING PASS',
        centerX: width / 2,
        centerY: 118,
        color: themeColors.textPrimary,
        arrowColor: themeColors.textPrimary,
        arrowSize: 76,
        gap: 28,
      })
      context.font = `500 46px ${fontFamilies.mono}`
      context.letterSpacing = '5px'
      context.fillStyle = SECONDARY_ON_DARK
      context.textAlign = 'center'
      context.fillText("FREE · CAN'T BE SENT OR SOLD", width / 2, 312)
    },
  })
}

/** The counter's upright screen, a waitlist kiosk: where the film showed #0137. */
export function createWaitlistKioskTexture({
  fontFamilies,
  printScale,
}: PrintCanvasOptions): Texture {
  return drawCanvasTexture({
    width: 600,
    height: 1000,
    scale: printScale,
    draw: (context, width, height) => {
      context.fillStyle = SCREEN_BLACK
      context.fillRect(0, 0, width, height)
      const left = 64
      context.textAlign = 'left'
      context.textBaseline = 'alphabetic'
      context.fillStyle = SECONDARY_ON_DARK
      context.font = `500 34px ${fontFamilies.mono}`
      context.letterSpacing = '5px'
      context.fillText('WAITLIST', left, 140)
      context.fillStyle = SIGN_WHITE
      context.letterSpacing = '0px'
      context.font = `700 92px ${fontFamilies.satoshi}`
      context.fillText('Join the', left, 340)
      context.fillText('waitlist', left, 440)
      context.fillStyle = SECONDARY_ON_DARK
      context.font = `500 40px ${fontFamilies.satoshi}`
      context.fillText('Waitlist members', left, 560)
      context.fillText('mint first.', left, 612)
      traceRoundedRect(context, left, 770, width - left * 2, 128, 64)
      context.fillStyle = themeColors.highlight
      context.fill()
      context.font = `700 46px ${fontFamilies.satoshi}`
      context.letterSpacing = '4px'
      drawLabelWithArrow({
        context,
        label: 'JOIN',
        centerX: width / 2,
        centerY: 836,
        color: themeColors.textPrimary,
        arrowColor: themeColors.textPrimary,
        arrowSize: 52,
        gap: 18,
      })
      // The screen's edge, as a display has.
      context.strokeStyle = 'rgba(244, 246, 255, 0.08)'
      context.lineWidth = 6
      context.strokeRect(3, 3, width - 6, height - 6)
    },
  })
}

/** On the white counter's front, by the stand: Find. */
export function createFindPlateTexture({ fontFamilies, printScale }: PrintCanvasOptions): Texture {
  return drawCanvasTexture({
    width: 780,
    height: 200,
    scale: printScale,
    draw: (context, width, height) => {
      traceRoundedRect(context, 0, 0, width, height, height / 2)
      context.fillStyle = '#141515'
      context.fill()
      // A magnifier, in the arrow's line weight.
      context.strokeStyle = SIGN_WHITE
      context.lineWidth = 9
      context.lineCap = 'round'
      context.beginPath()
      context.arc(96, 92, 30, 0, Math.PI * 2)
      context.moveTo(118, 114)
      context.lineTo(142, 138)
      context.stroke()
      context.letterSpacing = '4px'
      const labelLeft = 172
      const arrowLeft = width - 110
      setFittedFont(
        context,
        fontFamilies.mono,
        500,
        52,
        'FIND A SNEAKER',
        arrowLeft - 28 - labelLeft,
      )
      context.fillStyle = SIGN_WHITE
      context.textAlign = 'left'
      context.textBaseline = 'middle'
      context.fillText('FIND A SNEAKER', labelLeft, height / 2 + 2)
      drawArrow(context, arrowLeft, height / 2, 58, themeColors.highlight)
    },
  })
}

/** The tag's canvas, in pixels: width over height is LOOK_CLOSER.tag.aspectRatio. */
export const TAG_CANVAS = { width: 1024, height: 640 } as const

/**
 * Look closer's shop tag (D-068): white, with a hole like a hang tag, the number and rarity, the
 * name, the promise, and the link. Seen up close, so it's sharper than the signs: full size on
 * High, three quarters on a phone (about twice its size on screen there).
 */
export function createLookCloserTagTexture({
  design,
  fontFamilies,
  printScale,
}: PrintCanvasOptions & { design: PassDesign }): Texture {
  return drawCanvasTexture({
    width: TAG_CANVAS.width,
    height: TAG_CANVAS.height,
    scale: printScale >= 1 ? 1 : 0.75,
    draw: (context, width, height) => {
      traceRoundedRect(context, 0, 0, width, height, 44)
      context.fillStyle = '#F4F4F6'
      context.fill()
      context.beginPath()
      context.arc(width - 64, 64, 16, 0, Math.PI * 2)
      context.fillStyle = '#C9CAD0'
      context.fill()
      const left = 76
      const right = width - 76
      context.textBaseline = 'alphabetic'
      context.font = `500 44px ${fontFamilies.mono}`
      context.letterSpacing = '3px'
      context.fillStyle = themeColors.textPrimary
      context.textAlign = 'left'
      context.fillText(formatPassNumber(design.designNumber), left, 148)
      context.fillStyle = 'rgba(0, 0, 0, 0.55)'
      context.textAlign = 'right'
      context.fillText(passRarityLabels[design.rarity].toUpperCase(), right - 56, 148)
      context.fillStyle = themeColors.textPrimary
      context.textAlign = 'left'
      context.letterSpacing = '0px'
      setFittedFont(context, fontFamilies.satoshi, 700, 84, design.name, right - left)
      context.fillText(design.name, left, 262)
      context.font = `500 40px ${fontFamilies.satoshi}`
      context.fillStyle = 'rgba(0, 0, 0, 0.6)'
      context.fillText("Free to mint. Can't be sent or sold.", left, 340)
      traceRoundedRect(context, left, 418, right - left, 140, 70)
      context.fillStyle = '#0B0B0C'
      context.fill()
      context.letterSpacing = '3px'
      setFittedFont(context, fontFamilies.satoshi, 700, 44, 'SEE IT ON STRIDEMON.XYZ', 600)
      drawLabelWithArrow({
        context,
        label: 'SEE IT ON STRIDEMON.XYZ',
        centerX: width / 2,
        centerY: 490,
        color: SIGN_WHITE,
        arrowColor: themeColors.highlight,
        arrowSize: 48,
        gap: 20,
      })
    },
  })
}
