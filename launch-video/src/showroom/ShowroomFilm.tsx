import { useThree } from '@react-three/fiber'
import { Audio, Video } from '@remotion/media'
import { ThreeCanvas } from '@remotion/three'
import type { CSSProperties } from 'react'
import { AbsoluteFill, interpolate, Sequence, staticFile, useCurrentFrame } from 'remotion'
import type { PerspectiveCamera } from 'three'
import { type CameraPose, readCameraPose, shotMoves } from './camera'
import { FilmGrain } from './components/FilmGrain'
import { ShowroomWorld } from './components/ShowroomWorld'
import { StreetSign } from './components/StreetSign'
import { type ShowroomAssets, useShowroomAssets } from './components/useShowroomAssets'
import {
  BLACK_START_FRAME,
  HOOK_END_FRAME,
  MIRROR_SPLIT_END_FRAME,
  readShotAtFrame,
  SHOWROOM_HEIGHT,
  SHOWROOM_WIDTH,
  type ShowroomShotName,
  showroomShots,
  STREET_RUN_GREY_START_FRAME,
  WHIP_IN_END_FRAME,
  WHIP_OUT_START_FRAME,
} from './timeline'

// The Showroom film (docs/showroom-video-prompt.md): the reference's own hook (the cameraman and
// the F1 car), then a StrideMon Sneaker store in 3D, shot as the reference shoots its showroom, to
// the reference's own music. 1080 × 1920, 30 fps, 644 frames. The cut is timeline.ts; the camera
// is camera.ts; the store is ShowroomWorld.

/**
 * The reference's own music, untouched (Yash, 2026-10-21; unlicensed, so not for Instagram:
 * CREDITS.md). scripts/copy-showroom-media.sh extracts it.
 */
export const SHOWROOM_MUSIC_FILE_NAME = 'showroom-music.wav'

export type ShowroomFilmProps = {
  /** In public/audio/; null for a silent picture. */
  musicFileName: string | null
}

export const defaultShowroomProps: ShowroomFilmProps = {
  musicFileName: SHOWROOM_MUSIC_FILE_NAME,
}

const WHIP_FILTER_ID = 'showroom-whip-blur'

/** Aims the camera every frame. Roll turns the picture clockwise; pan turns the camera right. */
function CameraRig({ pose, exposure }: { pose: CameraPose; exposure: number }) {
  const camera = useThree((state) => state.camera) as PerspectiveCamera
  const renderer = useThree((state) => state.gl)
  camera.position.set(pose.position[0], pose.position[1], pose.position[2])
  camera.up.set(0, 1, 0)
  camera.lookAt(pose.target[0], pose.target[1], pose.target[2])
  camera.rotateY((-(pose.panDegrees ?? 0) * Math.PI) / 180)
  camera.rotateZ((pose.rollDegrees * Math.PI) / 180)
  camera.fov = pose.verticalFovDegrees
  camera.near = 0.05
  camera.far = 120
  camera.updateProjectionMatrix()
  renderer.toneMappingExposure = exposure
  return null
}

/** The picture's grade per shot, as CSS filters on the canvas (the reference is a phone at night). */
function readShotFilter(shotName: ShowroomShotName, frame: number): string {
  const nightGrade = 'contrast(1.08) saturate(0.88)'
  if (shotName === 'streetRun') {
    const greyShare = interpolate(frame, [STREET_RUN_GREY_START_FRAME, showroomShots.streetRun.endFrame - 1], [0, 1], {
      extrapolateLeft: 'clamp',
      extrapolateRight: 'clamp',
    })
    return `${nightGrade} grayscale(${greyShare}) brightness(${1 - 0.35 * greyShare})`
  }
  if (shotName === 'darkFront') {
    const brightness = interpolate(frame, [showroomShots.darkFront.startFrame, showroomShots.darkFront.startFrame + 18], [0.25, 0.75], {
      extrapolateLeft: 'clamp',
      extrapolateRight: 'clamp',
    })
    return `${nightGrade} brightness(${brightness}) saturate(0.7)`
  }
  if (shotName === 'streetSign') return `${nightGrade} blur(14px) brightness(0.85)`
  return nightGrade
}

