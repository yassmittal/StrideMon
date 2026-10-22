import { dirname } from 'node:path'
import { fileURLToPath } from 'node:url'
import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  // Fully static, like the website (brief §7.1): `next build` writes the site to `out/`.
  output: 'export',
  // Not a Bun workspace: without this, Turbopack takes the repo root's bun.lock as the root.
  turbopack: { root: dirname(fileURLToPath(import.meta.url)) },
  // The phone opens the dev server over the LAN (`ipconfig getifaddr en1`).
  allowedDevOrigins: ['192.168.*.*', '10.*.*.*', '172.*.*.*'],
}

export default nextConfig
