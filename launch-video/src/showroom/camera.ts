import { Easing, interpolate } from 'remotion'
import {
  type ShowroomShotName,
  showroomShots,
  WHIP_IN_END_FRAME,
  WHIP_OUT_START_FRAME,
} from './timeline'

// The camera, shot by shot (docs/showroom-video-prompt.md, "The look"). The store's world is in
// metres: the shop front is the plane z = 0, the street is z > 0, the store runs back to z = −10,
// x from −5 to 5, and the floor is y = 0 (world.ts).
//
// Each shot eases from its start pose to its end pose fast-then-slow, the reference's speed ramp,
// with a little gimbal drift on top. Roll is about the view axis, positive clockwise on screen.

export type Vector3Tuple = readonly [number, number, number]

export type CameraPose = {
  position: Vector3Tuple
  target: Vector3Tuple
  rollDegrees: number
  verticalFovDegrees: number
  /** A turn to the side after aiming at the target, for the whips (positive turns right). */
  panDegrees?: number
}

type ShotMove = {
  startPose: CameraPose
  endPose: CameraPose
  /** How bright the picture is (the renderer's tone-mapping exposure). */
  exposure: number
}

/** The reference's wide phone lens. */
const WIDE_FOV_DEGREES = 78

export const shotMoves: Record<ShowroomShotName, ShotMove> = {
  // Low along the shop fronts at night, the StrideMon front on the right running away up-left.
  streetRun: {
    startPose: {
      position: [10.5, 0.34, 2.3],
      target: [-3, 2.0, -0.4],
      rollDegrees: 28,
      verticalFovDegrees: WIDE_FOV_DEGREES,
    },
    endPose: {
      position: [9.3, 0.38, 2.25],
      target: [-4, 2.0, -0.4],
      rollDegrees: 31,
      verticalFovDegrees: WIDE_FOV_DEGREES,
    },
    exposure: 0.9,
  },
  // The same front in the dark, looking up at the sign.
  darkFront: {
    startPose: {
      position: [-2.2, 1.0, 7.2],
      target: [-0.6, 3.6, 0],
      rollDegrees: -9,
      verticalFovDegrees: 62,
    },
    endPose: {
      position: [-2.0, 1.1, 7.0],
      target: [-0.5, 3.7, 0],
      rollDegrees: -8,
      verticalFovDegrees: 62,
    },
    exposure: 0.45,
  },
  // The lights come on: the whole front, square on.
  litFront: {
    startPose: {
      position: [0.6, 1.5, 8.2],
      target: [0.4, 2.3, 0],
      rollDegrees: -2,
      verticalFovDegrees: 64,
    },
    endPose: {
      position: [0.6, 1.5, 7.6],
      target: [0.4, 2.3, 0],
      rollDegrees: -1.5,
      verticalFovDegrees: 64,
    },
    exposure: 1.0,
  },
  // Inside, low, tilted up at the #0137 lightbox on the left wall.
  heroLightbox: {
    startPose: {
      position: [-2.4, 0.55, -2.2],
      target: [-5, 2.1, -4.4],
      rollDegrees: 30,
      verticalFovDegrees: WIDE_FOV_DEGREES,
    },
    endPose: {
      position: [-2.6, 0.6, -2.5],
      target: [-5, 2.0, -4.3],
      rollDegrees: 22,
      verticalFovDegrees: WIDE_FOV_DEGREES,
    },
    exposure: 1.0,
  },
  // The Legendary poster in the back-left corner, over a table and two chairs.
  legendaryCorner: {
    startPose: {
      position: [-1.6, 1.45, -5.0],
      target: [-3.4, 1.35, -10],
      rollDegrees: -13,
      verticalFovDegrees: WIDE_FOV_DEGREES,
    },
    endPose: {
      position: [-1.8, 1.45, -5.3],
      target: [-3.4, 1.4, -10],
      rollDegrees: -10,
      verticalFovDegrees: WIDE_FOV_DEGREES,
    },
    exposure: 1.0,
  },
  // Low, looking up at the lit "Founding Pass" wall over the counter.
  foundingPassWall: {
    startPose: {
      position: [-0.6, 1.15, -5.6],
      target: [0.9, 2.2, -10],
      rollDegrees: 16,
      verticalFovDegrees: WIDE_FOV_DEGREES,
    },
    endPose: {
      position: [-0.7, 1.2, -5.8],
      target: [0.9, 2.15, -10],
      rollDegrees: 13,
      verticalFovDegrees: WIDE_FOV_DEGREES,
    },
    exposure: 1.0,
  },
  // The Sneaker wall behind the counter, pushing in to the Sneaker on the stand.
  sneakerWall: {
    startPose: {
      position: [1.4, 1.35, -3.0],
      target: [4.4, 1.3, -5.2],
      rollDegrees: -14,
      verticalFovDegrees: WIDE_FOV_DEGREES,
    },
    endPose: {
      position: [2.6, 1.3, -3.9],
      target: [4.2, 1.15, -5.1],
      rollDegrees: -10,
      verticalFovDegrees: WIDE_FOV_DEGREES,
    },
    exposure: 1.0,
  },
  // The "Rare" wall at the front of the left wall, tilted up from low.
  rareWall: {
    startPose: {
      position: [-1.9, 0.75, -3.6],
      target: [-5, 1.95, -1.4],
      rollDegrees: 17,
      verticalFovDegrees: WIDE_FOV_DEGREES,
    },
    endPose: {
      position: [-2.1, 0.8, -3.5],
      target: [-5, 1.95, -1.5],
      rollDegrees: 13,
      verticalFovDegrees: WIDE_FOV_DEGREES,
    },
    exposure: 1.0,
  },
  // Behind the street sign: the store across the street, out of focus.
  streetSign: {
    startPose: {
      position: [6.5, 1.3, 11],
      target: [0.5, 2.2, 0],
      rollDegrees: 0,
      verticalFovDegrees: 56,
    },
    endPose: {
      position: [6.4, 1.3, 10.8],
      target: [0.5, 2.2, 0],
      rollDegrees: 0,
      verticalFovDegrees: 56,
    },
    exposure: 0.85,
  },
}

