import type { ReactNode } from 'react'
import { appTourPhoneColors } from '../../theme'

// The film's phone (Yash, STOP 1: "more realistic"): a logo-free Android around the screen, with
// black glass and a thin bezel, a graphite metal rim catching light at its top left, volume and
// power keys on the right, a faint sheen on the glass and a soft shadow on the backdrop. No notch
// and no Dynamic Island: it's an Android app. Sizes are in the screen's own pixels (the reel's
// 720 × 1560) times `unit`, so the icon's landing can draw it around a box that's still changing.

const GLASS_BEZEL_PIXELS = 13
const RIM_PIXELS = 9
const KEY_DEPTH_PIXELS = 5
/** The right-side keys, from the screen's top: volume, then power, as a 20:9 Android has them. */
const keys = [
  { top: 287, height: 190 },
  { top: 547, height: 110 },
] as const

/** How far the shell reaches past the screen on each side, in screen pixels. */
export const SHELL_BEZEL_PIXELS = GLASS_BEZEL_PIXELS

type RealisticPhoneShellProps = {
  screenWidth: number
  screenHeight: number
  screenRadius: number
  /** Frame pixels per screen pixel (1 inside the phone's own scaled box). */
  unit?: number
  /** The shell fades in as the icon lands; the screen itself is never faded. */
  shellOpacity?: number
  children: ReactNode
}

/** The screen at (0, 0) of its parent, with the device drawn around it. */
export function RealisticPhoneShell({
  screenWidth,
  screenHeight,
  screenRadius,
  unit = 1,
  shellOpacity = 1,
  children,
}: RealisticPhoneShellProps) {
  const bezel = GLASS_BEZEL_PIXELS * unit
  const rim = RIM_PIXELS * unit
  const keyDepth = KEY_DEPTH_PIXELS * unit
  const glassRadius = screenRadius + bezel
  const { rimLight, rimMid, rimDark, glass, edgeHighlight, sheen, shadowNear, shadowFar } =
    appTourPhoneColors
  const metal = `linear-gradient(140deg, ${rimLight} 0%, ${rimMid} 22%, ${rimDark} 55%, ${rimMid} 85%, ${rimLight} 100%)`
  return (
    <div
      style={{ position: 'absolute', left: 0, top: 0, width: screenWidth, height: screenHeight }}
    >
      <div style={{ position: 'absolute', inset: 0, opacity: shellOpacity }}>
        {keys.map((key) => (
          <div
            key={key.top}
            style={{
              position: 'absolute',
              left: screenWidth + bezel + rim - 2 * unit,
              top: key.top * unit,
              width: keyDepth + 2 * unit,
              height: key.height * unit,
              borderRadius: `0 ${keyDepth}px ${keyDepth}px 0`,
              background: `linear-gradient(90deg, ${rimDark}, ${rimLight} 60%, ${rimMid})`,
            }}
          />
        ))}
        <div
          style={{
            position: 'absolute',
            left: -bezel - rim,
            top: -bezel - rim,
            width: screenWidth + 2 * (bezel + rim),
            height: screenHeight + 2 * (bezel + rim),
            borderRadius: glassRadius + rim,
            background: metal,
            boxShadow: `0 ${40 * unit}px ${80 * unit}px ${shadowFar}, 0 ${12 * unit}px ${24 * unit}px ${shadowNear}, inset 0 ${unit}px 0 ${edgeHighlight}`,
          }}
        />
        <div
          style={{
            position: 'absolute',
            left: -bezel,
            top: -bezel,
            width: screenWidth + 2 * bezel,
            height: screenHeight + 2 * bezel,
            borderRadius: glassRadius,
            backgroundColor: glass,
            boxShadow: `inset 0 0 0 ${unit}px ${edgeHighlight}`,
          }}
        />
      </div>
      <div
        style={{
          position: 'absolute',
          inset: 0,
          borderRadius: screenRadius,
          overflow: 'hidden',
        }}
      >
        {children}
        <div
          style={{
            position: 'absolute',
            inset: 0,
            background: `linear-gradient(118deg, ${sheen} 0%, transparent 38%)`,
            opacity: shellOpacity,
            pointerEvents: 'none',
          }}
        />
      </div>
    </div>
  )
}
