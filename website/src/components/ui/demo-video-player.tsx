'use client'

import { useId, useRef, useState } from 'react'
import type { DemoVideoChapter } from '@/content/demo-video'

type DemoVideoPlayerProps = {
  filePath: string
  posterPath?: string
  widthPixels: number
  heightPixels: number
  chapters: readonly DemoVideoChapter[]
  chaptersLabel: string
}

function formatChapterTime(startSeconds: number): string {
  const wholeSeconds = Math.floor(startSeconds)
  const minutes = Math.floor(wholeSeconds / 60)
  const seconds = String(wholeSeconds % 60).padStart(2, '0')
  return `${minutes}:${seconds}`
}

function findChapterIndex(chapters: readonly DemoVideoChapter[], currentSeconds: number): number {
  let chapterIndex = 0
  chapters.forEach((chapter, index) => {
    if (currentSeconds + 0.05 >= chapter.startSeconds) chapterIndex = index
  })
  return chapterIndex
}

// The phone-framed demo with a chapter list beside it. Nothing loads or plays until the visitor
// presses play or a chapter; a chapter seeks there and plays. The current chapter is marked
// quietly (no live region), and every chapter is a plain button, so the keyboard reaches them.
export function DemoVideoPlayer({
  filePath,
  posterPath,
  widthPixels,
  heightPixels,
  chapters,
  chaptersLabel,
}: DemoVideoPlayerProps) {
  const videoRef = useRef<HTMLVideoElement>(null)
  const [currentChapterIndex, setCurrentChapterIndex] = useState(0)
  const chaptersLabelId = useId()

  function seekToChapter(chapterIndex: number) {
    const video = videoRef.current
    const chapter = chapters[chapterIndex]
    if (!video || !chapter) return
    // With `preload="none"` there's no duration yet: seek as soon as the metadata arrives.
    if (video.readyState >= HTMLMediaElement.HAVE_METADATA) {
      video.currentTime = chapter.startSeconds
    } else {
      video.addEventListener(
        'loadedmetadata',
        () => {
          video.currentTime = chapter.startSeconds
        },
        { once: true },
      )
    }
    setCurrentChapterIndex(chapterIndex)
    video.play().catch(() => {
      // Playback refused (for example a data saver): the seek still stands.
    })
  }

  function updateCurrentChapter() {
    const video = videoRef.current
    if (!video) return
    setCurrentChapterIndex(findChapterIndex(chapters, video.currentTime))
  }

  return (
    <div className="flex w-full flex-col items-center gap-8 lg:flex-row lg:items-end lg:justify-end lg:gap-10">
      <div className="w-[66%] max-w-[296px] shrink-0 rounded-[28px] bg-ink p-[5px] lg:order-2">
        <video
          ref={videoRef}
          className="block h-auto w-full rounded-[23px] bg-ink"
          src={filePath}
          poster={posterPath}
          width={widthPixels}
          height={heightPixels}
          preload="none"
          controls
          muted
          playsInline
          onTimeUpdate={updateCurrentChapter}
          onSeeked={updateCurrentChapter}
        />
      </div>
      <div className="w-[66%] max-w-[296px] lg:order-1 lg:w-auto lg:max-w-[15rem]">
        <p
          id={chaptersLabelId}
          className="text-label font-medium tracking-[0.08em] text-ink-secondary-small uppercase"
        >
          {chaptersLabel}
        </p>
        <ol aria-labelledby={chaptersLabelId} className="mt-3 border-t border-hairline">
          {chapters.map((chapter, chapterIndex) => {
            const isCurrent = chapterIndex === currentChapterIndex
            return (
              <li key={chapter.label} className="border-b border-hairline">
                <button
                  type="button"
                  onClick={() => seekToChapter(chapterIndex)}
                  aria-current={isCurrent ? 'true' : undefined}
                  className={`flex min-h-11 w-full items-baseline gap-4 py-2 text-left transition-colors duration-300 ease-standard hover:text-ink ${
                    isCurrent ? 'text-ink' : 'text-ink-secondary-small'
                  }`}
                >
                  <span className="w-[4ch] shrink-0 font-mono text-sm tabular-nums">
                    {formatChapterTime(chapter.startSeconds)}
                  </span>
                  <span className="text-base leading-[1.3]">{chapter.label}</span>
                </button>
              </li>
            )
          })}
        </ol>
      </div>
    </div>
  )
}
