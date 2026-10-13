// The pitch video's voice track and its timing (src/pitch/voice-timing.json), which the
// composition is cut to. Run from launch-video/:
//
//   bun scripts/pitch-voice.ts say
//     The scratch track: each line spoken by macOS `say`, joined with pauses.
//   bun scripts/pitch-voice.ts recording <file>
//     Yash's take, cleaned into public/pitch/voice.wav: high-pass, silence trimmed, −16 LUFS.
//   bun scripts/pitch-voice.ts words <words.json>
//     Times each line of the cleaned take from a transcript's word timestamps. The words come
//     from mlx-whisper (whisper-large-v3-turbo, word_timestamps=True) run on
//     public/pitch/voice.wav, as [{ "w": word, "s": startSeconds, "e": endSeconds }].
//
// Writes public/pitch/voice.wav (48 kHz mono) and src/pitch/voice-timing.json.
import { mkdirSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'
import { pitchLines } from '../src/pitch/script'

const PUBLIC_DIRECTORY = 'public/pitch'
const WORK_DIRECTORY = 'out/work/pitch-voice'
const TIMING_FILE = 'src/pitch/voice-timing.json'
const SAY_VOICE = 'Aman'
const SAY_WORDS_PER_MINUTE = 170
const LEAD_IN_SECONDS = 0.8
const PAUSE_WITHIN_SCENE_SECONDS = 0.35
const PAUSE_BETWEEN_SCENES_SECONDS = 1.0
const TAIL_SECONDS = 0.5

type LineTiming = { startSeconds: number; endSeconds: number }

function run(command: string[]): string {
  const result = Bun.spawnSync(command, { stdout: 'pipe', stderr: 'pipe' })
  if (result.exitCode !== 0) {
    throw new Error(`${command.join(' ')}\n${result.stderr.toString()}`)
  }
  return result.stdout.toString()
}

function readDurationSeconds(filePath: string): number {
  return Number(
    run([
      'ffprobe',
      '-v',
      'error',
      '-show_entries',
      'format=duration',
      '-of',
      'csv=p=0',
      filePath,
    ]).trim(),
  )
}

function makeSilence(filePath: string, seconds: number): void {
  run([
    'ffmpeg',
    '-nostdin',
    '-v',
    'error',
    '-y',
    '-f',
    'lavfi',
    '-i',
    'anullsrc=r=48000:cl=mono',
    '-t',
    seconds.toFixed(3),
    '-c:a',
    'pcm_s16le',
    filePath,
  ])
}

function makeSayTrack(): void {
  mkdirSync(WORK_DIRECTORY, { recursive: true })
  mkdirSync(PUBLIC_DIRECTORY, { recursive: true })
  const parts: string[] = []
  const lineTimings: LineTiming[] = []
  let cursorSeconds = 0

  const addSilence = (seconds: number) => {
    const filePath = join(WORK_DIRECTORY, `silence-${parts.length}.wav`)
    makeSilence(filePath, seconds)
    parts.push(filePath)
    cursorSeconds += seconds
  }

  addSilence(LEAD_IN_SECONDS)
  pitchLines.forEach((line, lineIndex) => {
    const previousLine = pitchLines[lineIndex - 1]
    if (previousLine !== undefined) {
      addSilence(
        previousLine.scene === line.scene
          ? PAUSE_WITHIN_SCENE_SECONDS
          : PAUSE_BETWEEN_SCENES_SECONDS,
      )
    }
    const aiffPath = join(WORK_DIRECTORY, `line-${lineIndex}.aiff`)
    const wavPath = join(WORK_DIRECTORY, `line-${lineIndex}.wav`)
    run([
      'say',
      '-v',
      SAY_VOICE,
      '-r',
      String(SAY_WORDS_PER_MINUTE),
      '-o',
      aiffPath,
      line.speech ?? line.text,
    ])
    run([
      'ffmpeg',
      '-nostdin',
      '-v',
      'error',
      '-y',
      '-i',
      aiffPath,
      '-ar',
      '48000',
      '-ac',
      '1',
      '-c:a',
      'pcm_s16le',
      wavPath,
    ])
    const durationSeconds = readDurationSeconds(wavPath)
    lineTimings.push({ startSeconds: cursorSeconds, endSeconds: cursorSeconds + durationSeconds })
    parts.push(wavPath)
    cursorSeconds += durationSeconds
  })
  addSilence(TAIL_SECONDS)

  const listPath = join(WORK_DIRECTORY, 'parts.txt')
  writeFileSync(listPath, parts.map((part) => `file '${join(process.cwd(), part)}'`).join('\n'))
  const voicePath = join(PUBLIC_DIRECTORY, 'voice.wav')
  run([
    'ffmpeg',
    '-nostdin',
    '-v',
    'error',
    '-y',
    '-f',
    'concat',
    '-safe',
    '0',
    '-i',
    listPath,
    '-c:a',
    'pcm_s16le',
    voicePath,
  ])
  writeTiming('say', readDurationSeconds(voicePath), lineTimings)
}

function writeTiming(source: string, durationSeconds: number, lines: LineTiming[]): void {
  const rounded = lines.map(({ startSeconds, endSeconds }) => ({
    startSeconds: Number(startSeconds.toFixed(3)),
    endSeconds: Number(endSeconds.toFixed(3)),
  }))
  writeFileSync(
    TIMING_FILE,
    `${JSON.stringify({ source, durationSeconds: Number(durationSeconds.toFixed(3)), lines: rounded }, null, 2)}\n`,
  )
  console.log(`${TIMING_FILE}: ${source}, ${durationSeconds.toFixed(1)} s, ${lines.length} lines`)
}

// The real take, cleaned. Its lines are then timed from a transcript (`words`).
const SILENCE_THRESHOLD_DECIBELS = -38
const HIGH_PASS_HERTZ = 80
const TARGET_LOUDNESS_LUFS = -16

function cleanRecording(inputPath: string, outputPath: string): void {
  mkdirSync(WORK_DIRECTORY, { recursive: true })
  const trimmedPath = join(WORK_DIRECTORY, 'recording-trimmed.wav')
  // Mono 48 kHz, light high-pass, silence trimmed from both ends (the reverse trick).
  const trimSilence = `silenceremove=start_periods=1:start_threshold=${SILENCE_THRESHOLD_DECIBELS}dB:start_silence=0.15`
  run([
    'ffmpeg',
    '-nostdin',
    '-v',
    'error',
    '-y',
    '-i',
    inputPath,
    '-vn',
    '-ac',
    '1',
    '-ar',
    '48000',
    '-af',
    `highpass=f=${HIGH_PASS_HERTZ},${trimSilence},areverse,${trimSilence},areverse`,
    '-c:a',
    'pcm_s16le',
    trimmedPath,
  ])
  // Two-pass loudnorm to −16 LUFS, applied as one linear gain, then the lead-in and tail.
  const loudnormBase = `loudnorm=I=${TARGET_LOUDNESS_LUFS}:TP=-1.5:LRA=11`
  const measureOutput = Bun.spawnSync(
    [
      'ffmpeg',
      '-nostdin',
      '-i',
      trimmedPath,
      '-af',
      `${loudnormBase}:print_format=json`,
      '-f',
      'null',
      '-',
    ],
    { stderr: 'pipe' },
  ).stderr.toString()
  const measuredJson = measureOutput.match(/\{[^{}]*"input_i"[^{}]*\}/)?.[0]
  if (measuredJson === undefined)
    throw new Error(`loudnorm printed no measurement:\n${measureOutput}`)
  const measured = JSON.parse(measuredJson) as Record<string, string>
  const loudnorm = `${loudnormBase}:measured_I=${measured.input_i}:measured_TP=${measured.input_tp}:measured_LRA=${measured.input_lra}:measured_thresh=${measured.input_thresh}:offset=${measured.target_offset}:linear=true`
  run([
    'ffmpeg',
    '-nostdin',
    '-v',
    'error',
    '-y',
    '-i',
    trimmedPath,
    '-af',
    `${loudnorm},aresample=48000,adelay=${LEAD_IN_SECONDS * 1000}:all=1,apad=pad_dur=${TAIL_SECONDS}`,
    '-ac',
    '1',
    '-c:a',
    'pcm_s16le',
    outputPath,
  ])
}

function takeRecording(inputPath: string): void {
  mkdirSync(PUBLIC_DIRECTORY, { recursive: true })
  const voicePath = join(PUBLIC_DIRECTORY, 'voice.wav')
  cleanRecording(inputPath, voicePath)
  console.log(`${voicePath}: cleaned. Now transcribe it and run \`words <words.json>\`.`)
}

type TranscriptWord = { w: string; s: number; e: number }

function normaliseWord(word: string): string {
  return word.toLowerCase().replace(/[^a-z0-9]/g, '')
}

/** Similar enough for a misheard name ("stradmon" for "stridemon", "work" for "walk"). */
function isWordMatch(scriptWord: string, heardWord: string): boolean {
  if (scriptWord === heardWord) return true
  if (scriptWord.length < 3 || heardWord.length < 3) return false
  return scriptWord.slice(0, 2) === heardWord.slice(0, 2)
}

/**
 * Lines from the word timestamps: the script's words and the heard words are aligned with an
 * edit-distance walk, and each line runs from its first matched word to its last.
 */
function alignLinesToWords(words: TranscriptWord[], durationSeconds: number): LineTiming[] {
  const heard = words
    .map((word) => ({ ...word, token: normaliseWord(word.w) }))
    .filter((word) => word.token.length > 0 && word.s < durationSeconds - TAIL_SECONDS)
  const scriptWords = pitchLines.flatMap((line, lineIndex) =>
    line.text
      .replace(/1,000/g, 'thousand')
      .split(/[\s—-]+/)
      .map(normaliseWord)
      .filter((token) => token.length > 0)
      .map((token) => ({ token, lineIndex })),
  )
  const rowCount = scriptWords.length + 1
  const columnCount = heard.length + 1
  const distance = Array.from({ length: rowCount }, (_, row) =>
    Array.from({ length: columnCount }, (_, column) =>
      row === 0 ? column : column === 0 ? row : 0,
    ),
  )
  for (let row = 1; row < rowCount; row += 1) {
    for (let column = 1; column < columnCount; column += 1) {
      const isMatch = isWordMatch(scriptWords[row - 1]?.token ?? '', heard[column - 1]?.token ?? '')
      const rowValues = distance[row] as number[]
      rowValues[column] = Math.min(
        (distance[row - 1]?.[column - 1] ?? 0) + (isMatch ? 0 : 1),
        (distance[row - 1]?.[column] ?? 0) + 1,
        (rowValues[column - 1] ?? 0) + 1,
      )
    }
  }
  // Walk back, keeping which heard word each script word landed on.
  const heardIndexByScriptWord: (number | undefined)[] = Array(scriptWords.length).fill(undefined)
  let row = rowCount - 1
  let column = columnCount - 1
  while (row > 0 && column > 0) {
    const isMatch = isWordMatch(scriptWords[row - 1]?.token ?? '', heard[column - 1]?.token ?? '')
    const current = distance[row]?.[column] ?? 0
    if (current === (distance[row - 1]?.[column - 1] ?? 0) + (isMatch ? 0 : 1)) {
      heardIndexByScriptWord[row - 1] = column - 1
      row -= 1
      column -= 1
    } else if (current === (distance[row - 1]?.[column] ?? 0) + 1) {
      row -= 1
    } else {
      column -= 1
    }
  }
  return pitchLines.map((line, lineIndex) => {
    const heardIndices = scriptWords
      .map((scriptWord, scriptWordIndex) =>
        scriptWord.lineIndex === lineIndex ? heardIndexByScriptWord[scriptWordIndex] : undefined,
      )
      .filter((index): index is number => index !== undefined)
    const firstWord = heard[Math.min(...heardIndices)]
    const lastWord = heard[Math.max(...heardIndices)]
    if (firstWord === undefined || lastWord === undefined) {
      throw new Error(`No heard words for line ${lineIndex}: ${line.text}`)
    }
    return { startSeconds: firstWord.s, endSeconds: lastWord.e }
  })
}

async function retimeFromWords(wordsPath: string): Promise<void> {
  const voicePath = join(PUBLIC_DIRECTORY, 'voice.wav')
  const durationSeconds = readDurationSeconds(voicePath)
  const words = (await Bun.file(wordsPath).json()) as TranscriptWord[]
  const timings = alignLinesToWords(words, durationSeconds)
  timings.forEach((timing, lineIndex) => {
    const seconds = `${timing.startSeconds.toFixed(2).padStart(6)}–${timing.endSeconds.toFixed(2).padStart(6)}`
    console.log(`${seconds}  ${pitchLines[lineIndex]?.text}`)
  })
  writeTiming(`words: ${wordsPath}`, durationSeconds, timings)
}

const mode = process.argv[2]
const recordingPath = process.argv[3]
if (mode === 'say') {
  makeSayTrack()
} else if (mode === 'recording' && recordingPath !== undefined) {
  takeRecording(recordingPath)
} else if (mode === 'words' && recordingPath !== undefined) {
  await retimeFromWords(recordingPath)
} else {
  console.error('usage: bun scripts/pitch-voice.ts say | recording <file> | words <words.json>')
  process.exit(1)
}
