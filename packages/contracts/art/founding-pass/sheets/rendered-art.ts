import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { fileURLToPath } from 'node:url'
import type { DesignLayers } from '../art-system/types'
import { type EncodedLayers, encodeLayers } from '../solidity/solidity-order'

/**
 * The bridge to `script/RenderPassArt.s.sol`: the sheets ask for cards and Sneakers here, the
 * Solidity renderer draws them into `rendered/`, and the sheets lay out what it drew. The sheets
 * never draw a Sneaker themselves.
 */
export const RENDERED_DIRECTORY = fileURLToPath(new URL('../rendered/', import.meta.url))

/** Matches `CardRequest` in `RenderPassArt.s.sol`. */
export type CardRequest = {
  fileName: string
  designNumber: number
  isMinted: boolean
  founderNumber: number
  hasGoldFrame: boolean
  isLaced: boolean
}

/**
 * Matches `SneakerPictureRequest` in `RenderPassArt.s.sol`: a Sneaker's whole picture as
 * `SneakerNft.imageSvg` returns it. A Founder Sneaker in design `designNumber` with that pass
 * record, or a normal Sneaker when `designNumber` is 0 (D-042).
 */
export type SneakerPictureRequest = {
  fileName: string
  designNumber: number
  sneakerTokenId: number
  level: number
  durability: number
  isLaced: boolean
  hasGoldFrame: boolean
}

/** Matches `SneakerRequest` in `RenderPassArt.s.sol`. */
export type SneakerRequest = EncodedLayers & {
  fileName: string
  isLaced: boolean
  clipPathId: string
}

export function buildSneakerRequest({
  layers,
  isLaced,
  fileName,
}: {
  layers: DesignLayers
  isLaced: boolean
  /** Also the clip path id, so it must be unique across the sheet that shows it. */
  fileName: string
}): SneakerRequest {
  return { ...encodeLayers(layers), fileName, isLaced, clipPathId: fileName }
}

/** What the script wrote. Each Sneaker file wraps its markup in a 1000 × 600 `<svg>`. */
export const renderedArt = {
  readDesignCardSvg(designNumber: number): string {
    return readRenderedFile(`designs/${String(designNumber).padStart(4, '0')}.svg`)
  },
  readCardSvg(fileName: string): string {
    return readRenderedFile(`cards/${fileName}.svg`)
  },
  readSneakerPictureSvg(fileName: string): string {
    return readRenderedFile(`sneaker-pictures/${fileName}.svg`)
  },
  readSneakerMarkup(fileName: string): string {
    const svg = readRenderedFile(`sneakers/${fileName}.svg`)
    const markupStart = svg.indexOf('>') + 1
    const markupEnd = svg.lastIndexOf('</svg>')
    return svg.slice(markupStart, markupEnd)
  },
}

export type RenderedArt = typeof renderedArt

/** A card's own clip path is `pass` + its number, so two cards of one design need new ids. */
export function renameClipPath(svg: string, fromId: string, toId: string): string {
  return svg
    .replaceAll(`id="${fromId}"`, `id="${toId}"`)
    .replaceAll(`url(#${fromId})`, `url(#${toId})`)
}

function readRenderedFile(relativePath: string): string {
  return readFileSync(join(RENDERED_DIRECTORY, relativePath), 'utf8')
}
