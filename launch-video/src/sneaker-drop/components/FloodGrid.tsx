import { useLayoutEffect, useRef, useState } from 'react'
import { cancelRender, continueRender, delayRender } from 'remotion'
import { FLOOD_ATLAS_PATH } from '../art'
import {
  FLOOD_ATLAS_COLUMN_COUNT,
  FLOOD_ATLAS_TILE_HEIGHT,
  FLOOD_ATLAS_TILE_WIDTH,
} from '../flood-atlas'
import type { FloodGrid as FloodGridData } from '../sneakers'

// The flood: all 1,000 Sneakers from one rasterised atlas (scripts/copy-sneaker-drop-art.sh),
// drawn on one canvas, so a frame with 1,000 shoes renders as fast as one with a few. Each step
// shows `columnCount` columns centred on #0020's cell; at the grid's own column count, the whole
// grid fills the frame.

/** The tile fills this much of its cell's width, so neighbours never touch. */
const TILE_FILL_RATIO = 0.94

type FloodGridProps = {
  grid: FloodGridData
  columnCount: number
  width: number
  height: number
}

export function FloodGrid({ grid, columnCount, width, height }: FloodGridProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const atlas = useAtlasImage()

  useLayoutEffect(() => {
    const context = canvasRef.current?.getContext('2d')
    if (context == null || atlas === null) return
    context.clearRect(0, 0, width, height)
    // At the full grid, a cell is exactly the frame divided by the grid; every step keeps that shape.
    const cellAspect = height / grid.rowCount / (width / grid.columnCount)
    const cellWidth = width / columnCount
    const cellHeight = cellWidth * cellAspect
    const gridWidth = grid.columnCount * cellWidth
    const gridHeight = grid.rowCount * cellHeight
    // The camera centres on #0020's cell, kept inside the grid so no empty edge shows.
    const centreX = clamp((grid.centre.column + 0.5) * cellWidth, width / 2, gridWidth - width / 2)
    const centreY = clamp((grid.centre.row + 0.5) * cellHeight, height / 2, gridHeight - height / 2)
    const offsetX = width / 2 - centreX
    const offsetY = height / 2 - centreY
    const tileWidth = cellWidth * TILE_FILL_RATIO
    const tileHeight = (tileWidth * FLOOD_ATLAS_TILE_HEIGHT) / FLOOD_ATLAS_TILE_WIDTH
    context.imageSmoothingQuality = 'high'
    grid.designNumbers.forEach((designNumber, cellIndex) => {
      const left = offsetX + (cellIndex % grid.columnCount) * cellWidth
      const top = offsetY + Math.floor(cellIndex / grid.columnCount) * cellHeight
      if (left > width || top > height || left + cellWidth < 0 || top + cellHeight < 0) return
      const tileIndex = designNumber - 1
      context.drawImage(
        atlas,
        (tileIndex % FLOOD_ATLAS_COLUMN_COUNT) * FLOOD_ATLAS_TILE_WIDTH,
        Math.floor(tileIndex / FLOOD_ATLAS_COLUMN_COUNT) * FLOOD_ATLAS_TILE_HEIGHT,
        FLOOD_ATLAS_TILE_WIDTH,
        FLOOD_ATLAS_TILE_HEIGHT,
        left + (cellWidth - tileWidth) / 2,
        top + (cellHeight - tileHeight) / 2,
        tileWidth,
        tileHeight,
      )
    })
  }, [atlas, grid, columnCount, width, height])

  return (
    <canvas
      ref={canvasRef}
      width={width}
      height={height}
      style={{ position: 'absolute', left: 0, top: 0, width, height }}
    />
  )
}

let atlasPromise: Promise<HTMLImageElement> | null = null

/** The atlas image, loaded once for the whole render, holding the render until it's decoded. */
function useAtlasImage(): HTMLImageElement | null {
  const [atlas, setAtlas] = useState<HTMLImageElement | null>(null)
  const [delayHandle] = useState(() => delayRender('Loading the flood atlas'))
  useLayoutEffect(() => {
    atlasPromise ??= new Promise((resolve, reject) => {
      const image = new Image()
      image.onload = () => resolve(image)
      image.onerror = () =>
        reject(new Error(`Missing ${FLOOD_ATLAS_PATH}: run bash scripts/copy-sneaker-drop-art.sh`))
      image.src = FLOOD_ATLAS_PATH
    })
    atlasPromise
      .then((image) => {
        setAtlas(image)
        continueRender(delayHandle)
      })
      .catch((error: unknown) => cancelRender(error))
  }, [delayHandle])
  return atlas
}

function clamp(value: number, minimum: number, maximum: number): number {
  if (maximum < minimum) return (minimum + maximum) / 2
  return Math.min(maximum, Math.max(minimum, value))
}
