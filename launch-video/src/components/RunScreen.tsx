import { colors, fontFamilies, fontWeights } from '../theme'
import { ArrowIcon } from './ArrowIcon'
import { RollingDigits, type RollingDigitsStep } from './RollingDigits'

// A vector rebuild of the app's active run screen (apps/mobile/app/run/active.tsx and
// LiveRunStats.tsx) at screenshot 03's resolution, 1080 × 2340, so a macro crop stays sharp.
// Sizes are the app's tokens in points × 2.75 (the phone's density). Positions are calibrated
// against website/public/screenshots/03-active-run.png with a 50/50 overlay (scripts/check-run-screen-overlay.py).

export const RUN_SCREEN_WIDTH_PIXELS = 1080
export const RUN_SCREEN_HEIGHT_PIXELS = 2340
const POINTS_TO_PIXELS = 2.75

// Measured on screenshot 03: content spans x 44–1036 (15 pt plus the screen's own inset).
const pageGutter = 44
const contentWidth = RUN_SCREEN_WIDTH_PIXELS - 2 * pageGutter
const captionFontSize = 14 * POINTS_TO_PIXELS
const displayHugeFontSize = 76 * POINTS_TO_PIXELS
const titleFontSize = 25 * POINTS_TO_PIXELS
const recordingDotSize = 7 * POINTS_TO_PIXELS
const crossMarkSize = 14 * POINTS_TO_PIXELS
const crossMarkStrokeWidth = 1 * POINTS_TO_PIXELS
const progressTrackHeight = 4 * POINTS_TO_PIXELS
const pillHeight = 45 * POINTS_TO_PIXELS
const iconSize = 18 * POINTS_TO_PIXELS
const iconGap = 10 * POINTS_TO_PIXELS

/** The top of each line box, in screen pixels. */
const elementTops = {
  header: 128,
  timeLabel: 265,
  timer: 346,
  distanceLabel: 610,
  distance: 690,
  speed: 953,
  energy: 1062,
  energyTrack: 1144,
  rewardMarksTop: 1212,
  reward: 1301,
  rewardMarksBottom: 1415,
  estimateNote: 1509,
  gpsStatus: 1673,
  stopPill: 1884,
  gestureBar: 2304,
} as const

export type RunScreenState = {
  timerSteps: readonly RollingDigitsStep[]
  distanceSteps: readonly RollingDigitsStep[]
  speedText: string
  energyLeft: number
  energyAtStart: number
  estimatedRewardText: string
  estimateNoteLines: readonly string[]
  /** The GPS line under the estimate. Left out where its count isn't known (the ramped walk). */
  gpsStatus?: string
  metaItems: readonly string[]
  stopLabel: string
}

export function RunScreen({ state }: { state: RunScreenState }) {
  return (
    <div
      style={{
        position: 'absolute',
        width: RUN_SCREEN_WIDTH_PIXELS,
        height: RUN_SCREEN_HEIGHT_PIXELS,
        backgroundColor: colors.darkBackground,
        color: colors.textOnDark,
        fontFamily: fontFamilies.satoshi,
        fontWeight: fontWeights.regular,
      }}
    >
      <Header metaItems={state.metaItems} />
      <CaptionText top={elementTops.timeLabel} text="TIME" />
      <RollingDigits
        steps={state.timerSteps}
        fontSize={displayHugeFontSize}
        color={colors.textOnDark}
        style={{ left: pageGutter, top: elementTops.timer }}
      />
      <CaptionText top={elementTops.distanceLabel} text="DISTANCE" />
      <RollingDigits
        steps={state.distanceSteps}
        fontSize={displayHugeFontSize}
        color={colors.textOnDark}
        style={{ left: pageGutter, top: elementTops.distance }}
      />
      <CaptionText top={elementTops.speed} text={`SPEED  •  ${state.speedText}`} />
      <EnergyBar energyLeft={state.energyLeft} energyAtStart={state.energyAtStart} />
      <EstimatedReward rewardText={state.estimatedRewardText} />
      {state.estimateNoteLines.map((line, lineIndex) => (
        <CaptionText
          key={line}
          top={elementTops.estimateNote + lineIndex * captionFontSize * 1.4}
          text={line}
          color={colors.textOnDarkMuted}
          isUppercase={false}
        />
      ))}
      {state.gpsStatus !== undefined && (
        <CaptionText
          top={elementTops.gpsStatus}
          text={state.gpsStatus}
          color={colors.textOnDarkMuted}
          isUppercase={false}
        />
      )}
      <StopPill label={state.stopLabel} />
      <div
        style={{
          position: 'absolute',
          left: 340,
          top: elementTops.gestureBar,
          width: 397,
          height: 11,
          borderRadius: 6,
          backgroundColor: colors.textOnDark,
        }}
      />
    </div>
  )
}

