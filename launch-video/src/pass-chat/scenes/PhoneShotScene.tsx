import { AbsoluteFill, useCurrentFrame } from 'remotion'
import { PHONE_SHOT_PERSPECTIVE_PIXELS, readPhoneCamera, toPhoneTransform } from '../camera'
import { ChatScreen } from '../components/ChatScreen'
import { PhoneBody } from '../components/PhoneBody'
import { PhoneBack, PhoneFront } from '../components/PhoneFaces'
import { SkyPhoto } from '../components/SkyPhoto'
import { SubFrameMotionBlur } from '../components/SubFrameMotionBlur'
import { phoneDimensions } from '../layout'
import { PASS_CHAT_HEIGHT, PASS_CHAT_WIDTH, phoneInTimeline, spinTimeline } from '../timeline'

// Scenes 1–3 as one continuous shot: the phone swings in over the sky, the chat builds while the
// camera drifts and pushes in, and the phone spins away to its back. Every pose is camera.ts's.

const FRAME_CENTRE = { x: PASS_CHAT_WIDTH / 2, y: PASS_CHAT_HEIGHT / 2 }
/**
 * The sky sits at infinity: as the camera turns round the phone, it pans and rolls a little. The
 * pan follows the turn while the phone faces the camera (about 2% across the chat), and is held
 * inside the overscan through the swing and the spin, which turn the phone half round.
 */
const SKY_PAN_PIXELS_PER_DEGREE = 1.2
const SKY_ROLL_RATIO = 0.6
const SKY_OVERSCAN = 1.3
const SKY_PAN_LIMIT_PIXELS = 160

// A film camera's shutter: 180°. The swing and the spin need many samples, or the copies show.
const SHUTTER_FRACTION = 0.5
const BLUR_SAMPLE_COUNT = 16

/** The whole phone shot. Motion blur runs only on the swing and the spin, never on the chat. */
export function PhoneShotScene() {
  const frame = useCurrentFrame()
  const isBlurred = frame < phoneInTimeline.endFrame - 6 || frame >= spinTimeline.blurStartFrame
  return (
    <AbsoluteFill style={{ overflow: 'hidden' }}>
      <SubFrameMotionBlur
        frame={frame}
        shutterFraction={isBlurred ? SHUTTER_FRACTION : 0}
        sampleCount={BLUR_SAMPLE_COUNT}
        render={(sampleFrame) => <PhoneShotPicture frame={sampleFrame} />}
      />
    </AbsoluteFill>
  )
}

/** The sky and the phone on one (sub-)frame. */
function PhoneShotPicture({ frame }: { frame: number }) {
  const pose = readPhoneCamera(frame)
  return (
    <AbsoluteFill>
      <SkyPhoto
        width={PASS_CHAT_WIDTH}
        height={PASS_CHAT_HEIGHT}
        overscan={SKY_OVERSCAN}
        offsetX={clampPan(-pose.rotateY * SKY_PAN_PIXELS_PER_DEGREE)}
        rotateDegrees={pose.rotateZ * SKY_ROLL_RATIO}
      />
      <AbsoluteFill
        style={{
          perspective: PHONE_SHOT_PERSPECTIVE_PIXELS,
          perspectiveOrigin: `${FRAME_CENTRE.x}px ${FRAME_CENTRE.y}px`,
        }}
      >
        <PhoneBody
          dimensions={phoneDimensions}
          transform={toPhoneTransform(pose, FRAME_CENTRE)}
          front={<PhoneFront screen={<ChatScreen frame={frame} />} />}
          back={<PhoneBack />}
        />
      </AbsoluteFill>
    </AbsoluteFill>
  )
}

/** Keeps the sky's pan inside its overscan, easing into the limit rather than stopping at it. */
function clampPan(pixels: number): number {
  return SKY_PAN_LIMIT_PIXELS * Math.tanh(pixels / SKY_PAN_LIMIT_PIXELS)
}
