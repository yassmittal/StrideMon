import { getLength } from '@remotion/paths'
import type { ReactNode } from 'react'
import { AbsoluteFill, interpolate, useCurrentFrame } from 'remotion'
import { ClipRise } from '../../components/ClipRise'
import { Drift } from '../../components/Drift'
import { MaskedRise } from '../../components/MaskedRise'
import {
  readSvgAttributes,
  SvgArt,
  type SvgElementDecorator,
  splitSubpaths,
  useSvgMarkups,
} from '../../components/svg-markup'
import { colors, easings, letterSpacings } from '../../theme'
import { readWaitlistSceneDurationInFrames, toWaitlistSceneBeatFrame } from '../beats'
import { passContent } from '../content'
import { waitlistLayout } from '../layout'
import {
  founderSneakerFileNames,
  HERO_DESIGN_NUMBER,
  toFounderSneakerPath,
  toPassCardPath,
} from '../pass-art'

const CARD_PATH = toPassCardPath(HERO_DESIGN_NUMBER)
const UNLACED_PATH = toFounderSneakerPath(founderSneakerFileNames.unlaced)
const LACED_PATH = toFounderSneakerPath(founderSneakerFileNames.laced)
const HEADLINE_LINE_HEIGHT = 1
/**
 * The Founder Sneaker picture (400 × 400) down to its name row: the level and durability rows stay
 * out, because the laced preview's level 06 and durability 064 aren't what a first walk gives.
 */
const FOUNDER_SNEAKER_CROP_VIEW_BOX = '0 0 400 281'
const LIME = '#C1FF00'
const INK = '#141515'
const CARD_RADIUS_PIXELS = 12
const PANEL_RADIUS_PIXELS = 20

/** The pass scene's grid, in beats from its first frame. */
export const passSceneBeats = {
  passCard: 0,
  passHeadline: 0.5,
  founderSneakerFlip: 4,
  founderSneakerHeadline: 4.5,
  lacesStart: 6,
  lacedLabel: 7.5,
} as const

const SLAT_DRAW_FRAMES = 14
const SLAT_STAGGER_FRAMES = 3
const SLAT_FILL_FRAMES = 6
const LABEL_RISE_FRAMES = 18

/**
 * Scene 3 (0:07–0:12). Off-white: the #0137 card, "Your way into StrideMon." A flip to black: the
 * Founder Sneaker the app gives for it, in the same design. Its lace slats draw in one by one and
 * the LACED label lands, as they do after the first walk.
 */
export function PassScene() {
  const frame = useCurrentFrame()
  const { pass } = waitlistLayout
  const markups = useSvgMarkups([CARD_PATH, UNLACED_PATH, LACED_PATH])
  const flipFrame = toWaitlistSceneBeatFrame('pass', passSceneBeats.founderSneakerFlip)
  const isFounderSneaker = frame >= flipFrame
  const cardMarkup = markups?.get(CARD_PATH)
  const unlacedMarkup = markups?.get(UNLACED_PATH)
  const lacedMarkup = markups?.get(LACED_PATH)

  return (
    <AbsoluteFill
      style={{ backgroundColor: isFounderSneaker ? colors.darkBackground : colors.background }}
    >
      <Drift durationInFrames={readWaitlistSceneDurationInFrames('pass')}>
        {!isFounderSneaker && cardMarkup !== undefined && (
          <>
            <ClipRise
              startFrame={toWaitlistSceneBeatFrame('pass', passSceneBeats.passCard)}
              style={{
                left: pass.card.left,
                top: pass.card.top,
                width: pass.card.width,
                height: pass.card.height,
                borderRadius: CARD_RADIUS_PIXELS,
              }}
            >
              <SvgArt markup={cardMarkup} width={pass.card.width} />
            </ClipRise>
            <MaskedRise
              lines={passContent.passHeadlineLines}
              startFrame={toWaitlistSceneBeatFrame('pass', passSceneBeats.passHeadline)}
              fontSize={pass.headlineFontSize}
              lineHeight={HEADLINE_LINE_HEIGHT}
              letterSpacing={letterSpacings.display}
              color={colors.textPrimary}
              isOpticallyPulledLeft
              style={{ left: pass.passHeadline.left, top: pass.passHeadline.top }}
            />
          </>
        )}
        {isFounderSneaker && unlacedMarkup !== undefined && lacedMarkup !== undefined && (
          <>
            <div
              style={{
                position: 'absolute',
                left: pass.founderSneaker.left,
                top: pass.founderSneaker.top,
                borderRadius: PANEL_RADIUS_PIXELS,
                overflow: 'hidden',
              }}
            >
              <FounderSneaker
                unlacedMarkup={unlacedMarkup}
                lacedMarkup={lacedMarkup}
                frame={frame}
              />
            </div>
            <MaskedRise
              lines={passContent.founderSneakerHeadlineLines}
              startFrame={toWaitlistSceneBeatFrame('pass', passSceneBeats.founderSneakerHeadline)}
              fontSize={pass.headlineFontSize}
              lineHeight={HEADLINE_LINE_HEIGHT}
              letterSpacing={letterSpacings.display}
              color={colors.textOnDark}
              isOpticallyPulledLeft
              style={{
                left: pass.founderSneakerHeadline.left,
                top: pass.founderSneakerHeadline.top,
              }}
            />
          </>
        )}
      </Drift>
    </AbsoluteFill>
  )
}

