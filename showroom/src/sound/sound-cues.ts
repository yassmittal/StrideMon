import type { SoundCueName } from './visit-cues'

// The soft cues (D-070), each drawn from oscillators and a little noise at the moment it plays:
// no files. Quiet, short, never looped. The bells are D major notes: soft and high, over the music.

/** Where a cue plays: the dry sound, and the send to the shared reverb. */
export type CueOutput = { context: AudioContext; dry: AudioNode; wet: AudioNode }

type ToneOptions = {
  frequencyHertz: number
  startSeconds: number
  peakGain: number
  decaySeconds: number
  type?: OscillatorType
  /** Glide to this pitch over the first `glideSeconds`. */
  glideToHertz?: number
  glideSeconds?: number
  wetShare?: number
}

/** One tone with a quick attack and an exponential fall. */
function playTone(output: CueOutput, options: ToneOptions): void {
  const { context } = output
  const {
    frequencyHertz,
    startSeconds,
    peakGain,
    decaySeconds,
    type = 'sine',
    glideToHertz,
    glideSeconds = 0.05,
    wetShare = 0,
  } = options
  const oscillator = context.createOscillator()
  oscillator.type = type
  oscillator.frequency.setValueAtTime(frequencyHertz, startSeconds)
  if (glideToHertz !== undefined)
    oscillator.frequency.exponentialRampToValueAtTime(glideToHertz, startSeconds + glideSeconds)
  const envelope = context.createGain()
  envelope.gain.setValueAtTime(0, startSeconds)
  envelope.gain.linearRampToValueAtTime(peakGain, startSeconds + 0.006)
  envelope.gain.exponentialRampToValueAtTime(0.0001, startSeconds + decaySeconds)
  oscillator.connect(envelope)
  envelope.connect(output.dry)
  if (wetShare > 0) {
    const send = context.createGain()
    send.gain.value = wetShare
    envelope.connect(send)
    send.connect(output.wet)
  }
  oscillator.start(startSeconds)
  oscillator.stop(startSeconds + decaySeconds + 0.05)
}

/** A glassy bell: the note and two quiet partials above it, which fade faster. */
function playBell(
  output: CueOutput,
  frequencyHertz: number,
  startSeconds: number,
  peakGain: number,
  decaySeconds: number,
  wetShare: number,
): void {
  playTone(output, { frequencyHertz, startSeconds, peakGain, decaySeconds, wetShare })
  playTone(output, {
    frequencyHertz: frequencyHertz * 2,
    startSeconds,
    peakGain: peakGain * 0.22,
    decaySeconds: decaySeconds * 0.45,
    wetShare,
  })
  playTone(output, {
    frequencyHertz: frequencyHertz * 3.01,
    startSeconds,
    peakGain: peakGain * 0.08,
    decaySeconds: decaySeconds * 0.25,
    wetShare,
  })
}

const noiseBuffers = new WeakMap<BaseAudioContext, AudioBuffer>()

/** One second of white noise, made once per context. */
export function readNoiseBuffer(context: BaseAudioContext): AudioBuffer {
  const cached = noiseBuffers.get(context)
  if (cached !== undefined) return cached
  const buffer = context.createBuffer(1, context.sampleRate, context.sampleRate)
  const samples = buffer.getChannelData(0)
  for (let index = 0; index < samples.length; index += 1) samples[index] = Math.random() * 2 - 1
  noiseBuffers.set(context, buffer)
  return buffer
}

type NoiseOptions = {
  startSeconds: number
  durationSeconds: number
  peakGain: number
  /** The band the noise passes, from start to peak to end. */
  bandHertz: readonly [number, number, number]
  qualityFactor: number
  /** Where in the duration the swell peaks, 0 to 1. */
  peakShare: number
  wetShare?: number
}

/** Filtered noise that swells and fades: air moving, a soft tap. */
function playNoise(output: CueOutput, options: NoiseOptions): void {
  const { context } = output
  const { startSeconds, durationSeconds, peakGain, bandHertz, qualityFactor, peakShare } = options
  const peakSeconds = startSeconds + durationSeconds * peakShare
  const endSeconds = startSeconds + durationSeconds
  const source = context.createBufferSource()
  source.buffer = readNoiseBuffer(context)
  source.loop = true
  const filter = context.createBiquadFilter()
  filter.type = 'bandpass'
  filter.Q.value = qualityFactor
  filter.frequency.setValueAtTime(bandHertz[0], startSeconds)
  filter.frequency.exponentialRampToValueAtTime(bandHertz[1], peakSeconds)
  filter.frequency.exponentialRampToValueAtTime(bandHertz[2], endSeconds)
  const envelope = context.createGain()
  envelope.gain.setValueAtTime(0.0001, startSeconds)
  envelope.gain.exponentialRampToValueAtTime(peakGain, peakSeconds)
  envelope.gain.exponentialRampToValueAtTime(0.0001, endSeconds)
  source.connect(filter)
  filter.connect(envelope)
  envelope.connect(output.dry)
  if (options.wetShare !== undefined) {
    const send = context.createGain()
    send.gain.value = options.wetShare
    envelope.connect(send)
    send.connect(output.wet)
  }
  source.start(startSeconds, Math.random() * 0.5)
  source.stop(endSeconds + 0.05)
}

