import { Composition, Folder, Still } from 'remotion'
import { FILM_DURATION_IN_FRAMES, FRAMES_PER_SECOND, readSceneDurationInFrames } from './beats'
import { RunScreenCheck } from './checks/RunScreenCheck'
import { LaunchFilm } from './LaunchFilm'
import { EarnScene } from './scenes/EarnScene'
import { EndCardScene } from './scenes/EndCardScene'
import { GetSneakerScene } from './scenes/GetSneakerScene'
import { IntroScene } from './scenes/IntroScene'
import { OwnItScene } from './scenes/OwnItScene'
import { UpgradeScene } from './scenes/UpgradeScene'
import { WalkScene } from './scenes/WalkScene'
import {
  readWaitlistSceneDurationInFrames,
  WAITLIST_DURATION_IN_FRAMES,
  WAITLIST_FRAMES_PER_SECOND,
} from './waitlist/beats'
import { WAITLIST_HEIGHT, WAITLIST_WIDTH } from './waitlist/layout'
import { AskScene as WaitlistAskScene } from './waitlist/scenes/AskScene'
import { CollectionScene as WaitlistCollectionScene } from './waitlist/scenes/CollectionScene'
import { HookScene as WaitlistHookScene } from './waitlist/scenes/HookScene'
import { PassScene as WaitlistPassScene } from './waitlist/scenes/PassScene'
import { PromiseScene as WaitlistPromiseScene } from './waitlist/scenes/PromiseScene'
import { WaitlistFilm } from './waitlist/WaitlistFilm'

export function RemotionRoot() {
  return (
    <>
      <Composition
        id="Launch4x5"
        component={LaunchFilm}
        width={1080}
        height={1350}
        fps={FRAMES_PER_SECOND}
        durationInFrames={FILM_DURATION_IN_FRAMES}
        defaultProps={{ format: '4x5' as const }}
      />
      <Composition
        id="Launch16x9"
        component={LaunchFilm}
        width={1920}
        height={1080}
        fps={FRAMES_PER_SECOND}
        durationInFrames={FILM_DURATION_IN_FRAMES}
        defaultProps={{ format: '16x9' as const }}
      />
      <Composition
        id="Launch9x16"
        component={LaunchFilm}
        width={1080}
        height={1920}
        fps={FRAMES_PER_SECOND}
        durationInFrames={FILM_DURATION_IN_FRAMES}
        defaultProps={{ format: '9x16' as const }}
      />
      <Folder name="Scenes-4x5">
        <Composition
          id="Intro"
          component={IntroScene}
          width={1080}
          height={1350}
          fps={FRAMES_PER_SECOND}
          durationInFrames={readSceneDurationInFrames('intro')}
          defaultProps={{ format: '4x5' as const }}
        />
        <Composition
          id="GetSneaker"
          component={GetSneakerScene}
          width={1080}
          height={1350}
          fps={FRAMES_PER_SECOND}
          durationInFrames={readSceneDurationInFrames('getSneaker')}
          defaultProps={{ format: '4x5' as const }}
        />
        <Composition
          id="Walk"
          component={WalkScene}
          width={1080}
          height={1350}
          fps={FRAMES_PER_SECOND}
          durationInFrames={readSceneDurationInFrames('walk')}
          defaultProps={{ format: '4x5' as const }}
        />
        <Composition
          id="Earn"
          component={EarnScene}
          width={1080}
          height={1350}
          fps={FRAMES_PER_SECOND}
          durationInFrames={readSceneDurationInFrames('earn')}
          defaultProps={{ format: '4x5' as const }}
        />
        <Composition
          id="Upgrade"
          component={UpgradeScene}
          width={1080}
          height={1350}
          fps={FRAMES_PER_SECOND}
          durationInFrames={readSceneDurationInFrames('upgrade')}
          defaultProps={{ format: '4x5' as const }}
        />
        <Composition
          id="OwnIt"
          component={OwnItScene}
          width={1080}
          height={1350}
          fps={FRAMES_PER_SECOND}
          durationInFrames={readSceneDurationInFrames('ownIt')}
          defaultProps={{ format: '4x5' as const }}
        />
        <Composition
          id="EndCard"
          component={EndCardScene}
          width={1080}
          height={1350}
          fps={FRAMES_PER_SECOND}
          durationInFrames={readSceneDurationInFrames('endCard')}
          defaultProps={{ format: '4x5' as const }}
        />
      </Folder>
      <Composition
        id="Waitlist4x5"
        component={WaitlistFilm}
        width={WAITLIST_WIDTH}
        height={WAITLIST_HEIGHT}
        fps={WAITLIST_FRAMES_PER_SECOND}
        durationInFrames={WAITLIST_DURATION_IN_FRAMES}
      />
      <Folder name="WaitlistScenes-4x5">
        <Composition
          id="WaitlistHook"
          component={WaitlistHookScene}
          width={WAITLIST_WIDTH}
          height={WAITLIST_HEIGHT}
          fps={WAITLIST_FRAMES_PER_SECOND}
          durationInFrames={readWaitlistSceneDurationInFrames('hook')}
        />
        <Composition
          id="WaitlistCollection"
          component={WaitlistCollectionScene}
          width={WAITLIST_WIDTH}
          height={WAITLIST_HEIGHT}
          fps={WAITLIST_FRAMES_PER_SECOND}
          durationInFrames={readWaitlistSceneDurationInFrames('collection')}
        />
        <Composition
          id="WaitlistPass"
          component={WaitlistPassScene}
          width={WAITLIST_WIDTH}
          height={WAITLIST_HEIGHT}
          fps={WAITLIST_FRAMES_PER_SECOND}
          durationInFrames={readWaitlistSceneDurationInFrames('pass')}
        />
        <Composition
          id="WaitlistPromise"
          component={WaitlistPromiseScene}
          width={WAITLIST_WIDTH}
          height={WAITLIST_HEIGHT}
          fps={WAITLIST_FRAMES_PER_SECOND}
          durationInFrames={readWaitlistSceneDurationInFrames('promise')}
        />
        <Composition
          id="WaitlistAsk"
          component={WaitlistAskScene}
          width={WAITLIST_WIDTH}
          height={WAITLIST_HEIGHT}
          fps={WAITLIST_FRAMES_PER_SECOND}
          durationInFrames={readWaitlistSceneDurationInFrames('ask')}
        />
      </Folder>
      <Folder name="Checks">
        <Still id="RunScreenCheck" component={RunScreenCheck} width={1080} height={2340} />
      </Folder>
    </>
  )
}
