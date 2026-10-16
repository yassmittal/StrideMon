import { Sequence, useCurrentFrame } from 'remotion'
import { PassChatSoundtrack } from './components/PassChatSoundtrack'
import { ShoeArtProvider } from './components/PassShoe'
import { CardScene } from './scenes/CardScene'
import { LineScene } from './scenes/LineScene'
import { PhoneShotScene } from './scenes/PhoneShotScene'
import { cardTimeline, type PassChatSceneName, passChatScenes, ringTimeline } from './timeline'

/**
 * The Pass chat film (docs/pass-chat-video-prompt.md): a group chat on a lime phone in the sky
 * picks #0627, the phone spins into a card where it floats in the same sky, ten other passes burst
 * out, and it ends on "This isn’t a JPEG." 16:9, 60 fps.
 */
/** "Brazilian Phonk" by ScrewedQueen, its drop on the whip (CREDITS.md, scripts/fetch-audio.sh). */
export const PASS_CHAT_MUSIC_FILE_NAME = 'pass-chat-music.wav'

export function PassChatFilm({
  musicFileName = PASS_CHAT_MUSIC_FILE_NAME,
}: {
  /** In public/audio/. */
  musicFileName?: string
}) {
  return (
    <ShoeArtProvider>
      <PassChatSoundtrack musicFileName={musicFileName} />
      <PassChatPicture />
    </ShoeArtProvider>
  )
}

/** The picture, shot by shot: the phone, then the card, then the line on black. */
function PassChatPicture() {
  const frame = useCurrentFrame()
  if (frame < cardTimeline.startFrame) return <PhoneShotScene />
  if (frame < ringTimeline.flipFrame) return <CardScene />
  return <LineScene />
}

/** One scene of the film on its own (the PassChatScenes-16x9 folder). */
export function PassChatScene({ sceneName }: { sceneName: PassChatSceneName }) {
  return (
    <Sequence from={-passChatScenes[sceneName].startFrame} layout="none">
      <PassChatFilm />
    </Sequence>
  )
}
