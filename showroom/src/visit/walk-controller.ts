import { MathUtils } from 'three'
import { visitStore } from '@/lib/visit-store'
import { type StoreLightingLevels, storeLightingPresets } from '@/store/store-lighting'
import { readArrivalLighting } from './arrival-lighting'
import { frameSubject, poseLookingAt, readVerticalFovDegrees, type WalkPose } from './frame-subject'
import { buildWalkPath, easeWalk, readPoseOnPath, type WalkPath } from './walk-path'
import {
  ARRIVAL,
  ARRIVAL_DARK_POSE,
  LAST_STOP_INDEX,
  LOOK_AROUND,
  MOVES,
  STREET_LIT_SESSION_KEY,
  STREET_STOP_INDEX,
  WALK_STOP_IDS,
  walkStops,
} from './walk-plan'

// The walk (brief §4, Part 2): the arrival, the moves between stops, the queue, and looking
// around. The DOM's input calls it; the canvas calls `update` every frame and gets the camera's
// pose, any new light levels and the veil's opacity (reduced motion's fade). It writes the visit
// store for the DOM layer. Times are in seconds on `performance.now()`'s clock.

type Motion =
  | { kind: 'arrival'; startSeconds: number; path: WalkPath }
  | { kind: 'fadeIn'; startSeconds: number }
  | { kind: 'walk'; startSeconds: number; path: WalkPath; toIndex: number }
  | { kind: 'cut'; startSeconds: number; fromIndex: number; toIndex: number }

export type WalkFrame = {
  pose: WalkPose
  /** New light levels this frame, or null when they haven't changed. */
  lighting: StoreLightingLevels | null
  veilOpacity: number
}

const MAX_YAW_RADIANS = MathUtils.degToRad(LOOK_AROUND.maxYawDegrees)
const MAX_PITCH_RADIANS = MathUtils.degToRad(LOOK_AROUND.maxPitchDegrees)

function nowSeconds(): number {
  return performance.now() / 1000
}

export class WalkController {
  private motion: Motion | null = null
  private atIndex = STREET_STOP_INDEX
  private queuedIndex: number | null = null
  private hasBegun = false
  private isReducedMotion = false
  private aspectRatio = 1
  private readonly poseCache = new Map<string, WalkPose>()
  private pendingLighting: StoreLightingLevels | null = null
  private dragLook = { yawRadians: 0, pitchRadians: 0 }
  private dragLookAtStart = { yawRadians: 0, pitchRadians: 0 }
  private pointerLook = { yawRadians: 0, pitchRadians: 0 }
  private shownLook = { yawRadians: 0, pitchRadians: 0 }

  setReducedMotion(isReducedMotion: boolean): void {
    this.isReducedMotion = isReducedMotion
    if (isReducedMotion) this.pointerLook = { yawRadians: 0, pitchRadians: 0 }
  }

  /** Starts the arrival on the canvas's first frame. A second visit in the tab starts lit. */
  begin(aspectRatio: number): void {
    if (this.hasBegun) return
    this.hasBegun = true
    this.aspectRatio = aspectRatio
    const startSeconds = nowSeconds()
    if (readIsStreetLitThisSession() || this.isReducedMotion) {
      this.pendingLighting = storeLightingPresets.lit
      this.motion = { kind: 'fadeIn', startSeconds }
      this.finishArrival()
      return
    }
    this.pendingLighting = storeLightingPresets.dark
    this.motion = {
      kind: 'arrival',
      startSeconds,
      path: buildWalkPath(this.readDarkPose(), this.readStopPose(STREET_STOP_INDEX)),
    }
    visitStore.update({ arrivalPhase: 'lightsComingOn', stopIndex: STREET_STOP_INDEX })
  }

  /** One stop forward (1) or back (−1): scroll, swipe, the arrows and ↑ ↓. */
  step(direction: 1 | -1): void {
    if (visitStore.read().arrivalPhase !== 'ready') return
    if (this.isBusy()) {
      if (this.queuedIndex !== null) return
      const queuedIndex = this.readSteppedIndex(this.readDestinationIndex(), direction)
      if (queuedIndex !== this.readDestinationIndex()) this.queuedIndex = queuedIndex
      return
    }
    const toIndex = this.readSteppedIndex(this.atIndex, direction)
    if (toIndex !== this.atIndex) this.startMove(toIndex)
  }

