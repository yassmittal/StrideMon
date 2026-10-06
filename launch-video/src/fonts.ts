import { loadFont as loadLocalFont } from '@remotion/fonts'
import { loadFont as loadIbmPlexMono } from '@remotion/google-fonts/IBMPlexMono'
import satoshiMediumUrl from '../../apps/mobile/assets/fonts/Satoshi-Medium.ttf'
import satoshiRegularUrl from '../../apps/mobile/assets/fonts/Satoshi-Regular.ttf'
import { fontFamilies } from './theme'

// Satoshi comes from the app's own files rather than a second copy. Its licence
// (apps/mobile/assets/fonts/Satoshi-FFL.txt, §01) allows use in video and social media.
// Both loaders hold the render (delayRender) until the font is ready, so no frame is drawn
// in a fallback font.
export function loadFilmFonts(): void {
  void loadLocalFont({ family: fontFamilies.satoshi, url: satoshiRegularUrl, weight: '400' })
  void loadLocalFont({ family: fontFamilies.satoshi, url: satoshiMediumUrl, weight: '500' })
  loadIbmPlexMono('normal', { weights: ['400', '500'], subsets: ['latin'] })
}
