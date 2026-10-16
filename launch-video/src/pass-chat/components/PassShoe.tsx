import { type CSSProperties, createContext, type ReactNode, useContext } from 'react'
import { staticFile } from 'remotion'
import {
  parseSvgMarkup,
  readSvgAttributes,
  renderSvgElement,
  useSvgMarkups,
} from '../../components/svg-markup'
import { BURST_DESIGN_NUMBERS, HERO_DESIGN_NUMBER } from '../sneakers'

// The film's shoes: each gallery card's shoe, cropped out by scripts/copy-pass-chat-art.sh into
// public/pass-chat/shoes/NNNN.svg (the card's own shoe group and ground ellipse, byte for byte,
// under a viewBox that frames the shoe's 1000 × 600 space). Drawn unchanged: placed, scaled,
// rotated and blurred, never recoloured (DESIGNS_FROZEN_ON).

/** The shoe's frame: every template stands on the ground at y 520 with its heel near x 56. */
export const SHOE_FRAME_UNITS = { width: 1000, height: 600 } as const
/** Spins and scales turn about the middle of a mid-height shoe, not the frame's corner. */
export const SHOE_PIVOT = { x: '50%', y: `${(360 / 600) * 100}%` } as const

function toShoePath(designNumber: number): string {
  return staticFile(`pass-chat/shoes/${String(designNumber).padStart(4, '0')}.svg`)
}

const ALL_SHOE_PATHS = [HERO_DESIGN_NUMBER, ...BURST_DESIGN_NUMBERS].map(toShoePath)

const ShoeArtContext = createContext<ReadonlyMap<string, string> | null>(null)

/** Loads every shoe the film draws once, holding the render until they're in. */
export function ShoeArtProvider({ children }: { children: ReactNode }) {
  const markups = useSvgMarkups(ALL_SHOE_PATHS)
  if (markups === null) return null
  return <ShoeArtContext.Provider value={markups}>{children}</ShoeArtContext.Provider>
}

type PassShoeProps = {
  designNumber: number
  /** The shoe frame's width in pixels (its height is 0.6 of it). */
  width: number
  /** Unique per shoe on screen, so two copies never share a clip path id. */
  instanceId: string
  style?: CSSProperties
}

/** One shoe in its 1000 × 600 frame, exactly as the gallery card draws it, without the ground. */
export function PassShoe({ designNumber, width, instanceId, style }: PassShoeProps) {
  const markups = useContext(ShoeArtContext)
  const markup = markups?.get(toShoePath(designNumber))
  if (markup === undefined) throw new Error(`Shoe art not loaded: #${designNumber}`)
  const svgElement = parseSvgMarkup(markup)
  const clipPathId = svgElement.querySelector('clipPath')?.getAttribute('id') ?? ''
  const instanceClipPathId = `${clipPathId}-${instanceId}`
  return (
    <svg
      {...readSvgAttributes(svgElement)}
      width={width}
      height={(width * SHOE_FRAME_UNITS.height) / SHOE_FRAME_UNITS.width}
      aria-hidden="true"
      style={{ display: 'block', overflow: 'visible', ...style }}
    >
      {[...svgElement.children].map((child, childIndex) =>
        renderSvgElement(child, `shoe-${childIndex}`, (element) => {
          // The card's light ground ellipse: floating in the sky, the shoe has nothing to sit on.
          if (element.tagName === 'ellipse') return null
          if (element.tagName === 'clipPath') return { props: { id: instanceClipPathId } }
          if (element.getAttribute('clip-path') !== null) {
            return { props: { clipPath: `url(#${instanceClipPathId})` } }
          }
          return undefined
        }),
      )}
    </svg>
  )
}
