import type { SectionTone } from '../theme'
import { musicBeats } from './beats'
import { GHOST_CLAP_STRENGTH } from './content'
import { readHitFrame, readHitsBetween } from './hit-map'
import type { Hit } from './hits'
import { HERO_DESIGN_NUMBER, SEQUENCE_DESIGN_NUMBERS } from './sneakers'

// The whole film as states that start on hits (docs/sneaker-drop-video-prompt.md §3, content.ts's
// hitMoves). Nothing here is a typed frame: each start is a hit from hits.ts, named by its beat
// and kind, or the result of the one mapping applied to every hit in a stretch of the music.

/** The cold open and the build: the hero as line art. */
export const lineArtTimeline = {
  /** The outline is already partly drawn on frame 0 (the X thumbnail is a drawing, not black). */
  outlineStartFrame: -50,
  /** It closes on the intro's second cowbell note. */
  outlineEndFrame: readHitFrame({ beat: 1.5, kind: 'cowbell' }),
  panelStartFrame: readHitFrame({ beat: 1.5, kind: 'cowbell' }),
  /** The panels finish, and the laces fill in, on the build's first cowbell note. */
  panelEndFrame: readHitFrame({ beat: 4, kind: 'cowbell' }),
  detailsFrame: readHitFrame({ beat: 4, kind: 'cowbell' }),
  punchFrames: readHitsBetween({ fromBeat: 0, toBeat: musicBeats.drop, kinds: ['cowbell'] }).map(
    (hit) => hit.frame,
  ),
  /** The build's first clap that isn't a ghost: punch in on the heel. */
  macroFrame: readHitFrame({ beat: 5.25, kind: 'snare' }),
  /** Beat 7's hit, the loudest of the build: flip to off-white, the drawing in ink. */
  slamFrame: readHitFrame({ beat: 7, kind: 'snare' }),
  /** The music falls silent before the drop: back to black, the drawing small. */
  inhaleFrame: readHitFrame({ beat: 7.75, kind: 'stop' }),
} as const

export type CellsFraming =
  | 'heroFull'
  | 'heroMacroHeel'
  | 'heroMacroToe'
  | 'one'
  | 'two'
  | 'four'
  | 'nine'

/** What's on screen from a hit until the next state: a framing, a tone and a shoe per cell. */
export type CellsState = {
  startFrame: number
  tone: SectionTone
  framing: CellsFraming
  designNumbers: readonly number[]
}

const SPLIT_CELL_COUNTS = { two: 2, four: 4, nine: 9 } as const

/** The drop bar's four kicks frame the hero four ways: whole and huge, two punch-ins, then registered. */
const HERO_BAR_FRAMINGS: readonly CellsFraming[] = [
  'heroFull',
  'heroMacroHeel',
  'heroMacroToe',
  'one',
]

/** Bars 3 to 8 (beats 12–35): one shoe per kick, then the 2-, 4- and 9-up splits. */
const FRAMING_BY_BAR: Record<number, CellsFraming> = {
  3: 'one',
  4: 'one',
  5: 'one',
  6: 'two',
  7: 'four',
  8: 'nine',
}

const FLOOD_START_BEAT = 36

/**
 * The drop through the 9-up split (beats 8–35), from the mapping in content.ts: a kick or a clap
 * cuts (and flips the tone on a bar's downbeat); a cowbell punches one shoe or stamps a split's
 * next cell. It uses up the sequence in sneakers.ts exactly, or throws.
 */
