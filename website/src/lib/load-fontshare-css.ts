// Build-time only. Satoshi's licence doesn't allow self-hosting the files (D-035), so they stay on
// Fontshare's CDN. Fontshare's CSS is fetched once per build and inlined, so the page doesn't wait
// on a render-blocking request to api.fontshare.com. If the fetch fails, the layout falls back to
// linking the stylesheet.
export const fontshareCssUrl = 'https://api.fontshare.com/v2/css?f[]=satoshi@400,500&display=swap'

export type FontshareCss = {
  css: string
  woff2Urls: string[]
}

export async function loadFontshareCss(): Promise<FontshareCss | undefined> {
  try {
    const response = await fetch(fontshareCssUrl)
    if (!response.ok) return undefined
    // Fontshare writes protocol-relative URLs; pin them to https.
    const css = (await response.text()).replaceAll("url('//", "url('https://")
    const woff2Urls = [...css.matchAll(/url\('([^']+\.woff2)'\)/g)].flatMap((match) =>
      match[1] ? [match[1]] : [],
    )
    if (woff2Urls.length === 0) return undefined
    return { css, woff2Urls }
  } catch {
    return undefined
  }
}
