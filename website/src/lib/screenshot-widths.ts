// The widths `bun run images` renders for every screenshot. `next.config.ts` hands the same lists
// to `next/image`, so every `srcset` entry it writes points at a file that exists.
export const screenshotDeviceWidths = [360, 540, 720, 1080] as const
export const screenshotImageWidths = [240] as const
export const screenshotWidths = [...screenshotImageWidths, ...screenshotDeviceWidths] as const

export type ScreenshotFormat = 'webp' | 'avif'

export const optimizedScreenshotDirectory = '/screenshots/optimized'

export function buildOptimizedScreenshotPath(
  sourcePath: string,
  widthPixels: number,
  format: ScreenshotFormat,
): string {
  const fileName = sourcePath.split('/').pop() ?? sourcePath
  const baseName = fileName.replace(/\.png$/, '')
  return `${optimizedScreenshotDirectory}/${baseName}-${widthPixels}.${format}`
}