/** How strong the whip's horizontal blur is, in pixels: dying away after the cut in, building into the cut out. */
function readWhipBlurPixels(frame: number): number {
  if (frame < WHIP_IN_END_FRAME) {
    return interpolate(frame, [HOOK_END_FRAME, WHIP_IN_END_FRAME], [70, 0], { extrapolateRight: 'clamp' })
  }
  if (frame >= WHIP_OUT_START_FRAME && frame < showroomShots.sneakerWall.endFrame) {
    return interpolate(frame, [WHIP_OUT_START_FRAME, showroomShots.sneakerWall.endFrame - 1], [0, 90])
  }
  return 0
}

function StoreShot({ assets, shotName }: { assets: ShowroomAssets; shotName: ShowroomShotName }) {
  const frame = useCurrentFrame()
  const whipBlurPixels = readWhipBlurPixels(frame)
  const isMirrorSplit = frame < MIRROR_SPLIT_END_FRAME
  const canvasStyle: CSSProperties = {
    position: 'absolute',
    inset: 0,
    filter: [readShotFilter(shotName, frame), whipBlurPixels > 0 ? `url(#${WHIP_FILTER_ID})` : '']
      .join(' ')
      .trim(),
  }
  const canvas = (
    <ThreeCanvas width={SHOWROOM_WIDTH} height={SHOWROOM_HEIGHT} style={canvasStyle}>
      <CameraRig pose={readCameraPose(shotName, frame)} exposure={shotMoves[shotName].exposure} />
      <ShowroomWorld assets={assets} lighting={shotName === 'darkFront' ? 'dim' : 'on'} />
    </ThreeCanvas>
  )
  return (
    <AbsoluteFill>
      <svg width={0} height={0} style={{ position: 'absolute' }} aria-hidden="true">
        <filter id={WHIP_FILTER_ID} x="-10%" y="0" width="120%" height="100%">
          <feGaussianBlur stdDeviation={`${whipBlurPixels} 0`} edgeMode="duplicate" />
        </filter>
      </svg>
      {isMirrorSplit ? (
        // The reference's cut in: the left half, mirrored onto the right, for three frames.
        <div
          style={{
            position: 'absolute',
            left: 0,
            top: 0,
            width: SHOWROOM_WIDTH / 2,
            height: SHOWROOM_HEIGHT,
            overflow: 'hidden',
            WebkitBoxReflect: 'right',
          }}
        >
          {canvas}
        </div>
      ) : (
        canvas
      )}
    </AbsoluteFill>
  )
}

/** A dark edge, as a phone lens at night. */
function Vignette() {
  return (
    <AbsoluteFill
      style={{
        background:
          'radial-gradient(ellipse 75% 60% at 50% 48%, rgba(0, 0, 0, 0) 55%, rgba(0, 0, 0, 0.55) 100%)',
      }}
    />
  )
}

function Store({ assets }: { assets: ShowroomAssets }) {
  const frame = useCurrentFrame()
  const shotName = readShotAtFrame(frame)
  if (shotName === null) return null
  return (
    <AbsoluteFill>
      <StoreShot assets={assets} shotName={shotName} />
      {shotName === 'streetSign' ? <StreetSign /> : null}
      <Vignette />
      <FilmGrain />
    </AbsoluteFill>
  )
}

export function ShowroomFilm({ musicFileName }: ShowroomFilmProps) {
  const frame = useCurrentFrame()
  const assets = useShowroomAssets()
  const isStoreFrame = frame >= HOOK_END_FRAME && frame < BLACK_START_FRAME
  return (
    <AbsoluteFill style={{ backgroundColor: '#000000' }}>
      <Sequence durationInFrames={HOOK_END_FRAME} name="Hook (the reference's footage)">
        <Video
          src={staticFile('showroom/reference.mp4')}
          muted
          style={{ width: SHOWROOM_WIDTH, height: SHOWROOM_HEIGHT, objectFit: 'cover' }}
        />
      </Sequence>
      {assets !== null && isStoreFrame ? <Store assets={assets} /> : null}
      {musicFileName === null ? null : <Audio src={staticFile(`audio/${musicFileName}`)} />}
    </AbsoluteFill>
  )
}