function buildCellsTimeline(): { states: CellsState[]; punchFrames: number[] } {
  const events = groupBySixteenth(
    readHitsBetween({
      fromBeat: musicBeats.drop,
      toBeat: FLOOD_START_BEAT,
      kinds: ['kick', 'snare', 'cowbell'],
    }),
  )
  const queue = [...SEQUENCE_DESIGN_NUMBERS]
  const takeNext = (): number => {
    const next = queue.shift()
    if (next === undefined) throw new Error('The sequence in sneakers.ts is too short')
    return next
  }
  if (takeNext() !== HERO_DESIGN_NUMBER) throw new Error('The sequence must open on the hero')

  const states: CellsState[] = []
  const punchFrames: number[] = []
  let stampCursor = 0
  for (const sixteenthHits of events) {
    const sixteenth = sixteenthHits[0]?.sixteenth ?? 0
    const frame = sixteenthHits[0]?.frame ?? 0
    const isCut = sixteenthHits.some(
      (hit) => hit.kind === 'kick' || (hit.kind === 'snare' && hit.strength >= GHOST_CLAP_STRENGTH),
    )
    const isCowbell = sixteenthHits.some((hit) => hit.kind === 'cowbell')
    if (!isCut && !isCowbell) continue
    const bar = Math.floor(sixteenth / 16)
    const isDownbeat = sixteenth % 16 === 0
    const tone: SectionTone = bar % 2 === 0 ? 'dark' : 'light'
    const previous = states[states.length - 1]

    if (bar === 2) {
      if (isCut) {
        const framing = HERO_BAR_FRAMINGS[Math.floor((sixteenth % 16) / 4)] ?? 'one'
        states.push({ startFrame: frame, tone, framing, designNumbers: [HERO_DESIGN_NUMBER] })
      } else {
        punchFrames.push(frame)
      }
      continue
    }
    const framing = FRAMING_BY_BAR[bar]
    if (framing === undefined) throw new Error(`No framing for bar ${bar}`)
    if (framing === 'one') {
      if (isCut) states.push({ startFrame: frame, tone, framing, designNumbers: [takeNext()] })
      else punchFrames.push(frame)
      continue
    }
    const cellCount = SPLIT_CELL_COUNTS[framing as keyof typeof SPLIT_CELL_COUNTS]
    if (isDownbeat) {
      stampCursor = 0
      const designNumbers = Array.from({ length: cellCount }, takeNext)
      states.push({ startFrame: frame, tone, framing, designNumbers })
      continue
    }
    if (previous === undefined) throw new Error('A stamp before any split')
    const designNumbers = [...previous.designNumbers]
    designNumbers[stampCursor] = takeNext()
    stampCursor = (stampCursor + 1) % cellCount
    states.push({ startFrame: frame, tone, framing, designNumbers })
  }
  if (queue.length > 0) {
    throw new Error(`The sequence in sneakers.ts has ${queue.length} designs the film never shows`)
  }
  return { states, punchFrames }
}

export const cellsTimeline = buildCellsTimeline()

/** Bar 9 (beats 36–39): the flood pulls back a step on every hit, hats included. */
export const floodStepFrames: readonly number[] = groupBySixteenth(
  readHitsBetween({
    fromBeat: FLOOD_START_BEAT,
    toBeat: musicBeats.join,
    kinds: ['kick', 'snare', 'cowbell', 'hat'],
  }),
).map((sixteenthHits) => sixteenthHits[0]?.frame ?? 0)

/** The track's last bar: the Legendary on the join, its name on the next clap, its picture on the last. */
export const legendaryTimeline = {
  startFrame: readHitFrame({ beat: musicBeats.join, kind: 'kick' }),
  labelFrame: readHitFrame({ beat: 41, kind: 'snare' }),
  founderSneakerFrame: readHitFrame({ beat: 43, kind: 'snare' }),
} as const

/** The music stops: the end card cuts in on the silence and holds through the tail. */
export const END_CARD_FRAME = readHitFrame({ beat: musicBeats.stop, kind: 'stop' })

function groupBySixteenth(hitsToGroup: readonly Hit[]): Hit[][] {
  const groups = new Map<number, Hit[]>()
  for (const hit of hitsToGroup) {
    groups.set(hit.sixteenth, [...(groups.get(hit.sixteenth) ?? []), hit])
  }
  return [...groups.values()]
}
