import { Audio } from '@remotion/media'
import type { ReactNode } from 'react'
import { AbsoluteFill, Sequence, staticFile, useCurrentFrame } from 'remotion'
import { useSneakerArtMarkups } from '../components/SneakerArt'
import { APP_TOUR_FRAMES_PER_SECOND, APP_TOUR_WIDTH } from './beats'
import { REST_FRAMING, readPhoneFraming } from './camera'
import { AppTourPhone } from './components/AppTourPhone'
import { EndCard } from './components/EndCard'
import { IconMorph } from './components/IconMorph'
import { appTourArtFileNames, PhoneScreen } from './components/PhoneScreen'
import { measureHeadlineWordLefts, SectionHeadline } from './components/SectionHeadline'
import { HomeDrawIn } from './components/screens/HomeDrawIn'
import { type AppTourSectionName, appTourSections } from './content'
import { reelMoments } from './footage'
import { appTourSoundCues, appTourSoundFiles, appTourSoundVolumes } from './sound-cues'
import {
  type AppTourSceneName,
  appTourScenes,
  appTourWipes,
  coverTimeline,
  iconTimeline,
  meetTimeline,
} from './timeline'
import { readWipeEdgeShare } from './wipe'

// The App tour film (docs/app-tour-video-prompt.md): one phone in the middle of the frame with the
// real app in it, a colour field and a headline per step of the game loop, each brought in by the
// reference's wipe, and the logo at the end. 1080 × 1920, 60 fps, 30 s. Every frame is named in
// timeline.ts; the camera is camera.ts; the phone's screen is footage.ts's shot list.

/**
 * The reference ad's own music, which the film is cut to (Yash's choice, 2026-10-17; unlicensed, so
 * not for Instagram: CREDITS.md). scripts/fetch-audio.sh extracts it from reference.mp4.
 */
export const APP_TOUR_MUSIC_FILE_NAME = 'app-tour-music.wav'

export type AppTourFilmProps = {
  /** In public/audio/; null for a silent picture. */
  musicFileName: string | null
  /** The taps and the hit (sound-cues.ts). Off gives music only. */
  hasSoundEffects?: boolean
}

export const defaultAppTourProps: AppTourFilmProps = {
  musicFileName: APP_TOUR_MUSIC_FILE_NAME,
}

const headlinedSections: readonly AppTourSectionName[] = [
  'meet',
  'walk',
  'earn',
  'repair',
  'levelUp',
]

/** The first frame the wipe's edge reaches each word of the section's headline. */
function readWipedWordStartFrames(section: AppTourSectionName): number[] {
  const wipe = appTourWipes.find((candidate) => candidate.section === section)
  if (wipe === undefined) return []
  return measureHeadlineWordLefts(appTourSections[section].headline).map((wordLeft) => {
    for (let frame = wipe.startFrame; frame < wipe.startFrame + 120; frame += 1) {
      const secondsIntoWipe = (frame - wipe.startFrame) / APP_TOUR_FRAMES_PER_SECOND
      if (readWipeEdgeShare(secondsIntoWipe) * APP_TOUR_WIDTH >= wordLeft) return frame
    }
    return wipe.snapFrame
  })
}

function readWordStartFrames(section: AppTourSectionName, isCover: boolean): number[] {
  if (section !== 'meet') return readWipedWordStartFrames(section)
  // The cover shows the headline in place; after it, it rises word by word.
  if (isCover) return [-100, -100]
  return [meetTimeline.headlineFrame, meetTimeline.headlineFrame + 6]
}

export function AppTourFilm({ musicFileName, hasSoundEffects = true }: AppTourFilmProps) {
  const artMarkups = useSneakerArtMarkups([
    appTourArtFileNames.levelOne,
    appTourArtFileNames.levelTwo,
  ])
  return (
    <AbsoluteFill
      style={{
        backgroundColor: appTourSections.meet.background,
        // No hinting: hinted text snapped to the frame's pixels on its own while the camera scaled,
        // and Remotion's parallel tabs hinted it differently, so small text shimmered.
        textRendering: 'geometricPrecision',
      }}
    >
      {musicFileName !== null && <Audio src={staticFile(`audio/${musicFileName}`)} name="Music" />}
      {hasSoundEffects &&
        appTourSoundCues.map((cue) => (
          <Sequence
            key={`${cue.kind}-${cue.frame}`}
            from={cue.frame}
            layout="none"
            name={`SFX ${cue.kind}`}
          >
            <Audio
              src={staticFile(`audio/${appTourSoundFiles[cue.kind]}`)}
              volume={appTourSoundVolumes[cue.kind]}
            />
          </Sequence>
        ))}
      {artMarkups !== null && <AppTourPicture artMarkups={artMarkups} />}
    </AbsoluteFill>
  )
}

function AppTourPicture({ artMarkups }: { artMarkups: ReadonlyMap<string, string> }) {
  const frame = useCurrentFrame()
  const isCover = frame < coverTimeline.endFrame
  const lastWipe = appTourWipes[appTourWipes.length - 1]
  return (
    <>
      {appTourWipes.slice(0, -1).map((wipe) => (
        <WipeField key={wipe.section} section={wipe.section} startFrame={wipe.startFrame} />
      ))}
      {headlinedSections.map((section, index) => {
        const nextWipe = appTourWipes[index]
        const { headline, headlineColor } = appTourSections[section]
        return (
          <SectionHeadline
            key={section}
            text={headline}
            color={headlineColor}
            wordStartFrames={readWordStartFrames(section, isCover)}
            {...(nextWipe === undefined ? {} : { hideFrame: nextWipe.snapFrame })}
          />
        )
      })}
      {isCover ? (
        <AppTourPhone framing={REST_FRAMING}>
          <HomeDrawIn
            artMarkup={artMarkups.get(appTourArtFileNames.levelOne) ?? ''}
            homeClipFrame={reelMoments.homeStill}
            drawInStartFrame={-1000}
            energyFillStartFrame={-1000}
          />
        </AppTourPhone>
      ) : frame < iconTimeline.landFrame ? (
        frame >= iconTimeline.riseStartFrame && <IconMorph />
      ) : (
        <AppTourPhone framing={readPhoneFraming(frame)}>
          <PhoneScreen artMarkups={artMarkups} />
        </AppTourPhone>
      )}
      {lastWipe !== undefined && (
        <WipeField section="end" startFrame={lastWipe.startFrame}>
          <EndCard />
        </WipeField>
      )}
    </>
  )
}

/** A section's field, sweeping in from the left on the measured curve, with what sits on it. */
function WipeField({
  section,
  startFrame,
  children,
}: {
  section: AppTourSectionName
  startFrame: number
  children?: ReactNode
}) {
  const frame = useCurrentFrame()
  if (frame < startFrame) return null
  const edgeShare = readWipeEdgeShare((frame - startFrame) / APP_TOUR_FRAMES_PER_SECOND)
  return (
    <AbsoluteFill
      style={{
        backgroundColor: appTourSections[section].background,
        clipPath: `inset(0px ${(1 - edgeShare) * 100}% 0px 0px)`,
      }}
    >
      {children}
    </AbsoluteFill>
  )
}

/** One section of the film on its own (the AppTourScenes-9x16 folder). */
export function AppTourScene({ sceneName }: { sceneName: AppTourSceneName }) {
  return (
    <Sequence from={-appTourScenes[sceneName].startFrame} layout="none">
      <AppTourFilm {...defaultAppTourProps} />
    </Sequence>
  )
}
