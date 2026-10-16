import { staticFile } from 'remotion'
import { HERO_DESIGN_NUMBER, LEGENDARY_DESIGN_NUMBER, SEQUENCE_DESIGN_NUMBERS } from './sneakers'

// The film's art, copied into public/pass-art/ (gitignored) by scripts/copy-sneaker-drop-art.sh:
// the contract renderer's laced Sneakers, #0020's Founder Sneaker picture and the flood's atlas.
// The film animates them; it never changes a path or a colour (DESIGNS_FROZEN_ON).

export function toLacedSneakerPath(designNumber: number): string {
  return staticFile(`pass-art/laced/${String(designNumber).padStart(4, '0')}.svg`)
}

/** #0020 Earthshine's Founder Sneaker picture as minted, drawn by SneakerArtRenderer. */
export const LEGENDARY_FOUNDER_SNEAKER_PATH = staticFile(
  'pass-art/founder-sneakers/founder-sneaker-0020-minted.svg',
)

export const FLOOD_ATLAS_PATH = staticFile('pass-art/atlas/laced-atlas.png')

/** Every SVG the film draws as a vector: the hero, the sequence, the Legendary and its picture. */
export const SNEAKER_DROP_SVG_PATHS: readonly string[] = [
  ...new Set([HERO_DESIGN_NUMBER, ...SEQUENCE_DESIGN_NUMBERS, LEGENDARY_DESIGN_NUMBER]),
].map(toLacedSneakerPath)