/** Fast at the cut, slow by the end: the reference's speed ramp. */
const speedRampEasing = Easing.bezier(0.16, 0.84, 0.3, 1)

/** A slow, small sway, like a gimbal in the hand. Deterministic per frame. */
function readGimbalDrift(frame: number): { offset: Vector3Tuple; rollDegrees: number } {
  const seconds = frame / 30
  return {
    offset: [
      0.012 * Math.sin(seconds * 1.7 + 0.4) + 0.006 * Math.sin(seconds * 3.1),
      0.01 * Math.sin(seconds * 2.3 + 1.1),
      0.008 * Math.sin(seconds * 1.3 + 2.2),
    ],
    rollDegrees: 0.35 * Math.sin(seconds * 1.9 + 0.7),
  }
}

function mixTuple(from: Vector3Tuple, to: Vector3Tuple, progress: number): Vector3Tuple {
  return [
    from[0] + (to[0] - from[0]) * progress,
    from[1] + (to[1] - from[1]) * progress,
    from[2] + (to[2] - from[2]) * progress,
  ]
}

export function readCameraPose(shotName: ShowroomShotName, frame: number): CameraPose {
  const { startFrame, endFrame } = showroomShots[shotName]
  const { startPose, endPose } = shotMoves[shotName]
  const progress = interpolate(frame, [startFrame, endFrame - 1], [0, 1], {
    easing: speedRampEasing,
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  })
  const drift = readGimbalDrift(frame)
  const position = mixTuple(startPose.position, endPose.position, progress)
  return {
    position: [
      position[0] + drift.offset[0],
      position[1] + drift.offset[1],
      position[2] + drift.offset[2],
    ],
    target: mixTuple(startPose.target, endPose.target, progress),
    rollDegrees:
      startPose.rollDegrees + (endPose.rollDegrees - startPose.rollDegrees) * progress + drift.rollDegrees,
    verticalFovDegrees:
      startPose.verticalFovDegrees +
      (endPose.verticalFovDegrees - startPose.verticalFovDegrees) * progress,
    panDegrees: readWhipPanDegrees(shotName, frame),
  }
}

/** The whip in from the F1 car swings in from the left, as the car exits; the whip out of the Sneaker wall throws right. */
function readWhipPanDegrees(shotName: ShowroomShotName, frame: number): number {
  if (shotName === 'streetRun') {
    return interpolate(frame, [showroomShots.streetRun.startFrame, WHIP_IN_END_FRAME], [-16, 0], {
      easing: Easing.out(Easing.cubic),
      extrapolateLeft: 'clamp',
      extrapolateRight: 'clamp',
    })
  }
  if (shotName === 'sneakerWall') {
    return interpolate(frame, [WHIP_OUT_START_FRAME, showroomShots.sneakerWall.endFrame], [0, 40], {
      easing: Easing.in(Easing.cubic),
      extrapolateLeft: 'clamp',
      extrapolateRight: 'clamp',
    })
  }
  return 0
}
