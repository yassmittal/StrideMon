import { AbsoluteFill, useCurrentFrame } from 'remotion'
import { readSectionBackground, readSectionText } from '../../theme'
import { RegisteredSneaker } from '../components/RegisteredSneaker'
import { useLacedSneakerMarkup } from '../components/sneaker-art-context'
import { heroLabel } from '../content'
import {
  placeShoeInCell,
  readSplitCells,
  type ShoePlacement,
  type SneakerDropFormat,
  sneakerDropLayouts,
} from '../layout'
import { readDriftScale, readPunchScale } from '../motion'
import { type CellsFraming, type CellsState, cellsTimeline } from '../timeline'
import { DesignLabel } from './DesignLabel'

const SPLIT_CELL_COUNTS = { two: 2, four: 4, nine: 9 } as const

/**
 * Scenes 3 to 5 up to the flood (beats 8–35). The drop's kick cuts to the hero, whole and huge,
 * and the bar's next kicks punch in on it twice and set it down at the size every shoe after it
 * shares. Then one shoe per kick, then 2-, 4- and 9-up splits that stamp a new shoe into the next
 * cell on every hit. Each bar's downbeat flips black ↔ off-white (timeline.ts).
 */
export function CellsScene({ format }: { format: SneakerDropFormat }) {
  const frame = useCurrentFrame()
  const { states, punchFrames } = cellsTimeline
  const stateIndex = findLastIndex(states, (state) => state.startFrame <= frame)
  const state = states[Math.max(0, stateIndex)]
  if (state === undefined) return null
  const barStartFrame = findBarStartFrame(states, Math.max(0, stateIndex))
  // The drop bar runs until the first flip, the next bar's downbeat.
  const heroBarEndFrame = states.find((candidate) => candidate.tone !== states[0]?.tone)?.startFrame
  const isHeroBar = heroBarEndFrame === undefined || frame < heroBarEndFrame

  return (
    <AbsoluteFill style={{ backgroundColor: readSectionBackground(state.tone) }}>
      <AbsoluteFill style={{ scale: readDriftScale(frame - barStartFrame) }}>
        <Cells
          state={state}
          format={format}
          punchScale={state.framing in SPLIT_CELL_COUNTS ? 1 : readPunchScale(frame, punchFrames)}
        />
      </AbsoluteFill>
      {isHeroBar && (
        <DesignLabel
          format={format}
          number={heroLabel.number}
          name={heroLabel.name}
          startFrame={states[0]?.startFrame ?? 0}
          color={readSectionText(state.tone)}
        />
      )}
    </AbsoluteFill>
  )
}

function Cells({
  state,
  format,
  punchScale,
}: {
  state: CellsState
  format: SneakerDropFormat
  punchScale: number
}) {
  const layout = sneakerDropLayouts[format]
  const cellCount = SPLIT_CELL_COUNTS[state.framing as keyof typeof SPLIT_CELL_COUNTS]
  const placements: ShoePlacement[] =
    cellCount === undefined
      ? [readOneShoePlacement(state.framing, format)]
      : readSplitCells(layout.splitArea, cellCount).map(placeShoeInCell)
  return (
    <>
      {state.designNumbers.map((designNumber, cellIndex) => {
        const placement = placements[cellIndex]
        if (placement === undefined) return null
        return (
          <Shoe
            // A cell keeps its key, so a stamp swaps only that cell's shoe.
            // biome-ignore lint/suspicious/noArrayIndexKey: cells are fixed positions.
            key={cellIndex}
            designNumber={designNumber}
            placement={placement}
            hasRim={state.tone === 'dark'}
            punchScale={punchScale}
            instanceId={`cell-${cellIndex}`}
          />
        )
      })}
    </>
  )
}

function Shoe({
  designNumber,
  ...props
}: {
  designNumber: number
  placement: ShoePlacement
  hasRim: boolean
  punchScale: number
  instanceId: string
}) {
  const markup = useLacedSneakerMarkup(designNumber)
  return <RegisteredSneaker markup={markup} {...props} />
}

function readOneShoePlacement(framing: CellsFraming, format: SneakerDropFormat): ShoePlacement {
  const { hero, one } = sneakerDropLayouts[format]
  if (framing === 'heroFull') return hero.full
  if (framing === 'heroMacroHeel') return hero.macroHeel
  if (framing === 'heroMacroToe') return hero.macroToe
  return one
}

/** The drift restarts on each tone flip (a bar's downbeat), so it never jumps inside a bar. */
function findBarStartFrame(states: readonly CellsState[], stateIndex: number): number {
  let index = stateIndex
  while (index > 0 && states[index - 1]?.tone === states[index]?.tone) index -= 1
  return states[index]?.startFrame ?? 0
}

function findLastIndex<Item>(items: readonly Item[], predicate: (item: Item) => boolean): number {
  for (let index = items.length - 1; index >= 0; index -= 1) {
    const item = items[index]
    if (item !== undefined && predicate(item)) return index
  }
  return -1
}
