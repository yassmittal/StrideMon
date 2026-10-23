import { createSmallStore } from '@/lib/create-small-store'
import { type CueOutput, playSoundCue, readNoiseBuffer } from './sound-cues'
import { StoreMusic } from './store-music'
import type { SoundCueName } from './visit-cues'

// The showroom's sound (D-070): one AudioContext, made on the visitor's first press (nothing plays
// before one, brief §9). The store's music and the cues share a reverb; Find muffles the room.
// The sound button turns it all off, and that's remembered on the device.
//
//   music ─┬─ dry ─────────────┐
//          └─ wet ─ reverb ─ room filter ─ master ─ limiter ─ speakers
//   cues ──┬─ dry ───────────────────────┘
//          └─ wet ─ reverb

/** What the sound button shows: whether the music is playing. */
export const soundStore = createSmallStore<{ isPlaying: boolean }>({ isPlaying: false })

const SOUND_OFF_STORAGE_KEY = 'stridemon-showroom:sound-off'

export const SOUND_MIX = {
  masterGain: 0.9,
  cueGain: 1,
  reverbSeconds: 4.5,
  reverbReturnGain: 0.55,
  fadeInSeconds: 3,
  fadeOutSeconds: 0.8,
  /** Find's muffle: the room's low-pass, open and while Find is open. */
  roomOpenHertz: 18000,
  roomMuffledHertz: 1100,
  roomGlideSeconds: 0.25,
} as const

type SoundGraph = {
  context: AudioContext
  master: GainNode
  roomFilter: BiquadFilterNode
  music: StoreMusic
  cueOutput: CueOutput
}

/** iOS Safari's audio session: "ambient" obeys the ringer switch and mixes with other audio. */
type NavigatorWithAudioSession = Navigator & { audioSession?: { type: string } }

class SoundEngine {
  private graph: SoundGraph | null = null
  private hasHeardPress = false
  private suspendTimer: number | null = null

  /** A press anywhere (not the sound button): the first starts the music, unless it was turned off. */
  handlePress(): void {
    if (!this.hasHeardPress) {
      this.hasHeardPress = true
      if (!readIsSoundTurnedOff()) this.start()
      return
    }
    // Music the browser didn't let start (or that a hidden tab paused) gets another try.
    if (soundStore.read().isPlaying) this.resume()
  }

  /** The sound button. */
  toggle(): void {
    this.hasHeardPress = true
    if (soundStore.read().isPlaying) {
      this.stop()
      writeIsSoundTurnedOff(true)
    } else {
      writeIsSoundTurnedOff(false)
      this.start()
    }
  }

  playCue(name: SoundCueName): void {
    if (!soundStore.read().isPlaying || this.graph === null) return
    playSoundCue(this.graph.cueOutput, name)
  }

  /** Find open: the room's sound goes soft and far, as if behind a door. */
  setRoomMuffled(isMuffled: boolean): void {
    if (this.graph === null) return
    const { context, roomFilter } = this.graph
    roomFilter.frequency.setTargetAtTime(
      isMuffled ? SOUND_MIX.roomMuffledHertz : SOUND_MIX.roomOpenHertz,
      context.currentTime,
      SOUND_MIX.roomGlideSeconds,
    )
  }

  /** A hidden tab is quiet; it comes back with the tab. */
  setPageVisible(isVisible: boolean): void {
    if (this.graph === null) return
    if (!isVisible) {
      this.graph.music.pause()
      void this.graph.context.suspend()
    } else if (soundStore.read().isPlaying) {
      this.resume()
    }
  }

  private resume(): void {
    if (this.graph === null) return
    void this.graph.context.resume()
    this.graph.music.play()
  }

  private start(): void {
    const graph = this.readGraph()
    if (graph === null) return
    if (this.suspendTimer !== null) window.clearTimeout(this.suspendTimer)
    this.suspendTimer = null
    this.resume()
    const now = graph.context.currentTime
    graph.master.gain.cancelScheduledValues(now)
    graph.master.gain.setValueAtTime(graph.master.gain.value, now)
    graph.master.gain.linearRampToValueAtTime(SOUND_MIX.masterGain, now + SOUND_MIX.fadeInSeconds)
    soundStore.update({ isPlaying: true })
  }

