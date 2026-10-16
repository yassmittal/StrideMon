// Where everything sits in the Pass chat film (1920 × 1080), and how big it is. The phone and its
// screen are in their own pixels (the phone's frame, before the camera); everything else is in
// the composition's pixels. Sizes measured from the reference are in reference.md.

import type { PhoneDimensions } from './components/PhoneBody'

/** The phone's body: a 20:9-ish Android slab, about 9% as deep as it is wide. */
export const phoneDimensions: PhoneDimensions = {
  width: 1240,
  height: 2700,
  cornerRadius: 170,
  depth: 112,
}

/** The lime rim round the bezel, and the ink bezel itself. */
export const PHONE_RIM_PIXELS = 16
export const PHONE_BEZEL_PIXELS = 26

export const phoneScreen = {
  width: phoneDimensions.width - 2 * (PHONE_RIM_PIXELS + PHONE_BEZEL_PIXELS),
  height: phoneDimensions.height - 2 * (PHONE_RIM_PIXELS + PHONE_BEZEL_PIXELS),
  cornerRadius: phoneDimensions.cornerRadius - PHONE_RIM_PIXELS - PHONE_BEZEL_PIXELS,
  punchHoleDiameter: 40,
  punchHoleTop: 44,
} as const

/** The chat, in the screen's pixels (the reference's proportions at our bubble size). */
export const chatLayout = {
  sidePadding: 48,
  /** The compose bar's bottom edge sits this far above the screen's bottom (the gesture area). */
  composeBottomInset: 78,
  composeHeight: 104,
  /** Between the compose bar and the newest bubble. */
  composeGap: 56,
  bubbleGap: 26,
  bubbleFontSize: 58,
  bubbleLineHeight: 1.22,
  /** The script word is set a little larger, so its x-height matches Satoshi's. */
  scriptFontScale: 1.08,
  bubblePaddingVertical: 28,
  bubblePaddingHorizontal: 40,
  bubbleRadius: 50,
  bubbleMaxWidthRatio: 0.76,
  timestampFontSize: 34,
  timestampGap: 30,
  placeholderFontSize: 44,
} as const

/** The phone's centre in the screen's pixels is (0, 0); these are points on its face. */
export const phoneFacePoints = {
  /** About where the newest bubble sits, just above the compose bar: the chat's focus. */
  newestBubble: {
    x: 0,
    y:
      phoneScreen.height / 2 -
      chatLayout.composeBottomInset -
      chatLayout.composeHeight -
      chatLayout.composeGap -
      90,
  },
} as const

/** The card (scene 4): 58% of the frame wide, as measured, in the frame's own 16:9. */
export const cardLayout = {
  width: 1114,
  height: 626,
  /** 28 px at 1920, as the brief and the reference's card have it. */
  radius: 28,
  /** The burst's card: about 92% of the frame, as measured. */
  grownWidth: 1766,
  grownHeight: 960,
  labelGap: 40,
  labelFontSize: 40,
} as const
