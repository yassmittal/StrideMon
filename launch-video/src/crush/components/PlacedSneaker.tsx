import type { SneakerPose } from '../poses'
import { CrushSneaker, SNEAKER_VIEW_HEIGHT, SNEAKER_VIEW_WIDTH } from './CrushSneaker'

// One Sneaker at its pose, in the plate's pixels: the art point the pose names lands on (x, y),
// turned around it. A Sneaker standing on something gets a soft contact shadow under its sole; one
// in the air a soft drop shadow, as the reference's pasted cup.

const STANDING_SHADOW_COLOR = 'rgba(12, 10, 8, 0.55)'

export function PlacedSneaker({ markup, pose, idPrefix, frame }: { markup: string; pose: SneakerPose; idPrefix: string; frame: number }) {
  const pixelsPerUnit = pose.width / SNEAKER_VIEW_WIDTH
  const anchorLeft = pose.anchor.artX * pixelsPerUnit
  const anchorTop = pose.anchor.artY * pixelsPerUnit
  const shadowWidth = pose.width * 0.82
  const shadowHeight = pose.width * 0.07
  return (
    <div
      style={{
        position: 'absolute',
        left: pose.x - anchorLeft,
        top: pose.y - anchorTop,
        width: pose.width,
        height: SNEAKER_VIEW_HEIGHT * pixelsPerUnit,
        transformOrigin: `${anchorLeft}px ${anchorTop}px`,
        rotate: `${pose.rotationDegrees}deg`,
      }}
    >
      {pose.isStanding ? (
        <div
          style={{
            position: 'absolute',
            // Under the sole's middle (the art's x 501, y 520), a little behind it.
            left: 501 * pixelsPerUnit - shadowWidth / 2,
            top: 520 * pixelsPerUnit - shadowHeight * 0.55,
            width: shadowWidth,
            height: shadowHeight,
            borderRadius: '50%',
            background: `radial-gradient(closest-side, ${STANDING_SHADOW_COLOR}, rgba(12, 10, 8, 0))`,
            filter: `blur(${pose.width * 0.012}px)`,
          }}
        />
      ) : null}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          filter: [
            pose.blurPixels > 0 ? `blur(${pose.blurPixels}px)` : '',
            pose.isStanding ? '' : `drop-shadow(0 ${pose.width * 0.03}px ${pose.width * 0.04}px rgba(0, 0, 0, 0.28))`,
          ]
            .join(' ')
            .trim(),
        }}
      >
        <CrushSneaker
          markup={markup}
          width={pose.width}
          build={pose.build}
          pour={pose.pour}
          idPrefix={idPrefix}
          frame={frame}
          rotationDegrees={pose.rotationDegrees}
        />
      </div>
    </div>
  )
}