  private stop(): void {
    soundStore.update({ isPlaying: false })
    const graph = this.graph
    if (graph === null) return
    const now = graph.context.currentTime
    graph.master.gain.cancelScheduledValues(now)
    graph.master.gain.setValueAtTime(graph.master.gain.value, now)
    graph.master.gain.linearRampToValueAtTime(0, now + SOUND_MIX.fadeOutSeconds)
    this.suspendTimer = window.setTimeout(
      () => {
        this.suspendTimer = null
        graph.music.pause()
        void graph.context.suspend()
      },
      (SOUND_MIX.fadeOutSeconds + 0.5) * 1000,
    )
  }

  /** The graph, made on first use. Null where the browser has no Web Audio. */
  private readGraph(): SoundGraph | null {
    if (this.graph !== null) return this.graph
    if (typeof window.AudioContext !== 'function') return null
    const audioSession = (navigator as NavigatorWithAudioSession).audioSession
    if (audioSession !== undefined) audioSession.type = 'ambient'
    const context = new AudioContext({ latencyHint: 'interactive' })

    const limiter = context.createDynamicsCompressor()
    limiter.threshold.value = -10
    limiter.knee.value = 6
    limiter.ratio.value = 6
    limiter.connect(context.destination)
    const master = context.createGain()
    master.gain.value = 0
    master.connect(limiter)
    const roomFilter = context.createBiquadFilter()
    roomFilter.type = 'lowpass'
    roomFilter.frequency.value = SOUND_MIX.roomOpenHertz
    roomFilter.connect(master)

    const reverb = context.createConvolver()
    reverb.buffer = buildReverbImpulse(context, SOUND_MIX.reverbSeconds)
    const reverbReturn = context.createGain()
    reverbReturn.gain.value = SOUND_MIX.reverbReturnGain
    reverb.connect(reverbReturn)
    reverbReturn.connect(roomFilter)

    const cueLevel = context.createGain()
    cueLevel.gain.value = SOUND_MIX.cueGain
    cueLevel.connect(master)
    readNoiseBuffer(context)

    this.graph = {
      context,
      master,
      roomFilter,
      music: new StoreMusic({ context, dry: roomFilter, wet: reverb }),
      cueOutput: { context, dry: cueLevel, wet: reverb },
    }
    return this.graph
  }
}

/** A soft room: stereo noise that dies away, darker as it goes. */
function buildReverbImpulse(context: BaseAudioContext, durationSeconds: number): AudioBuffer {
  const length = Math.floor(context.sampleRate * durationSeconds)
  const impulse = context.createBuffer(2, length, context.sampleRate)
  for (let channel = 0; channel < 2; channel += 1) {
    const samples = impulse.getChannelData(channel)
    let smoothed = 0
    for (let index = 0; index < length; index += 1) {
      const progress = index / length
      // A one-pole low-pass that closes over the tail: high notes fade first, as in a real room.
      const smoothing = 0.2 + progress * 0.75
      smoothed = smoothed * smoothing + (Math.random() * 2 - 1) * (1 - smoothing)
      samples[index] = smoothed * (1 - progress) ** 3
    }
  }
  return impulse
}

function readIsSoundTurnedOff(): boolean {
  try {
    return window.localStorage.getItem(SOUND_OFF_STORAGE_KEY) === '1'
  } catch {
    return false
  }
}

function writeIsSoundTurnedOff(isTurnedOff: boolean): void {
  try {
    if (isTurnedOff) window.localStorage.setItem(SOUND_OFF_STORAGE_KEY, '1')
    else window.localStorage.removeItem(SOUND_OFF_STORAGE_KEY)
  } catch {
    // Nothing to do: the next visit starts the music on its first press again.
  }
}

export const soundEngine = new SoundEngine()
