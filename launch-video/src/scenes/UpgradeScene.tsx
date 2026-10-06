import { AbsoluteFill, interpolate, Sequence, useCurrentFrame, useVideoConfig } from 'remotion'
import { readSceneDurationInFrames, toSceneBeatFrame } from '../beats'
import { ClipRise } from '../components/ClipRise'
import { Drift } from '../components/Drift'
import { CroppedFootage } from '../components/Footage'
import { MaskedRise } from '../components/MaskedRise'
import { DIGIT_ROLL_DURATION_FRAMES, RollingDigits } from '../components/RollingDigits'
import { SneakerArt, toSneakerArtFileName, useSneakerArtMarkups } from '../components/SneakerArt'
import { upgradeContent, upgradeLevels } from '../content'
import { filmLayouts } from '../layouts'
import { colors, easings, letterSpacings } from '../theme'
import type { SceneProps } from './scene-props'

// metamask-confirm.mp4 starts at video2 397.0 s; Confirm is tapped at about 403.4 s (FOOTAGE.md M9),
// file frame 384. The insert ends 6 frames after the tap.
const METAMASK_TAP_FILE_FRAME = 384
const FRAMES_SHOWN_AFTER_TAP = 6
const CALLOUT_VALUE_OFFSET_PIXELS = 48
const STACKED_CALLOUT_GAP_PIXELS = 200

const REPAIR_FILE_NAMES = Array.from({ length: 41 }, (_unused, offset) =>
  toSneakerArtFileName({ level: 1, durability: upgradeContent.repairDurabilityFrom + offset }),
)
const LEVEL_FILE_NAMES = upgradeLevels.map(({ level }) =>
  toSneakerArtFileName({ level, durability: 100 }),
)
const ART_FILE_NAMES = [...REPAIR_FILE_NAMES, ...LEVEL_FILE_NAMES]
const UPGRADE_CALLOUTS = [
  { label: upgradeContent.efficiencyLabel, values: upgradeLevels.map((entry) => entry.efficiency) },
  {
    label: upgradeContent.solePerMinuteLabel,
    values: upgradeLevels.map((entry) => entry.solePerMinute),
  },
]

/**
 * Scene 4 (0:15–0:24), black. The contract's own Sneaker art draws in. Durability climbs
 * 060 → 100 through the renderer's real output, the player's wallet signs, and the Sneaker
 * levels up 01 → 05, one level per beat, a new lime speed line each time.
 */
/** The upgrade scene's grid, in beats from its first frame. */
const upgradeSceneBeats = {
  repairStart: 2,
  repairEnd: 5,
  insertStart: 6,
  insertEnd: 8,
  levelUps: [9, 10, 11, 12],
  headline: 13,
} as const

/** Scene frames the soundtrack hits: the repair landing, the Confirm tap and each level's landing. */
export function readUpgradeSoundFrames(): {
  repairLandingFrame: number
  confirmTapFrame: number
  levelLandingFrames: number[]
} {
  return {
    repairLandingFrame: toSceneBeatFrame('upgrade', upgradeSceneBeats.repairEnd),
    confirmTapFrame:
      toSceneBeatFrame('upgrade', upgradeSceneBeats.insertEnd) - FRAMES_SHOWN_AFTER_TAP,
    levelLandingFrames: upgradeSceneBeats.levelUps.map(
      (beatIndex) => toSceneBeatFrame('upgrade', beatIndex) + DIGIT_ROLL_DURATION_FRAMES,
    ),
  }
}

