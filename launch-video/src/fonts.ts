import { loadFont as loadLocalFont } from '@remotion/fonts'
import { loadFont as loadIbmPlexMono } from '@remotion/google-fonts/IBMPlexMono'
import { loadFont as loadKnewave } from '@remotion/google-fonts/Knewave'
import { staticFile } from 'remotion'
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
  // The Pass chat film's script face (its lime keywords and the handwritten "isn’t"): Knewave by
  // Tyler Finck, SIL Open Font License 1.1, which allows use in video. Only that film uses it.
  loadKnewave('normal', { weights: ['400'], subsets: ['latin'] })
  // Satoshi Bold, for the App tour film's headlines only (Yash, 2026-10-17): Fontshare's file from
  // the same release as the app's (its Medium is byte-identical), under the same licence.
  void loadLocalFont({
    family: fontFamilies.satoshi,
    url: staticFile('app-tour/Satoshi-Bold.ttf'),
    weight: '700',
  })
}
