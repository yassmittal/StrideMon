'use client'

import { useEffect, useRef, useState } from 'react'

type CountUpProps = {
  value: number
  fractionDigits: number
}

const countDurationMilliseconds = 900

function formatNumber(value: number, fractionDigits: number): string {
  return value.toFixed(fractionDigits)
}

// Counts from zero to `value` once, when it enters the viewport. The server renders the final
// number, and reduced motion leaves it there. The mono font plus a fixed `ch` width keeps it still.
export function CountUp({ value, fractionDigits }: CountUpProps) {
  const finalText = formatNumber(value, fractionDigits)
  const [displayedText, setDisplayedText] = useState(finalText)
  const elementRef = useRef<HTMLSpanElement>(null)

  useEffect(() => {
    const element = elementRef.current
    if (!element) return
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
    if (element.getBoundingClientRect().top < window.innerHeight) return

    setDisplayedText(formatNumber(0, fractionDigits))
    let animationFrameId = 0
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry?.isIntersecting) return
        observer.disconnect()
        const startMilliseconds = performance.now()
        const step = (nowMilliseconds: number) => {
          const progress = Math.min(
            1,
            (nowMilliseconds - startMilliseconds) / countDurationMilliseconds,
          )
          const easedProgress = 1 - (1 - progress) ** 3
          setDisplayedText(formatNumber(value * easedProgress, fractionDigits))
          if (progress < 1) animationFrameId = requestAnimationFrame(step)
        }
        animationFrameId = requestAnimationFrame(step)
      },
      { rootMargin: '0px 0px -10% 0px' },
    )
    observer.observe(element)
    return () => {
      observer.disconnect()
      cancelAnimationFrame(animationFrameId)
    }
  }, [value, fractionDigits])

  return (
    <span
      ref={elementRef}
      className="inline-block tabular-nums"
      style={{ minWidth: `${finalText.length}ch` }}
    >
      {displayedText}
    </span>
  )
}
