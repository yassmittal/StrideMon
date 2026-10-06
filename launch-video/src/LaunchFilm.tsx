import { Series, useVideoConfig } from 'remotion'
import { readSceneDurationInFrames } from './beats'
import { Soundtrack } from './components/Soundtrack'
import { ColdOpenScene } from './scenes/ColdOpenScene'
import { EarnScene } from './scenes/EarnScene'
import { EndCardScene } from './scenes/EndCardScene'
import { OwnItScene } from './scenes/OwnItScene'
import { RulesScene } from './scenes/RulesScene'
import type { SceneProps } from './scenes/scene-props'
import { UpgradeScene } from './scenes/UpgradeScene'
import { WalkScene } from './scenes/WalkScene'

/** The whole film: seven scenes, hard cuts between them, every cut on a beat (beats.ts). */
export function LaunchFilm({ format }: SceneProps) {
  const { fps } = useVideoConfig()
  return (
    <>
      <Soundtrack />
      <Series>
        <Series.Sequence
          name="1 Cold open"
          durationInFrames={readSceneDurationInFrames('coldOpen')}
          premountFor={fps}
        >
          <ColdOpenScene format={format} />
        </Series.Sequence>
        <Series.Sequence
          name="2 Walk"
          durationInFrames={readSceneDurationInFrames('walk')}
          premountFor={fps}
        >
          <WalkScene format={format} />
        </Series.Sequence>
        <Series.Sequence
          name="3 Earn"
          durationInFrames={readSceneDurationInFrames('earn')}
          premountFor={fps}
        >
          <EarnScene format={format} />
        </Series.Sequence>
        <Series.Sequence
          name="4 Upgrade"
          durationInFrames={readSceneDurationInFrames('upgrade')}
          premountFor={fps}
        >
          <UpgradeScene format={format} />
        </Series.Sequence>
        <Series.Sequence
          name="5 Own it"
          durationInFrames={readSceneDurationInFrames('ownIt')}
          premountFor={fps}
        >
          <OwnItScene format={format} />
        </Series.Sequence>
        <Series.Sequence
          name="6 Rules"
          durationInFrames={readSceneDurationInFrames('rules')}
          premountFor={fps}
        >
          <RulesScene format={format} />
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
