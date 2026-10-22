import { MathUtils, PerspectiveCamera, Vector3 } from 'three'
import { visitStore } from '@/lib/visit-store'
import { type StoreLightingLevels, storeLightingPresets } from '@/store/store-lighting'
import { readArrivalLighting } from './arrival-lighting'
import {
  frameSubject,
  placeCamera,
  poseLookingAt,
  readVerticalFovDegrees,
  type WalkPose,
} from './frame-subject'
import {
  findTargetOnRay,
  frameLookCloser,
  type LookCloserTarget,
  readLookCloserTarget,
  readNeighbourTarget,
  STAND_TARGET_ID,
} from './look-closer-targets'
import {
  buildDirectPath,
  buildWalkPath,
  easeWalk,
  isOutside,
  readPoseOnPath,
  type WalkPath,
} from './walk-path'
import {
  ARRIVAL,
  ARRIVAL_DARK_POSE,
  LAST_STOP_INDEX,
  LOOK_AROUND,
  LOOK_CLOSER,
  MOVES,
  STREET_LIT_SESSION_KEY,
  STREET_STOP_INDEX,
  WALK_STOP_IDS,
  walkStops,
} from './walk-plan'

// The walk (brief §4, Parts 2 and 3): the arrival, the moves between places, the queue, looking
// around, and look closer. A place is a stop, or a Sneaker seen close (look-closer-targets.ts).
// The DOM's input calls it; the canvas calls `update` every frame and gets the camera's pose, any
// new light levels and the veil's opacity (reduced motion's fade, and long jumps). It writes the
// visit store for the DOM layer. Times are in seconds on `performance.now()`'s clock.

type Place = { kind: 'stop'; index: number } | { kind: 'closer'; targetId: string }

type Motion =
  | { kind: 'arrival'; startSeconds: number; path: WalkPath }
  | { kind: 'fadeIn'; startSeconds: number }
  | { kind: 'walk'; startSeconds: number; path: WalkPath; to: Place }
  | { kind: 'cut'; startSeconds: number; from: Place; to: Place }

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

const streetPlace: Place = { kind: 'stop', index: STREET_STOP_INDEX }

function isSamePlace(first: Place, second: Place): boolean {
  return first.kind === 'stop'
    ? second.kind === 'stop' && first.index === second.index
    : second.kind === 'closer' && first.targetId === second.targetId
}

