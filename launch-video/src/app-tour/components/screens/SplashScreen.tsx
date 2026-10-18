import { REEL_HEIGHT_PIXELS, REEL_WIDTH_PIXELS } from '../../footage'
import { StrideMonMark } from '../StrideMonMark'
import { appColors, toReelPixels } from './app-styles'

// The app's splash (apps/mobile/app.config.ts: `splash-icon` on #F0F1FA, 200 dp wide). The splash
// image is the dark tile at 52% of its canvas (build-app-icons.sh), so the tile is 104 dp, centred.

export const SPLASH_TILE_SIZE_PIXELS = toReelPixels(200 * 0.52)

export function SplashScreen() {
  return (
    <div
      style={{
        position: 'absolute',
        width: REEL_WIDTH_PIXELS,
        height: REEL_HEIGHT_PIXELS,
        backgroundColor: appColors.background,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <StrideMonMark size={SPLASH_TILE_SIZE_PIXELS} />
    </div>
  )
}
