'use client'

import { useEffect, useState } from 'react'
import { loaderCopy, passCollectionUrl } from '@/content/showroom'
import { useSmallStore } from '@/lib/create-small-store'
import { loadingStore, readLoadingProgress } from '@/lib/loading-store'

// The loader (Part 4): the line-Sneaker mark (the website's `icon.svg`) drawn stroke by stroke as
// the store really loads, the sole, then the upper, then the lime stroke last, with the shaders.
// It's in the page's HTML, so it paints before any script; after 8 seconds a line (pure CSS, so it
// shows even if the script never comes) says where else the collection is.

/** Each stroke's share of the progress, in drawing order: the lime one waits for the shaders. */
const STROKES = [
  {
    path: 'M13 43h30c5 0 9-1 10-3 1-1 0-2-1-2L26 37c-5 0-9-1-12-1-1 3-1 6-1 7Z',
    from: 0,
    to: 0.45,
    color: '#FFFFFF',
    width: 3,
  },
  {
    path: 'M14 36c-2-5-2-10-1-15 4 2 8 3 11 3l3-6 15 10c7 2 10 6 11 10',
    from: 0.45,
    to: 0.85,
    color: '#FFFFFF',
    width: 3,
  },
  { path: 'M15 32c8 1 16-2 22-6', from: 0.85, to: 1, color: '#C1FF00', width: 3.5 },
] as const

/** The loader's fade once the store is ready. Matches `duration-700` below. */
const FADE_OUT_MILLISECONDS = 700

export function StoreLoader() {
  const progress = useSmallStore(loadingStore, readLoadingProgress)
  const phase = useSmallStore(loadingStore, (state) => state.phase)
  const isLeaving = phase !== 'loading'
  const [isGone, setIsGone] = useState(false)

  useEffect(() => {
    if (!isLeaving) return
    const timeoutId = window.setTimeout(() => setIsGone(true), FADE_OUT_MILLISECONDS)
    return () => window.clearTimeout(timeoutId)
  }, [isLeaving])
  if (isGone) return null

  const percent = Math.round(progress * 100)
  return (
    <div
      className={`absolute inset-0 z-40 flex flex-col items-center justify-center bg-night px-4 transition-opacity duration-700 ease-standard ${isLeaving ? 'pointer-events-none opacity-0' : 'opacity-100'}`}
    >
      <div
        role="progressbar"
        aria-label={loaderCopy.label}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={percent}
        className="flex flex-col items-center gap-5"
      >
        <svg viewBox="8 14 50 34" className="h-auto w-24" aria-hidden="true">
          {STROKES.map((stroke) => (
            <path
              key={`${stroke.path}-ghost`}
              d={stroke.path}
              fill="none"
              stroke="rgba(255,255,255,0.1)"
              strokeWidth={stroke.width}
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          ))}
          {STROKES.map((stroke) => {
            const share = Math.min(
              Math.max((progress - stroke.from) / (stroke.to - stroke.from), 0),
              1,
            )
            return (
              <path
                key={stroke.path}
                d={stroke.path}
                pathLength={1}
                fill="none"
                stroke={stroke.color}
                strokeWidth={stroke.width}
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeDasharray="1 1"
                strokeDashoffset={1 - share}
                className="loader-stroke"
                // A stroke not yet started draws nothing, not a dot from its round cap.
                opacity={share === 0 ? 0 : 1}
              />
            )
          })}
        </svg>
        <p className="font-mono text-label text-on-dark-secondary uppercase tabular-nums">
          {loaderCopy.label} · {percent}%
        </p>
      </div>
      <p className="loader-slow-note absolute inset-x-4 bottom-[max(32px,env(safe-area-inset-bottom))] mx-auto max-w-sm text-center text-[14px] text-on-dark-secondary leading-snug">
        {loaderCopy.slow}{' '}
        <a
          href={passCollectionUrl}
          className="text-on-dark underline decoration-hairline-on-dark underline-offset-4"
        >
          {loaderCopy.slowLink}
        </a>
      </p>
    </div>
  )
}
