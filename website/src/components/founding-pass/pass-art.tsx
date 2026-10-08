import {
  buildPassCardArtPath,
  buildPassLacedArtPath,
  formatPassNumber,
  PASS_CARD_SHOE_WINDOW,
  type PassDesign,
} from '@/lib/founding-pass/pass-design'

type PassArtProps = {
  design: PassDesign
  /**
   * `shoe`: the card cropped to the shoe, for the grid (D-044). `card`: the whole card, exactly as
   * the token's image. `laced`: the Sneaker alone after the first walk.
   */
  view: 'shoe' | 'card' | 'laced'
  isEager?: boolean
  className?: string
}

export function describePassArt(design: PassDesign): string {
  return `Founding Pass ${formatPassNumber(design.designNumber)}, ${design.name}: a ${design.template.label} in the ${design.colorFamily.label} family, ${design.colorway.label} colourway`
}

/** The on-chain art as a plain lazy image: fixed proportions, so nothing moves as it loads. */
export function PassArt({ design, view, isEager = false, className = '' }: PassArtProps) {
  const loadingProps = isEager
    ? ({ loading: 'eager', fetchPriority: 'high' } as const)
    : ({ loading: 'lazy', fetchPriority: 'auto' } as const)
  if (view === 'laced') {
    return (
      // biome-ignore lint/performance/noImgElement: a static export; the SVG needs no optimizer.
      <img
        src={buildPassLacedArtPath(design.designNumber)}
        alt={`${describePassArt(design)}, laced after the first walk, with ${design.laceColor.label.toLowerCase()} laces`}
        width={1000}
        height={600}
        decoding="async"
        {...loadingProps}
        className={`block h-auto w-full ${className}`}
      />
    )
  }
  if (view === 'card') {
    return (
      // biome-ignore lint/performance/noImgElement: a static export; the SVG needs no optimizer.
      <img
        src={buildPassCardArtPath(design.designNumber)}
        alt={describePassArt(design)}
        width={1000}
        height={1000}
        decoding="async"
        {...loadingProps}
        className={`block h-auto w-full ${className}`}
      />
    )
  }
  return (
    <div
      className={`relative w-full overflow-hidden bg-page ${className}`}
      style={{ aspectRatio: `${PASS_CARD_SHOE_WINDOW.width} / ${PASS_CARD_SHOE_WINDOW.height}` }}
    >
      {/* biome-ignore lint/performance/noImgElement: a static export; the SVG needs no optimizer. */}
      <img
        src={buildPassCardArtPath(design.designNumber)}
        alt={describePassArt(design)}
        width={1000}
        height={1000}
        decoding="async"
        {...loadingProps}
        className="absolute left-0 h-auto w-full max-w-none"
        style={{ top: `${(-PASS_CARD_SHOE_WINDOW.top / PASS_CARD_SHOE_WINDOW.height) * 100}%` }}
      />
    </div>
  )
}
