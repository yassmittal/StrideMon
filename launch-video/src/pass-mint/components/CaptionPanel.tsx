import { interpolate, useCurrentFrame } from 'remotion'
import { MaskedRise } from '../../components/MaskedRise'
import { colors, easings, fontFamilies, fontWeights, letterSpacings } from '../../theme'

// The film's one caption: a dark panel in the bottom-left corner, over the recording. Its title
// rises word by word; its subtitle follows. Used by the hook, each step and the reveal.

export const captionLayout = {
  left: 64,
  bottom: 64,
  paddingX: 40,
  paddingY: 30,
  radius: 28,
  numberFontSize: 26,
  titleFontSize: 64,
  hookTitleFontSize: 84,
  subtitleFontSize: 32,
} as const

const SATOSHI_BOLD = 700
const ENTER_FRAMES = 16
const EXIT_FRAMES = 8
const SUBTITLE_DELAY_FRAMES = 12

type CaptionPanelProps = {
  startFrame: number
  /** The panel dips out over its last frames, ending here. */
  endFrame: number
  title: string
  subtitle: string
  /** The step's "01"…"04" in lime mono, when it's a step. */
  number?: string
  isLarge?: boolean
  /** When the subtitle comes in, if not right after the title. */
  subtitleFrame?: number
}

export function CaptionPanel({
  startFrame,
  endFrame,
  title,
  subtitle,
  number,
  isLarge = false,
  subtitleFrame = startFrame + SUBTITLE_DELAY_FRAMES,
}: CaptionPanelProps) {
  const frame = useCurrentFrame()
  if (frame < startFrame || frame >= endFrame) return null
  const enterProgress = interpolate(frame, [startFrame, startFrame + ENTER_FRAMES], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
    easing: easings.outExpo,
  })
  const exitProgress = interpolate(frame, [endFrame - EXIT_FRAMES, endFrame], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
    easing: easings.standard,
  })
  const subtitleProgress = interpolate(
    frame,
    [subtitleFrame, subtitleFrame + ENTER_FRAMES],
    [0, 1],
    {
      extrapolateLeft: 'clamp',
      extrapolateRight: 'clamp',
      easing: easings.outExpo,
    },
  )
  const titleFontSize = isLarge ? captionLayout.hookTitleFontSize : captionLayout.titleFontSize

  return (
    <div
      style={{
        position: 'absolute',
        left: captionLayout.left,
        bottom: captionLayout.bottom,
        padding: `${captionLayout.paddingY}px ${captionLayout.paddingX}px`,
        borderRadius: captionLayout.radius,
        backgroundColor: 'rgba(20, 21, 21, 0.94)',
        boxShadow: '0 24px 60px rgba(0, 0, 0, 0.35)',
        opacity: enterProgress * (1 - exitProgress),
        translate: `0px ${(1 - enterProgress) * 40 + exitProgress * 12}px`,
        display: 'flex',
        flexDirection: 'column',
        gap: 14,
      }}
    >
      {number === undefined ? null : (
        <div
          style={{
            fontFamily: fontFamilies.mono,
            fontWeight: fontWeights.medium,
            fontSize: captionLayout.numberFontSize,
            letterSpacing: '0.08em',
            color: colors.highlight,
          }}
        >
          STEP {number} / 04
        </div>
      )}
      {/* MaskedRise is absolutely placed; this sizer gives the panel the title's width and height. */}
      <div style={{ position: 'relative' }}>
        <div
          style={{
            visibility: 'hidden',
            fontFamily: fontFamilies.satoshi,
            fontWeight: SATOSHI_BOLD,
            fontSize: titleFontSize,
            letterSpacing: letterSpacings.display,
            lineHeight: 1.05,
            whiteSpace: 'nowrap',
          }}
        >
          {title}
        </div>
        <MaskedRise
          lines={[title]}
          startFrame={startFrame}
          fontSize={titleFontSize}
          color={colors.textOnDark}
          fontWeight={SATOSHI_BOLD}
          letterSpacing={letterSpacings.display}
          lineHeight={1.05}
          style={{ left: 0, top: 0 }}
        />
      </div>
      <div
        style={{
          fontFamily: fontFamilies.satoshi,
          fontWeight: fontWeights.regular,
          fontSize: captionLayout.subtitleFontSize,
          color: 'rgba(255, 255, 255, 0.72)',
          opacity: subtitleProgress,
          translate: `0px ${(1 - subtitleProgress) * 14}px`,
          whiteSpace: 'nowrap',
        }}
      >
        {subtitle}
      </div>
    </div>
  )
}
