import { createSmallStore } from './create-small-store'

// The frame rate and draw calls the dev panel shows (Part 1, step 5).

export type DevStats = { framesPerSecond: number; drawCallCount: number; triangleCount: number }

export const devStatsStore = createSmallStore<DevStats>({
  framesPerSecond: 0,
  drawCallCount: 0,
  triangleCount: 0,
})
