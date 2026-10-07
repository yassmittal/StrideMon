'use client'

import { type KeyboardEvent, useCallback, useEffect, useRef, useState } from 'react'
import type { DemoVideoChapter } from '@/content/demo-video'

type DemoVideoPlayerProps = {
  filePath: string
  posterPath?: string
  widthPixels: number
  heightPixels: number
  durationSeconds: number
  chapters: readonly DemoVideoChapter[]
  label: string
  playLabel: string
  replayLabel: string
  className?: string
}

const controlsHideDelayMilliseconds = 2500
const keyboardStepSeconds = 5

function formatClockTime(totalSeconds: number): string {
  const wholeSeconds = Math.max(0, Math.floor(totalSeconds))
  const minutes = Math.floor(wholeSeconds / 60)
  const seconds = wholeSeconds % 60
  return `${minutes}:${seconds.toString().padStart(2, '0')}`
}

function findChapterIndex(chapters: readonly DemoVideoChapter[], currentSeconds: number): number {
  let chapterIndex = 0
  chapters.forEach((chapter, index) => {
    if (currentSeconds >= chapter.startSeconds) chapterIndex = index
  })
  return chapterIndex
}

// How much of a chapter has played, from 0 to 1.
function readChapterFraction(
  chapters: readonly DemoVideoChapter[],
  chapterIndex: number,
  currentSeconds: number,
  durationSeconds: number,
): number {
  const startSeconds = chapters[chapterIndex]?.startSeconds ?? 0
  const endSeconds = chapters[chapterIndex + 1]?.startSeconds ?? durationSeconds
  const fraction = (currentSeconds - startSeconds) / (endSeconds - startSeconds)
  return Math.min(1, Math.max(0, fraction))
}

