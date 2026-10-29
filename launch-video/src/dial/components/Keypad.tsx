import { AbsoluteFill, Easing, interpolate, useCurrentFrame } from 'remotion'
import { StrideMonMark } from '../../app-tour/components/StrideMonMark'
import { dialColors, fontFamilies, fontWeights, letterSpacings } from '../../theme'
import { dialContent, dialSneakers, keyLetters } from '../content'
import {
  type DialKey,
  type DialShotName,
  dialShotNames,
  keyFillFrames,
  keypadTimeline,
  REFERENCE_HEIGHT,
  REFERENCE_WIDTH,
} from '../timeline'
import { readShoeWidth, readSneakerCenter, ShotLens } from './ShotPicture'

// The phone's keypad, as the reference draws it: the lockup and "Dial a Sneaker" over a 3 x 4 grid
// of round keys and the green call button. Each digit's Sneaker fades into its key on the
// reference's beat, the call button is pressed, and the keypad zooms into key 1 until its circle
// opens onto the first shot. Places and sizes are the reference's, in its 720 px frame.

const KEY_DIAMETER = 112
/** The Sneaker's picture sits inside the white key, leaving a thin white ring. */
const LENS_RADIUS = 52
/** How wide the shoe is inside its key. */
const SHOE_WIDTH_IN_KEY = 90
const COLUMN_XS = [200, 360, 520] as const
const ROW_YS = [373, 507, 640, 773] as const
const CALL_CENTER = { x: 360, y: 896 }
const CALL_DIAMETER = 108
const LOCKUP_CENTER_Y = 214
const TAGLINE_CENTER_Y = 287

const KEY_ROWS: readonly (readonly (DialKey | '*' | '#')[])[] = [
  ['1', '2', '3'],
  ['4', '5', '6'],
  ['7', '8', '9'],
  ['*', '0', '#'],
]

