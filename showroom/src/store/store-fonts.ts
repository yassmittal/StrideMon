// The fonts the store's signs are drawn in, as the film draws them (Satoshi 700, IBM Plex Mono 500).
// Satoshi comes from Fontshare by its own name; IBM Plex Mono comes through `next/font`, whose
// family name is generated, so it's read from the CSS variable the layout sets.

const PLEX_MONO_CSS_VARIABLE = '--font-plex-mono'

export type StoreFontFamilies = { satoshi: string; mono: string }

export function readStoreFontFamilies(): StoreFontFamilies {
  const monoFamily = getComputedStyle(document.documentElement)
    .getPropertyValue(PLEX_MONO_CSS_VARIABLE)
    .trim()
  return { satoshi: 'Satoshi', mono: monoFamily === '' ? 'monospace' : monoFamily }
}

/** A font that hasn't come by then is skipped: the signs are drawn in the fallback. */
const FONT_WAIT_MILLISECONDS = 6000

/**
 * Waits for the weights the signs use, so no texture is drawn in a fallback font. A font that
 * can't be downloaded (Fontshare's CDN blocked by a network or a phone's Private DNS) or takes too
 * long is skipped, never fatal: the store opens with its signs in the fallback font.
 */
export async function loadStoreFonts(fontFamilies: StoreFontFamilies): Promise<void> {
  await Promise.all([
    loadFontOrSkip(`700 100px ${fontFamilies.satoshi}`),
    loadFontOrSkip(`500 100px ${fontFamilies.mono}`),
  ])
}

async function loadFontOrSkip(font: string): Promise<void> {
  let timeoutId: number | undefined
  const timeout = new Promise<'timedOut'>((resolve) => {
    timeoutId = window.setTimeout(() => resolve('timedOut'), FONT_WAIT_MILLISECONDS)
  })
  try {
    const result = await Promise.race([document.fonts.load(font), timeout])
    if (result === 'timedOut')
      console.warn(`The store's font "${font}" is slow: using the fallback`)
  } catch (error) {
    console.warn(`The store's font "${font}" couldn't load: using the fallback`, error)
  } finally {
    window.clearTimeout(timeoutId)
  }
}
