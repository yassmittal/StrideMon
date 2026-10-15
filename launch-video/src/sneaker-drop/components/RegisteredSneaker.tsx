import { getLength } from '@remotion/paths'
import type { CSSProperties, ReactNode } from 'react'
import { parseSvgMarkup, readSvgAttributes, renderSvgElement } from '../../components/svg-markup'
import { colors } from '../../theme'
import type { ShoePlacement } from '../layout'

// A laced Sneaker from FoundingPassArtRenderer (1000 × 600, ground at y 520), placed by its heel
// and ground line so every design registers on the same spot (layout.ts). The art is unchanged:
// on dark it gets SneakerArtRenderer's own light rim (the Founder Sneaker's, D-042: the
// silhouette at 34 units and the heel tab at 24, in the pass card's #F0F1FA), and the line-art
// version only recolours strokes while they draw (the cold open).

const ART_WIDTH_UNITS = 1000
const ART_HEIGHT_UNITS = 600
const GROUND_UNIT_Y = 520
const SILHOUETTE_RIM_WIDTH = 34
const HEEL_TAB_RIM_WIDTH = 24
/** A punch scales about the middle of the shoe, not its corner. */
const PUNCH_ORIGIN_UNITS = { x: 500, y: 360 }

type SneakerParts = {
  svgElement: Element
  clipPathId: string
  silhouetteData: string
  heelTabData: string
  /** The heel's leftmost unit (the silhouette or the tab), which the placement's heelX lands on. */
  heelUnitX: number
}

const partsCache = new Map<string, SneakerParts>()

function readSneakerParts(markup: string): SneakerParts {
  const cached = partsCache.get(markup)
  if (cached !== undefined) return cached
  const svgElement = parseSvgMarkup(markup)
  const clipPath = svgElement.querySelector('clipPath')
  const silhouetteData = clipPath?.querySelector('path')?.getAttribute('d') ?? ''
  const heelTabData = svgElement.querySelector(':scope > path')?.getAttribute('d') ?? ''
  const xValues = [silhouetteData, heelTabData].flatMap((pathData) =>
    pathData
      .replace(/[MZ]/g, ' ')
      .trim()
      .split(/\s+/)
      .map(Number)
      .filter((_value, valueIndex) => valueIndex % 2 === 0),
  )
  const parts = {
    svgElement,
    clipPathId: clipPath?.getAttribute('id') ?? '',
    silhouetteData,
    heelTabData,
    heelUnitX: Math.min(...xValues),
  }
  partsCache.set(markup, parts)
  return parts
}

type PlacedArtProps = {
  markup: string
  placement: ShoePlacement
  /** 1 at rest; the cowbell's punch is a little over 1. */
  punchScale?: number
  /** Unique per shoe on screen, so two copies never share a clip path id. */
  instanceId: string
  children: (parts: SneakerParts, clipPathId: string) => ReactNode
}

/** The 1000 × 600 art, positioned so its heel and ground land on the placement. */
function PlacedArt({ markup, placement, punchScale = 1, instanceId, children }: PlacedArtProps) {
  const parts = readSneakerParts(markup)
  const { heelX, groundY, unitScale } = placement
  const style: CSSProperties = {
    position: 'absolute',
    left: heelX - parts.heelUnitX * unitScale,
    top: groundY - GROUND_UNIT_Y * unitScale,
    width: ART_WIDTH_UNITS * unitScale,
    height: ART_HEIGHT_UNITS * unitScale,
    overflow: 'visible',
    scale: punchScale,
    transformOrigin: `${PUNCH_ORIGIN_UNITS.x * unitScale}px ${PUNCH_ORIGIN_UNITS.y * unitScale}px`,
  }
  return (
    <svg viewBox={`0 0 ${ART_WIDTH_UNITS} ${ART_HEIGHT_UNITS}`} style={style} aria-hidden="true">
      {children(parts, `${parts.clipPathId}-${instanceId}`)}
    </svg>
  )
}

type RegisteredSneakerProps = Omit<PlacedArtProps, 'children'> & {
  /** On black, the renderer's light rim keeps the dark outline from vanishing. */
  hasRim: boolean
}