/**
 * The picture as minted, with the laced picture's own lace slats and LACED label drawn over it.
 * Both pictures share every coordinate, so the slats land exactly where the renderer puts them.
 */
function FounderSneaker({
  unlacedMarkup,
  lacedMarkup,
  frame,
}: {
  unlacedMarkup: string
  lacedMarkup: string
  frame: number
}) {
  const { width } = waitlistLayout.pass.founderSneaker
  const lacesStartFrame = toWaitlistSceneBeatFrame('pass', passSceneBeats.lacesStart)
  const labelFrame = toWaitlistSceneBeatFrame('pass', passSceneBeats.lacedLabel)
  const eyeletOpacity = interpolate(
    frame,
    [lacesStartFrame, lacesStartFrame + SLAT_DRAW_FRAMES + 6 * SLAT_STAGGER_FRAMES],
    [1, 0],
    { extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: easings.standard },
  )
  const labelOffset = interpolate(frame, [labelFrame, labelFrame + LABEL_RISE_FRAMES], [28, 0], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
    easing: easings.outExpo,
  })

  // As minted: the eyelets give way to the slats.
  const decorateUnlaced: SvgElementDecorator = (element) =>
    element.tagName === 'g' && element.querySelector(':scope > circle') !== null
      ? { props: { opacity: eyeletOpacity } }
      : undefined

  // Laced: only what lacing adds. Its slats draw one by one; its label rises into place.
  const decorateLaced: SvgElementDecorator = (element) => {
    if (isLaceSlats(element)) {
      return {
        replace: () => <LaceSlats element={element} frame={frame} startFrame={lacesStartFrame} />,
      }
    }
    if (isLacedLabel(element)) {
      return {
        replace: (rendered: ReactNode) => (
          <g clipPath="url(#waitlist-laced-label)">
            <g transform={`translate(0 ${labelOffset})`}>{rendered}</g>
          </g>
        ),
      }
    }
    if (element.tagName === 'g' && element.querySelector(':scope > path') !== null) {
      // The shoe's group: keep its transform, so the slats sit in the shoe's own units.
      return element.hasAttribute('transform') ? undefined : null
    }
    return null
  }

  return (
    <div style={{ position: 'relative' }}>
      <SvgArt
        markup={unlacedMarkup}
        width={width}
        viewBox={FOUNDER_SNEAKER_CROP_VIEW_BOX}
        decorate={decorateUnlaced}
      />
      <div style={{ position: 'absolute', inset: 0 }}>
        <SvgArt
          markup={lacedMarkup}
          width={width}
          viewBox={FOUNDER_SNEAKER_CROP_VIEW_BOX}
          decorate={decorateLaced}
        >
          <clipPath id="waitlist-laced-label">
            <rect x={300} y={250} width={64} height={26} />
          </clipPath>
        </SvgArt>
      </div>
    </div>
  )
}

function LaceSlats({
  element,
  frame,
  startFrame,
}: {
  element: Element
  frame: number
  startFrame: number
}) {
  const attributes = readSvgAttributes(element)
  return (
    <>
      {splitSubpaths(element.getAttribute('d') ?? '').map((slatData, slatIndex) => {
        const slatStartFrame = startFrame + slatIndex * SLAT_STAGGER_FRAMES
        const length = getLength(slatData)
        const drawProgress = interpolate(
          frame,
          [slatStartFrame, slatStartFrame + SLAT_DRAW_FRAMES],
          [0, 1],
          { extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: easings.standard },
        )
        const fillOpacity = interpolate(
          frame,
          [
            slatStartFrame + SLAT_DRAW_FRAMES - 4,
            slatStartFrame + SLAT_DRAW_FRAMES + SLAT_FILL_FRAMES,
          ],
          [0, 1],
          { extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: easings.standard },
        )
        return (
          <path
            {...attributes}
            key={slatData}
            d={slatData}
            fillOpacity={fillOpacity}
            strokeDasharray={`${length} ${length}`}
            strokeDashoffset={length * (1 - drawProgress)}
            opacity={drawProgress === 0 ? 0 : 1}
          />
        )
      })}
    </>
  )
}

/** Lacing adds one ink path of slats (stroke width 6) inside the shoe. */
function isLaceSlats(element: Element): boolean {
  return (
    element.tagName === 'path' &&
    element.getAttribute('fill') === INK &&
    element.getAttribute('stroke-width') === '6'
  )
}

/** The lime LACED pill and its word. */
function isLacedLabel(element: Element): boolean {
  if (element.tagName === 'rect') {
    return element.getAttribute('fill') === LIME && element.hasAttribute('rx')
  }
  return element.tagName === 'text' && element.textContent === 'LACED'
}
