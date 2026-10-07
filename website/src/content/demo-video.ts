// The demo video, cut from one Android screen recording of the demo build (website/README.md has
// the ffmpeg commands). Its width and height are the encode's, with the status bar cropped off.
// The hero shows it in place of the Home screenshot when the file exists in public/.

export const demoVideo = {
  filePath: '/videos/stridemon-demo.mp4',
  posterPath: '/videos/stridemon-demo-poster.webp',
  widthPixels: 540,
  heightPixels: 1134,
  durationSeconds: 56,
  uploadDate: '2026-10-06',
  label: 'StrideMon demo: one Sneaker, start to finish',
  description:
    'Recorded on the Android demo build: sign in with MetaMask, a three-and-a-half-minute walk, 15 STRIDE settled on Monad, then the Sneaker sent to another wallet with its stats.',
  structuredDataName: 'StrideMon demo: walk, earn STRIDE and send a Sneaker NFT on Monad',
  playLabel: 'Watch the demo',
  replayLabel: 'Watch again',
} as const

export type DemoVideoChapter = {
  title: string
  startSeconds: number
}

// The player's chapter bars. Each starts mid-crossfade between two scenes of
// scripts/cut-demo-video.sh (it prints those times), so a re-cut means new times here.
export const demoVideoChapters: readonly DemoVideoChapter[] = [
  { title: 'Sign in', startSeconds: 0 },
  { title: 'Walk', startSeconds: 12.2 },
  { title: 'Earn', startSeconds: 27.4 },
  { title: 'Send', startSeconds: 35 },
]

// A short silent loop of the active run screen (sped up about 12×), shown in How it works' Move
// step in place of its screenshot while on screen, when motion is allowed. It has the
// screenshots' 1080 × 2340 aspect, so swapping one for the other moves nothing.
export const walkLoopVideoPath = '/videos/stridemon-walk-loop.mp4'
