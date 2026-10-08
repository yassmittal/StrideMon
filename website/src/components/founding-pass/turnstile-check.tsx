'use client'

import { useEffect, useRef } from 'react'
import { turnstileSiteKey } from '@/content/site'
import { loadTurnstile } from '@/lib/founding-pass/turnstile'

type TurnstileCheckProps = {
  /** Shown in Cloudflare's dashboard: `send-code` or `mint`. */
  action: 'send-code' | 'mint'
  /** Changing it asks for a fresh token: each one works once. */
  resetKey: number
  onTokenChange: (token: string | null) => void
  /** The check couldn't load or run (blocked, offline). Cleared by the next token. */
  onProblem: () => void
}

/**
 * Cloudflare Turnstile, out of sight unless it needs a tap (`interaction-only`). It hands each
 * fresh token up, and null when one runs out.
 */
export function TurnstileCheck({
  action,
  resetKey,
  onTokenChange,
  onProblem,
}: TurnstileCheckProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const widgetIdRef = useRef<string | null>(null)
  const callbacksRef = useRef({ onTokenChange, onProblem })
  callbacksRef.current = { onTokenChange, onProblem }

  useEffect(() => {
    let isCancelled = false
    const container = containerRef.current
    if (container === null) return
    if (turnstileSiteKey === '') {
      callbacksRef.current.onProblem()
      return
    }
    loadTurnstile()
      .then((turnstile) => {
        if (isCancelled) return
        widgetIdRef.current =
          turnstile.render(container, {
            sitekey: turnstileSiteKey,
            action,
            appearance: 'interaction-only',
            theme: 'light',
            size: 'flexible',
            'refresh-expired': 'auto',
            callback: (token) => callbacksRef.current.onTokenChange(token),
            'expired-callback': () => callbacksRef.current.onTokenChange(null),
            'error-callback': () => callbacksRef.current.onProblem(),
          }) ?? null
      })
      .catch(() => {
        if (!isCancelled) callbacksRef.current.onProblem()
      })
    return () => {
      isCancelled = true
      const widgetId = widgetIdRef.current
      widgetIdRef.current = null
      if (widgetId !== null) window.turnstile?.remove(widgetId)
    }
  }, [action])

  useEffect(() => {
    if (resetKey === 0) return
    const widgetId = widgetIdRef.current
    callbacksRef.current.onTokenChange(null)
    if (widgetId !== null) window.turnstile?.reset(widgetId)
  }, [resetKey])

  return <div ref={containerRef} className="empty:hidden" />
}
