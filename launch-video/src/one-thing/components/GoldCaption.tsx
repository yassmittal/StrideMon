import { interpolate, useCurrentFrame } from 'remotion'
import { fontFamilies, oneThingColors } from '../../theme'

// The reference's gold captions ("418m²", "OF LAND", "R3,500,000 📍 HOUT BAY"): a tall condensed
// face in warm yellow with a glow round it. The first one sparkles in, its letters streaks of light
// that settle; the others cut in with the shot and settle from a little larger. In the film's 1080 px.

const clamp = { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' } as const
const CUT_IN_SETTLE_FRAMES = 4
const PINNED_LINE_DELAY_FRAMES = 2
/** Each letter of a sparkle starts a frame after the one before it. */
const SPARKLE_LETTER_STAGGER_FRAMES = 1

const glow = `0 0 10px ${oneThingColors.goldGlowNear}, 0 0 34px ${oneThingColors.goldGlowFar}`

type GoldCaptionProps = {
  main: string
  pinned: string | null
  startFrame: number
  /** The frames a sparkle takes to settle, or null to cut in. */
  sparkleFrames: number | null
  /** The main line's centre, from the top of the frame. */
  centerY: number
  mainFontSize: number
}

function SparkleLetter({
  letter,
  startFrame,
  settleFrames,
}: {
  letter: string
  startFrame: number
  settleFrames: number
}) {
  const frame = useCurrentFrame()
  const settled = interpolate(frame, [startFrame, startFrame + settleFrames], [0, 1], clamp)
  // A streak flickers as it comes in: on odd frames it is a little dimmer, until it settles.
  const flicker = settled < 1 && frame % 2 === 1 ? 0.7 : 1
  return (
    <span
      style={{
        display: 'inline-block',
        opacity: Math.min(1, settled * 2.5) * flicker,
        scale: `1 ${1 + (1 - settled) * 1.6}`,
        filter: settled < 1 ? `blur(${(1 - settled) * 12}px)` : undefined,
      }}
    >
      {letter}
    </span>
  )
}

function MapPin({ size }: { size: number }) {
  return (
    <svg
      width={size * 0.62}
      height={size}
      viewBox="0 0 31 50"
      aria-hidden="true"
      style={{ display: 'block' }}
    >
      <line
        x1="15.5"
        y1="24"
        x2="15.5"
        y2="49"
        stroke={oneThingColors.pinNeedle}
        strokeWidth="3"
        strokeLinecap="round"
      />
      <circle cx="15.5" cy="14" r="13" fill={oneThingColors.pinHead} />
      <circle cx="11" cy="9.5" r="3.6" fill={oneThingColors.pinHighlight} />
    </svg>
  )
}

export function GoldCaption({
  main,
  pinned,
  startFrame,
  sparkleFrames,
  centerY,
  mainFontSize,
}: GoldCaptionProps) {
  const frame = useCurrentFrame()
  const mainSettled = interpolate(
    frame,
    [startFrame, startFrame + CUT_IN_SETTLE_FRAMES],
    [0, 1],
    clamp,
  )
  const pinnedSettled = interpolate(
    frame,
    [
      startFrame + PINNED_LINE_DELAY_FRAMES,
      startFrame + PINNED_LINE_DELAY_FRAMES + CUT_IN_SETTLE_FRAMES,
    ],
    [0, 1],
    clamp,
  )
  const letters = [...main.toUpperCase()]
  const pinnedFontSize = Math.round(mainFontSize * 0.5)
  return (
    <div
      style={{
        position: 'absolute',
        left: 0,
        right: 0,
        top: centerY - mainFontSize / 2,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        fontFamily: fontFamilies.oneThingCaption,
        color: oneThingColors.gold,
        textShadow: glow,
      }}
    >
      <div
        style={{
          fontSize: mainFontSize,
          lineHeight: 1,
          letterSpacing: '0.01em',
          scale: sparkleFrames === null ? String(1 + (1 - mainSettled) * 0.08) : undefined,
          opacity: sparkleFrames === null ? Math.min(1, mainSettled * 3) : undefined,
        }}
      >
        {sparkleFrames === null
          ? letters.join('')
          : letters.map((letter, letterIndex) => (
              <SparkleLetter
                // biome-ignore lint/suspicious/noArrayIndexKey: a word's letters repeat, and their order never changes.
                key={letterIndex}
                letter={letter}
                startFrame={startFrame + letterIndex * SPARKLE_LETTER_STAGGER_FRAMES}
                settleFrames={sparkleFrames}
              />
            ))}
      </div>
      {pinned === null ? null : (
        <div
          style={{
            marginTop: 6,
            display: 'flex',
            alignItems: 'center',
            gap: 18,
            fontSize: pinnedFontSize,
            lineHeight: 1,
            opacity: Math.min(1, pinnedSettled * 3),
            scale: String(1 + (1 - pinnedSettled) * 0.08),
          }}
        >
          <MapPin size={pinnedFontSize * 1.05} />
          {pinned.toUpperCase()}
        </div>
      )}
    </div>
  )
}
