import { Video } from '@remotion/media'
import type { CSSProperties, ReactNode } from 'react'
import { Freeze, interpolate, staticFile, useCurrentFrame } from 'remotion'
import { readPhoneBezel, readPhoneRadius } from '../layouts'
import { colors, easings, fontFamilies, fontWeights, type SectionTone } from '../theme'
import { PITCH_FRAMES_PER_SECOND, type TimedLine } from './timeline'

// The pitch video's shared pieces: the phone with the submission reel, the text column beside
// it and the burned-in captions. Theme, fonts and the phone's proportions are the launch film's.

export const pitchLayout = {
  gutter: 140,
  textColumnWidth: 1040,
  labelTop: 150,
  headlineTop: 205,
  headlineFontSize: 80,
  labelFontSize: 24,
  phoneOuterWidth: 390,
  phoneLeft: 1340,
  phoneTop: 48,
  captionBottom: 64,
  captionFontSize: 40,
  captionMaxWidth: 1400,
} as const

// The reel is 720 × 1560 (website/scripts/cut-submission-reel.sh), copied to public/pitch/.
const REEL_ASPECT_RATIO = 1560 / 720
const REEL_FILE = 'pitch/reel.mp4'
const ENTER_FRAMES = 18

export function readPhoneOuterHeight(outerWidth: number): number {
  const bezel = readPhoneBezel(outerWidth)
  return Math.round((outerWidth - 2 * bezel) * REEL_ASPECT_RATIO + 2 * bezel)
}

/** 0 → 1 over the enter time from `startFrame`, on the film's out-expo. */
export function useEnterProgress(startFrame: number, durationFrames = ENTER_FRAMES): number {
  const frame = useCurrentFrame()
  return interpolate(frame, [startFrame, startFrame + durationFrames], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
    easing: easings.outExpo,
  })
}

/** Text that rises 24 px and fades in from `startFrame`, then stays. */
export function Enter({
  startFrame,
  children,
  style,
}: {
  startFrame: number
  children: ReactNode
  style?: CSSProperties
}) {
  const progress = useEnterProgress(startFrame)
  return (
    <div
      style={{
        position: 'absolute',
        opacity: progress,
        translate: `0px ${(1 - progress) * 24}px`,
        ...style,
      }}
    >
      {children}
    </div>
  )
}

export function MetaLabel({ text, tone }: { text: string; tone: SectionTone }) {
  return (
    <div
      style={{
        fontFamily: fontFamilies.satoshi,
        fontWeight: fontWeights.medium,
        fontSize: pitchLayout.labelFontSize,
        letterSpacing: '0.08em',
        textTransform: 'uppercase',
        color: tone === 'dark' ? colors.textOnDarkSecondary : colors.textSecondarySmall,
      }}
    >
      {text}
    </div>
  )
}

/**
 * A stretch of the reel shown from a scene line on. `clips` are [start, end] in reel seconds,
 * played back to back; a clip whose start equals its end is a held frame.
 */
export type PhoneSegment = { fromLine: number; clips: ReadonlyArray<readonly [number, number]> }

const SLOWEST_PLAYBACK_RATE = 0.6
const FASTEST_PLAYBACK_RATE = 2.5

/** The reel second to show `elapsedFrames` into a segment that lasts `spanFrames`. */
function readReelSeconds(segment: PhoneSegment, elapsedFrames: number, spanFrames: number): number {
  const clipsLengthSeconds = segment.clips.reduce((total, [start, end]) => total + end - start, 0)
  const spanSeconds = spanFrames / PITCH_FRAMES_PER_SECOND
  const playbackRate =
    clipsLengthSeconds === 0
      ? 0
      : Math.min(
          FASTEST_PLAYBACK_RATE,
          Math.max(SLOWEST_PLAYBACK_RATE, clipsLengthSeconds / spanSeconds),
        )
  let remainingSeconds = (elapsedFrames / PITCH_FRAMES_PER_SECOND) * playbackRate
  for (const [start, end] of segment.clips) {
    if (remainingSeconds <= end - start) return start + remainingSeconds
    remainingSeconds -= end - start
  }
  const lastClip = segment.clips[segment.clips.length - 1]
  return lastClip === undefined ? 0 : lastClip[1]
}

type PitchPhoneProps = {
  tone: SectionTone
  segments: readonly PhoneSegment[]
  sceneLines: readonly TimedLine[]
  sceneDurationInFrames: number
}

