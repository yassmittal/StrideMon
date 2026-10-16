import { chatMessages } from './content'
import { handwritingStrokeTimings } from './handwriting'
import {
  burstTimeline,
  chatTimeline,
  endTimeline,
  ringTimeline,
  spinTimeline,
  writeTimeline,
} from './timeline'

// Every sound effect in the Pass chat film, in film frames, from the same timeline the picture uses
// (docs/pass-chat-video-prompt.md §5). Made for muted viewing, finished with sound: a whoosh as the
// phone swings in, a pop per bubble, a riser into the spin's whip, the shoes' burst, a boom on the
// flip to black (where the music cuts), the pen per stroke, a swoosh as "a JPEG." slides in and a
// pop as the pill lands. The files are in public/audio/ (gitignored), made by
// scripts/fetch-audio.sh; their sources are in CREDITS.md. The music is PassChatSoundtrack's.

export const passChatSoundFiles = {
  whooshIn: 'pass-chat-sfx-whoosh-in.wav',
  popSent: 'pass-chat-sfx-pop-sent.wav',
  popReceived: 'pass-chat-sfx-pop-received.wav',
  riser: 'pass-chat-sfx-riser.wav',
  whip: 'pass-chat-sfx-whip.wav',
  burst: 'pass-chat-sfx-burst.wav',
  boom: 'pass-chat-sfx-boom.wav',
  pen: 'pass-chat-sfx-pen.wav',
  slide: 'pass-chat-sfx-slide.wav',
  pill: 'pass-chat-sfx-pill.wav',
} as const

export type PassChatSoundKind = keyof typeof passChatSoundFiles

/**
 * Each sound's gain, set from its file's own peak (noted) so it peaks where noted in the mix, over
 * music levelled to −19 LUFS: the pops and the hits clear the beat.
 */
export const passChatSoundVolumes: Record<PassChatSoundKind, number> = {
  /** Peaks at −2.3 dBFS: to about −8. */
  whooshIn: 0.52,
  /** Peak at 0 dBFS: to about −2, so each lands over the beat. */
  popSent: 0.8,
  popReceived: 0.8,
  /** Peaks at −9.7 dBFS, at its end: to about −7, rising out of the music into the whip. */
  riser: 1.4,
  /** Peaks at −1.3 dBFS: to about −5. */
  whip: 0.65,
  /** Peaks at 0 dBFS: as it is, with the music dipping under it (PassChatSoundtrack). */
  burst: 1,
  /** Peaks at −0.9 dBFS: to about −6, alone once the music cuts, no louder than the drop. */
  boom: 0.55,
  /** Peaks at −1.9 dBFS: to about −10, over the boom's tail. */
  pen: 0.4,
  /** Peaks at −3.1 dBFS: to about −5. */
  slide: 0.8,
  /** Peaks at 0 dBFS: to about −4. */
  pill: 0.6,
}

/**
 * How far into each file its hit or peak falls, in frames (measured on the trimmed files), so a cue
 * can put that moment on its picture frame.
 */
const HIT_FRAMES: Record<PassChatSoundKind, number> = {
  whooshIn: 6,
  popSent: 1,
  popReceived: 1,
  /** The riser ends on its peak. */
  riser: 110,
  whip: 24,
  burst: 1,
  boom: 1,
  pen: 0,
  slide: 3,
  pill: 1,
}

export type PassChatSoundCue = {
  kind: PassChatSoundKind
  frame: number
  /** Only for sounds cut to a length (the pen): how long it plays, ending in a short fade. */
  durationInFrames?: number
  /** Only for the pen: where in its file this stroke's sound starts. */
  trimBeforeFrames?: number
}

/** The pen's sound outlasts its stroke by a hair, so the scratch never stops abruptly. */
const PEN_TAIL_FRAMES = 2

export const passChatSoundCues: readonly PassChatSoundCue[] = buildPassChatSoundCues()

function buildPassChatSoundCues(): PassChatSoundCue[] {
  const hitOn = (kind: PassChatSoundKind, frame: number): PassChatSoundCue => ({
    kind,
    frame: Math.max(0, frame - HIT_FRAMES[kind]),
  })
  const cues: PassChatSoundCue[] = [
    // The phone swings in.
    hitOn('whooshIn', 0),
    // Each bubble lands: sent ones a little higher than received ones.
    ...chatTimeline.bubbleFrames.map((frame, bubbleIndex) =>
      hitOn(chatMessages[bubbleIndex]?.side === 'sent' ? 'popSent' : 'popReceived', frame),
    ),
    // The build from the last bubble into the spin, peaking on the whip, where the drop comes in.
    hitOn('riser', spinTimeline.endFrame),
    hitOn('whip', spinTimeline.endFrame),
    // The shoes burst out from behind #0627.
    hitOn('burst', burstTimeline.firstShoeFrame),
    // The flip to black, where the music cuts.
    hitOn('boom', ringTimeline.flipFrame),
    // The pen, stroke by stroke, each on its own part of the recording.
    ...handwritingStrokeTimings.map((stroke) => ({
      kind: 'pen' as const,
      frame: writeTimeline.penStartFrame + stroke.startFrame,
      durationInFrames: stroke.durationFrames + PEN_TAIL_FRAMES,
      trimBeforeFrames: stroke.startFrame,
    })),
    // The camera whips back as "a JPEG." slides in, and the drop comes back.
    hitOn('slide', writeTimeline.slideStartFrame),
    // The pill lands.
    hitOn('pill', endTimeline.pillFrame),
  ]
  return cues.sort((first, second) => first.frame - second.frame)
}
