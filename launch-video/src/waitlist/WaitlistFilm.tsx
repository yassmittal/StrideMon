import { Series, useVideoConfig } from 'remotion'
import { Soundtrack } from '../components/Soundtrack'
import { readWaitlistSceneDurationInFrames, WAITLIST_DURATION_IN_FRAMES } from './beats'
import { AskScene } from './scenes/AskScene'
import { CollectionScene } from './scenes/CollectionScene'
import { HookScene } from './scenes/HookScene'
import { PassScene } from './scenes/PassScene'
import { PromiseScene } from './scenes/PromiseScene'
import {
  WAITLIST_MUSIC_FADE_OUT_START_FRAME,
  WAITLIST_MUSIC_FILE_NAME,
  waitlistSoundCues,
  waitlistSoundEffectFiles,
} from './sound-cues'

/** The Founding Pass waitlist film: five scenes, every cut on a beat (waitlist/beats.ts). */
export function WaitlistFilm() {
  const { fps } = useVideoConfig()
  return (
    <>
      <Soundtrack
        musicFileName={WAITLIST_MUSIC_FILE_NAME}
        soundEffectFiles={waitlistSoundEffectFiles}
        cues={waitlistSoundCues}
        durationInFrames={WAITLIST_DURATION_IN_FRAMES}
        fadeOutStartFrame={WAITLIST_MUSIC_FADE_OUT_START_FRAME}
      />
      <Series>
        <Series.Sequence
          name="1 Hook"
          durationInFrames={readWaitlistSceneDurationInFrames('hook')}
          premountFor={fps}
        >
          <HookScene />
        </Series.Sequence>
        <Series.Sequence
          name="2 One of one"
          durationInFrames={readWaitlistSceneDurationInFrames('collection')}
          premountFor={fps}
        >
          <CollectionScene />
        </Series.Sequence>
        <Series.Sequence
          name="3 What it is"
          durationInFrames={readWaitlistSceneDurationInFrames('pass')}
          premountFor={fps}
        >
          <PassScene />
        </Series.Sequence>
        <Series.Sequence
          name="4 The promise"
          durationInFrames={readWaitlistSceneDurationInFrames('promise')}
          premountFor={fps}
        >
          <PromiseScene />
        </Series.Sequence>
        <Series.Sequence
          name="5 The ask"
          durationInFrames={readWaitlistSceneDurationInFrames('ask')}
          premountFor={fps}
        >
          <AskScene />
        </Series.Sequence>
      </Series>
    </>
  )
}
