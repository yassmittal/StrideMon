import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { ImageResponse } from 'next/og'

export const dynamic = 'force-static'
export const size = { width: 180, height: 180 }
export const contentType = 'image/png'

// The same mark as `icon.svg`, on a full square (iOS rounds the corners itself).
export default function AppleIcon() {
  const iconMarkup = readFileSync(join(process.cwd(), 'src/app/icon.svg'), 'utf8').replace(
    'rx="14"',
    'rx="0"',
  )
  const iconDataUri = `data:image/svg+xml;base64,${Buffer.from(iconMarkup).toString('base64')}`
  return new ImageResponse(
    // biome-ignore lint/performance/noImgElement: next/og renders plain <img>, not next/image.
    <img src={iconDataUri} width={size.width} height={size.height} alt="" />,
    size,
  )
}
