// Writes WebP and AVIF copies of every PNG in public/screenshots/ at the widths in
// src/lib/screenshot-widths.ts. Runs before `next build`; a missing folder or no PNGs is fine.
import { existsSync, mkdirSync, readdirSync, statSync } from 'node:fs'
import { join } from 'node:path'
import { fileURLToPath } from 'node:url'
import sharp from 'sharp'
import {
  buildOptimizedScreenshotPath,
  type ScreenshotFormat,
  screenshotWidths,
} from '../src/lib/screenshot-widths'

const publicDirectory = fileURLToPath(new URL('../public', import.meta.url))
const screenshotDirectory = join(publicDirectory, 'screenshots')
const formats: readonly ScreenshotFormat[] = ['webp', 'avif']

function isFresh(outputPath: string, sourceModifiedMilliseconds: number): boolean {
  return existsSync(outputPath) && statSync(outputPath).mtimeMs >= sourceModifiedMilliseconds
}

async function convertScreenshots(): Promise<void> {
  if (!existsSync(screenshotDirectory)) return
  const pngFileNames = readdirSync(screenshotDirectory).filter((name) => name.endsWith('.png'))
  if (pngFileNames.length === 0) return
  mkdirSync(join(publicDirectory, 'screenshots', 'optimized'), { recursive: true })

  let writtenCount = 0
  for (const fileName of pngFileNames) {
    const sourcePath = join(screenshotDirectory, fileName)
    const sourceModifiedMilliseconds = statSync(sourcePath).mtimeMs
    for (const widthPixels of screenshotWidths) {
      for (const format of formats) {
        const publicPath = buildOptimizedScreenshotPath(
          `/screenshots/${fileName}`,
          widthPixels,
          format,
        )
        const outputPath = join(publicDirectory, publicPath)
        if (isFresh(outputPath, sourceModifiedMilliseconds)) continue
        const resized = sharp(sourcePath).resize({ width: widthPixels, withoutEnlargement: true })
        await (format === 'webp'
          ? resized.webp({ quality: 80 })
          : resized.avif({ quality: 55 })
        ).toFile(outputPath)
        writtenCount += 1
      }
    }
  }
  console.log(`Screenshots: ${pngFileNames.length} PNGs, ${writtenCount} files written.`)
}

await convertScreenshots()
