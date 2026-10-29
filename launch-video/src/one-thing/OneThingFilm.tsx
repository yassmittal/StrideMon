import { Audio, Video } from '@remotion/media'
import { AbsoluteFill, Sequence, staticFile, useCurrentFrame } from 'remotion'
import { useSvgMarkups } from '../components/svg-markup'
import { EndCard } from './components/EndCard'
import { RevealShot } from './components/RevealShot'
import { endCardTimeline, HOOK_END_FRAME, readRevealShotAtFrame } from './timeline'

// The One thing film (docs/one-thing-video-prompt.md): the reference's "Men only want one thing"
// ad with a StrideMon Sneaker in place of its land. Its hook plays as it is ("…it's not money, it's
// not power, it's not love,"), then on its own cut the answer is #0137 in its gold captions:
// "STRIDEMON", "SNEAKER", "FREE 📍 MONAD TESTNET". Then the lockup and the waitlist line. To the
// reference's own sound: the hook's voice, then its music without the second voice, looped under
// the end card. 1080 × 1920, 30 fps, 489 frames.

/**
 * The hook's voice, then the reference's music with its second voice taken out (demucs), looped
 * under the end card (Yash's ask, 2026-10-26; unlicensed, so not for Instagram: CREDITS.md).
 * scripts/copy-one-thing-media.sh makes it.
 */
export const ONE_THING_SOUNDTRACK_FILE_NAME = 'one-thing-soundtrack.wav'

export type OneThingFilmProps = {
  /** In public/audio/; null for a silent picture. */
  soundtrackFileName: string | null
}

export const defaultOneThingProps: OneThingFilmProps = {
  soundtrackFileName: ONE_THING_SOUNDTRACK_FILE_NAME,
}

const SNEAKER_PATH = staticFile('one-thing/sneaker-0137.svg')
const CARD_PATH = staticFile('one-thing/pass-card-0137.svg')
const ART_PATHS = [SNEAKER_PATH, CARD_PATH] as const

export function OneThingFilm({ soundtrackFileName }: OneThingFilmProps) {
  const frame = useCurrentFrame()
  const markups = useSvgMarkups(ART_PATHS)
  const revealShotName = readRevealShotAtFrame(frame)
  const sneakerMarkup = markups?.get(SNEAKER_PATH)
  const cardMarkup = markups?.get(CARD_PATH)
  return (
    <AbsoluteFill style={{ backgroundColor: '#000000' }}>
      <Sequence durationInFrames={HOOK_END_FRAME}>
        <Video
          src={staticFile('one-thing/reference.mp4')}
          muted
          objectFit="cover"
          style={{ width: '100%', height: '100%' }}
        />
      </Sequence>
      {revealShotName !== null && sneakerMarkup !== undefined && cardMarkup !== undefined ? (
        <RevealShot
          shotName={revealShotName}
          sneakerMarkup={sneakerMarkup}
          cardMarkup={cardMarkup}
        />
      ) : null}
      {frame >= endCardTimeline.startFrame ? <EndCard /> : null}
      {soundtrackFileName === null ? null : (
        <Audio src={staticFile(`audio/${soundtrackFileName}`)} />
      )}
    </AbsoluteFill>
  )
}
