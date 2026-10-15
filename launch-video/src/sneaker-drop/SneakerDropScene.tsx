import { Sequence } from 'remotion'
import { readSneakerDropSceneStartFrame, type SneakerDropSceneName } from './beats'
import { SneakerDropFilm } from './SneakerDropFilm'

/** One scene of the 4:5 film on its own (the SneakerDropScenes-4x5 folder), with its music. */
export function SneakerDropScene({ sceneName }: { sceneName: SneakerDropSceneName }) {
  return (
    <Sequence from={-readSneakerDropSceneStartFrame(sceneName)} layout="none">
      <SneakerDropFilm format="4x5" />
    </Sequence>
  )
}
