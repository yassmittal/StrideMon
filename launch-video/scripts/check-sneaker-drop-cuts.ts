// The Sneaker drop film's cut-sync report (docs/sneaker-drop-video-prompt.md, STOP 2 and 3): finds
// every cut in a render and matches it to the hit map. Run from launch-video/:
//
//   bun scripts/check-sneaker-drop-cuts.ts out/stridemon-sneaker-drop-4x5.mp4 [threshold]
//
// The brief's threshold, 0.3, finds the cuts that change most of the frame. A lower one (0.05)
// also finds the single-shoe swaps and split stamps, which change only part of it.
//
// A cut is a frame ffmpeg's scene detection scores over SCENE_THRESHOLD (select='gt(scene,0.3)'
// with showinfo). Each is matched to the nearest hit in src/sneaker-drop/hits.ts. The report lists
// every cut and its hit, and exits non-zero if any cut is more than one frame off a hit.

import { hits } from '../src/sneaker-drop/hits'

const SCENE_THRESHOLD = Number(process.argv[3] ?? 0.3)
const FRAMES_PER_SECOND = 60
const MAXIMUM_OFFSET_FRAMES = 1

const videoFile = process.argv[2]
if (videoFile === undefined) {
  console.error('usage: bun scripts/check-sneaker-drop-cuts.ts <video> [threshold]')
  process.exit(2)
}

const ffmpeg = Bun.spawn(
  [
    'ffmpeg',
    '-nostdin',
    '-hide_banner',
    '-i',
    videoFile,
    '-an',
    '-vf',
    `select='gt(scene,${SCENE_THRESHOLD})',showinfo`,
    '-f',
    'null',
    '-',
  ],
  { stderr: 'pipe', stdout: 'ignore' },
)
const log = await new Response(ffmpeg.stderr).text()
await ffmpeg.exited

const cutFrames = [...log.matchAll(/showinfo.*?pts_time:\s*([\d.]+)/g)].map((match) =>
  Math.round(Number(match[1]) * FRAMES_PER_SECOND),
)

const beatName = (sixteenth: number) => {
  const beat = Math.floor(sixteenth / 4)
  const sixteenthInBeat = sixteenth % 4
  return sixteenthInBeat === 0 ? `beat ${beat}` : `beat ${beat} + ${sixteenthInBeat}/16`
}

let offCount = 0
console.log(`Cut-sync report: ${videoFile}`)
console.log(`${cutFrames.length} cuts (scene score > ${SCENE_THRESHOLD})\n`)
console.log('cut frame  nearest hit                     offset')
for (const cutFrame of cutFrames) {
  const nearest = hits.reduce((best, hit) =>
    Math.abs(hit.frame - cutFrame) < Math.abs(best.frame - cutFrame) ? hit : best,
  )
  const sameFrame = hits.filter((hit) => hit.frame === nearest.frame).map((hit) => hit.kind)
  const offset = cutFrame - nearest.frame
  const isOff = Math.abs(offset) > MAXIMUM_OFFSET_FRAMES
  if (isOff) offCount += 1
  console.log(
    `${String(cutFrame).padStart(9)}  ${`${beatName(nearest.sixteenth)} (${sameFrame.join(' + ')})`.padEnd(32)}${offset >= 0 ? '+' : ''}${offset}${isOff ? '   OFF THE HIT MAP' : ''}`,
  )
}
console.log(
  `\n${offCount === 0 ? 'Clean' : `${offCount} cut(s) off the hit map`}: every cut must sit within ${MAXIMUM_OFFSET_FRAMES} frame of a hit.`,
)
process.exit(offCount === 0 ? 0 : 1)