export function UpgradeScene({ format }: SceneProps) {
  const frame = useCurrentFrame()
  const { fps } = useVideoConfig()
  const layout = filmLayouts[format]
  const markups = useSneakerArtMarkups(ART_FILE_NAMES)
  const durationInFrames = readSceneDurationInFrames('upgrade')
  const repairStartFrame = toSceneBeatFrame('upgrade', upgradeSceneBeats.repairStart)
  const repairEndFrame = toSceneBeatFrame('upgrade', upgradeSceneBeats.repairEnd)
  const insertStartFrame = toSceneBeatFrame('upgrade', upgradeSceneBeats.insertStart)
  const insertEndFrame = toSceneBeatFrame('upgrade', upgradeSceneBeats.insertEnd)
  const levelUpFrames = upgradeSceneBeats.levelUps.map((beatIndex) =>
    toSceneBeatFrame('upgrade', beatIndex),
  )
  const firstLevelUpFrame = levelUpFrames[0] ?? 0
  const levelCount = 1 + levelUpFrames.filter((levelUpFrame) => frame >= levelUpFrame).length
  const durability = Math.round(
    interpolate(
      frame,
      [repairStartFrame, repairEndFrame],
      [upgradeContent.repairDurabilityFrom, upgradeContent.repairDurabilityTo],
      { extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: easings.emphasized },
    ),
  )
  const artFileName = toSneakerArtFileName({
    level: levelCount,
    durability: levelCount === 1 ? durability : 100,
  })
  const markup = markups?.get(artFileName)
  const isMetamaskInsertShown = frame >= insertStartFrame && frame < insertEndFrame
  const { art, callouts } = layout.upgrade
  const isStacked = callouts.columnGap === 0

  return (
    <AbsoluteFill style={{ backgroundColor: colors.darkBackground }}>
      <Drift durationInFrames={durationInFrames}>
        {!isMetamaskInsertShown && markup !== undefined && (
          <div style={{ position: 'absolute', left: art.left, top: art.top }}>
            <SneakerArt
              markup={markup}
              size={art.width}
              drawInStartFrame={0}
              {...(levelCount > 1 ? { newSpeedLineStartFrame: levelUpFrames[levelCount - 2] } : {})}
              borderRadius={20}
            />
          </div>
        )}
        <Sequence
          name="MetaMask confirm"
          from={insertStartFrame}
          durationInFrames={insertEndFrame - insertStartFrame}
          premountFor={fps}
        >
          <CroppedFootage
            fileName="metamask-confirm.mp4"
            crop={layout.upgrade.metamaskCrop}
            trimBeforeFrames={
              METAMASK_TAP_FILE_FRAME + FRAMES_SHOWN_AFTER_TAP - (insertEndFrame - insertStartFrame)
            }
          />
        </Sequence>
        {!isMetamaskInsertShown &&
          frame >= insertEndFrame &&
          UPGRADE_CALLOUTS.map((callout, calloutIndex) => {
            const left = callouts.origin.left + (isStacked ? 0 : calloutIndex * callouts.columnGap)
            const top =
              callouts.origin.top + (isStacked ? calloutIndex * STACKED_CALLOUT_GAP_PIXELS : 0)
            const startFrame = insertEndFrame + calloutIndex * 4
            return (
              <div key={callout.label}>
                <MaskedRise
                  lines={[callout.label.toUpperCase()]}
                  startFrame={startFrame}
                  fontSize={layout.metaFontSize}
                  fontWeight={500}
                  color={colors.textOnDarkSecondary}
                  style={{ left, top }}
                />
                <ClipRise
                  startFrame={startFrame + 4}
                  style={{
                    left,
                    top: top + CALLOUT_VALUE_OFFSET_PIXELS,
                    width: 280,
                    height: layout.monoCalloutFontSize * 1.1,
                  }}
                >
                  <RollingDigits
                    steps={callout.values.map((value, levelIndex) => ({
                      startFrame: levelIndex === 0 ? 0 : (levelUpFrames[levelIndex - 1] ?? 0),
                      text: String(value),
                    }))}
                    fontSize={layout.monoCalloutFontSize}
                    color={colors.textOnDark}
                  />
                </ClipRise>
              </div>
            )
          })}
        <MaskedRise
          lines={[upgradeContent.repairCaption]}
          startFrame={repairStartFrame}
          exitFrame={repairEndFrame}
          fontSize={layout.captionFontSize}
          color={colors.textOnDark}
          style={{ left: layout.upgrade.caption.left, top: layout.upgrade.caption.top }}
        />
        <MaskedRise
          lines={[upgradeContent.signCaption]}
          startFrame={insertStartFrame - 12}
          exitFrame={firstLevelUpFrame - 12}
          fontSize={layout.captionFontSize}
          color={colors.textOnDark}
          style={{ left: layout.upgrade.caption.left, top: layout.upgrade.caption.top }}
        />
        <MaskedRise
          lines={[upgradeContent.levelCaption]}
          startFrame={firstLevelUpFrame}
          fontSize={layout.captionFontSize}
          color={colors.textOnDark}
          style={{ left: layout.upgrade.caption.left, top: layout.upgrade.caption.top }}
        />
        <MaskedRise
          lines={[upgradeContent.headline]}
          startFrame={toSceneBeatFrame('upgrade', upgradeSceneBeats.headline)}
          fontSize={layout.headlineFontSize}
          color={colors.textOnDark}
          letterSpacing={letterSpacings.display}
          isOpticallyPulledLeft
          style={{
            left: layout.gutter,
            top: layout.headlineBaseline - layout.headlineFontSize * 0.86,
          }}
        />
      </Drift>
    </AbsoluteFill>
  )
}
