import { AbsoluteFill, useCurrentFrame } from 'remotion'

/** A phone's night noise: fresh grain every frame, light enough to sit under the picture. */
export function FilmGrain() {
  const frame = useCurrentFrame()
  return (
    <AbsoluteFill style={{ mixBlendMode: 'overlay', opacity: 0.16, pointerEvents: 'none' }}>
      <svg width="100%" height="100%" aria-hidden="true">
        <filter id="showroom-grain">
          <feTurbulence type="fractalNoise" baseFrequency="0.85" numOctaves={2} seed={frame} />
          <feColorMatrix type="saturate" values="0" />
        </filter>
        <rect width="100%" height="100%" filter="url(#showroom-grain)" />
      </svg>
    </AbsoluteFill>
  )
}
