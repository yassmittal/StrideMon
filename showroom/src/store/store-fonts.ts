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

/** Waits for the weights the signs use, so no texture is drawn in a fallback font. */
export async function loadStoreFonts(fontFamilies: StoreFontFamilies): Promise<void> {
  await Promise.all([
    document.fonts.load(`700 100px ${fontFamilies.satoshi}`),
    document.fonts.load(`500 100px ${fontFamilies.mono}`),
  ])
}
