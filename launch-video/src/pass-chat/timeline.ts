// The Pass chat film's timeline: every scene's frames, named once (docs/pass-chat-video-prompt.md
// §2, retimed from the reference's measured beats in reference.md). 60 fps, 1920 × 1080. Every
// other file reads its frames from here.

import { HANDWRITING_DURATION_FRAMES } from './handwriting'

export const PASS_CHAT_FRAMES_PER_SECOND = 60
export const PASS_CHAT_WIDTH = 1920
export const PASS_CHAT_HEIGHT = 1080
/** 11.7 s: the end card holds 2.2 s after the pill lands. */
export const PASS_CHAT_DURATION_IN_FRAMES = 702

/** Scene 1: the phone swings in from the right. Frame 0 already shows it, partly in. */
export const phoneInTimeline = {
  startFrame: 0,
  /** Frame 0 is this far into the swing, so the thumbnail is the phone over sky, not empty sky. */
  startProgress: 0.02,
  endFrame: 30,
} as const

/** Scene 2: the chat. Each bubble lands on its frame; the older ones scroll up as it does. */
export const chatTimeline = {
  bubbleFrames: [24, 90, 156, 222],
  /** Each bubble pops from its tail corner over this long. */
  popDurationFrames: 10,
  /**
   * The older bubbles scroll up by the new one's height over this long, starting a little before
   * the pop, so the room is always there before the bubble fills it (it never overlaps the last).
   */
  scrollLeadFrames: 2,
  scrollDurationFrames: 12,
  endFrame: 300,
} as const

/** Scene 3: the phone spins on Y, faster and faster, through its edge to its back. */
export const spinTimeline = {
  startFrame: 300,
  /** Motion blur starts here and grows to the end. */
  blurStartFrame: 312,
  endFrame: 336,
} as const

/** Scene 4: the whip into the card with #0627 in the same sky. 1.2 s, so its label reads. */
const CARD_START_FRAME = spinTimeline.endFrame
const CARD_HOLD_FRAMES = 84
export const cardTimeline = {
  startFrame: CARD_START_FRAME,
  /** The card arrives blurred and too big, and settles over this long. */
  settleDurationFrames: 12,
  labelFrame: CARD_START_FRAME + 12,
  /** The label dips out just before the card grows, so the growing card never runs into it. */
  labelExitFrame: CARD_START_FRAME + CARD_HOLD_FRAMES - 12,
  endFrame: CARD_START_FRAME + CARD_HOLD_FRAMES,
} as const

/** Scene 5: the card grows and ten shoes burst out from behind #0627, over the sky. */
const BURST_START_FRAME = cardTimeline.endFrame
export const burstTimeline = {
  startFrame: BURST_START_FRAME,
  growDurationFrames: 42,
  /** The first shoe leaves on this frame; the rest follow on the stagger. */
  firstShoeFrame: BURST_START_FRAME + 6,
  shoeStaggerFrames: 2,
  /** Each shoe's flight out, before it drifts. */
  shoeFlightFrames: 30,
  endFrame: BURST_START_FRAME + 58,
} as const

/** Scene 6: the card shrinks away, the frame flips to black, the ring closes in on "This". */
const FLIP_FRAME = burstTimeline.endFrame + 10
export const ringTimeline = {
  startFrame: burstTimeline.endFrame,
  /** The card shrinks into the middle, accelerating into the flip. */
  cardExitDurationFrames: 10,
  flipFrame: FLIP_FRAME,
  /** The ring closes in over this long (as measured, it never stops), fading over its last half. */
  closeDurationFrames: 16,
  fadeStartFrame: FLIP_FRAME + 8,
  endFrame: FLIP_FRAME + 16,
} as const

/** Scene 7: "isn’t" writes itself on, then the camera whips back as "a JPEG." slides in. */
const PEN_START_FRAME = FLIP_FRAME + 12
export const writeTimeline = {
  penStartFrame: PEN_START_FRAME,
  penEndFrame: PEN_START_FRAME + HANDWRITING_DURATION_FRAMES,
  /** An out-expo pull-back: a whip in its first frames, then the reference's slow drift back. */
  pullBackStartFrame: PEN_START_FRAME + 42,
  pullBackDurationFrames: 40,
  slideStartFrame: PEN_START_FRAME + 44,
  slideDurationFrames: 14,
  /** The slide's horizontal blur clears over this long. */
  slideBlurFrames: 10,
  endFrame: PEN_START_FRAME + 68,
} as const

/** Scene 8: the end card. Its last frame is the poster. */
export const endTimeline = {
  startFrame: writeTimeline.endFrame,
  lineFrame: writeTimeline.endFrame + 4,
  pillFrame: writeTimeline.endFrame + 44,
  endFrame: PASS_CHAT_DURATION_IN_FRAMES,
} as const

export type PassChatSceneName =
  | 'phoneIn'
  | 'chat'
  | 'spin'
  | 'card'
  | 'burst'
  | 'ring'
  | 'write'
  | 'end'

/** Where each scene starts and ends, for the scene compositions. */
export const passChatScenes: Record<PassChatSceneName, { startFrame: number; endFrame: number }> = {
  phoneIn: { startFrame: phoneInTimeline.startFrame, endFrame: phoneInTimeline.endFrame },
  chat: { startFrame: chatTimeline.bubbleFrames[0], endFrame: chatTimeline.endFrame },
  spin: { startFrame: spinTimeline.startFrame, endFrame: spinTimeline.endFrame },
  card: { startFrame: cardTimeline.startFrame, endFrame: cardTimeline.endFrame },
  burst: { startFrame: burstTimeline.startFrame, endFrame: burstTimeline.endFrame },
  ring: { startFrame: ringTimeline.startFrame, endFrame: writeTimeline.penStartFrame },
  write: { startFrame: writeTimeline.penStartFrame, endFrame: writeTimeline.endFrame },
  end: { startFrame: endTimeline.startFrame, endFrame: endTimeline.endFrame },
}
