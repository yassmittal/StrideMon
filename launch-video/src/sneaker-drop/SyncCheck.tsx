import { Audio } from '@remotion/media'
import { AbsoluteFill, interpolate, staticFile, useCurrentFrame } from 'remotion'
import { colors, fontFamilies } from '../theme'
import { sneakerDropBeatFrames } from './beats'
import { type HitKind, hits } from './hits'
import { SNEAKER_DROP_MUSIC_FILE_NAME } from './music'

// The sync check (docs/sneaker-drop-video-prompt.md §2.3): one lane per hit kind, a block that
// flashes on each hit of hits.ts, over the film's music. Watch it with sound: every flash should
// sit on something you hear. It's a check, never part of the film.

const LANES: readonly { kind: HitKind; label: string }[] = [
  { kind: 'kick', label: 'KICK / 808' },
  { kind: 'snare', label: 'CLAP' },
  { kind: 'cowbell', label: 'COWBELL' },
  { kind: 'hat', label: 'HAT' },
  { kind: 'stop', label: 'STOP (SILENCE)' },
]
const FLASH_DECAY_FRAMES = 8
/** The strip of upcoming hits shows this many frames on either side of the playhead. */
const STRIP_HALF_WIDTH_FRAMES = 120

export function SneakerDropSyncCheck() {
  const frame = useCurrentFrame()
  const beat = frame / sneakerDropBeatFrames
  const bar = Math.floor(beat / 4)
  const sixteenthInBar = Math.floor(beat * 4) % 16

  return (
    <AbsoluteFill style={{ backgroundColor: colors.darkBackground, fontFamily: fontFamilies.mono }}>
      <Audio src={staticFile(`audio/${SNEAKER_DROP_MUSIC_FILE_NAME}`)} />
      <div
        style={{ position: 'absolute', left: 60, top: 60, color: colors.textOnDark, fontSize: 44 }}
      >
        {`BAR ${String(bar).padStart(2, '0')}  BEAT ${Math.floor(beat)}  16TH ${sixteenthInBar}`}
      </div>
      <div
        style={{
          position: 'absolute',
          left: 60,
          top: 120,
          color: colors.textOnDarkSecondary,
          fontSize: 30,
        }}
      >
        {`FRAME ${frame}`}
      </div>
      {LANES.map((lane, laneIndex) => {
        const lastHit = [...hits]
          .reverse()
          .find((hit) => hit.kind === lane.kind && hit.frame <= frame)
        const flash =
          lastHit === undefined
            ? 0
            : interpolate(frame - lastHit.frame, [0, FLASH_DECAY_FRAMES], [1, 0], {
                extrapolateLeft: 'clamp',
                extrapolateRight: 'clamp',
              }) * Math.max(0.35, lastHit.strength)
        const top = 200 + laneIndex * 225
        return (
          <div key={lane.kind}>
            <div
              style={{
                position: 'absolute',
                left: 60,
                top,
                width: 420,
                height: 180,
                backgroundColor: colors.highlight,
                opacity: flash,
              }}
            />
            <div
              style={{
                position: 'absolute',
                left: 60,
                top,
                width: 420,
                height: 180,
                border: `2px solid ${colors.overlayOnDark}`,
              }}
            />
            <div
              style={{
                position: 'absolute',
                left: 520,
                top: top + 70,
                color: colors.textOnDark,
                fontSize: 36,
              }}
            >
              {lane.label}
            </div>
            <HitStrip kind={lane.kind} frame={frame} top={top + 150} />
          </div>
        )
      })}
    </AbsoluteFill>
  )
}

/** The lane's hits as ticks scrolling past a playhead, so a late or early flash is easy to see. */
function HitStrip({ kind, frame, top }: { kind: HitKind; frame: number; top: number }) {
  const left = 520
  const width = 500
  const toLeft = (hitFrame: number) =>
    left + ((hitFrame - frame + STRIP_HALF_WIDTH_FRAMES) / (2 * STRIP_HALF_WIDTH_FRAMES)) * width
  return (
    <>
      <div
        style={{
          position: 'absolute',
          left: left + width / 2 - 1,
          top: top - 20,
          width: 2,
          height: 40,
          backgroundColor: colors.textOnDark,
        }}
      />
      {hits
        .filter(
          (hit) => hit.kind === kind && Math.abs(hit.frame - frame) <= STRIP_HALF_WIDTH_FRAMES,
        )
        .map((hit) => (
          <div
            key={hit.sixteenth}
            style={{
              position: 'absolute',
              left: toLeft(hit.frame) - 3,
              top: top - 10 - hit.strength * 10,
              width: 6,
              height: 20 + hit.strength * 20,
              backgroundColor: colors.highlight,
            }}
          />
        ))}
    </>
  )
}
