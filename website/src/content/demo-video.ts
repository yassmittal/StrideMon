// The demo video, cut from two Android screen recordings of the demo build (website/README.md has
// the ffmpeg commands). Its width and height are the encode's, with the status bar cropped off.
// The section shows only when the file exists in public/.

export type DemoVideoChapter = {
  label: string
  // Where pressing the chapter seeks to: just past the crossfade into it.
  startSeconds: number
}

const demoVideoChapters: readonly DemoVideoChapter[] = [
  { label: 'Sign in with MetaMask', startSeconds: 0 },
  { label: 'Home and the Sneaker', startSeconds: 10.7 },
  { label: 'START and the walk', startSeconds: 14 },
  { label: 'STOP and the reward', startSeconds: 27.6 },
  { label: 'Repair and upgrade', startSeconds: 36 },
  { label: 'Send to another wallet', startSeconds: 56.7 },
]

export const demoVideo = {
  filePath: '/videos/stridemon-demo.mp4',
  posterPath: '/videos/stridemon-demo-poster.webp',
  widthPixels: 540,
  heightPixels: 1136,
  durationSeconds: 78,
  uploadDate: '2026-10-05',
  heading: 'One Sneaker, start to finish',
  description:
    'Recorded on the Android demo build: sign in, a three-minute walk, SOLE settled on Monad, a repair and an upgrade, then the Sneaker sent to another wallet.',
  structuredDataName: 'StrideMon demo: walk, earn, upgrade and send a Sneaker NFT on Monad',
  chaptersLabel: 'Chapters',
  chapters: demoVideoChapters,
} as const

// A short silent loop of the active run screen (sped up about 12×), shown in How it works' Move
// step in place of its screenshot while on screen, when motion is allowed. It has the
// screenshots' 1080 × 2340 aspect, so swapping one for the other moves nothing.
export const walkLoopVideoPath = '/videos/stridemon-walk-loop.mp4'