/** The Sneaker in colour, exactly as the renderer drew it. */
export function RegisteredSneaker({ hasRim, ...placedProps }: RegisteredSneakerProps) {
  return (
    <PlacedArt {...placedProps}>
      {(parts, clipPathId) => (
        <>
          {hasRim && <Rim parts={parts} />}
          {[...parts.svgElement.children].map((child, childIndex) =>
            renderSvgElement(child, `art-${childIndex}`, (element) => {
              if (element.tagName === 'clipPath') return { props: { id: clipPathId } }
              if (element.getAttribute('clip-path') !== null) {
                return { props: { clipPath: `url(#${clipPathId})` } }
              }
              return undefined
            }),
          )}
        </>
      )}
    </PlacedArt>
  )
}

function Rim({ parts }: { parts: SneakerParts }) {
  const rimProps = {
    fill: colors.background,
    stroke: colors.background,
    strokeLinejoin: 'round' as const,
  }
  return (
    <>
      <path d={parts.heelTabData} strokeWidth={HEEL_TAB_RIM_WIDTH} {...rimProps} />
      <path d={parts.silhouetteData} strokeWidth={SILHOUETTE_RIM_WIDTH} {...rimProps} />
    </>
  )
}

type LineSneakerProps = Omit<PlacedArtProps, 'children'> & {
  color: string
  /** The outline and heel tab, drawn on: 0 to 1. */
  outlineProgress: number
  /** The panel lines, each starting a little after the last: 0 to 1 across all of them. */
  panelProgress: number
  /** The lace slats and the tab's mark, filled in: shown or not. */
  areDetailsShown: boolean
}

// Each panel starts this fraction of the whole panel draw after the one before it.
const PANEL_STAGGER = 0.08

/** The same Sneaker as line art: its own strokes and panel edges in one colour, drawing on. */
export function LineSneaker({
  color,
  outlineProgress,
  panelProgress,
  areDetailsShown,
  ...placedProps
}: LineSneakerProps) {
  return (
    <PlacedArt {...placedProps}>
      {(parts, clipPathId) => {
        const [, heelTab, heelTabMark, panelGroup, outline, laceSlats] = [
          ...parts.svgElement.children,
        ]
        const panels = panelGroup === undefined ? [] : [...panelGroup.children].slice(1)
        const panelCount = Math.max(1, panels.length)
        const panelDrawLength = 1 - PANEL_STAGGER * (panelCount - 1)
        return (
          <>
            <defs>
              <clipPath id={clipPathId}>
                <path d={parts.silhouetteData} />
              </clipPath>
            </defs>
            <g clipPath={`url(#${clipPathId})`}>
              {panels.map((panel, panelIndex) => {
                const start = panelIndex * PANEL_STAGGER
                const progress = clampUnit((panelProgress - start) / panelDrawLength)
                return (
                  <DrawnPath
                    // biome-ignore lint/suspicious/noArrayIndexKey: the art's own fixed order.
                    key={panelIndex}
                    pathData={panel.getAttribute('d') ?? ''}
                    progress={progress}
                    color={color}
                    strokeWidth={7}
                  />
                )
              })}
            </g>
            {heelTab !== undefined && (
              <DrawnPath
                pathData={heelTab.getAttribute('d') ?? ''}
                progress={outlineProgress}
                color={color}
                strokeWidth={8}
              />
            )}
            {outline !== undefined && (
              <DrawnPath
                pathData={outline.getAttribute('d') ?? ''}
                progress={outlineProgress}
                color={color}
                strokeWidth={18}
              />
            )}
            {areDetailsShown &&
              [heelTabMark, laceSlats].map(
                (detail, detailIndex) =>
                  detail !== undefined && (
                    <path
                      // biome-ignore lint/suspicious/noArrayIndexKey: two fixed parts.
                      key={detailIndex}
                      {...readSvgAttributes(detail)}
                      fill={color}
                      stroke={color}
                    />
                  ),
              )}
          </>
        )
      }}
    </PlacedArt>
  )
}

function DrawnPath({
  pathData,
  progress,
  color,
  strokeWidth,
}: {
  pathData: string
  progress: number
  color: string
  strokeWidth: number
}) {
  const length = getLength(pathData)
  return (
    <path
      d={pathData}
      fill="none"
      stroke={color}
      strokeWidth={strokeWidth}
      strokeLinejoin="round"
      strokeLinecap="round"
      strokeDasharray={`${length} ${length}`}
      strokeDashoffset={length * (1 - progress)}
      // A round cap still paints a dot at zero length.
      opacity={progress === 0 ? 0 : 1}
    />
  )
}

function clampUnit(value: number): number {
  return Math.min(1, Math.max(0, value))
}
