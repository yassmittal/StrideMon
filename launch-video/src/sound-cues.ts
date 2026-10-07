import { readSceneStartFrame, toSceneBeatFrame } from './beats'
import { DIGIT_ROLL_DURATION_FRAMES } from './components/RollingDigits'
import { earnSceneBeats } from './scenes/EarnScene'
import { readOwnerRollLandingFrame } from './scenes/OwnItScene'
import { readUpgradeSoundFrames } from './scenes/UpgradeScene'
import { readWalkReadoutChangeFrames } from './scenes/WalkScene'
import type { SoundEffectKind } from './soundtrack'

// Every sound effect in the film, in film frames. Each one comes from the same timing the picture
// uses (beats.ts and the scenes), so re-timing the grid moves the sounds with it.

export type SoundCue = { kind: SoundEffectKind; frame: number }

/** Ticks closer than this to the previous tick are dropped, so the 6× walk doesn't rattle. */
const MINIMUM_TICK_GAP_FRAMES = 6

export const soundCues: readonly SoundCue[] = buildSoundCues()

function buildSoundCues(): SoundCue[] {
  const walkStart = readSceneStartFrame('walk')
  const earnStart = readSceneStartFrame('earn')
  const upgradeStart = readSceneStartFrame('upgrade')
  const ownItStart = readSceneStartFrame('ownIt')
  const upgradeFrames = readUpgradeSoundFrames()

  const tickFrames = [
    // The walk's callouts, each time a number lands.
    ...readWalkReadoutChangeFrames().map(
      (changeFrame) => walkStart + changeFrame + DIGIT_ROLL_DURATION_FRAMES,
    ),
    // Durability 060 → 100, then each level's STRIDE per minute.
    upgradeStart + upgradeFrames.repairLandingFrame,
    ...upgradeFrames.levelLandingFrames.map((landingFrame) => upgradeStart + landingFrame),
    // The owner's address lands on wallet B.
    ownItStart + readOwnerRollLandingFrame(),
  ]

  const cues: SoundCue[] = [
    ...thinTicks(tickFrames).map((frame) => ({ kind: 'tick' as const, frame })),
    // Black ↔ off-white flips.
    ...[
      readSceneStartFrame('getSneaker'),
      walkStart,
      earnStart + toSceneBeatFrame('earn', earnSceneBeats.flip),
      upgradeStart,
      ownItStart,
    ].map((frame) => ({ kind: 'thump' as const, frame })),
    { kind: 'tap', frame: earnStart + toSceneBeatFrame('earn', earnSceneBeats.stopTap) },
    { kind: 'tone', frame: earnStart + toSceneBeatFrame('earn', earnSceneBeats.rewardLanding) },
  ]
  return cues.sort((first, second) => first.frame - second.frame)
}

function thinTicks(frames: readonly number[]): number[] {
  const keptFrames: number[] = []
  for (const frame of [...frames].sort((first, second) => first - second)) {
    const previousFrame = keptFrames[keptFrames.length - 1]
    if (previousFrame === undefined || frame - previousFrame >= MINIMUM_TICK_GAP_FRAMES) {
      keptFrames.push(frame)
    }
  }
  return keptFrames
}