  /** Straight to a stop: the dots, "Step inside", "Back to the start". */
  goTo(toIndex: number): void {
    if (visitStore.read().arrivalPhase !== 'ready') return
    const index = MathUtils.clamp(Math.round(toIndex), STREET_STOP_INDEX, LAST_STOP_INDEX)
    if (this.isBusy()) {
      this.queuedIndex = index === this.readDestinationIndex() ? null : index
      return
    }
    if (index !== this.atIndex) this.startMove(index)
  }

  /** A drag that looks around starts. */
  beginLookDrag(): void {
    this.dragLookAtStart = { ...this.dragLook }
  }

  /** The drag so far, as a share of the screen's width and height (right and down positive). */
  moveLookDrag(acrossShare: number, downShare: number): void {
    if (!this.canLookAround()) return
    this.dragLook = {
      yawRadians: MathUtils.clamp(
        this.dragLookAtStart.yawRadians +
          MathUtils.degToRad(acrossShare * LOOK_AROUND.dragYawDegreesPerScreen),
        -MAX_YAW_RADIANS,
        MAX_YAW_RADIANS,
      ),
      pitchRadians: MathUtils.clamp(
        this.dragLookAtStart.pitchRadians +
          MathUtils.degToRad(downShare * LOOK_AROUND.dragPitchDegreesPerScreen),
        -MAX_PITCH_RADIANS,
        MAX_PITCH_RADIANS,
      ),
    }
  }

  /** A laptop's pointer, from −1 to 1 across and down from the screen's centre. */
  setPointerLook(across: number, down: number): void {
    if (this.isReducedMotion) return
    this.pointerLook = {
      yawRadians: -MathUtils.degToRad(across * LOOK_AROUND.pointerYawDegrees),
      pitchRadians: -MathUtils.degToRad(down * LOOK_AROUND.pointerPitchDegrees),
    }
  }

  /** The camera for this frame. */
  update(aspectRatio: number, deltaSeconds: number): WalkFrame {
    if (aspectRatio !== this.aspectRatio) {
      this.aspectRatio = aspectRatio
      this.poseCache.clear()
    }
    const time = nowSeconds()
    const { pose: basePose, veilOpacity } = this.advanceMotion(time)
    const lighting = this.pendingLighting
    this.pendingLighting = null
    return { pose: this.withLookAround(basePose, deltaSeconds), lighting, veilOpacity }
  }

  private advanceMotion(time: number): { pose: WalkPose; veilOpacity: number } {
    const motion = this.motion
    if (motion === null) return { pose: this.readStopPose(this.atIndex), veilOpacity: 0 }
    const elapsedSeconds = time - motion.startSeconds

    if (motion.kind === 'arrival') {
      if (elapsedSeconds >= ARRIVAL.readySeconds) {
        this.pendingLighting = storeLightingPresets.lit
        this.endMotion()
        this.finishArrival()
        return { pose: this.readStopPose(STREET_STOP_INDEX), veilOpacity: 0 }
      }
      this.pendingLighting = readArrivalLighting(elapsedSeconds)
      const cameraProgress = easeWalk(
        (elapsedSeconds - ARRIVAL.cameraHoldSeconds) / ARRIVAL.cameraMoveSeconds,
      )
      return { pose: readPoseOnPath(motion.path, cameraProgress), veilOpacity: 0 }
    }

    if (motion.kind === 'fadeIn') {
      const share = elapsedSeconds / ARRIVAL.reducedMotionFadeInSeconds
      if (share >= 1) this.endMotion()
      return {
        pose: this.readStopPose(this.atIndex),
        veilOpacity: 1 - MathUtils.clamp(share, 0, 1),
      }
    }

    if (motion.kind === 'walk') {
      const share = elapsedSeconds / motion.path.durationSeconds
      if (share >= 1) {
        this.arriveAt(motion.toIndex)
        return { pose: this.readStopPose(motion.toIndex), veilOpacity: 0 }
      }
      return { pose: readPoseOnPath(motion.path, easeWalk(share)), veilOpacity: 0 }
    }

    // A cut: fade to black, change places, fade back.
    const { cutFadeOutSeconds, cutFadeInSeconds } = MOVES
    if (elapsedSeconds < cutFadeOutSeconds) {
      return {
        pose: this.readStopPose(motion.fromIndex),
        veilOpacity: elapsedSeconds / cutFadeOutSeconds,
      }
    }
    const fadeInShare = (elapsedSeconds - cutFadeOutSeconds) / cutFadeInSeconds
    if (fadeInShare >= 1) {
      this.arriveAt(motion.toIndex)
      return { pose: this.readStopPose(motion.toIndex), veilOpacity: 0 }
    }
    return { pose: this.readStopPose(motion.toIndex), veilOpacity: 1 - fadeInShare }
  }