/** Note frequencies the cues use (D major). */
const NOTE_HERTZ = {
  fSharp5: 739.99,
  a5: 880,
  b5: 987.77,
  d6: 1174.66,
  fSharp6: 1479.98,
} as const

/** Plays one cue now. */
export function playSoundCue(output: CueOutput, name: SoundCueName): void {
  const now = output.context.currentTime + 0.005
  if (name === 'press') {
    // A soft, wooden press: a tick of noise and a short falling thock under it.
    playNoise(output, {
      startSeconds: now,
      durationSeconds: 0.03,
      peakGain: 0.07,
      bandHertz: [3600, 3000, 2400],
      qualityFactor: 1.2,
      peakShare: 0.15,
    })
    playTone(output, {
      frequencyHertz: 720,
      glideToHertz: 380,
      glideSeconds: 0.04,
      startSeconds: now,
      peakGain: 0.07,
      decaySeconds: 0.07,
    })
  } else if (name === 'hover') {
    playTone(output, {
      frequencyHertz: 2400,
      startSeconds: now,
      peakGain: 0.012,
      decaySeconds: 0.03,
    })
  } else if (name === 'move') {
    // Air moving past as the camera walks.
    playNoise(output, {
      startSeconds: now,
      durationSeconds: 1.5,
      peakGain: 0.05,
      bandHertz: [350, 1100, 500],
      qualityFactor: 0.7,
      peakShare: 0.4,
      wetShare: 0.4,
    })
  } else if (name === 'door') {
    // The shop door's chime, then the air of walking through.
    playBell(output, NOTE_HERTZ.a5, now, 0.06, 2.2, 0.55)
    playBell(output, NOTE_HERTZ.fSharp5, now + 0.32, 0.055, 2.6, 0.55)
    playNoise(output, {
      startSeconds: now + 0.2,
      durationSeconds: 2.6,
      peakGain: 0.04,
      bandHertz: [300, 900, 420],
      qualityFactor: 0.7,
      peakShare: 0.45,
      wetShare: 0.4,
    })
  } else if (name === 'lookCloser') {
    playBell(output, NOTE_HERTZ.a5, now, 0.035, 1.1, 0.5)
    playBell(output, NOTE_HERTZ.d6, now + 0.08, 0.035, 1.4, 0.5)
    playNoise(output, {
      startSeconds: now,
      durationSeconds: 0.7,
      peakGain: 0.025,
      bandHertz: [600, 1600, 900],
      qualityFactor: 0.8,
      peakShare: 0.5,
    })
  } else if (name === 'leaveLookCloser') {
    playBell(output, NOTE_HERTZ.d6, now, 0.03, 1, 0.5)
    playBell(output, NOTE_HERTZ.a5, now + 0.08, 0.03, 1.2, 0.5)
  } else if (name === 'neighbour') {
    playBell(output, NOTE_HERTZ.b5, now, 0.026, 0.8, 0.45)
    playNoise(output, {
      startSeconds: now,
      durationSeconds: 0.45,
      peakGain: 0.02,
      bandHertz: [900, 1800, 1200],
      qualityFactor: 0.9,
      peakShare: 0.4,
    })
  } else if (name === 'placeOnStand') {
    // A Sneaker set down on the counter, then a shimmer as the light finds it.
    playTone(output, {
      frequencyHertz: 150,
      glideToHertz: 70,
      glideSeconds: 0.12,
      startSeconds: now,
      peakGain: 0.12,
      decaySeconds: 0.22,
    })
    playBell(output, NOTE_HERTZ.d6, now + 0.12, 0.03, 1.6, 0.6)
    playBell(output, NOTE_HERTZ.fSharp6, now + 0.2, 0.02, 1.8, 0.6)
  } else if (name === 'findOpen') {
    playTone(output, {
      frequencyHertz: 520,
      glideToHertz: 820,
      glideSeconds: 0.07,
      startSeconds: now,
      peakGain: 0.045,
      decaySeconds: 0.14,
      wetShare: 0.2,
    })
  } else if (name === 'findClose') {
    playTone(output, {
      frequencyHertz: 820,
      glideToHertz: 520,
      glideSeconds: 0.07,
      startSeconds: now,
      peakGain: 0.04,
      decaySeconds: 0.14,
      wetShare: 0.2,
    })
  }
}
