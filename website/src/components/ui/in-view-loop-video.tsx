'use client'

import { type ReactNode, useEffect, useRef, useState } from 'react'

type InViewLoopVideoProps = {
  videoPath: string
  className?: string
  // The phone-framed screenshot. It stays underneath, and is all that shows with reduced motion,
  // before the video is near, or without JavaScript.
  children: ReactNode
}

const reducedMotionQuery = '(prefers-reduced-motion: reduce)'

// A silent loop laid over a phone-framed screenshot of the same aspect. It loads once the frame is
// near the viewport, plays only while on screen, and fades in once it's actually playing.
export function InViewLoopVideo({ videoPath, className = '', children }: InViewLoopVideoProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const videoRef = useRef<HTMLVideoElement>(null)
  const [isMotionAllowed, setIsMotionAllowed] = useState(false)
  const [isNearViewport, setIsNearViewport] = useState(false)
  const [isPlaying, setIsPlaying] = useState(false)

  useEffect(() => {
    const mediaQueryList = window.matchMedia(reducedMotionQuery)
    const updateMotionAllowed = () => {
      setIsMotionAllowed(!mediaQueryList.matches)
      // The video unmounts with reduced motion; it fades in again only once it's playing.
      if (mediaQueryList.matches) setIsPlaying(false)
    }
    updateMotionAllowed()
    mediaQueryList.addEventListener('change', updateMotionAllowed)
    return () => mediaQueryList.removeEventListener('change', updateMotionAllowed)
  }, [])

  useEffect(() => {
    const container = containerRef.current
    if (!container || !isMotionAllowed) return
    const nearObserver = new IntersectionObserver(
      ([entry]) => {
        if (!entry?.isIntersecting) return
        setIsNearViewport(true)
        nearObserver.disconnect()
      },
      { rootMargin: '400px 0px' },
    )
    nearObserver.observe(container)
    return () => nearObserver.disconnect()
  }, [isMotionAllowed])

  useEffect(() => {
    const container = containerRef.current
    const video = videoRef.current
    if (!container || !video || !isNearViewport || !isMotionAllowed) return
    const visibleObserver = new IntersectionObserver(([entry]) => {
      if (entry?.isIntersecting) {
        video.play().catch(() => {
          // Autoplay refused (for example a data saver): the screenshot stays.
        })
      } else {
        video.pause()
      }
    })
    visibleObserver.observe(container)
    return () => {
      visibleObserver.disconnect()
      video.pause()
    }
  }, [isNearViewport, isMotionAllowed])

  const shouldRenderVideo = isNearViewport && isMotionAllowed

  return (
    <div ref={containerRef} className={`relative ${className}`}>
      {children}
      {shouldRenderVideo ? (
        <video
          ref={videoRef}
          className={`absolute inset-[5px] h-[calc(100%-10px)] w-[calc(100%-10px)] rounded-[23px] object-cover transition-opacity duration-500 ease-standard ${
            isPlaying ? 'opacity-100' : 'opacity-0'
          }`}
          src={videoPath}
          aria-hidden="true"
          tabIndex={-1}
          preload="auto"
          muted
          loop
          playsInline
          disablePictureInPicture
          disableRemotePlayback
          onPlaying={() => setIsPlaying(true)}
        />
      ) : null}
    </div>
  )
}