function Header({ metaItems }: { metaItems: readonly string[] }) {
  return (
    <div
      style={{
        position: 'absolute',
        left: pageGutter,
        top: elementTops.header,
        height: captionFontSize * 1.4,
        display: 'flex',
        alignItems: 'center',
        gap: 10 * POINTS_TO_PIXELS,
      }}
    >
      <div
        style={{
          width: recordingDotSize,
          height: recordingDotSize,
          borderRadius: recordingDotSize,
          backgroundColor: colors.highlight,
        }}
      />
      <div
        style={{
          fontSize: captionFontSize,
          lineHeight: 1.4,
          textTransform: 'uppercase',
          whiteSpace: 'pre',
        }}
      >
        {metaItems.join('  •  ')}
      </div>
    </div>
  )
}

function CaptionText({
  top,
  text,
  color = colors.textOnDark,
  isUppercase = true,
}: {
  top: number
  text: string
  color?: string
  isUppercase?: boolean
}) {
  return (
    <div
      style={{
        position: 'absolute',
        left: pageGutter,
        top,
        fontSize: captionFontSize,
        lineHeight: 1.4,
        color,
        textTransform: isUppercase ? 'uppercase' : 'none',
        whiteSpace: 'pre',
      }}
    >
      {text}
    </div>
  )
}

function EnergyBar({ energyLeft, energyAtStart }: { energyLeft: number; energyAtStart: number }) {
  return (
    <>
      <div
        style={{
          position: 'absolute',
          left: pageGutter,
          top: elementTops.energy,
          width: contentWidth,
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'baseline',
          fontSize: captionFontSize,
          lineHeight: 1.4,
        }}
      >
        <span>ENERGY LEFT (ESTIMATED)</span>
        <span style={{ fontFamily: fontFamilies.mono }}>{`${energyLeft} / ${energyAtStart}`}</span>
      </div>
      <div
        style={{
          position: 'absolute',
          left: pageGutter,
          top: elementTops.energyTrack,
          width: contentWidth,
          height: progressTrackHeight,
          borderRadius: 3 * POINTS_TO_PIXELS,
          backgroundColor: colors.darkTrack,
          overflow: 'hidden',
        }}
      >
        <div
          style={{
            width: `${(energyLeft / energyAtStart) * 100}%`,
            height: '100%',
            borderRadius: 3 * POINTS_TO_PIXELS,
            backgroundColor: colors.highlight,
          }}
        />
      </div>
    </>
  )
}

function EstimatedReward({ rewardText }: { rewardText: string }) {
  return (
    <>
      <MarkRow top={elementTops.rewardMarksTop} caption="ESTIMATED REWARD" />
      <div
        style={{
          position: 'absolute',
          left: 0,
          top: elementTops.reward,
          width: RUN_SCREEN_WIDTH_PIXELS,
          textAlign: 'center',
          fontFamily: fontFamilies.mono,
          fontSize: titleFontSize,
          lineHeight: 1,
          whiteSpace: 'pre',
        }}
      >
        {rewardText}
      </div>
      <MarkRow top={elementTops.rewardMarksBottom} />
    </>
  )
}

function MarkRow({ top, caption }: { top: number; caption?: string }) {
  return (
    <div
      style={{
        position: 'absolute',
        left: pageGutter,
        top,
        width: contentWidth,
        height: crossMarkSize,
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
      }}
    >
      <CrossMark />
      {caption !== undefined && (
        <span
          style={{ fontWeight: fontWeights.medium, fontSize: captionFontSize, lineHeight: 1.15 }}
        >
          {caption}
        </span>
      )}
      <CrossMark />
    </div>
  )
}

function CrossMark() {
  const strokeOffset = (crossMarkSize - crossMarkStrokeWidth) / 2
  return (
    <div style={{ position: 'relative', width: crossMarkSize, height: crossMarkSize }}>
      <div
        style={{
          position: 'absolute',
          top: strokeOffset,
          width: crossMarkSize,
          height: crossMarkStrokeWidth,
          backgroundColor: colors.crossMark,
        }}
      />
      <div
        style={{
          position: 'absolute',
          left: strokeOffset,
          width: crossMarkStrokeWidth,
          height: crossMarkSize,
          backgroundColor: colors.crossMark,
        }}
      />
    </div>
  )
}

function StopPill({ label }: { label: string }) {
  return (
    <div
      style={{
        position: 'absolute',
        left: pageGutter,
        top: elementTops.stopPill,
        width: contentWidth,
        height: pillHeight,
        borderRadius: pillHeight,
        backgroundColor: colors.primary,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: iconGap,
        fontWeight: fontWeights.medium,
        fontSize: captionFontSize,
        textTransform: 'uppercase',
      }}
    >
      {label}
      <ArrowIcon size={iconSize} color={colors.textOnDark} />
    </div>
  )
}