  private withLookAround(pose: WalkPose, deltaSeconds: number): WalkPose {
    const isLooking = this.canLookAround()
    const targetYaw = isLooking
      ? MathUtils.clamp(
          this.dragLook.yawRadians + this.pointerLook.yawRadians,
          -MAX_YAW_RADIANS,
          MAX_YAW_RADIANS,
        )
      : 0
    const targetPitch = isLooking
      ? MathUtils.clamp(
          this.dragLook.pitchRadians + this.pointerLook.pitchRadians,
          -MAX_PITCH_RADIANS,
          MAX_PITCH_RADIANS,
        )
      : 0
    const damping = LOOK_AROUND.dampingPerSecond
    const step = Math.min(deltaSeconds, 0.1)
    this.shownLook = {
      yawRadians: MathUtils.damp(this.shownLook.yawRadians, targetYaw, damping, step),
      pitchRadians: MathUtils.damp(this.shownLook.pitchRadians, targetPitch, damping, step),
    }
    return {
      ...pose,
      yawRadians: pose.yawRadians + this.shownLook.yawRadians,
      pitchRadians: pose.pitchRadians + this.shownLook.pitchRadians,
    }
  }

  private canLookAround(): boolean {
    return visitStore.read().arrivalPhase === 'ready' && !this.isBusy()
  }

  private isBusy(): boolean {
    return this.motion?.kind === 'walk' || this.motion?.kind === 'cut'
  }

  private readDestinationIndex(): number {
    const motion = this.motion
    return motion?.kind === 'walk' || motion?.kind === 'cut' ? motion.toIndex : this.atIndex
  }

  private readSteppedIndex(fromIndex: number, direction: 1 | -1): number {
    return MathUtils.clamp(fromIndex + direction, STREET_STOP_INDEX, LAST_STOP_INDEX)
  }

  private startMove(toIndex: number): void {
    const startSeconds = nowSeconds()
    this.dragLook = { yawRadians: 0, pitchRadians: 0 }
    this.motion = this.isReducedMotion
      ? { kind: 'cut', startSeconds, fromIndex: this.atIndex, toIndex }
      : {
          kind: 'walk',
          startSeconds,
          toIndex,
          path: buildWalkPath(this.readStopPose(this.atIndex), this.readStopPose(toIndex)),
        }
    const { walkStepCount } = visitStore.read()
    visitStore.update({ stopIndex: toIndex, isMoving: true, walkStepCount: walkStepCount + 1 })
  }

  private arriveAt(index: number): void {
    this.atIndex = index
    this.motion = null
    visitStore.update({ stopIndex: index, isMoving: false })
    const queuedIndex = this.queuedIndex
    this.queuedIndex = null
    if (queuedIndex !== null && queuedIndex !== index) this.startMove(queuedIndex)
  }

  private endMotion(): void {
    this.motion = null
  }

  private finishArrival(): void {
    visitStore.update({ arrivalPhase: 'ready', stopIndex: STREET_STOP_INDEX, isMoving: false })
    writeIsStreetLitThisSession()
  }

  private readStopPose(index: number): WalkPose {
    const key = `${index}:${this.aspectRatio.toFixed(3)}`
    const cached = this.poseCache.get(key)
    if (cached !== undefined) return cached
    const stopId = WALK_STOP_IDS[index] ?? 'street'
    const pose = frameSubject(walkStops[stopId], this.aspectRatio)
    this.poseCache.set(key, pose)
    return pose
  }

  private readDarkPose(): WalkPose {
    const verticalFovDegrees =
      this.aspectRatio < 1
        ? ARRIVAL_DARK_POSE.portraitVerticalFovDegrees
        : readVerticalFovDegrees(this.aspectRatio)
    return poseLookingAt(ARRIVAL_DARK_POSE.position, ARRIVAL_DARK_POSE.target, verticalFovDegrees)
  }
}

/** Session storage can throw (private windows, blocked storage): the walk works without it. */
function readIsStreetLitThisSession(): boolean {
  try {
    return window.sessionStorage.getItem(STREET_LIT_SESSION_KEY) === '1'
  } catch {
    return false
  }
}

function writeIsStreetLitThisSession(): void {
  try {
    window.sessionStorage.setItem(STREET_LIT_SESSION_KEY, '1')
  } catch {
    // Nothing to do: the next visit plays the lights again.
  }
}

/** The one walk on the page. */
export const walkController = new WalkController()
