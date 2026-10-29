import { Img, staticFile } from 'remotion'
import { dialSneakers, type SneakerPlacement } from '../content'
import { type DialShotName, REFERENCE_HEIGHT, REFERENCE_WIDTH } from '../timeline'

// One shot as a picture, in the plate's pixels: the reference's own background with its cake taken
// out (scripts/build-dial-plates.py), and the Sneaker standing where the cake stood. The laced art
// is the website's own file, never edited (DESIGNS_FROZEN_ON).

/** The laced art's viewBox is 1000 x 600; its sole's middle is at (501, 520). */
const ART_HEIGHT_SHARE = 0.6
const SOLE_MIDDLE_X_SHARE = 0.501
const SOLE_BOTTOM_Y_SHARE = 0.52
/** The shoe's own middle (between its collar and its sole), as a share of the art's width above the sole. */
const SHOE_MIDDLE_ABOVE_SOLE_SHARE = 0.2
/** The shoe spans this share of the art's width (x 58 to 944). */
const SHOE_WIDTH_SHARE = 0.885
const CONTACT_SHADOW_COLOR = 'rgba(28, 18, 10, 0.5)'
/**
 * The art is a crisp vector and the plates are a phone's 720 px frames, scaled up: a touch of blur
 * and a warmer, quieter colour sit it in the room.
 */
const SNEAKER_GRADE = 'saturate(0.92) brightness(0.97) blur(0.45px)'

export function readSneakerPath(designNumber: number): string {
  return staticFile(`dial/sneakers/${String(designNumber).padStart(4, '0')}.svg`)
}

/** The middle of the shoe in its shot, in the plate's pixels: where every zoom and push-in centres. */
export function readSneakerCenter({ x, y, width }: SneakerPlacement): { x: number; y: number } {
  return { x, y: y - width * SHOE_MIDDLE_ABOVE_SOLE_SHARE }
}

/** The shoe's own width on screen, in the plate's pixels. */
export function readShoeWidth({ width }: SneakerPlacement): number {
  return width * SHOE_WIDTH_SHARE
}

export function ShotPicture({ shotName }: { shotName: DialShotName }) {
  const { designNumber, placement } = dialSneakers[shotName]
  const { x, y, width } = placement
  const shadowWidth = readShoeWidth(placement) * 0.95
  const shadowHeight = width * 0.06
  return (
    <div
      style={{
        position: 'absolute',
        left: 0,
        top: 0,
        width: REFERENCE_WIDTH,
        height: REFERENCE_HEIGHT,
      }}
    >
      <Img
        src={staticFile(`dial/plates/${shotName}.png`)}
        style={{
          position: 'absolute',
          left: 0,
          top: 0,
          width: REFERENCE_WIDTH,
          height: REFERENCE_HEIGHT,
        }}
      />
      <div
        style={{
          position: 'absolute',
          left: x - shadowWidth / 2,
          top: y - shadowHeight * 0.55,
          width: shadowWidth,
          height: shadowHeight,
          borderRadius: '50%',
          background: `radial-gradient(closest-side, ${CONTACT_SHADOW_COLOR}, rgba(28, 18, 10, 0))`,
          filter: `blur(${width * 0.01}px)`,
        }}
      />
      <Img
        src={readSneakerPath(designNumber)}
        style={{
          position: 'absolute',
          left: x - width * SOLE_MIDDLE_X_SHARE,
          top: y - width * SOLE_BOTTOM_Y_SHARE,
          width,
          height: width * ART_HEIGHT_SHARE,
          filter: SNEAKER_GRADE,
        }}
      />
    </div>
  )
}

type ShotLensProps = {
  shotName: DialShotName
  /** Where the shoe's middle lands, in the plate's pixels. */
  centerX: number
  centerY: number
  scale: number
  /** A circle round the centre, for a key; none for the full frame. */
  circleRadius?: number
}

/** The shot, scaled about its shoe and moved so the shoe's middle lands on (centerX, centerY). */
export function ShotLens({ shotName, centerX, centerY, scale, circleRadius }: ShotLensProps) {
  const sneakerCenter = readSneakerCenter(dialSneakers[shotName].placement)
  return (
    <div
      style={{
        position: 'absolute',
        left: 0,
        top: 0,
        width: REFERENCE_WIDTH,
        height: REFERENCE_HEIGHT,
        overflow: 'visible',
        clipPath:
          circleRadius === undefined
            ? undefined
            : `circle(${circleRadius}px at ${centerX}px ${centerY}px)`,
      }}
    >
      <div
        style={{
          position: 'absolute',
          left: 0,
          top: 0,
          transformOrigin: '0 0',
          transform: `translate(${centerX - sneakerCenter.x * scale}px, ${centerY - sneakerCenter.y * scale}px) scale(${scale})`,
        }}
      >
        <ShotPicture shotName={shotName} />
      </div>
    </div>
  )
}
