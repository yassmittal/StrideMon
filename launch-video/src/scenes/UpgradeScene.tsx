import { AbsoluteFill, interpolate, useCurrentFrame } from 'remotion'
import { readSceneDurationInFrames, toSceneBeatFrame } from '../beats'
import { ClipRise } from '../components/ClipRise'
import { Drift } from '../components/Drift'
import { MaskedRise } from '../components/MaskedRise'
import { DIGIT_ROLL_DURATION_FRAMES, RollingDigits } from '../components/RollingDigits'
import { SneakerArt, toSneakerArtFileName, useSneakerArtMarkups } from '../components/SneakerArt'
import { StepText } from '../components/StepText'
import { upgradeContent, upgradeLevels } from '../content'
import { filmLayouts } from '../layouts'
import { colors, easings } from '../theme'
import type { SceneProps } from './scene-props'

const CALLOUT_VALUE_OFFSET_PIXELS = 48
const ART_RADIUS_PIXELS = 20

const REPAIR_FILE_NAMES = Array.from(
  { length: upgradeContent.repairDurabilityTo - upgradeContent.repairDurabilityFrom + 1 },
  (_unused, offset) =>
    toSneakerArtFileName({ level: 1, durability: upgradeContent.repairDurabilityFrom + offset }),
)
const LEVEL_FILE_NAMES = upgradeLevels.map(({ level }) =>
  toSneakerArtFileName({ level, durability: 100 }),
)
const ART_FILE_NAMES = [...REPAIR_FILE_NAMES, ...LEVEL_FILE_NAMES]

/** The upgrade scene's grid, in beats from its first frame. */
const upgradeSceneBeats = {
  repairStart: 2,
  repairEnd: 4,
  calloutIn: 5,
  levelUps: [6, 7, 8, 9],
} as const

/** Scene frames the soundtrack hits: the repair landing and each level's landing. */
export function readUpgradeSoundFrames(): {
  repairLandingFrame: number
  levelLandingFrames: number[]
} {
  return {
    repairLandingFrame: toSceneBeatFrame('upgrade', upgradeSceneBeats.repairEnd),
    levelLandingFrames: upgradeSceneBeats.levelUps.map(
      (beatIndex) => toSceneBeatFrame('upgrade', beatIndex) + DIGIT_ROLL_DURATION_FRAMES,
    ),
  }
}

/**
 * Scene 5 (0:23–0:31), black. Step 4. The contract's own art: durability climbs 060 → 100 through
 * the renderer's real output, then the Sneaker levels up 01 → 05, one level per beat, each adding
 * a lime speed line, while STRIDE per minute rolls 5 → 9.
 */
export function UpgradeScene({ format }: SceneProps) {
  const frame = useCurrentFrame()
  const layout = filmLayouts[format]
  const { art, callout } = layout.upgrade
  const markups = useSneakerArtMarkups(ART_FILE_NAMES)
  const levelUpFrames = upgradeSceneBeats.levelUps.map((beatIndex) =>
    toSceneBeatFrame('upgrade', beatIndex),
  )
  const levelCount = 1 + levelUpFrames.filter((levelUpFrame) => frame >= levelUpFrame).length
  const durability = Math.round(
    interpolate(
      frame,
      [
        toSceneBeatFrame('upgrade', upgradeSceneBeats.repairStart),
        toSceneBeatFrame('upgrade', upgradeSceneBeats.repairEnd),
      ],
      [upgradeContent.repairDurabilityFrom, upgradeContent.repairDurabilityTo],
      { extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: easings.emphasized },
    ),
  )
  const markup = markups?.get(
    toSneakerArtFileName({ level: levelCount, durability: levelCount === 1 ? durability : 100 }),
  )
  const calloutStartFrame = toSceneBeatFrame('upgrade', upgradeSceneBeats.calloutIn)

  return (
    <AbsoluteFill style={{ backgroundColor: colors.darkBackground }}>
      <Drift durationInFrames={readSceneDurationInFrames('upgrade')}>
        {markup !== undefined && (
          <div style={{ position: 'absolute', left: art.left, top: art.top }}>
            <SneakerArt
              markup={markup}
              size={art.width}
              drawInStartFrame={0}
              {...(levelCount > 1 ? { newSpeedLineStartFrame: levelUpFrames[levelCount - 2] } : {})}
              borderRadius={ART_RADIUS_PIXELS}
            />
          </div>
        )}
        <MaskedRise
          lines={[upgradeContent.tokensPerMinuteLabel.toUpperCase()]}
          startFrame={calloutStartFrame}
          fontSize={layout.metaFontSize}
          fontWeight={500}
          color={colors.textOnDarkSecondary}
          style={{ left: callout.left, top: callout.top }}
        />
        <ClipRise
          startFrame={calloutStartFrame + 4}
          style={{
            left: callout.left,
            top: callout.top + CALLOUT_VALUE_OFFSET_PIXELS,
            width: layout.monoCalloutFontSize * 1.5,
            height: layout.monoCalloutFontSize * 1.1,
          }}
        >
          <RollingDigits
            steps={upgradeLevels.map((entry, levelIndex) => ({
              startFrame: levelIndex === 0 ? 0 : (levelUpFrames[levelIndex - 1] ?? 0),
              text: String(entry.tokensPerMinute),
            }))}
            fontSize={layout.monoCalloutFontSize}
            color={colors.textOnDark}
          />
        </ClipRise>
        <StepText
          copy={upgradeContent}
          layout={layout.stepText}
          metaFontSize={layout.metaFontSize}
          color={colors.textOnDark}
          labelColor={colors.textOnDarkSecondary}
          labelStartFrame={0}
          headlineStartFrame={toSceneBeatFrame('upgrade', 1)}
          sentenceStartFrame={toSceneBeatFrame('upgrade', 2)}
        />
      </Drift>
    </AbsoluteFill>
  )
}
