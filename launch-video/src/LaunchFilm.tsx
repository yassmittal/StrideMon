import { Series, useVideoConfig } from 'remotion'
import { readSceneDurationInFrames } from './beats'
import { Soundtrack } from './components/Soundtrack'
import { EarnScene } from './scenes/EarnScene'
import { EndCardScene } from './scenes/EndCardScene'
import { GetSneakerScene } from './scenes/GetSneakerScene'
import { IntroScene } from './scenes/IntroScene'
import { OwnItScene } from './scenes/OwnItScene'
import type { SceneProps } from './scenes/scene-props'
import { UpgradeScene } from './scenes/UpgradeScene'
import { WalkScene } from './scenes/WalkScene'

/** The whole film: an intro, four steps, ownership and the end card, every cut on a beat (beats.ts). */
export function LaunchFilm({ format }: SceneProps) {
  const { fps } = useVideoConfig()
  return (
    <>
      <Soundtrack />
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
