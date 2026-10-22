import {
  type BufferGeometry,
  Euler,
  Matrix4,
  PlaneGeometry,
  Quaternion,
  type Texture,
  Vector3,
} from 'three'
import { mergeGeometries } from 'three/examples/jsm/utils/BufferGeometryUtils.js'
import type { Vector3Tuple } from './camera-poses'
import type { SneakerImages } from './load-sneaker-images'
import { drawCanvasTexture, drawSneaker, SNEAKER_ASPECT } from './textures'

// The Sneakers as pictures (brief §5.3): rasterised from the laced SVGs on a canvas at the tier's
// size. A wall's Sneakers share one atlas and one merged mesh, so a wall is one draw call. The
// one Sneaker on the stand gets its own sharp picture.

/** The stand's and look closer's picture width (brief §5.3). */
export const SHARP_SNEAKER_PIXELS = 1024
/** The largest atlas side any phone takes. */
const MAX_ATLAS_SIDE_PIXELS = 4096
/** Clear space round each cell, as a share of its width, so the smaller mipmaps don't bleed. */
const ATLAS_GUTTER_SHARE = 1 / 32

export type AtlasRect = { u0: number; v0: number; u1: number; v1: number }

export type SneakerAtlas = {
  texture: Texture
  /** Each design's place in the atlas, in texture coordinates. */
  rectsByDesign: ReadonlyMap<number, AtlasRect>
}

export function createSneakerAtlas({
  sneakerImages,
  designNumbers,
  sneakerPixels,
}: {
  sneakerImages: SneakerImages
  designNumbers: readonly number[]
  sneakerPixels: number
}): SneakerAtlas {
  const cellHeight = Math.round(sneakerPixels * SNEAKER_ASPECT)
  const gutter = Math.round(sneakerPixels * ATLAS_GUTTER_SHARE)
  const outerWidth = sneakerPixels + gutter * 2
  const outerHeight = cellHeight + gutter * 2
  // Roughly square, never wider than a phone takes.
  const columnCount = Math.min(
    Math.ceil(Math.sqrt((designNumbers.length * outerHeight) / outerWidth)),
    Math.floor(MAX_ATLAS_SIDE_PIXELS / outerWidth),
  )
  const rowCount = Math.ceil(designNumbers.length / columnCount)
  const atlasWidth = columnCount * outerWidth
  const atlasHeight = rowCount * outerHeight
  const rectsByDesign = new Map<number, AtlasRect>()
  const texture = drawCanvasTexture({
    width: atlasWidth,
    height: atlasHeight,
    draw: (context) => {
      designNumbers.forEach((designNumber, cellIndex) => {
        const image = sneakerImages.get(designNumber)
        if (image === undefined) throw new Error(`Sneaker #${designNumber} isn't loaded`)
        const left = (cellIndex % columnCount) * outerWidth + gutter
        const top = Math.floor(cellIndex / columnCount) * outerHeight + gutter
        context.drawImage(image, left, top, sneakerPixels, cellHeight)
        // The canvas texture is flipped on upload, so v runs from the bottom.
        rectsByDesign.set(designNumber, {
          u0: left / atlasWidth,
          u1: (left + sneakerPixels) / atlasWidth,
          v0: 1 - (top + cellHeight) / atlasHeight,
          v1: 1 - top / atlasHeight,
        })
      })
    },
  })
  return { texture, rectsByDesign }
}

/** One Sneaker as its own sharp picture, for the stand. */
export function createSneakerPictureTexture(image: HTMLImageElement, widthPixels: number): Texture {
  return drawCanvasTexture({
    width: widthPixels,
    height: Math.round(widthPixels * SNEAKER_ASPECT),
    draw: (context, width, height) => {
      drawSneaker({ context, image, centerX: width / 2, centerY: height / 2, width })
    },
  })
}

export type SneakerCell = {
  designNumber: number
  position: Vector3Tuple
  rotationY: number
  width: number
}

/** A wall's Sneakers as one geometry: a quad per Sneaker, each showing its cell of the atlas. */
export function buildSneakerWallGeometry(
  cells: readonly SneakerCell[],
  atlas: SneakerAtlas,
): BufferGeometry {
  const quads = cells.map(({ designNumber, position, rotationY, width }) => {
    const rect = atlas.rectsByDesign.get(designNumber)
    if (rect === undefined) throw new Error(`Sneaker #${designNumber} isn't in the atlas`)
    const quad = new PlaneGeometry(width, width * SNEAKER_ASPECT)
    // PlaneGeometry's corners: top left, top right, bottom left, bottom right.
    quad.attributes.uv?.array.set([
      rect.u0,
      rect.v1,
      rect.u1,
      rect.v1,
      rect.u0,
      rect.v0,
      rect.u1,
      rect.v0,
    ])
    quad.applyMatrix4(
      new Matrix4().compose(
        new Vector3(...position),
        new Quaternion().setFromEuler(new Euler(0, rotationY, 0)),
        new Vector3(1, 1, 1),
      ),
    )
    return quad
  })
  const merged = mergeGeometries(quads)
  for (const quad of quads) quad.dispose()
  if (merged === null) throw new Error("The wall's Sneakers couldn't be merged")
  return merged
}
