import { useCurrentFrame } from 'remotion'
import type { Box } from '../layouts'

// At 1080 wide, hairlines shimmer and vanish after X's re-encode: 2 px is the floor.
const CROSS_MARK_STROKE_WIDTH = 2
const CROSS_MARK_SIZE = 26
/** Registration marks arrive just ahead of what they frame. */
export const CROSS_MARK_LEAD_FRAMES = 3

type CrossMarksProps = {
  box: Box
  color: string
  /** The frame the framed content starts; the marks snap in a few frames earlier. */
  contentStartFrame: number
}

/** "+" marks on the four corners of a block, centred on its corners. */
export function CrossMarks({ box, color, contentStartFrame }: CrossMarksProps) {
  const frame = useCurrentFrame()
  if (frame < contentStartFrame - CROSS_MARK_LEAD_FRAMES) return null
  const corners = [
    { left: box.left, top: box.top },
    { left: box.left + box.width, top: box.top },
    { left: box.left, top: box.top + box.height },
    { left: box.left + box.width, top: box.top + box.height },
  ]
  return (
    <>
      {corners.map((corner) => (
        <CrossMark
          key={`${corner.left}-${corner.top}`}
          left={corner.left}
          top={corner.top}
          color={color}
        />
      ))}
    </>
  )
}

function CrossMark({ left, top, color }: { left: number; top: number; color: string }) {
  const halfSize = CROSS_MARK_SIZE / 2
  const halfStroke = CROSS_MARK_STROKE_WIDTH / 2
  return (
    <>
      <div
        style={{
          position: 'absolute',
          left: left - halfSize,
          top: top - halfStroke,
          width: CROSS_MARK_SIZE,
          height: CROSS_MARK_STROKE_WIDTH,
          backgroundColor: color,
        }}
      />
      <div
        style={{
          position: 'absolute',
          left: left - halfStroke,
          top: top - halfSize,
          width: CROSS_MARK_STROKE_WIDTH,
          height: CROSS_MARK_SIZE,
          backgroundColor: color,
        }}
      />
    </>
  )
}
