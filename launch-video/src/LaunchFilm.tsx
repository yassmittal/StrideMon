import { Series, useVideoConfig } from 'remotion'
import {
  FILM_DURATION_IN_FRAMES,
  readSceneDurationInFrames,
  readSceneStartFrame,
  toSceneBeatFrame,
} from './beats'
import { Soundtrack } from './components/Soundtrack'
import { EarnScene } from './scenes/EarnScene'
import { EndCardScene } from './scenes/EndCardScene'
import { GetSneakerScene } from './scenes/GetSneakerScene'
import { IntroScene } from './scenes/IntroScene'
import { OwnItScene } from './scenes/OwnItScene'
import type { SceneProps } from './scenes/scene-props'
import { UpgradeScene } from './scenes/UpgradeScene'
import { WalkScene } from './scenes/WalkScene'
import { soundCues } from './sound-cues'
import { MUSIC_FILE_NAME, soundEffectFileNames } from './soundtrack'

/** The music fades from the end card's beat 2 ("Upgrade.") to silence on the last frame. */
const MUSIC_FADE_OUT_START_FRAME = readSceneStartFrame('endCard') + toSceneBeatFrame('endCard', 2)

/** The whole film: an intro, four steps, ownership and the end card, every cut on a beat (beats.ts). */
export function LaunchFilm({ format }: SceneProps) {
  const { fps } = useVideoConfig()
  return (
    <>
      <Soundtrack
        musicFileName={MUSIC_FILE_NAME}
        soundEffectFiles={soundEffectFileNames}
        cues={soundCues}
        durationInFrames={FILM_DURATION_IN_FRAMES}
        fadeOutStartFrame={MUSIC_FADE_OUT_START_FRAME}
      />
      <Series>
        <Series.Sequence
          name="1 Intro"
          durationInFrames={readSceneDurationInFrames('intro')}
          premountFor={fps}
        >
          <IntroScene format={format} />
        </Series.Sequence>
        <Series.Sequence
          name="2 Get a Sneaker"
          durationInFrames={readSceneDurationInFrames('getSneaker')}
          premountFor={fps}
        >
          <GetSneakerScene format={format} />
        </Series.Sequence>
        <Series.Sequence
          name="3 Walk"
          durationInFrames={readSceneDurationInFrames('walk')}
          premountFor={fps}
        >
          <WalkScene format={format} />
        </Series.Sequence>
        <Series.Sequence
          name="4 Earn"
          durationInFrames={readSceneDurationInFrames('earn')}
          premountFor={fps}
        >
          <EarnScene format={format} />
        </Series.Sequence>
        <Series.Sequence
          name="5 Upgrade"
          durationInFrames={readSceneDurationInFrames('upgrade')}
          premountFor={fps}
        >
          <UpgradeScene format={format} />
        </Series.Sequence>
        <Series.Sequence
          name="6 Yours"
          durationInFrames={readSceneDurationInFrames('ownIt')}
          premountFor={fps}
        >
          <OwnItScene format={format} />
        </Series.Sequence>
        <Series.Sequence
          name="7 End card"
          durationInFrames={readSceneDurationInFrames('endCard')}
          premountFor={fps}
        >
          <EndCardScene format={format} />
        </Series.Sequence>
      </Series>
    </>
  )
}
