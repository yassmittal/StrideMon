import type { ImageLoaderProps } from 'next/image'
import { buildOptimizedScreenshotPath } from './screenshot-widths'

// The default `next/image` loader for the static export: WebP at the requested width.
// `ScreenshotPicture` adds an AVIF <source> in front of it with `loadAvifScreenshot`.
export default function loadWebpScreenshot({ src, width }: ImageLoaderProps): string {
  return buildOptimizedScreenshotPath(src, width, 'webp')
}

export function loadAvifScreenshot({ src, width }: ImageLoaderProps): string {
  return buildOptimizedScreenshotPath(src, width, 'avif')
}
