import { Composition, Folder, Still } from 'remotion'
import { AppTourFilm, AppTourScene, defaultAppTourProps } from './app-tour/AppTourFilm'
import {
  APP_TOUR_DURATION_IN_FRAMES,
  APP_TOUR_FRAMES_PER_SECOND,
  APP_TOUR_HEIGHT,
  APP_TOUR_WIDTH,
} from './app-tour/beats'
import { RebuildCheck, rebuildCheckNames } from './app-tour/checks/RebuildCheck'
import { type AppTourSceneName, appTourScenes } from './app-tour/timeline'
import { FILM_DURATION_IN_FRAMES, FRAMES_PER_SECOND, readSceneDurationInFrames } from './beats'
import { RunScreenCheck } from './checks/RunScreenCheck'
import { CrushFilm, defaultCrushProps } from './crush/CrushFilm'
import {
  CRUSH_DURATION_IN_FRAMES,
  CRUSH_FRAMES_PER_SECOND,
  CRUSH_HEIGHT,
  CRUSH_WIDTH,
} from './crush/timeline'
import { DialFilm, defaultDialProps } from './dial/DialFilm'
import {
  DIAL_DURATION_IN_FRAMES,
  DIAL_FRAMES_PER_SECOND,
  DIAL_HEIGHT,
  DIAL_WIDTH,
} from './dial/timeline'
import { LaunchFilm } from './LaunchFilm'
import { defaultOneThingProps, OneThingFilm } from './one-thing/OneThingFilm'
import {
  ONE_THING_DURATION_IN_FRAMES,
  ONE_THING_FRAMES_PER_SECOND,
  ONE_THING_HEIGHT,
  ONE_THING_WIDTH,
} from './one-thing/timeline'
import { PassChatFilm, PassChatScene } from './pass-chat/PassChatFilm'
import {
  PASS_CHAT_DURATION_IN_FRAMES,
  PASS_CHAT_FRAMES_PER_SECOND,
  PASS_CHAT_HEIGHT,
  PASS_CHAT_WIDTH,
  type PassChatSceneName,
  passChatScenes,
} from './pass-chat/timeline'
import { defaultPassMintProps, PassMintFilm } from './pass-mint/PassMintFilm'
import {
  PASS_MINT_DURATION_IN_FRAMES,
  PASS_MINT_FRAMES_PER_SECOND,
  PASS_MINT_HEIGHT,
  PASS_MINT_WIDTH,
} from './pass-mint/timeline'
import { PitchFilm } from './pitch/PitchFilm'
import {
  PITCH_DURATION_IN_FRAMES,
  PITCH_FRAMES_PER_SECOND,
  PITCH_HEIGHT,
  PITCH_WIDTH,
} from './pitch/timeline'
import { defaultRainProps, RainFilm } from './rain/RainFilm'
import {
  RAIN_DURATION_IN_FRAMES,
  RAIN_FRAMES_PER_SECOND,
  RAIN_HEIGHT,
  RAIN_WIDTH,
} from './rain/timeline'
import { EarnScene } from './scenes/EarnScene'
import { EndCardScene } from './scenes/EndCardScene'
import { GetSneakerScene } from './scenes/GetSneakerScene'
import { IntroScene } from './scenes/IntroScene'
import { OwnItScene } from './scenes/OwnItScene'
import { UpgradeScene } from './scenes/UpgradeScene'
import { WalkScene } from './scenes/WalkScene'
import { defaultShowroomProps, ShowroomFilm } from './showroom/ShowroomFilm'
import {
  SHOWROOM_DURATION_IN_FRAMES,
  SHOWROOM_FRAMES_PER_SECOND,
  SHOWROOM_HEIGHT,
  SHOWROOM_WIDTH,
} from './showroom/timeline'
import {
  readSneakerDropSceneDurationInFrames,
  SNEAKER_DROP_DURATION_IN_FRAMES,
  SNEAKER_DROP_FRAMES_PER_SECOND,
  type SneakerDropSceneName,
} from './sneaker-drop/beats'
import { sneakerDropLayouts } from './sneaker-drop/layout'
import { SneakerDropFilm } from './sneaker-drop/SneakerDropFilm'
import { SneakerDropScene } from './sneaker-drop/SneakerDropScene'
import { SneakerDropSyncCheck } from './sneaker-drop/SyncCheck'
import { defaultStashProps, StashFilm } from './stash/StashFilm'
import {
  STASH_DURATION_IN_FRAMES,
  STASH_FRAMES_PER_SECOND,
  STASH_HEIGHT,
  STASH_WIDTH,
} from './stash/timeline'
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

