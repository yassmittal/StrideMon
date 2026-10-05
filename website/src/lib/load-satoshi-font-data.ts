// Build-time only: fetches Satoshi's TTF files through Fontshare's hosted CSS for the generated
// Open Graph image (`next/og` can't read WOFF2). The files are never written to the site. If the
// fetch fails, the image falls back to `next/og`'s built-in font.
const fontshareCssUrl = 'https://api.fontshare.com/v2/css?f[]=satoshi@400,500&display=swap'

export type SatoshiFont = {
  name: 'Satoshi'
  data: ArrayBuffer
  weight: 400 | 500
  style: 'normal'
}

function findTrueTypeUrl(css: string, weight: SatoshiFont['weight']): string | undefined {
  for (const fontFaceBlock of css.split('@font-face').slice(1)) {
    if (!fontFaceBlock.includes(`font-weight: ${weight};`)) continue
    const match = fontFaceBlock.match(/url\('([^']+\.ttf)'\)/)
    if (match?.[1]) return match[1].startsWith('//') ? `https:${match[1]}` : match[1]
  }
  return undefined
}

export async function loadSatoshiFontData(): Promise<SatoshiFont[]> {
  try {
    const css = await (await fetch(fontshareCssUrl)).text()
    const weights: SatoshiFont['weight'][] = [400, 500]
    const fonts = await Promise.all(
      weights.map(async (weight): Promise<SatoshiFont | undefined> => {
        const url = findTrueTypeUrl(css, weight)
        if (!url) return undefined
        const response = await fetch(url)
        if (!response.ok) return undefined
        return { name: 'Satoshi', data: await response.arrayBuffer(), weight, style: 'normal' }
      }),
    )
    return fonts.filter((font): font is SatoshiFont => font !== undefined)
  } catch {
    return []
  }
}