// The demo in the same plain phone frame as the screenshots, with our own controls instead of the
// browser's: a pill on the poster, story-style chapter bars while it plays (press one to jump
// there), a press anywhere else to pause, and a replay pill at the end. Muted, `preload="none"`:
// nothing but the poster loads until the visitor presses play. Without JavaScript the poster stays.
export function DemoVideoPlayer({
  filePath,
  posterPath,
  widthPixels,
  heightPixels,
  durationSeconds,
  chapters,
  label,
  playLabel,
  replayLabel,
  className = '',
}: DemoVideoPlayerProps) {
  const videoRef = useRef<HTMLVideoElement>(null)
  const hideControlsTimeoutRef = useRef<number | undefined>(undefined)
  const [hasStarted, setHasStarted] = useState(false)
  const [isPlaying, setIsPlaying] = useState(false)
  const [isWaiting, setIsWaiting] = useState(false)
  const [hasEnded, setHasEnded] = useState(false)
  const [currentSeconds, setCurrentSeconds] = useState(0)
  const [knownDurationSeconds, setKnownDurationSeconds] = useState(durationSeconds)
  const [areControlsRecent, setAreControlsRecent] = useState(false)

  // Smooth bars: read the clock every frame while playing (`timeupdate` only fires ~4 times a second).
  useEffect(() => {
    const video = videoRef.current
    if (!video || !isPlaying) return
    let animationFrameId = 0
    const readClock = () => {
      setCurrentSeconds(video.currentTime)
      animationFrameId = requestAnimationFrame(readClock)
    }
    animationFrameId = requestAnimationFrame(readClock)
    return () => cancelAnimationFrame(animationFrameId)
  }, [isPlaying])

  useEffect(() => () => window.clearTimeout(hideControlsTimeoutRef.current), [])

  // Controls show on any interaction, then fade while the video plays untouched.
  const showControlsForAWhile = useCallback(() => {
    setAreControlsRecent(true)
    window.clearTimeout(hideControlsTimeoutRef.current)
    hideControlsTimeoutRef.current = window.setTimeout(
      () => setAreControlsRecent(false),
      controlsHideDelayMilliseconds,
    )
  }, [])

  const playVideo = useCallback(() => {
    const video = videoRef.current
    if (!video) return
    setHasStarted(true)
    video.play().catch(() => {
      // Playback refused (for example a data saver): the poster and the pill stay.
      setHasStarted(false)
    })
  }, [])

  const togglePlayback = () => {
    const video = videoRef.current
    if (!video) return
    showControlsForAWhile()
    if (video.paused || video.ended) {
      if (video.ended) video.currentTime = 0
      playVideo()
    } else {
      video.pause()
    }
  }

  const seekTo = (targetSeconds: number) => {
    const video = videoRef.current
    if (!video) return
    const clampedSeconds = Math.min(Math.max(0, targetSeconds), knownDurationSeconds - 0.1)
    video.currentTime = clampedSeconds
    setCurrentSeconds(clampedSeconds)
    setHasEnded(false)
    showControlsForAWhile()
  }

  const jumpToChapter = (chapter: DemoVideoChapter) => {
    seekTo(chapter.startSeconds)
    if (videoRef.current?.paused) playVideo()
  }

  // Space and Enter press the focused button themselves; K and the arrows work from any control.
  const handleKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    if (!hasStarted) return
    if (event.key === 'k') {
      event.preventDefault()
      togglePlayback()
    } else if (event.key === 'ArrowLeft') {
      event.preventDefault()
      seekTo(currentSeconds - keyboardStepSeconds)
    } else if (event.key === 'ArrowRight') {
      event.preventDefault()
      seekTo(currentSeconds + keyboardStepSeconds)
    }
  }

  const currentChapterIndex = findChapterIndex(chapters, currentSeconds)
  const currentChapter = chapters[currentChapterIndex]
  const isPaused = hasStarted && !isPlaying && !hasEnded
  const areChaptersVisible = hasStarted && !hasEnded && (isPaused || areControlsRecent)
  const isInviteVisible = !hasStarted || hasEnded
  const surfaceLabel = isInviteVisible
    ? `${hasEnded ? replayLabel : playLabel} (${formatClockTime(knownDurationSeconds)})`
    : isPlaying
      ? 'Pause the demo'
      : 'Resume the demo'

  return (
    // biome-ignore lint/a11y/noStaticElementInteractions: keys reach this wrapper from the buttons inside it.
    <div
      className={`rounded-[28px] bg-ink p-[5px] ${className}`}
      onKeyDown={handleKeyDown}
      onPointerMove={hasStarted ? showControlsForAWhile : undefined}
    >
      <div className="@container relative overflow-hidden rounded-[23px] bg-ink">
        <video
          ref={videoRef}
          className="block h-auto w-full"
          src={filePath}
          poster={posterPath}
          width={widthPixels}
          height={heightPixels}
          aria-label={label}
          preload="none"
          muted
          playsInline
          disablePictureInPicture
          disableRemotePlayback
          onPlay={() => {
            setIsPlaying(true)
            setHasEnded(false)
          }}
          onPause={() => setIsPlaying(false)}
          onWaiting={() => setIsWaiting(true)}
          onPlaying={() => setIsWaiting(false)}
          onSeeked={(event) => setCurrentSeconds(event.currentTarget.currentTime)}
          onLoadedMetadata={(event) => setKnownDurationSeconds(event.currentTarget.duration)}
          onEnded={() => {
            setHasEnded(true)
            setCurrentSeconds(knownDurationSeconds)
          }}
        />

        {/* Before play and at the end: the poster dims so the play button stands out. */}
        <div
          aria-hidden="true"
          className={`pointer-events-none absolute inset-0 bg-ink/20 transition-opacity duration-500 ease-standard ${
            isInviteVisible ? 'opacity-100' : 'opacity-0'
          }`}
        />

        {/* The whole screen is the play / pause button. */}
        <button
          type="button"
          aria-label={surfaceLabel}
          className="demo-player-surface absolute inset-0 grid cursor-pointer place-items-center focus-visible:outline-offset-[-4px]"
          onClick={togglePlayback}
        >
          <span
            className={`flex flex-col items-center gap-2.5 transition-[opacity,transform] duration-500 ease-standard ${
              isInviteVisible ? 'opacity-100' : 'pointer-events-none scale-95 opacity-0'
            }`}
          >
            <span className="demo-player-button grid size-16 place-items-center rounded-full bg-surface text-ink shadow-floating-pill">
              {hasEnded ? (
                <ReplayArrow className="size-6" />
              ) : (
                <PlayTriangle className="size-5 translate-x-0.5" />
              )}
            </span>
            <span className="flex items-baseline gap-2 rounded-full bg-ink/70 px-3 py-1.5 text-label font-medium tracking-[0.08em] text-on-dark uppercase backdrop-blur-sm">
              <span className="hidden @[170px]:inline">{hasEnded ? replayLabel : playLabel}</span>
              <span className="font-mono text-on-dark-secondary @max-[170px]:text-on-dark">
                {formatClockTime(knownDurationSeconds)}
              </span>
            </span>
          </span>
        </button>

        {/* Paused: a quiet play mark in the middle. Loading: a thin ring. */}
        <div
          aria-hidden="true"
          className={`pointer-events-none absolute inset-0 grid place-items-center transition-opacity duration-300 ease-standard ${
            isPaused || (isWaiting && isPlaying) ? 'opacity-100' : 'opacity-0'
          }`}
        >
          {isWaiting && isPlaying ? (
            <span className="size-10 animate-spin rounded-full border-2 border-on-dark/30 border-t-on-dark" />
          ) : (
            <span className="grid size-14 place-items-center rounded-full bg-ink/55 text-on-dark backdrop-blur-sm">
              <PlayTriangle className="size-5 translate-x-px" />
            </span>
          )}
        </div>

        {/* Chapters on a frosted strip: one bar each, filling as it plays; press one to jump there. */}
        <div
          className={`absolute inset-x-1.5 top-1.5 rounded-[17px] bg-ink/65 px-2.5 pb-2 backdrop-blur-md transition-opacity duration-300 ease-standard ${
            areChaptersVisible ? 'opacity-100' : 'pointer-events-none opacity-0'
          }`}
        >
          <div className="flex gap-1">
            {chapters.map((chapter, index) => {
              const fraction =
                index < currentChapterIndex
                  ? 1
                  : index > currentChapterIndex
                    ? 0
                    : readChapterFraction(chapters, index, currentSeconds, knownDurationSeconds)
              return (
                <button
                  key={chapter.title}
                  type="button"
                  aria-label={`Jump to ${chapter.title}`}
                  aria-current={index === currentChapterIndex ? 'step' : undefined}
                  tabIndex={areChaptersVisible ? 0 : -1}
                  className="group flex-1 cursor-pointer py-2"
                  onClick={() => jumpToChapter(chapter)}
                >
                  <span className="block h-[3px] overflow-hidden rounded-full bg-on-dark/35 transition-colors duration-300 ease-standard group-hover:bg-on-dark/55">
                    <span
                      className="block h-full origin-left rounded-full bg-on-dark"
                      style={{ transform: `scaleX(${fraction})` }}
                    />
                  </span>
                </button>
              )
            })}
          </div>
          <p className="pointer-events-none flex items-baseline justify-between gap-2 px-0.5 whitespace-nowrap text-label font-medium tracking-[0.08em] text-on-dark uppercase">
            <span>
              <span className="font-mono text-on-dark-secondary">
                {String(currentChapterIndex + 1).padStart(2, '0')}
              </span>{' '}
              {currentChapter?.title}
            </span>
            <span className="hidden font-mono text-on-dark-secondary @[200px]:inline">
              {formatClockTime(currentSeconds)} / {formatClockTime(knownDurationSeconds)}
            </span>
          </p>
        </div>
      </div>
    </div>
  )
}

function PlayTriangle({ className = '' }: { className?: string }) {
  return (
    <svg aria-hidden="true" className={className} viewBox="0 0 12 12" fill="currentColor">
      <path d="M2.5 1.4v9.2a.6.6 0 0 0 .9.5l7.6-4.6a.6.6 0 0 0 0-1L3.4.9a.6.6 0 0 0-.9.5Z" />
    </svg>
  )
}

function ReplayArrow({ className = '' }: { className?: string }) {
  return (
    <svg
      aria-hidden="true"
      className={className}
      viewBox="0 0 18 18"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M3.5 9a5.5 5.5 0 1 0 1.6-3.9M3.5 3v3.2h3.2" />
    </svg>
  )
}
