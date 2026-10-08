import { readPublicTextFile } from '../read-public-file'
import { buildPassCardArtPath, PASS_CARD_SHOE_WINDOW } from './pass-design'

// Build-time only: the Open Graph images.

/**
 * The card cropped to the shoe, as a data URI for `next/og`: the same window as the gallery
 * (D-044). Its text is dropped: `next/og`'s renderer has no font for it, and the crop leaves it
 * outside anyway.
 */
export function readPassShoeArtDataUri(designNumber: number): string {
  const croppedSvg = readPublicTextFile(buildPassCardArtPath(designNumber))
    .replace(
      'viewBox="0 0 1000 1000"',
      `viewBox="0 ${PASS_CARD_SHOE_WINDOW.top} ${PASS_CARD_SHOE_WINDOW.width} ${PASS_CARD_SHOE_WINDOW.height}"`,
    )
    .replaceAll(/<text\b[^>]*>[^<]*<\/text>/g, '')
  return `data:image/svg+xml;base64,${Buffer.from(croppedSvg).toString('base64')}`
}
