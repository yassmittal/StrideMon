// The demo video, cut from two Android screen recordings of the demo build (website/README.md has
// the ffmpeg commands). Its width and height are the encode's, with the status bar cropped off.
// The hero shows it in place of the Home screenshot when the file exists in public/.

export const demoVideo = {
  filePath: '/videos/stridemon-demo.mp4',
  posterPath: '/videos/stridemon-demo-poster.webp',
  widthPixels: 540,
  heightPixels: 1136,
  durationSeconds: 78,
  uploadDate: '2026-10-05',
  label: 'StrideMon demo: one Sneaker, start to finish',
  description:
    'Recorded on the Android demo build: sign in, a three-minute walk, STRIDE settled on Monad, a repair and an upgrade, then the Sneaker sent to another wallet.',
  structuredDataName: 'StrideMon demo: walk, earn, upgrade and send a Sneaker NFT on Monad',
} as const

// A short silent loop of the active run screen (sped up about 12×), shown in How it works' Move
// step in place of its screenshot while on screen, when motion is allowed. It has the
// screenshots' 1080 × 2340 aspect, so swapping one for the other moves nothing.
export const walkLoopVideoPath = '/videos/stridemon-walk-loop.mp4'
