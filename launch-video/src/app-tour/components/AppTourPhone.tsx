import type { ReactNode } from 'react'
import { APP_TOUR_WIDTH } from '../beats'
import type { PhoneFraming } from '../camera'
import { REEL_HEIGHT_PIXELS, REEL_WIDTH_PIXELS } from '../footage'
import { RealisticPhoneShell, SHELL_BEZEL_PIXELS } from './RealisticPhoneShell'

// The phone, drawn at its natural size around the reel's 720 × 1560 screen and placed by the
// camera's framing, so the footage and the rebuilt screens inside it are never resampled twice.
// The framing's width is the glass's (the screen plus its bezel); the metal rim sits outside it.

export const NATURAL_PHONE_BEZEL = SHELL_BEZEL_PIXELS
export const NATURAL_PHONE_WIDTH = REEL_WIDTH_PIXELS + 2 * NATURAL_PHONE_BEZEL
export const NATURAL_PHONE_HEIGHT = REEL_HEIGHT_PIXELS + 2 * NATURAL_PHONE_BEZEL
/** The screen's corners, as the website's frame rounds them (28/296 of the width, less the bezel). */
export const NATURAL_SCREEN_RADIUS =
  Math.round((NATURAL_PHONE_WIDTH * 28) / 296) - NATURAL_PHONE_BEZEL

export function readPhoneScale(framing: PhoneFraming): number {
  return (framing.widthShare * APP_TOUR_WIDTH) / NATURAL_PHONE_WIDTH
}

export function AppTourPhone({
  framing,
  children,
}: {
  framing: PhoneFraming
  children: ReactNode
}) {
  return (
    <div
      style={{
        position: 'absolute',
        left: framing.centerX - NATURAL_PHONE_WIDTH / 2,
        top: framing.top,
        width: NATURAL_PHONE_WIDTH,
        height: NATURAL_PHONE_HEIGHT,
        transformOrigin: '50% 0%',
        scale: String(readPhoneScale(framing)),
      }}
    >
      <div style={{ position: 'absolute', inset: 0, rotate: `${framing.rotation}deg` }}>
        <div style={{ position: 'absolute', left: NATURAL_PHONE_BEZEL, top: NATURAL_PHONE_BEZEL }}>
          <RealisticPhoneShell
            screenWidth={REEL_WIDTH_PIXELS}
            screenHeight={REEL_HEIGHT_PIXELS}
            screenRadius={NATURAL_SCREEN_RADIUS}
          >
            {children}
          </RealisticPhoneShell>
        </div>
      </div>
    </div>
  )
}
