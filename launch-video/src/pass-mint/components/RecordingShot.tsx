import { Video } from '@remotion/media'
import { AbsoluteFill, Freeze, interpolate, staticFile, useCurrentFrame } from 'remotion'
import { colors, easings } from '../../theme'
import { redactionBoxesByRecordingFrame } from '../redactions'
import {
  type CameraKeyframe,
  cameraKeyframes,
  hookCamera,
  hookTimeline,
  isRewindFrame,
  PASS_MINT_FRAMES_PER_SECOND,
  PASS_MINT_HEIGHT,
  PASS_MINT_WIDTH,
  RECORDING_HEIGHT,
  RECORDING_LAST_FRAME,
  RECORDING_WIDTH,
  readRecordingSecondsAtFrame,
} from '../timeline'

// The desktop recording, remapped (timeline.ts): each film frame shows one recording frame, under
// the film's own camera, with the email and the autofill list blurred.

const RECORDING_FILE = staticFile('pass-mint/recording.mp4')
const REDACTION_BLUR_PIXELS = 12
/** The app's background, lightly over the blur, so a box reads as a soft pill, not a smudge. */
const REDACTION_TINT = 'rgba(240, 241, 250, 0.3)'

type Camera = Omit<CameraKeyframe, 'seconds'>

function readCameraAtSeconds(seconds: number): Camera {
  const nextIndex = cameraKeyframes.findIndex((keyframe) => keyframe.seconds > seconds)
  if (nextIndex <= 0) {
    const edge = nextIndex === 0 ? cameraKeyframes[0] : cameraKeyframes[cameraKeyframes.length - 1]
    if (edge === undefined) throw new Error('No camera keyframes')
    return edge
  }
  const from = cameraKeyframes[nextIndex - 1]
  const to = cameraKeyframes[nextIndex]
  if (from === undefined || to === undefined) throw new Error('No camera keyframes')
  const progress = easings.standard((seconds - from.seconds) / (to.seconds - from.seconds))
  return {
    zoom: from.zoom + (to.zoom - from.zoom) * progress,
    centerX: from.centerX + (to.centerX - from.centerX) * progress,
    centerY: from.centerY + (to.centerY - from.centerY) * progress,
  }
}

/** Keeps the view inside the recording, so a zoomed camera never shows past its edge. */
function clampCenter(center: number, zoom: number, recordingSize: number): number {
  const halfView = recordingSize / zoom / 2
  return Math.min(recordingSize - halfView, Math.max(halfView, center))
}

export function RecordingShot() {
  const frame = useCurrentFrame()
  const recordingSeconds = readRecordingSecondsAtFrame(frame)
  const recordingFrame = Math.min(
    Math.round(recordingSeconds * PASS_MINT_FRAMES_PER_SECOND),
    RECORDING_LAST_FRAME,
  )
  const isRewind = isRewindFrame(frame)

  let camera = isRewind ? readCameraAtSeconds(0) : readCameraAtSeconds(recordingSeconds)
  if (frame < hookTimeline.endFrame) {
    camera = {
      zoom: interpolate(
        frame,
        [0, hookTimeline.endFrame],
        [hookCamera.fromZoom, hookCamera.toZoom],
        {
          easing: easings.standard,
        },
      ),
      centerX: hookCamera.centerX,
      centerY: hookCamera.centerY,
    }
  }
  const scale = (camera.zoom * PASS_MINT_WIDTH) / RECORDING_WIDTH
  const centerX = clampCenter(camera.centerX, camera.zoom, RECORDING_WIDTH)
  const centerY = clampCenter(camera.centerY, camera.zoom, RECORDING_HEIGHT)
  const redactionBoxes = redactionBoxesByRecordingFrame[recordingFrame] ?? []

  return (
    <AbsoluteFill style={{ backgroundColor: colors.darkBackground, overflow: 'hidden' }}>
      <div
        style={{
          position: 'absolute',
          width: RECORDING_WIDTH,
          height: RECORDING_HEIGHT,
          left: PASS_MINT_WIDTH / 2 - centerX * scale,
          top: PASS_MINT_HEIGHT / 2 - centerY * scale,
          transform: `scale(${scale})`,
          transformOrigin: '0 0',
          // The tape winding back: a little soft and dim.
          filter: isRewind ? 'blur(2px) brightness(0.8) saturate(0.7)' : undefined,
        }}
      >
        <RecordingFrame recordingFrame={recordingFrame} />
        {/* Each box shows the same frame again, blurred, clipped to the box. */}
        {redactionBoxes.map(([left, top, width, height]) => (
          <div
            key={`${left}-${top}`}
            style={{
              position: 'absolute',
              left,
              top,
              width,
              height,
              borderRadius: height / 2,
              overflow: 'hidden',
            }}
          >
            <div
              style={{
                position: 'absolute',
                left: -left,
                top: -top,
                filter: `blur(${REDACTION_BLUR_PIXELS}px)`,
              }}
            >
              <RecordingFrame recordingFrame={recordingFrame} />
            </div>
            <div style={{ position: 'absolute', inset: 0, backgroundColor: REDACTION_TINT }} />
          </div>
        ))}
      </div>
    </AbsoluteFill>
  )
}

/**
 * One recording frame. Frozen on the clip's first frame, with the clip starting at the frame
 * wanted: a frozen frame past the composition's own length (24.95 s) would be clamped to it.
 */
function RecordingFrame({ recordingFrame }: { recordingFrame: number }) {
  return (
    <Freeze frame={0}>
      <Video
        src={RECORDING_FILE}
        muted
        trimBefore={recordingFrame}
        style={{ width: RECORDING_WIDTH, height: RECORDING_HEIGHT, display: 'block' }}
      />
    </Freeze>
  )
}
