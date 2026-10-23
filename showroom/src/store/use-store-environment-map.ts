import { useThree } from '@react-three/fiber'
import { useEffect, useState } from 'react'
import {
  BackSide,
  BoxGeometry,
  Color,
  DoubleSide,
  Mesh,
  MeshBasicMaterial,
  PlaneGeometry,
  PMREMGenerator,
  Scene,
  type Texture,
  Vector3,
} from 'three'

// The environment map the shiny things reflect: chrome, glass, the counters, the floor (brief
// §6.3). It's a small room of light shapes that match the store (the downlight grid, the amber
// cove, the violet glow), rendered once into a PMREM, with no HDRI to download.
//
// It's given to those materials only, not set as `scene.environment`: three r186 lights every
// standard material with the scene's environment at one intensity, which would wash the matte
// walls the film keeps flat.

const ENVIRONMENT_ROOM_COLOR = '#16171B'
const ENVIRONMENT_BLUR_SIGMA = 0.04
const ENVIRONMENT_CENTER = new Vector3(0, 1.4, -5)
/** The PMREM's cube side. Blurred light shapes need no more, and 128 is a quarter of 256's memory. */
const ENVIRONMENT_CUBE_PIXELS = 128

export function useStoreEnvironmentMap(): Texture | null {
  const renderer = useThree((state) => state.gl)
  const [environmentMap, setEnvironmentMap] = useState<Texture | null>(null)
  useEffect(() => {
    const environmentScene = buildEnvironmentScene()
    const generator = new PMREMGenerator(renderer)
    const renderTarget = generator.fromScene(environmentScene, ENVIRONMENT_BLUR_SIGMA, 0.1, 30, {
      position: ENVIRONMENT_CENTER,
      size: ENVIRONMENT_CUBE_PIXELS,
    })
    generator.dispose()
    disposeScene(environmentScene)
    setEnvironmentMap(renderTarget.texture)
    return () => renderTarget.dispose()
  }, [renderer])
  return environmentMap
}

function buildEnvironmentScene(): Scene {
  const scene = new Scene()
  const room = new Mesh(
    new BoxGeometry(10, 3.2, 10),
    new MeshBasicMaterial({ color: ENVIRONMENT_ROOM_COLOR, side: BackSide }),
  )
  room.position.set(0, 1.6, -5)
  scene.add(room)
  // The downlight grid, as bright squares on the ceiling.
  for (const lightX of [-3.4, -1.0, 1.4, 3.6]) {
    for (const lightZ of [-1.4, -3.9, -6.4, -8.9]) {
      scene.add(
        createLightShape({
          width: 0.5,
          height: 0.5,
          color: new Color(4, 4, 4.2),
          position: [lightX, 3.15, lightZ],
          rotationX: Math.PI / 2,
        }),
      )
    }
  }
  // The amber cove on the left wall and the violet glow of the Sneakers niche on the right.
  scene.add(
    createLightShape({
      width: 4.4,
      height: 0.3,
      color: new Color('#FFAE45').multiplyScalar(2),
      position: [-4.9, 3.0, -5],
      rotationY: Math.PI / 2,
    }),
  )
  scene.add(
    createLightShape({
      width: 4.7,
      height: 1.7,
      color: new Color('#6E6BFF').multiplyScalar(0.8),
      position: [4.9, 2.2, -6],
      rotationY: -Math.PI / 2,
    }),
  )
  // The lit back wall and the street's dark glass.
  scene.add(
    createLightShape({
      width: 2.5,
      height: 1.5,
      color: new Color('#E6E8F8'),
      position: [0.7, 1.6, -9.9],
    }),
  )
  return scene
}

function createLightShape({
  width,
  height,
  color,
  position,
  rotationX = 0,
  rotationY = 0,
}: {
  width: number
  height: number
  color: Color
  position: readonly [number, number, number]
  rotationX?: number
  rotationY?: number
}): Mesh {
  const shape = new Mesh(
    new PlaneGeometry(width, height),
    new MeshBasicMaterial({ color, side: DoubleSide }),
  )
  shape.position.set(...position)
  shape.rotation.set(rotationX, rotationY, 0)
  return shape
}

function disposeScene(scene: Scene): void {
  scene.traverse((object) => {
    if (!(object instanceof Mesh)) return
    object.geometry.dispose()
    const material = object.material
    if (material instanceof MeshBasicMaterial) material.dispose()
  })
}
