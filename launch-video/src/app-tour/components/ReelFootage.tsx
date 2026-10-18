import { Video } from '@remotion/media'
import { staticFile, useVideoConfig } from 'remotion'
import { type AppTourClipName, REEL_HEIGHT_PIXELS, REEL_WIDTH_PIXELS } from '../footage'

/**
 * One of the reel's clips (public/footage/app-tour/, 720 × 1560, 60 fps) at its own size. It plays
 * from its first frame at the current frame; wrap it in `Freeze` to show a mapped clip frame.
 */
export function ReelFootage({ clipName }: { clipName: AppTourClipName }) {
  const { fps } = useVideoConfig()
  return (
    <Video
      src={staticFile(`footage/app-tour/${clipName}.mp4`)}
      muted
      premountFor={fps}
      style={{ position: 'absolute', width: REEL_WIDTH_PIXELS, height: REEL_HEIGHT_PIXELS }}
    />
  )
}
