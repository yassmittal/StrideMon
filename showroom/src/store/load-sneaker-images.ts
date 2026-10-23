import { buildPassLacedArtPath } from '@/lib/sneaker-design'

// The laced Sneakers as images the canvas can draw (brief §5.3). Each SVG is fetched (so the
// loader shows real progress), then decoded from a blob. The SVGs carry only a viewBox; Firefox
// won't draw an SVG without a size onto a canvas, so the root gets the art's own 1000 × 600 as
// width and height. Nothing in the drawing changes.

export type SneakerImages = ReadonlyMap<number, HTMLImageElement>

const LACED_ART_ROOT_TAG = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1000 600">'
const SIZED_ROOT_TAG =
  '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1000 600" width="1000" height="600">'

export async function loadSneakerImages({
  designNumbers,
  onFileLoaded,
}: {
  designNumbers: readonly number[]
  onFileLoaded: () => void
}): Promise<SneakerImages> {
  const loadedImages = await Promise.all(
    designNumbers.map(async (designNumber) => {
      const image = await loadSneakerImage(designNumber)
      onFileLoaded()
      return [designNumber, image] as const
    }),
  )
  return new Map(loadedImages)
}

export async function loadSneakerImage(designNumber: number): Promise<HTMLImageElement> {
  const artPath = buildPassLacedArtPath(designNumber)
  const response = await fetch(artPath)
  if (!response.ok) throw new Error(`Couldn't load ${artPath} (${response.status})`)
  const svg = (await response.text()).replace(LACED_ART_ROOT_TAG, SIZED_ROOT_TAG)
  const objectUrl = URL.createObjectURL(new Blob([svg], { type: 'image/svg+xml' }))
  try {
    const image = new Image()
    image.src = objectUrl
    await image.decode()
    return image
  } finally {
    URL.revokeObjectURL(objectUrl)
  }
}
