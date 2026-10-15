import { AbsoluteFill, interpolate, useCurrentFrame } from 'remotion'
import { colors, easings, readSectionBackground, type SectionTone } from '../../theme'
import { LineSneaker } from '../components/RegisteredSneaker'
import { useLacedSneakerMarkup } from '../components/sneaker-art-context'
import type { SneakerDropFormat } from '../layout'
import { sneakerDropLayouts } from '../layout'
import { readDriftScale, readPunchScale } from '../motion'
import { HERO_DESIGN_NUMBER } from '../sneakers'
import { lineArtTimeline } from '../timeline'

/**
 * Scenes 1 and 2 (beats 0–7). On black, the hero draws itself in white: the outline closes on
 * the intro's second cowbell, the panels draw through the bar, and the laces fill in on the
 * build's first. Every cowbell punches it. The build's clap cuts to the heel, beat 7's hit flips
 * to off-white with the drawing in ink, and the silence before the drop pulls it back, small, on
 * black.
 */
export function LineArtScene({ format }: { format: SneakerDropFormat }) {
  const frame = useCurrentFrame()
  const { lineArt } = sneakerDropLayouts[format]
  const markup = useLacedSneakerMarkup(HERO_DESIGN_NUMBER)
  const timeline = lineArtTimeline

  const isInhale = frame >= timeline.inhaleFrame
  const isSlam = frame >= timeline.slamFrame && !isInhale
  const isMacro = frame >= timeline.macroFrame && !isSlam && !isInhale
  const tone: SectionTone = isSlam ? 'light' : 'dark'
  const placement = isInhale ? lineArt.inhale : isMacro ? lineArt.macro : lineArt.full
  const shotStartFrame = isInhale
    ? timeline.inhaleFrame
    : isSlam
      ? timeline.slamFrame
      : isMacro
        ? timeline.macroFrame
        : timeline.outlineStartFrame

  const outlineProgress = interpolate(
    frame,
    [timeline.outlineStartFrame, timeline.outlineEndFrame],
    [0, 1],
    { extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: easings.standard },
  )
  const panelProgress = interpolate(
    frame,
    [timeline.panelStartFrame, timeline.panelEndFrame],
    [0, 1],
    { extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: easings.standard },
  )

  return (
    <AbsoluteFill style={{ backgroundColor: readSectionBackground(tone) }}>
      <AbsoluteFill style={{ scale: readDriftScale(frame - shotStartFrame) }}>
        <LineSneaker
          markup={markup}
          placement={placement}
          punchScale={readPunchScale(frame, timeline.punchFrames)}
          instanceId="line"
          color={tone === 'dark' ? colors.textOnDark : colors.textPrimary}
          outlineProgress={outlineProgress}
          panelProgress={panelProgress}
          areDetailsShown={frame >= timeline.detailsFrame}
        />
      </AbsoluteFill>
    </AbsoluteFill>
  )
}
