import { Easing, interpolate, useCurrentFrame } from 'remotion'
import { colors, easings } from '../../theme'
import { APP_TOUR_HEIGHT, APP_TOUR_WIDTH } from '../beats'
import { REST_FRAMING } from '../camera'
import { iconTimeline } from '../timeline'
import {
  NATURAL_PHONE_BEZEL,
  NATURAL_PHONE_HEIGHT,
  NATURAL_PHONE_WIDTH,
  NATURAL_SCREEN_RADIUS,
  readPhoneScale,
} from './AppTourPhone'
import { RealisticPhoneShell } from './RealisticPhoneShell'
import { MARK_TILE_RADIUS_UNITS, StrideMonMark } from './StrideMonMark'
import { SPLASH_TILE_SIZE_PIXELS } from './screens/SplashScreen'

// The app icon becoming the phone (reference.md, frames 4–30): the StrideMon tile rises in from
// below, already big, grows, punches past the frame, settles at 62% on beat 0, then collapses into
// the splash's own tile while the phone's screen grows out from its edges, and the phone's glass,
// rim and shadow fade in as it lands. One screen box animates its size and corners the whole way; the tile on it is the
// same mark at every size. Nothing cross-fades.

const restScale = readPhoneScale(REST_FRAMING)
/** Where the phone's screen lands, in frame pixels. */
const landedScreen = {
  width: (NATURAL_PHONE_WIDTH - 2 * NATURAL_PHONE_BEZEL) * restScale,
  height: (NATURAL_PHONE_HEIGHT - 2 * NATURAL_PHONE_BEZEL) * restScale,
  centerY: REST_FRAMING.top + (NATURAL_PHONE_HEIGHT * restScale) / 2,
  radius: NATURAL_SCREEN_RADIUS * restScale,
}
const landedTileSize = SPLASH_TILE_SIZE_PIXELS * restScale

/** The tile's width as a share of the frame, measured on the reference (frames 4–24 at 30 fps). */
const tileSizeKeyframes: readonly [number, number, (t: number) => number][] = [
  [iconTimeline.riseStartFrame, 0.817, Easing.linear],
  [iconTimeline.riseEndFrame, 0.817, Easing.linear],
  [iconTimeline.growEndFrame, 0.861, easings.standard],
  [iconTimeline.punchPeakFrame, 1.22, easings.outExpo],
  [iconTimeline.punchPeakFrame + 6, 1.15, easings.standard],
  [iconTimeline.settleFrame, 0.619, easings.outExpo],
  [iconTimeline.collapseStartFrame, 0.608, Easing.linear],
]

function readTileShare(frame: number): number {
  const inputs = tileSizeKeyframes.map(([keyFrame]) => keyFrame)
  const outputs = tileSizeKeyframes.map(([, share]) => share)
  const curves = tileSizeKeyframes.slice(1).map(([, , easing]) => easing)
  return interpolate(frame, inputs, outputs, {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
    easing: curves,
  })
}

export function IconMorph() {
  const frame = useCurrentFrame()
  const iconSize = readTileShare(frame) * APP_TOUR_WIDTH
  // The rise: from 82% of the height to the middle, fast out.
  const riseCenterY = interpolate(
    frame,
    [iconTimeline.riseStartFrame, iconTimeline.riseEndFrame],
    [0.82 * APP_TOUR_HEIGHT, APP_TOUR_HEIGHT / 2],
    { extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: easings.outExpo },
  )
  const collapse = interpolate(
    frame,
    [iconTimeline.collapseStartFrame, iconTimeline.landFrame],
    [0, 1],
    { extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: easings.emphasized },
  )
  const shellOpacity = interpolate(
    frame,
    [iconTimeline.screenOutFrame, iconTimeline.landFrame],
    [0, 1],
    { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' },
  )
  const iconRadius = (iconSize * MARK_TILE_RADIUS_UNITS) / 64
  // The screen box starts as the tile and ends as the landed screen.
  const screenWidth = interpolate(collapse, [0, 1], [iconSize, landedScreen.width])
  const screenHeight = interpolate(collapse, [0, 1], [iconSize, landedScreen.height])
  const screenRadius = interpolate(collapse, [0, 1], [iconRadius, landedScreen.radius])
  const centerY = interpolate(collapse, [0, 1], [riseCenterY, landedScreen.centerY])
  // The tile on it shrinks to the splash's own tile.
  const tileSize = interpolate(collapse, [0, 1], [iconSize, landedTileSize])
  const centerX = APP_TOUR_WIDTH / 2
  return (
    <div
      style={{
        position: 'absolute',
        left: centerX - screenWidth / 2,
        top: centerY - screenHeight / 2,
      }}
    >
      <RealisticPhoneShell
        screenWidth={screenWidth}
        screenHeight={screenHeight}
        screenRadius={screenRadius}
        unit={restScale}
        shellOpacity={shellOpacity}
      >
        <div
          style={{
            position: 'absolute',
            inset: 0,
            backgroundColor: colors.background,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <StrideMonMark size={tileSize} tileRadius={(tileSize * MARK_TILE_RADIUS_UNITS) / 64} />
        </div>
      </RealisticPhoneShell>
    </div>
  )
}
