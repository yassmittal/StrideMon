import { Audio } from '@remotion/media'
import { staticFile, useCurrentFrame } from 'remotion'
import { musicBeats, toSneakerDropBeatFrame } from './beats'
import { SneakerArtProvider } from './components/sneaker-art-context'
import type { SneakerDropFormat } from './layout'
import { SNEAKER_DROP_MUSIC_FILE_NAME } from './music'
import { CellsScene } from './scenes/CellsScene'
import { EndCardScene } from './scenes/EndCardScene'
import { FloodScene } from './scenes/FloodScene'
import { LegendaryScene } from './scenes/LegendaryScene'
import { LineArtScene } from './scenes/LineArtScene'
import { cellsTimeline, END_CARD_FRAME, floodStepFrames, legendaryTimeline } from './timeline'

/**
 * The Sneaker drop film (docs/sneaker-drop-video-prompt.md): StrideMon's Sneakers cut to "Drift
 * Phonk", every change on a hit from hits.ts. One timeline for both formats; only the layout
 * differs. Music only: the track's own hits are the sync, so there are no sound effects.
 */
export function SneakerDropFilm({ format }: { format: SneakerDropFormat }) {
  return (
    <SneakerArtProvider>
      <Audio name="Music" src={staticFile(`audio/${SNEAKER_DROP_MUSIC_FILE_NAME}`)} />
      <SneakerDropPicture format={format} />
    </SneakerArtProvider>
  )
}

/** The picture alone, scene by scene: each scene starts on its own hit. */
export function SneakerDropPicture({ format }: { format: SneakerDropFormat }) {
  const frame = useCurrentFrame()
  if (frame < (cellsTimeline.states[0]?.startFrame ?? toSneakerDropBeatFrame(musicBeats.drop))) {
    return <LineArtScene format={format} />
  }
  if (frame < (floodStepFrames[0] ?? 0)) return <CellsScene format={format} />
  if (frame < legendaryTimeline.startFrame) return <FloodScene format={format} />
  if (frame < END_CARD_FRAME) return <LegendaryScene format={format} />
  return <EndCardScene format={format} />
}