export class WalkController {
  private motion: Motion | null = null
  private at: Place = streetPlace
  /** The stop look closer returns to: the last stop the camera was at. */
  private homeStopIndex = STREET_STOP_INDEX
  private queued: Place | null = null
  private hasBegun = false
  /** The deep link: start on the stand, lit, with its card open (brief §10). */
  private isStartingAtStand = false
  private shownPose: WalkPose | null = null
  private readonly hitCamera = new PerspectiveCamera()
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
    if (this.isStartingAtStand) {
      this.pendingLighting = storeLightingPresets.lit
      this.motion = { kind: 'fadeIn', startSeconds }
      this.at = { kind: 'closer', targetId: STAND_TARGET_ID }
      this.homeStopIndex = LAST_STOP_INDEX
      this.finishArrival()
      visitStore.update({ stopIndex: LAST_STOP_INDEX, lookCloserTargetId: STAND_TARGET_ID })
      return
    }
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
      path: buildWalkPath(this.readDarkPose(), this.readPlacePose(streetPlace)),
    }
    visitStore.update({ arrivalPhase: 'lightsComingOn', stopIndex: STREET_STOP_INDEX })
  }

  /** Before the first frame: the deep link opens on the stand instead of the street. */
  startAtStand(): void {
    if (!this.hasBegun) this.isStartingAtStand = true
  }

  /**
   * One stop forward (1) or back (−1): scroll, swipe, the arrows and ↑ ↓. Looking closer, it goes
   * back to the stop first (D-066).
   */
  step(direction: 1 | -1): void {
    if (visitStore.read().arrivalPhase !== 'ready') return
    const destination = this.readDestination()
    if (destination.kind === 'closer') {
      this.goToPlace({ kind: 'stop', index: this.homeStopIndex })
      return
    }
    if (this.isBusy()) {
      if (this.queued !== null) return
      const queuedIndex = this.readSteppedIndex(destination.index, direction)
      if (queuedIndex !== destination.index) this.queued = { kind: 'stop', index: queuedIndex }
      return
    }
    const toIndex = this.readSteppedIndex(destination.index, direction)
    if (toIndex !== destination.index) this.startMove({ kind: 'stop', index: toIndex })
  }

  /** Straight to a stop: the dots, "Step inside", "Back to the start". */
  goTo(toIndex: number): void {
    if (visitStore.read().arrivalPhase !== 'ready') return
    const index = MathUtils.clamp(Math.round(toIndex), STREET_STOP_INDEX, LAST_STOP_INDEX)
    this.goToPlace({ kind: 'stop', index })
  }

  /** Look closer at a Sneaker: the camera comes to it and the card opens. */
  lookCloser(targetId: string): void {
    if (visitStore.read().arrivalPhase !== 'ready') return
    if (readLookCloserTarget(targetId) === null) return
    this.goToPlace({ kind: 'closer', targetId })
  }

  /** Back to the stop: Esc, "Back", a tap on nothing. */
  leaveLookCloser(): void {
    if (this.readDestination().kind !== 'closer') return
    this.goToPlace({ kind: 'stop', index: this.homeStopIndex })
  }

  /** The next (1) or previous (−1) Sneaker on the same wall: ← →, the small arrows, a swipe across. */
  stepNeighbour(direction: 1 | -1): void {
    const destination = this.readDestination()
    if (destination.kind !== 'closer') return
    const target = readLookCloserTarget(destination.targetId)
    const neighbour = target === null ? null : readNeighbourTarget(target, direction)
    if (neighbour !== null) this.lookCloser(neighbour.id)
  }

  /**
   * Find put a Sneaker on the stand: walk to it, or fade there from anywhere but the Sneaker wall
   * (D-066). The stand's Sneaker fades to the new one as the camera comes.
   */
  lookCloserAtStand(): void {
    if (visitStore.read().arrivalPhase !== 'ready') return
    const isNearTheStand = this.homeStopIndex === LAST_STOP_INDEX
    this.homeStopIndex = LAST_STOP_INDEX
    this.goToPlace({ kind: 'closer', targetId: STAND_TARGET_ID }, { isCut: !isNearTheStand })
  }

  /**
   * A tap at a point on the screen (−1 to 1 across, and up): look closer at the Sneaker there.
   * Looking closer, a tap on nothing goes back to the stop.
   */
  tapAt(across: number, up: number): void {
    if (visitStore.read().arrivalPhase !== 'ready' || this.isBusy()) return
    const target = this.findTargetAt(across, up)
    if (target !== null) {
      if (this.at.kind !== 'closer' || this.at.targetId !== target.id) this.lookCloser(target.id)
      return
    }
    this.leaveLookCloser()
  }

  /** The Sneaker under a point on the screen, for the tap and the pointer's cursor. */
  findTargetAt(across: number, up: number): LookCloserTarget | null {
    const pose = this.shownPose
    if (pose === null || this.isBusy()) return null
    const camera = this.hitCamera
    camera.aspect = this.aspectRatio
    placeCamera(camera, pose)
    camera.updateProjectionMatrix()
    const origin = new Vector3().setFromMatrixPosition(camera.matrixWorld)
    const direction = new Vector3(across, up, 0.5).unproject(camera).sub(origin).normalize()
    return findTargetOnRay(origin, direction, isOutside(pose))
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
    const pose = this.withLookAround(basePose, deltaSeconds)
    this.shownPose = pose
    return { pose, lighting, veilOpacity }
  }

  private advanceMotion(time: number): { pose: WalkPose; veilOpacity: number } {
    const motion = this.motion
    if (motion === null) return { pose: this.readPlacePose(this.at), veilOpacity: 0 }
    const elapsedSeconds = time - motion.startSeconds

    if (motion.kind === 'arrival') {
      if (elapsedSeconds >= ARRIVAL.readySeconds) {
        this.pendingLighting = storeLightingPresets.lit
        this.endMotion()
        this.finishArrival()
        return { pose: this.readPlacePose(streetPlace), veilOpacity: 0 }
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
        pose: this.readPlacePose(this.at),
        veilOpacity: 1 - MathUtils.clamp(share, 0, 1),
      }
    }

    if (motion.kind === 'walk') {
      const share = elapsedSeconds / motion.path.durationSeconds
      if (share >= 1) {
        this.arriveAt(motion.to)
        return { pose: this.readPlacePose(motion.to), veilOpacity: 0 }
      }
      return { pose: readPoseOnPath(motion.path, easeWalk(share)), veilOpacity: 0 }
    }

    // A cut: fade to black, change places, fade back.
    const { cutFadeOutSeconds, cutFadeInSeconds } = MOVES
    if (elapsedSeconds < cutFadeOutSeconds) {
      return {
        pose: this.readPlacePose(motion.from),
        veilOpacity: elapsedSeconds / cutFadeOutSeconds,
      }
    }
    const fadeInShare = (elapsedSeconds - cutFadeOutSeconds) / cutFadeInSeconds
    if (fadeInShare >= 1) {
      this.arriveAt(motion.to)
      return { pose: this.readPlacePose(motion.to), veilOpacity: 0 }
    }
    return { pose: this.readPlacePose(motion.to), veilOpacity: 1 - fadeInShare }
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

  /** At a stop only: looking closer, the view holds still. */
  private canLookAround(): boolean {
    return visitStore.read().arrivalPhase === 'ready' && !this.isBusy() && this.at.kind === 'stop'
  }

  private isBusy(): boolean {
    return this.motion?.kind === 'walk' || this.motion?.kind === 'cut'
  }

  private readDestination(): Place {
    const motion = this.motion
    return motion?.kind === 'walk' || motion?.kind === 'cut' ? motion.to : this.at
  }

  private readSteppedIndex(fromIndex: number, direction: 1 | -1): number {
    return MathUtils.clamp(fromIndex + direction, STREET_STOP_INDEX, LAST_STOP_INDEX)
  }

  private goToPlace(place: Place, { isCut = false }: { isCut?: boolean } = {}): void {
    if (this.isBusy()) {
      this.queued = isSamePlace(place, this.readDestination()) ? null : place
      return
    }
    if (!isSamePlace(place, this.at)) this.startMove(place, { isCut })
  }

  private startMove(to: Place, { isCut = false }: { isCut?: boolean } = {}): void {
    const startSeconds = nowSeconds()
    this.dragLook = { yawRadians: 0, pitchRadians: 0 }
    const from = this.at
    const fromPose = this.readPlacePose(from)
    const toPose = this.readPlacePose(to)
    const isCloserMove = from.kind === 'closer' || to.kind === 'closer'
    // Look closer flies straight: its poses stand over the counters, which the floor plan avoids.
    const path = isCloserMove ? buildDirectPath(fromPose, toPose) : buildWalkPath(fromPose, toPose)
    const isLongJump = isCloserMove && path.curve.getLength() > LOOK_CLOSER.longJumpMeters
    this.motion =
      this.isReducedMotion || isCut || isLongJump
        ? { kind: 'cut', startSeconds, from, to }
        : { kind: 'walk', startSeconds, to, path }
    if (to.kind === 'stop') {
      const { walkStepCount } = visitStore.read()
      visitStore.update({
        stopIndex: to.index,
        lookCloserTargetId: null,
        isMoving: true,
        walkStepCount: walkStepCount + 1,
      })
    } else {
      visitStore.update({
        stopIndex: this.homeStopIndex,
        lookCloserTargetId: to.targetId,
        isMoving: true,
      })
    }
  }

  private arriveAt(place: Place): void {
    this.at = place
    if (place.kind === 'stop') this.homeStopIndex = place.index
    this.motion = null
    visitStore.update({ isMoving: false })
    const queued = this.queued
    this.queued = null
    if (queued !== null && !isSamePlace(queued, place)) this.startMove(queued)
  }

  private endMotion(): void {
    this.motion = null
  }

  private finishArrival(): void {
    visitStore.update({ arrivalPhase: 'ready', stopIndex: STREET_STOP_INDEX, isMoving: false })
    writeIsStreetLitThisSession()
  }

  private readPlacePose(place: Place): WalkPose {
    const key =
      place.kind === 'stop'
        ? `stop:${place.index}:${this.aspectRatio.toFixed(3)}`
        : `closer:${place.targetId}:${this.aspectRatio.toFixed(3)}`
    const cached = this.poseCache.get(key)
    if (cached !== undefined) return cached
    const target = place.kind === 'closer' ? readLookCloserTarget(place.targetId) : null
    const pose =
      target !== null
        ? frameLookCloser(target, this.aspectRatio)
        : frameSubject(
            walkStops[WALK_STOP_IDS[place.kind === 'stop' ? place.index : 0] ?? 'street'],
            this.aspectRatio,
          )
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
