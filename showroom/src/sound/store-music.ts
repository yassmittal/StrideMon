import type { CueOutput } from './sound-cues'

// The store's music (D-070): one lo-fi track on repeat, Yash's pick. Cut to its first 35 bars,
// so the loop lands on the beat. Streamed by an <audio> element (nothing is fetched before the
// first press) and routed through the sound graph, so the master fade and Find's muffle reach
// it. Source and licence: README → Music.

const STORE_MUSIC_URL = '/music/lofi-beats.mp3'

/** The track is levelled to about −16 LUFS; this sets it under the cues, as a store's music. */
const MUSIC_GAIN = 0.45
/** A little of the music in the room's reverb, so it sounds played in the store. */
const MUSIC_WET_SHARE = 0.12

export class StoreMusic {
  private readonly audio: HTMLAudioElement

  constructor(destination: CueOutput) {
    const { context } = destination
    this.audio = new Audio(STORE_MUSIC_URL)
    this.audio.preload = 'auto'
    this.audio.loop = true
    const source = context.createMediaElementSource(this.audio)
    const level = context.createGain()
    level.gain.value = MUSIC_GAIN
    source.connect(level)
    level.connect(destination.dry)
    const wetSend = context.createGain()
    wetSend.gain.value = MUSIC_WET_SHARE
    level.connect(wetSend)
    wetSend.connect(destination.wet)
  }

  /** Plays, or carries on. Called on a press, so the browser lets it. */
  play(): void {
    if (!this.audio.paused) return
    // A refusal (no press yet on this page) is retried on the next press.
    this.audio.play().catch(() => undefined)
  }

  pause(): void {
    this.audio.pause()
  }
}