/** The website's plain phone frame with the submission reel, cut to the scene's lines. */
export function PitchPhone({ tone, segments, sceneLines, sceneDurationInFrames }: PitchPhoneProps) {
  const frame = useCurrentFrame()
  const outerWidth = pitchLayout.phoneOuterWidth
  const bezel = readPhoneBezel(outerWidth)
  const radius = readPhoneRadius(outerWidth)
  const segmentStartFrames = segments.map((segment, segmentIndex) =>
    segmentIndex === 0 ? 0 : (sceneLines[segment.fromLine]?.startFrame ?? 0),
  )
  let segmentIndex = 0
  segmentStartFrames.forEach((startFrame, index) => {
    if (frame >= startFrame) segmentIndex = index
  })
  const segment = segments[segmentIndex]
  const segmentStartFrame = segmentStartFrames[segmentIndex] ?? 0
  const segmentEndFrame = segmentStartFrames[segmentIndex + 1] ?? sceneDurationInFrames
  const reelSeconds =
    segment === undefined
      ? 0
      : readReelSeconds(segment, frame - segmentStartFrame, segmentEndFrame - segmentStartFrame)

  return (
    <div
      style={{
        position: 'absolute',
        left: pitchLayout.phoneLeft,
        top: pitchLayout.phoneTop,
        width: outerWidth,
        height: readPhoneOuterHeight(outerWidth),
        padding: bezel,
        borderRadius: radius,
        backgroundColor: colors.textPrimary,
        outline: tone === 'dark' ? `2px solid ${colors.overlayOnDark}` : 'none',
      }}
    >
      <div
        style={{
          position: 'relative',
          width: '100%',
          height: '100%',
          overflow: 'hidden',
          borderRadius: radius - bezel,
          backgroundColor: colors.darkBackground,
        }}
      >
        <Freeze frame={Math.round(reelSeconds * PITCH_FRAMES_PER_SECOND)}>
          <Video
            src={staticFile(REEL_FILE)}
            muted
            objectFit="cover"
            style={{ width: '100%', height: '100%' }}
          />
        </Freeze>
      </div>
    </div>
  )
}

/** The spoken line, burned in at the bottom: white on black, so it reads on both tones. */
export function Captions({ lines }: { lines: readonly TimedLine[] }) {
  const frame = useCurrentFrame()
  const line = lines.find(
    (candidate) => frame >= candidate.startFrame && frame < candidate.captionEndFrame,
  )
  if (line === undefined) return null
  const opacity = interpolate(
    frame,
    [line.startFrame, line.startFrame + 4, line.captionEndFrame - 4, line.captionEndFrame],
    [0, 1, 1, 0],
    { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' },
  )
  return (
    <div
      style={{
        position: 'absolute',
        left: 0,
        right: 0,
        bottom: pitchLayout.captionBottom,
        display: 'flex',
        justifyContent: 'center',
        opacity,
      }}
    >
      <div
        style={{
          maxWidth: pitchLayout.captionMaxWidth,
          padding: '14px 30px 16px',
          borderRadius: 14,
          backgroundColor: colors.darkBackground,
          outline: `2px solid ${colors.overlayOnDark}`,
          color: colors.textOnDark,
          fontFamily: fontFamilies.satoshi,
          fontWeight: fontWeights.regular,
          fontSize: pitchLayout.captionFontSize,
          lineHeight: 1.3,
          textAlign: 'center',
        }}
      >
        {line.text}
      </div>
    </div>
  )
}

/** One row of a list that lights up when its line is spoken: dim before, full after. */
export function ListRow({
  activeFrame,
  tone,
  index,
  title,
  detail,
  style,
}: {
  activeFrame: number
  tone: SectionTone
  index: string
  title: string
  detail?: string
  style?: CSSProperties
}) {
  const progress = useEnterProgress(activeFrame, 14)
  const isDark = tone === 'dark'
  return (
    <div
      style={{
        position: 'absolute',
        left: pitchLayout.gutter,
        display: 'flex',
        gap: 28,
        opacity: 0.22 + 0.78 * progress,
        ...style,
      }}
    >
      <div
        style={{
          fontFamily: fontFamilies.mono,
          fontSize: 30,
          lineHeight: '58px',
          color: isDark ? colors.highlight : colors.textSecondarySmall,
          width: 48,
        }}
      >
        {index}
      </div>
      <div>
        <div
          style={{
            fontFamily: fontFamilies.satoshi,
            fontSize: 50,
            lineHeight: 1.15,
            letterSpacing: '-0.01em',
            color: isDark ? colors.textOnDark : colors.textPrimary,
          }}
        >
          {title}
        </div>
        {detail !== undefined && (
          <div
            style={{
              marginTop: 6,
              fontFamily: fontFamilies.satoshi,
              fontSize: 32,
              lineHeight: 1.3,
              color: isDark ? colors.textOnDarkSecondary : colors.textSecondarySmall,
            }}
          >
            {detail}
          </div>
        )}
      </div>
    </div>
  )
}