const SNEAKER_DROP_SCENES: readonly { id: string; sceneName: SneakerDropSceneName }[] = [
  { id: 'SneakerDropColdOpen', sceneName: 'coldOpen' },
  { id: 'SneakerDropBuild', sceneName: 'build' },
  { id: 'SneakerDropDrop', sceneName: 'drop' },
  { id: 'SneakerDropEscalation', sceneName: 'escalation' },
  { id: 'SneakerDropLegendary', sceneName: 'legendary' },
  { id: 'SneakerDropEndCard', sceneName: 'endCard' },
]

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
      <Composition
        id="SneakerDrop4x5"
        component={SneakerDropFilm}
        width={sneakerDropLayouts['4x5'].width}
        height={sneakerDropLayouts['4x5'].height}
        fps={SNEAKER_DROP_FRAMES_PER_SECOND}
        durationInFrames={SNEAKER_DROP_DURATION_IN_FRAMES}
        defaultProps={{ format: '4x5' as const }}
      />
      <Composition
        id="SneakerDrop9x16"
        component={SneakerDropFilm}
        width={sneakerDropLayouts['9x16'].width}
        height={sneakerDropLayouts['9x16'].height}
        fps={SNEAKER_DROP_FRAMES_PER_SECOND}
        durationInFrames={SNEAKER_DROP_DURATION_IN_FRAMES}
        defaultProps={{ format: '9x16' as const }}
      />
      <Folder name="SneakerDropScenes-4x5">
        {SNEAKER_DROP_SCENES.map(({ id, sceneName }) => (
          <Composition
            key={id}
            id={id}
            component={SneakerDropScene}
            width={sneakerDropLayouts['4x5'].width}
            height={sneakerDropLayouts['4x5'].height}
            fps={SNEAKER_DROP_FRAMES_PER_SECOND}
            durationInFrames={readSneakerDropSceneDurationInFrames(sceneName)}
            defaultProps={{ sceneName }}
          />
        ))}
      </Folder>
      <Composition
        id="Pitch16x9"
        component={PitchFilm}
        width={PITCH_WIDTH}
        height={PITCH_HEIGHT}
        fps={PITCH_FRAMES_PER_SECOND}
        durationInFrames={PITCH_DURATION_IN_FRAMES}
      />
      <Composition
        id="PassChat16x9"
        component={PassChatFilm}
        width={PASS_CHAT_WIDTH}
        height={PASS_CHAT_HEIGHT}
        fps={PASS_CHAT_FRAMES_PER_SECOND}
        durationInFrames={PASS_CHAT_DURATION_IN_FRAMES}
      />
      <Folder name="PassChatScenes-16x9">
        {(Object.keys(passChatScenes) as PassChatSceneName[]).map((sceneName) => (
          <Composition
            key={sceneName}
            id={`PassChat-${sceneName}`}
            component={PassChatScene}
            width={PASS_CHAT_WIDTH}
            height={PASS_CHAT_HEIGHT}
            fps={PASS_CHAT_FRAMES_PER_SECOND}
            durationInFrames={
              passChatScenes[sceneName].endFrame - passChatScenes[sceneName].startFrame
            }
            defaultProps={{ sceneName }}
          />
        ))}
      </Folder>
      <Composition
        id="AppTour9x16"
        component={AppTourFilm}
        width={APP_TOUR_WIDTH}
        height={APP_TOUR_HEIGHT}
        fps={APP_TOUR_FRAMES_PER_SECOND}
        durationInFrames={APP_TOUR_DURATION_IN_FRAMES}
        defaultProps={defaultAppTourProps}
      />
      <Folder name="AppTourScenes-9x16">
        {(Object.keys(appTourScenes) as AppTourSceneName[]).map((sceneName) => (
          <Composition
            key={sceneName}
            id={`AppTour-${sceneName}`}
            component={AppTourScene}
            width={APP_TOUR_WIDTH}
            height={APP_TOUR_HEIGHT}
            fps={APP_TOUR_FRAMES_PER_SECOND}
            durationInFrames={
              appTourScenes[sceneName].endFrame - appTourScenes[sceneName].startFrame
            }
            defaultProps={{ sceneName }}
          />
        ))}
      </Folder>
      <Composition
        id="Showroom9x16"
        component={ShowroomFilm}
        width={SHOWROOM_WIDTH}
        height={SHOWROOM_HEIGHT}
        fps={SHOWROOM_FRAMES_PER_SECOND}
        durationInFrames={SHOWROOM_DURATION_IN_FRAMES}
        defaultProps={defaultShowroomProps}
      />
      <Composition
        id="Crush9x16"
        component={CrushFilm}
        width={CRUSH_WIDTH}
        height={CRUSH_HEIGHT}
        fps={CRUSH_FRAMES_PER_SECOND}
        durationInFrames={CRUSH_DURATION_IN_FRAMES}
        defaultProps={defaultCrushProps}
      />
      <Composition
        id="Stash9x16"
        component={StashFilm}
        width={STASH_WIDTH}
        height={STASH_HEIGHT}
        fps={STASH_FRAMES_PER_SECOND}
        durationInFrames={STASH_DURATION_IN_FRAMES}
        defaultProps={defaultStashProps}
      />
      <Composition
        id="PassMint16x9"
        component={PassMintFilm}
        width={PASS_MINT_WIDTH}
        height={PASS_MINT_HEIGHT}
        fps={PASS_MINT_FRAMES_PER_SECOND}
        durationInFrames={PASS_MINT_DURATION_IN_FRAMES}
        defaultProps={defaultPassMintProps}
      />
      <Composition
        id="Dial9x16"
        component={DialFilm}
        width={DIAL_WIDTH}
        height={DIAL_HEIGHT}
        fps={DIAL_FRAMES_PER_SECOND}
        durationInFrames={DIAL_DURATION_IN_FRAMES}
        defaultProps={defaultDialProps}
      />
      <Composition
        id="OneThing9x16"
        component={OneThingFilm}
        width={ONE_THING_WIDTH}
        height={ONE_THING_HEIGHT}
        fps={ONE_THING_FRAMES_PER_SECOND}
        durationInFrames={ONE_THING_DURATION_IN_FRAMES}
        defaultProps={defaultOneThingProps}
      />
      <Composition
        id="Rain9x16"
        component={RainFilm}
        width={RAIN_WIDTH}
        height={RAIN_HEIGHT}
        fps={RAIN_FRAMES_PER_SECOND}
        durationInFrames={RAIN_DURATION_IN_FRAMES}
        defaultProps={defaultRainProps}
      />
      <Folder name="Checks">
        <Composition
          id="SneakerDropSync"
          component={SneakerDropSyncCheck}
          width={1080}
          height={1350}
          fps={SNEAKER_DROP_FRAMES_PER_SECOND}
          durationInFrames={SNEAKER_DROP_DURATION_IN_FRAMES}
        />
        <Still id="RunScreenCheck" component={RunScreenCheck} width={1080} height={2340} />
        {/* Compositions, not Stills: a frozen footage frame must lie inside the composition. */}
        {rebuildCheckNames.map((checkName) => (
          <Composition
            key={checkName}
            id={`AppTourRebuild-${checkName}`}
            component={RebuildCheck}
            width={720}
            height={1560}
            fps={APP_TOUR_FRAMES_PER_SECOND}
            durationInFrames={120}
            defaultProps={{ checkName }}
          />
        ))}
      </Folder>
    </>
  )
}
