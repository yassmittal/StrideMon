import { createElement, type ReactNode } from 'react'
import {
  parseSvgMarkup,
  readSvgAttributes,
  renderSvgElement,
  type SvgElementDecoration,
} from '../../components/svg-markup'

// #0137's laced Sneaker, drawn from the contract renderer's own SVG and built in four layers for
// the making shots: the sole drops into the empty outline (the pearls), the base colour rises from
// the bottom (the tea), the panels flood down from the top (the cream) and the laces and heel tab
// land on top (the topping). Every path, coordinate and colour is the file's own
// (DESIGNS_FROZEN_ON): the build only moves, clips and hides them. Fully built, it's the art as
// minted.

/** The art's viewBox is 1000 × 600; the shoe itself spans x 58–944 and y 108–520. */
export const SNEAKER_VIEW_WIDTH = 1000
export const SNEAKER_VIEW_HEIGHT = 600
/** The shoe's own bottom and top in the art (the outsole's lowest point and the collar's highest). */
const SHOE_BOTTOM_Y = 520
const SHOE_TOP_Y = 100

/** How far each layer is built, 0 to 1. A fully built Sneaker is all ones. */
export type SneakerBuild = {
  /** The sole (midsole and outsole) dropping into place. */
  sole: number
  /** The base colour, rising from the bottom. */
  base: number
  /** The panels, flooding down from the top. */
  panels: number
  /** The laces and the heel tab, landing from above. */
  laces: number
}

export const FULLY_BUILT: SneakerBuild = { sole: 1, base: 1, panels: 1, laces: 1 }

/**
 * A pour into the shoe's opening, in the art's units: a rounded stream of the layer's own colour
 * from above the frame, down to the rising colour (base) or into the collar (panels).
 */
export type SneakerPour = { layer: 'base' | 'panels'; centerX: number; width: number }

/** Where the panels' stream ends: the collar's opening, between the heel (256, 136) and the laces (338, 142). */
const COLLAR_OPENING_Y = 150

type CrushSneakerProps = {
  markup: string
  /** Width in the containing element's pixels; the height follows the art's aspect ratio. */
  width: number
  build?: SneakerBuild
  pour?: SneakerPour | undefined
  /** Unique within a frame: names the clip paths. */
  idPrefix: string
  /** Drives the pour's wobble and the liquid's wave. */
  frame: number
  /** The Sneaker's own turn, undone for the pour so it always falls straight down. */
  rotationDegrees?: number
}

const SOLE_DROP_UNITS = 360
const LACES_DROP_UNITS = 260
const WAVE_AMPLITUDE_UNITS = 9
const WAVE_LENGTH_UNITS = 220

/** A clip path whose one edge at levelY is a gentle wave, filling down (towards +y) or up. */
function buildWaveClipPath(levelY: number, fillsDownward: boolean, phase: number): string {
  const points: string[] = []
  for (let x = -20; x <= SNEAKER_VIEW_WIDTH + 20; x += 20) {
    const y = levelY + WAVE_AMPLITUDE_UNITS * Math.sin((x / WAVE_LENGTH_UNITS) * 2 * Math.PI + phase)
    points.push(`${x} ${y.toFixed(1)}`)
  }
  const farY = fillsDownward ? -2000 : SNEAKER_VIEW_HEIGHT + 2000
  return `M-20 ${farY} L${points.join(' L')} L${SNEAKER_VIEW_WIDTH + 20} ${farY} Z`
}

export function CrushSneaker({
  markup,
  width,
  build = FULLY_BUILT,
  pour,
  idPrefix,
  frame,
  rotationDegrees = 0,
}: CrushSneakerProps) {
  const svgElement = parseSvgMarkup(markup)
  const [, heelTab, heelTabMark, panelGroup, outline, laces] = [...svgElement.children]
  const panelChildren = panelGroup === undefined ? [] : [...panelGroup.children]
  const baseFill = panelChildren[0]
  const soleParts = new Set(panelChildren.slice(-2))
  const lacesParts = new Set([heelTab, heelTabMark, laces])

  const baseClipId = `${idPrefix}-base-level`
  const panelsClipId = `${idPrefix}-panels-level`
  const wavePhase = frame * 0.55
  const baseLevelY = SHOE_BOTTOM_Y + 12 - build.base * (SHOE_BOTTOM_Y + 12 - (SHOE_TOP_Y - 20))
  const panelsLevelY = SHOE_TOP_Y - 20 + build.panels * (SHOE_BOTTOM_Y + 20 - (SHOE_TOP_Y - 20))

  const decorate = (element: Element): SvgElementDecoration => {
    if (soleParts.has(element)) {
      if (build.sole <= 0) return null
      return { props: { transform: `translate(0 ${(-(1 - build.sole) * SOLE_DROP_UNITS).toFixed(2)})` } }
    }
    if (lacesParts.has(element)) {
      if (build.laces <= 0) return null
      return {
        props: {
          transform: `translate(0 ${(-(1 - build.laces) * LACES_DROP_UNITS).toFixed(2)})`,
          opacity: Math.min(1, build.laces * 3),
        },
      }
    }
    if (element === baseFill) {
      if (build.base <= 0) return null
      if (build.base >= 1) return undefined
      return { replace: (rendered) => <g clipPath={`url(#${baseClipId})`}>{rendered}</g> }
    }
    if (element.parentElement === panelGroup && !soleParts.has(element)) {
      if (build.panels <= 0) return null
      if (build.panels >= 1) return undefined
      return { replace: (rendered) => <g clipPath={`url(#${panelsClipId})`}>{rendered}</g> }
    }
    return undefined
  }

  const isEmptyOutline = build.base < 1
  const outlinePath = outline?.getAttribute('d') ?? ''
  const children: ReactNode[] = [
    <defs key="build-clips">
      <clipPath id={baseClipId}>
        <path d={buildWaveClipPath(baseLevelY, false, wavePhase)} />
      </clipPath>
      <clipPath id={panelsClipId}>
        <path d={buildWaveClipPath(panelsLevelY, true, wavePhase + 1.3)} />
      </clipPath>
    </defs>,
    // Before the colour is in, the outline reads as a clear shoe: a faint glass fill inside it.
    isEmptyOutline ? <path key="glass" d={outlinePath} fill="#FFFFFF" fillOpacity={0.16} /> : null,
    ...[...svgElement.children].map((child, childIndex) => renderSvgElement(child, `art-${childIndex}`, decorate)),
  ]
  if (pour !== undefined) {
    const wobbleX = Math.sin(frame * 1.7) * pour.width * 0.08
    const layerElement = pour.layer === 'base' ? baseFill : panelChildren[1]
    const bottomY = pour.layer === 'base' ? baseLevelY : COLLAR_OPENING_Y
    children.push(
      <rect
        key="pour"
        x={pour.centerX - pour.width / 2 + wobbleX}
        y={-3000}
        width={pour.width}
        height={3000 + bottomY}
        rx={pour.width / 2}
        transform={`rotate(${-rotationDegrees} ${pour.centerX} ${bottomY})`}
        fill={layerElement?.getAttribute('fill') ?? '#000000'}
      />,
    )
  }

  return createElement(
    'svg',
    {
      ...readSvgAttributes(svgElement),
      width,
      height: (width * SNEAKER_VIEW_HEIGHT) / SNEAKER_VIEW_WIDTH,
      style: { display: 'block', overflow: 'visible' },
    },
    children,
  )
}
