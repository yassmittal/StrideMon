'use client'

import { LEGENDARY_WALL_Z, PASS_WALL_CENTER_X, PASS_WALL_Z, printSpots } from '../sneaker-spots'
import { useStoreContext } from '../store-context'
import { CEILING_HEIGHT } from '../store-dimensions'
import { useLookCloserPrint } from '../use-look-closer-print'
import type { LightStripSpec } from './light-strips'
import type { BlockSpec } from './merged-blocks'
import { Glow, LitPanel, StorePointLight } from './store-primitives'

// The back of the store: the Legendary corner and the Founding Pass wall with its counter, ported
// from the film's `LegendaryCorner` and `FoundingPassWall`. The counter's upright screen is the
// waitlist kiosk now, one of the store's buttons (store-buttons.tsx, D-068).

const { legendaryPoster, foundingPassLightbox } = printSpots
/**
 * The black counter. The film's was 3 m wide from x = −0.8, so its screen (at x = −0.9) stood past
 * the end, in the air; here it reaches 0.5 m further left and the screen stands on it.
 */
const PASS_COUNTER = { centerX: PASS_WALL_CENTER_X - 0.25, width: 3.5 } as const
const CHROME = { color: '#B9BBC2', metalness: 0.6, roughness: 0.3, environmentShare: 1 } as const
const CHAIR_BLACK = '#111113'

const CHAIRS = [
  { chairX: -3.85, chairZ: -8.1, facing: 1 },
  { chairX: -2.1, chairZ: -7.6, facing: -1 },
] as const

export const backOfStoreBlocks: readonly BlockSpec[] = [
  // The Legendary poster's frame, the table on its chrome pedestal, two black chairs.
  { position: [-3.4, 1.75, LEGENDARY_WALL_Z], size: [1.32, 2.12, 0.05], color: '#0E0F12' },
  {
    position: [-3.0, 0.74, -8.3],
    size: [1.1, 0.04, 0.65],
    color: '#3A3B40',
    roughness: 0.4,
    environmentShare: 0.3,
  },
  { position: [-3.0, 0.37, -8.3], size: [0.06, 0.74, 0.06], ...CHROME },
  { position: [-3.0, 0.01, -8.3], size: [0.5, 0.02, 0.5], ...CHROME },
  ...CHAIRS.flatMap(({ chairX, chairZ, facing }): BlockSpec[] => {
    const turn = { pivot: [chairX, 0, chairZ] as const, rotationY: facing * 0.5 }
    return [
      {
        position: [chairX, 0.46, chairZ],
        size: [0.46, 0.05, 0.46],
        color: CHAIR_BLACK,
        roughness: 0.6,
        ...turn,
      },
      {
        position: [chairX - 0.21 * facing, 0.75, chairZ],
        size: [0.05, 0.55, 0.44],
        color: CHAIR_BLACK,
        roughness: 0.6,
        ...turn,
      },
      ...[-0.18, 0.18].flatMap((legX) =>
        [-0.18, 0.18].map(
          (legZ): BlockSpec => ({
            position: [chairX + legX, 0.22, chairZ + legZ],
            size: [0.03, 0.44, 0.03],
            color: '#1A1A1D',
            ...turn,
          }),
        ),
      ),
    ]
  }),
  // The Founding Pass wall's dark panel, the black counter, its top and the screen's case.
  {
    position: [PASS_WALL_CENTER_X, CEILING_HEIGHT / 2, PASS_WALL_Z],
    size: [4.0, CEILING_HEIGHT, 0.06],
    color: '#121214',
    roughness: 0.5,
  },
  {
    position: [PASS_COUNTER.centerX, 0.5, -8.55],
    size: [PASS_COUNTER.width, 1.0, 0.7],
    color: '#18181B',
    roughness: 0.35,
    environmentShare: 0.3,
  },
  {
    position: [PASS_COUNTER.centerX, 1.01, -8.55],
    size: [PASS_COUNTER.width + 0.04, 0.03, 0.74],
    color: '#232327',
    roughness: 0.25,
    environmentShare: 0.5,
  },
  { position: [PASS_WALL_CENTER_X - 1.6, 1.4, -8.45], size: [0.48, 0.78, 0.04], color: '#0A0A0C' },
]

export const backOfStoreLightStrips: readonly LightStripSpec[] = [
  {
    position: [PASS_WALL_CENTER_X - 2.02, CEILING_HEIGHT / 2, PASS_WALL_Z + 0.04],
    size: [0.035, CEILING_HEIGHT, 0.03],
    color: '#FFB13D',
    intensity: 2.2,
  },
]

/** The back-left corner: the Legendary poster over a table and two chairs. */
export function LegendaryCorner() {
  const { assets } = useStoreContext()
  const posterTexture = useLookCloserPrint('legendaryPoster', assets.legendaryPoster)
  return (
    <group>
      <LitPanel
        texture={posterTexture}
        position={legendaryPoster.position}
        width={legendaryPoster.width}
        height={legendaryPoster.height}
        isPrint
      />
      <Glow
        texture={assets.glow}
        position={[-3.4, 1.75, LEGENDARY_WALL_Z + 0.4]}
        size={[2.4, 3.2]}
        color="#9A8CFF"
        opacity={0.18}
      />
    </group>
  )
}

/** The back wall: the lit "Founding Pass" words over its lightbox, a counter in front. */
export function FoundingPassWall() {
  const { assets } = useStoreContext()
  const lightboxTexture = useLookCloserPrint('foundingPassLightbox', assets.foundingPassLightbox)
  return (
    <group>
      <LitPanel
        texture={assets.foundingPassTitle}
        position={[PASS_WALL_CENTER_X, 2.72, PASS_WALL_Z + 0.04]}
        width={3.1}
        height={0.605}
        brightness={1.1}
        isTransparent
      />
      <Glow
        texture={assets.glow}
        position={[PASS_WALL_CENTER_X, 2.72, PASS_WALL_Z + 0.3]}
        size={[4.2, 1.3]}
        opacity={0.22}
      />
      <LitPanel
        texture={lightboxTexture}
        position={foundingPassLightbox.position}
        width={foundingPassLightbox.width}
        height={foundingPassLightbox.height}
        isPrint
      />
      <Glow
        texture={assets.glow}
        position={[PASS_WALL_CENTER_X, 1.62, PASS_WALL_Z + 0.5]}
        size={[3.6, 2.4]}
        color="#C9CCFF"
        opacity={0.2}
      />
      <Glow
        texture={assets.glow}
        position={[PASS_WALL_CENTER_X - 2.0, CEILING_HEIGHT / 2, PASS_WALL_Z + 0.2]}
        size={[0.8, 3.6]}
        color="#FF9A2E"
        opacity={0.5}
        lightingSource="led"
      />
      <StorePointLight
        position={[PASS_WALL_CENTER_X, 2.4, -8.6]}
        color="#F4F4FF"
        intensity={3}
        distance={4}
        decay={1.5}
      />
    </group>
  )
}
