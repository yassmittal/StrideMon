import { getLength } from '@remotion/paths'
import { createElement, type ReactNode } from 'react'
import { AbsoluteFill, interpolate, useCurrentFrame } from 'remotion'
import { Drift } from '../../components/Drift'
import { MaskedRise } from '../../components/MaskedRise'
import {
  parseSvgMarkup,
  readSvgAttributes,
  renderSvgElement,
  useSvgMarkups,
} from '../../components/svg-markup'
import { colors, easings, letterSpacings } from '../../theme'
import { readWaitlistSceneDurationInFrames, toWaitlistSceneBeatFrame } from '../beats'
import { hookContent } from '../content'
import { waitlistLayout } from '../layout'
import { founderSneakerFileNames, toFounderSneakerPath } from '../pass-art'

const SNEAKER_PATH = toFounderSneakerPath(founderSneakerFileNames.unlaced)
const HEADLINE_LINE_HEIGHT = 0.95
/** The shoe and its light rim, in the 400 × 400 picture's units: the panel, labels and stats stay out. */
const SHOE_CROP_VIEW_BOX = '22 64 356 172'
// The art's own lime, used only to find the heel tab in the markup.
const LIME = '#C1FF00'

/** The hook's grid, in beats from its first frame. */
export const hookSceneBeats = {
  /** The rim is already partly drawn on frame 0, so the first frame is a drawing, not black. */
  rimDrawStart: -1.4,
  rimDrawEnd: 2.4,
  panelsFill: 2.4,
  limeTab: 4,
} as const

const FILL_DURATION_FRAMES = 30
const TAB_DURATION_FRAMES = 20

/**
 * Scene 1 (0:00–0:03), black. "1,000 Founding Passes." is set from the first frame (the
 * thumbnail), while the Founder Sneaker #0137 draws itself: its light rim as a line, then the
 * panels fill from the sole up, and the lime heel tab lands last.
 */
export function HookScene() {
  const frame = useCurrentFrame()
  const { hook, metaFontSize, metaTop, gutter } = waitlistLayout
  const markups = useSvgMarkups([SNEAKER_PATH])
  const markup = markups?.get(SNEAKER_PATH)

  return (
    <AbsoluteFill style={{ backgroundColor: colors.darkBackground }}>
      <Drift durationInFrames={readWaitlistSceneDurationInFrames('hook')}>
        <MaskedRise
          lines={['Founding Pass'.toUpperCase()]}
          startFrame={-40}
          fontSize={metaFontSize}
          fontWeight={500}
          color={colors.textOnDarkSecondary}
          style={{ left: gutter, top: metaTop }}
        />
        <MaskedRise
          lines={hookContent.headlineLines}
          startFrame={-40}
          fontSize={hook.headlineFontSize}
          lineHeight={HEADLINE_LINE_HEIGHT}
          letterSpacing={letterSpacings.display}
          color={colors.textOnDark}
          isOpticallyPulledLeft
          style={{ left: hook.headline.left, top: hook.headline.top }}
        />
        {markup !== undefined && (
          <div style={{ position: 'absolute', left: hook.sneaker.left, top: hook.sneaker.top }}>
            <DrawnSneaker markup={markup} frame={frame} width={hook.sneaker.width} />
          </div>
        )}
      </Drift>
    </AbsoluteFill>
  )
}

function DrawnSneaker({ markup, frame, width }: { markup: string; frame: number; width: number }) {
  const svgElement = parseSvgMarkup(markup)
  const shadow = svgElement.querySelector(':scope > ellipse')
  const shoeGroup = svgElement.querySelector(':scope > g[transform]')
  if (shoeGroup === null) return null
  const shoeChildren = [...shoeGroup.children]
  // The renderer draws the rim first: the heel tab's, then the silhouette's (light, thick strokes).
  const rimSilhouette = shoeChildren[1]
  const rimSilhouetteData = rimSilhouette?.getAttribute('d') ?? ''
  const rimLength = getLength(rimSilhouetteData)
  const toFrame = (beat: number) => toWaitlistSceneBeatFrame('hook', beat)

  const rimProgress = interpolate(
    frame,
    [toFrame(hookSceneBeats.rimDrawStart), toFrame(hookSceneBeats.rimDrawEnd)],
    [0, 1],
    { extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: easings.standard },
  )
  // The reveals rise from below the sole (y 600 in the shoe's own units) to above the tab.
  const fillTop = interpolate(
    frame,
    [toFrame(hookSceneBeats.panelsFill), toFrame(hookSceneBeats.panelsFill) + FILL_DURATION_FRAMES],
    [620, 60],
    { extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: easings.emphasized },
  )
  const tabTop = interpolate(
    frame,
    [toFrame(hookSceneBeats.limeTab), toFrame(hookSceneBeats.limeTab) + TAB_DURATION_FRAMES],
    [240, 60],
    { extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: easings.outExpo },
  )
  const tabElements = new Set(
    shoeChildren.filter(
      (child, childIndex) =>
        childIndex === 0 || child.getAttribute('fill') === LIME || isTabMark(child, shoeChildren),
    ),
  )

  const [, , cropWidth = 1, cropHeight = 1] = SHOE_CROP_VIEW_BOX.split(' ').map(Number)
  const wrapIn = (clipId: string) => (rendered: ReactNode) =>
    createElement('g', { clipPath: `url(#${clipId})` }, rendered)

  return (
    <svg
      viewBox={SHOE_CROP_VIEW_BOX}
      width={width}
      height={(width * cropHeight) / cropWidth}
      style={{ display: 'block' }}
      aria-hidden="true"
    >
      {shadow !== null && renderSvgElement(shadow, 'shadow')}
      <g {...readSvgAttributes(shoeGroup)}>
        <defs>
          <clipPath id="waitlist-hook-fill">
            <rect x={-60} y={fillTop} width={1120} height={720} />
          </clipPath>
          <clipPath id="waitlist-hook-tab">
            <rect x={-60} y={tabTop} width={1120} height={720} />
          </clipPath>
        </defs>
        <path
          d={rimSilhouetteData}
          fill="none"
          stroke={rimSilhouette?.getAttribute('stroke') ?? undefined}
          strokeWidth={rimSilhouette?.getAttribute('stroke-width') ?? '34'}
          strokeLinejoin="round"
          strokeDasharray={`${rimLength} ${rimLength}`}
          strokeDashoffset={rimLength * (1 - rimProgress)}
          opacity={rimProgress === 0 ? 0 : 1}
        />
        {shoeChildren.map((child, childIndex) => {
          const clipId = tabElements.has(child) ? 'waitlist-hook-tab' : 'waitlist-hook-fill'
          return renderSvgElement(child, `shoe-${childIndex}`, (element) =>
            element === child ? { replace: wrapIn(clipId) } : undefined,
          )
        })}
      </g>
    </svg>
  )
}

/** The small ink mark on the lime tab: the path right after the lime one. */
function isTabMark(element: Element, siblings: readonly Element[]): boolean {
  const previous = siblings[siblings.indexOf(element) - 1]
  return previous?.getAttribute('fill') === LIME && element.tagName === 'path'
}
