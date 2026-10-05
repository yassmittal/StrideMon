import { dirname } from 'node:path'
import { fileURLToPath } from 'node:url'
import type { NextConfig } from 'next'
import { screenshotDeviceWidths, screenshotImageWidths } from './src/lib/screenshot-widths'

const nextConfig: NextConfig = {
  // Fully static (D-035): `next build` writes the site to `out/`, with no server code.
  output: 'export',
  // Not a Bun workspace (D-035): without this, Turbopack takes the repo root's bun.lock as the root.
  turbopack: { root: dirname(fileURLToPath(import.meta.url)) },
  images: {
    // A static export has no image optimizer. `bun run images` writes WebP and AVIF copies of
    // each screenshot at these widths, and the loader points `next/image` at them.
    loader: 'custom',
    loaderFile: './src/lib/screenshot-image-loader.ts',
    deviceSizes: [...screenshotDeviceWidths],
    imageSizes: [...screenshotImageWidths],
  },
}

export default nextConfig
