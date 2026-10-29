import { AbsoluteFill, interpolate, Sequence, useCurrentFrame } from 'remotion'
import { colors, easings, fontFamilies, fontWeights } from '../theme'
import { CaptionPanel } from './components/CaptionPanel'
import { PassMintEndCard } from './components/PassMintEndCard'
import { PassMintSoundtrack } from './components/PassMintSoundtrack'
import { RecordingShot } from './components/RecordingShot'
import { StepTracker } from './components/StepTracker'
import { emailCutLabel, hookLines, revealLines, rewindLabel, stepContent } from './content'
import {
  emailCutFrame,
  endCardTimeline,
  hookFlipFrame,
  hookTimeline,
  passMintStepOrder,
  revealCaptionFrame,
  revealFlipFrame,
  revealTimeline,
  rewindTimeline,
  stepTimelines,
} from './timeline'

// The Pass mint film: Yash's desktop recording of minting Founding Pass #0039, cut so the payoff
// comes first. The flip into the card and the promise ("This Sneaker exists once."), a rewind to
// the start, then the four steps with a tracker across the top, the same flip again, and the end
// card. 1920 × 1080, 60 fps. Every frame is named in timeline.ts, every word in content.ts.

export type PassMintFilmProps = {
  /** False for a silent picture (the render's picture pass). */
  hasSound: boolean
}

export const defaultPassMintProps: PassMintFilmProps = { hasSound: true }

/** The flash on each flip: white, gone in a few frames. */
const FLASH_FRAMES = 8

export function PassMintFilm({ hasSound }: PassMintFilmProps) {
  const frame = useCurrentFrame()
  const flashOpacity = Math.max(
    readFlashOpacity(frame, hookFlipFrame),
    readFlashOpacity(frame, revealFlipFrame),
    readFlashOpacity(frame, rewindTimeline.endFrame),
  )

  return (
    <AbsoluteFill style={{ backgroundColor: colors.darkBackground }}>
      <Sequence name="Recording" durationInFrames={revealTimeline.endFrame} layout="none">
        <RecordingShot />
      </Sequence>

      <CaptionPanel
        startFrame={0}
        endFrame={hookTimeline.endFrame}
        title={hookLines.title}
        subtitle={hookLines.subtitle}
        subtitleFrame={hookTimeline.secondLineFrame}
        isLarge
      />
      <RewindChip />

      <StepTracker startFrame={stepTimelines.pick.startFrame} endFrame={revealCaptionFrame} />
      {passMintStepOrder.map((stepName) => {
        const { number, title, subtitle } = stepContent[stepName]
        const { startFrame, endFrame } = stepTimelines[stepName]
        return (
          <CaptionPanel
            key={stepName}
            startFrame={startFrame}
            endFrame={endFrame}
            title={title}
            subtitle={subtitle}
            number={number}
          />
        )
      })}
      <EmailCutChip />

      <CaptionPanel
        startFrame={revealCaptionFrame}
        endFrame={revealTimeline.endFrame}
        title={revealLines.title}
        subtitle={revealLines.subtitle}
      />

      {/* Not a Sequence: the end card reads the film's own frames (timeline.ts). */}
      {frame >= endCardTimeline.startFrame ? <PassMintEndCard /> : null}

      <AbsoluteFill
        style={{ backgroundColor: colors.textOnDark, opacity: flashOpacity, pointerEvents: 'none' }}
      />
      {hasSound ? <PassMintSoundtrack /> : null}
    </AbsoluteFill>
  )
}

function readFlashOpacity(frame: number, flashFrame: number): number {
  return (
    interpolate(frame, [flashFrame, flashFrame + FLASH_FRAMES], [0.55, 0], {
      extrapolateLeft: 'clamp',
      extrapolateRight: 'clamp',
    }) * (frame >= flashFrame ? 1 : 0)
  )
}

/** "◀◀ Rewind", in the middle, while the tape winds back. */
function RewindChip() {
  const frame = useCurrentFrame()
  const { startFrame, endFrame } = rewindTimeline
  if (frame < startFrame || frame >= endFrame) return null
  const blink = Math.floor((frame - startFrame) / 6) % 2 === 0 ? 1 : 0.55
  return (
    <AbsoluteFill style={{ alignItems: 'center', justifyContent: 'center' }}>
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 22,
          padding: '22px 44px',
          borderRadius: 999,
          backgroundColor: 'rgba(20, 21, 21, 0.94)',
          fontFamily: fontFamilies.mono,
          fontWeight: fontWeights.medium,
          fontSize: 44,
          letterSpacing: '0.08em',
          textTransform: 'uppercase',
          color: colors.highlight,
          opacity: blink,
        }}
      >
        <span>◀◀</span>
        <span>{rewindLabel}</span>
      </div>
    </AbsoluteFill>
  )
}

/** "Code from your inbox", over the jump that skips the wait for the code. */
function EmailCutChip() {
  const frame = useCurrentFrame()
  const startFrame = emailCutFrame - 6
  const endFrame = emailCutFrame + 50
  if (frame < startFrame || frame >= endFrame) return null
  const progress = interpolate(
    frame,
    [startFrame, startFrame + 12, endFrame - 10, endFrame],
    [0, 1, 1, 0],
    {
      extrapolateLeft: 'clamp',
      extrapolateRight: 'clamp',
      easing: easings.standard,
    },
  )
  return (
    <div
      style={{
        position: 'absolute',
        right: 64,
        bottom: 64,
        padding: '18px 32px',
        borderRadius: 999,
        backgroundColor: colors.highlight,
        fontFamily: fontFamilies.satoshi,
        fontWeight: fontWeights.medium,
        fontSize: 32,
        color: colors.textPrimary,
        opacity: progress,
        translate: `0px ${(1 - progress) * 20}px`,
      }}
    >
      {emailCutLabel}
    </div>
  )
}
