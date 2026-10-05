import { readPublicTextFile } from './read-public-file'

// The SVG exported from `SneakerNft.imageSvg` (D-030), served unchanged at this path.
export const sneakerArtPath = '/sneaker-art/sneaker-0002-level-02.svg'
export const sneakerArtSizePixels = 400

/**
 * Returns the on-chain SVG with `pathLength="1"` on every path, so CSS can draw each line in with
 * `stroke-dasharray: 1`. Nothing the picture shows changes.
 */
export function readSneakerArtForDrawing(): string {
  return readPublicTextFile(sneakerArtPath)
    .replaceAll('<path ', '<path pathLength="1" ')
    .replace('<svg ', '<svg aria-hidden="true" focusable="false" ')
}