const clamp = { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' } as const

function readKeyCenter(label: DialKey | '*' | '#'): { x: number; y: number } {
  for (const [rowIndex, row] of KEY_ROWS.entries()) {
    const columnIndex = row.indexOf(label)
    if (columnIndex >= 0) return { x: COLUMN_XS[columnIndex] ?? 0, y: ROW_YS[rowIndex] ?? 0 }
  }
  return { x: 0, y: 0 }
}

function readShotForKey(key: DialKey): DialShotName {
  return dialShotNames.find((shotName) => dialSneakers[shotName].key === key) ?? 'honey'
}

/** The scale that shows a shot's shoe at its key's size. */
function readThumbnailScale(shotName: DialShotName): number {
  return SHOE_WIDTH_IN_KEY / readShoeWidth(dialSneakers[shotName].placement)
}

/** The zoom into key 1, from 0 to 1: an ease-in, as the reference's camera accelerates into it. */
function readZoomProgress(frame: number): number {
  return interpolate(frame, [keypadTimeline.zoomStartFrame, keypadTimeline.zoomEndFrame], [0, 1], {
    ...clamp,
    easing: Easing.in(Easing.cubic),
  })
}

function Key({ label, frame }: { label: DialKey | '*' | '#'; frame: number }) {
  const { x, y } = readKeyCenter(label)
  const fillFrame = label === '*' || label === '#' ? null : keyFillFrames[label]
  const filled =
    fillFrame === null ? 0 : interpolate(frame, [fillFrame, fillFrame + 2], [0, 1], clamp)
  const letters = label === '*' || label === '#' ? '' : keyLetters[label]
  return (
    <div
      style={{
        position: 'absolute',
        left: x - KEY_DIAMETER / 2,
        top: y - KEY_DIAMETER / 2,
        width: KEY_DIAMETER,
        height: KEY_DIAMETER,
        borderRadius: '50%',
        backgroundColor: dialColors.key,
        boxShadow: `0 6px 18px ${dialColors.keyShadow}`,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        color: dialColors.keyInk,
      }}
    >
      <div
        style={{
          opacity: 1 - filled,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          marginTop: letters === '' ? 0 : 6,
        }}
      >
        <span
          style={{
            fontFamily: fontFamilies.satoshi,
            fontWeight: fontWeights.regular,
            fontSize: label === '*' || label === '#' ? 40 : 44,
            lineHeight: 1,
          }}
        >
          {label === '*' ? '✱' : label}
        </span>
        {letters === '' ? null : (
          <span
            style={{
              fontFamily: fontFamilies.satoshi,
              fontWeight: fontWeights.medium,
              fontSize: 10,
              letterSpacing: '0.18em',
              marginTop: 4,
              marginLeft: '0.18em',
            }}
          >
            {letters}
          </span>
        )}
      </div>
    </div>
  )
}

/** A key's Sneaker: the shot itself, scaled down about its shoe, fading and settling into the key. */
function KeyLens({
  keyLabel,
  frame,
  circleRadiusScale = 1,
}: {
  keyLabel: DialKey
  frame: number
  circleRadiusScale?: number
}) {
  const shotName = readShotForKey(keyLabel)
  const fillFrame = keyFillFrames[keyLabel]
  const opacity = interpolate(frame, [fillFrame, fillFrame + 2], [0, 1], clamp)
  if (opacity === 0) return null
  const settle = interpolate(frame, [fillFrame, fillFrame + 4], [1.08, 1], {
    ...clamp,
    easing: Easing.out(Easing.cubic),
  })
  const { x, y } = readKeyCenter(keyLabel)
  return (
    <div style={{ position: 'absolute', inset: 0, opacity }}>
      <ShotLens
        shotName={shotName}
        centerX={x}
        centerY={y}
        scale={readThumbnailScale(shotName) * settle}
        circleRadius={LENS_RADIUS * circleRadiusScale}
      />
    </div>
  )
}

function CallButton({ frame }: { frame: number }) {
  const { callPressFrame } = keypadTimeline
  const press = interpolate(
    frame,
    [callPressFrame, callPressFrame + 2, callPressFrame + 6],
    [1, 0.9, 1],
    clamp,
  )
  const ringShare = interpolate(frame, [callPressFrame, callPressFrame + 12], [0, 1], clamp)
  return (
    <>
      {ringShare > 0 && ringShare < 1 ? (
        <div
          style={{
            position: 'absolute',
            left: CALL_CENTER.x - (CALL_DIAMETER / 2) * (1 + 0.5 * ringShare),
            top: CALL_CENTER.y - (CALL_DIAMETER / 2) * (1 + 0.5 * ringShare),
            width: CALL_DIAMETER * (1 + 0.5 * ringShare),
            height: CALL_DIAMETER * (1 + 0.5 * ringShare),
            borderRadius: '50%',
            border: `3px solid ${dialColors.callRing}`,
            opacity: 1 - ringShare,
          }}
        />
      ) : null}
      <div
        style={{
          position: 'absolute',
          left: CALL_CENTER.x - CALL_DIAMETER / 2,
          top: CALL_CENTER.y - CALL_DIAMETER / 2,
          width: CALL_DIAMETER,
          height: CALL_DIAMETER,
          borderRadius: '50%',
          backgroundColor: dialColors.call,
          boxShadow: `0 10px 24px ${dialColors.callRing}`,
          scale: String(press),
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        {/* A handset, as the phone's own call button. */}
        <svg width={40} height={40} viewBox="0 0 24 24" aria-hidden="true">
          <path
            d="M6.6 10.8a15.2 15.2 0 0 0 6.6 6.6l2.2-2.2a1 1 0 0 1 1-.25 11.4 11.4 0 0 0 3.6.57 1 1 0 0 1 1 1V20a1 1 0 0 1-1 1A17 17 0 0 1 3 4a1 1 0 0 1 1-1h3.5a1 1 0 0 1 1 1c0 1.25.2 2.45.57 3.57a1 1 0 0 1-.25 1z"
            fill={dialColors.key}
          />
        </svg>
      </div>
    </>
  )
}

function Lockup() {
  return (
    <>
      <div
        style={{
          position: 'absolute',
          left: 0,
          width: REFERENCE_WIDTH,
          top: LOCKUP_CENTER_Y - 22,
          height: 44,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 12,
        }}
      >
        <StrideMonMark size={44} />
        <span
          style={{
            fontFamily: fontFamilies.satoshi,
            fontWeight: fontWeights.medium,
            fontSize: 38,
            letterSpacing: letterSpacings.display,
            color: dialColors.ink,
          }}
        >
          {dialContent.wordmark}
        </span>
      </div>
      <div
        style={{
          position: 'absolute',
          left: 0,
          width: REFERENCE_WIDTH,
          top: TAGLINE_CENTER_Y - 22,
          textAlign: 'center',
          fontFamily: fontFamilies.dialSerif,
          fontStyle: 'italic',
          fontWeight: fontWeights.regular,
          fontSize: 34,
          lineHeight: '44px',
          color: dialColors.keyInk,
        }}
      >
        {dialContent.tagline}
      </div>
    </>
  )
}

/** The keypad on its paper, zooming into key 1 from keypadTimeline.zoomStartFrame. */
export function Keypad() {
  const frame = useCurrentFrame()
  const zoom = readZoomProgress(frame)
  const firstShot = readShotForKey('1')
  const thumbnailScale = readThumbnailScale(firstShot)
  // Key 1's picture grows from its key's scale to the shot's own, and its shoe moves from the key to
  // where it stands in the shot, so the zoom ends exactly on the first shot's first frame.
  const pictureScale = thumbnailScale * (1 / thumbnailScale) ** zoom
  const keypadScale = pictureScale / thumbnailScale
  const keyCenter = readKeyCenter('1')
  const sneakerCenter = readSneakerCenter(dialSneakers[firstShot].placement)
  const landingX = keyCenter.x + (sneakerCenter.x - keyCenter.x) * zoom
  const landingY = keyCenter.y + (sneakerCenter.y - keyCenter.y) * zoom
  const circleOpening = interpolate(
    frame,
    [keypadTimeline.zoomEndFrame, keypadTimeline.circleOpenEndFrame],
    [1, 2.6],
    { ...clamp, easing: Easing.in(Easing.quad) },
  )
  const digitKeys = (Object.keys(keyFillFrames) as DialKey[]).filter((key) => key !== '1')
  return (
    <AbsoluteFill
      style={{
        background: `radial-gradient(ellipse 70% 55% at 50% 42%, ${dialColors.paperLight}, ${dialColors.paper})`,
      }}
    >
      <div
        style={{
          position: 'absolute',
          left: 0,
          top: 0,
          width: REFERENCE_WIDTH,
          height: REFERENCE_HEIGHT,
          transformOrigin: '0 0',
          transform: `translate(${landingX - keypadScale * keyCenter.x}px, ${landingY - keypadScale * keyCenter.y}px) scale(${keypadScale})`,
        }}
      >
        <Lockup />
        {KEY_ROWS.flat().map((label) => (
          <Key key={label} label={label} frame={frame} />
        ))}
        {digitKeys.map((key) => (
          <KeyLens key={key} keyLabel={key} frame={frame} />
        ))}
        <CallButton frame={frame} />
        {/* Key 1 last, so its circle opens over everything else. */}
        <KeyLens keyLabel="1" frame={frame} circleRadiusScale={circleOpening} />
      </div>
    </AbsoluteFill>
  )
}
