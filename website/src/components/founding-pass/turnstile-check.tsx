'use client'

import { type ReactNode, useCallback, useEffect, useRef, useState } from 'react'
import { turnstileSiteKey } from '@/content/site'
import { loadTurnstile } from '@/lib/founding-pass/turnstile'

/** What each token is for: the API checks it, so a token for one can't be spent on another. */
export type TurnstileAction = 'send-code' | 'send-waitlist-code' | 'mint' | 'join-waitlist'

type TurnstileCheckProps = {
  /** Shown in Cloudflare's dashboard, and checked by the API (D-045, D-056, D-057). */
  action: TurnstileAction
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

/**
 * A Turnstile check and a way to take its token when a form needs one (D-056): it waits for the
 * token if it isn't there yet, answers null if the check can't run, and asks for a fresh token
 * after each one is taken (each works once). With `isLazy`, the check (and Cloudflare's script)
 * starts only on `armTurnstile` or the first token taken, so people who only browse never load it
 * (D-050).
 */
export function useTurnstileToken(
  action: TurnstileAction,
  { isLazy = false }: { isLazy?: boolean } = {},
): {
  turnstileCheck: ReactNode
  takeTurnstileToken: () => Promise<string | null>
  /** Start the check early, when someone begins to fill the form in. */
  armTurnstile: () => void
} {
  const [isArmed, setIsArmed] = useState(!isLazy)
  const [resetKey, setResetKey] = useState(0)
  const tokenRef = useRef<string | null>(null)
  const hasProblemRef = useRef(false)
  const waitersRef = useRef<((token: string | null) => void)[]>([])

  const answerWaiters = useCallback((token: string | null) => {
    const waiters = waitersRef.current
    waitersRef.current = []
    for (const waiter of waiters) waiter(token)
  }, [])
  const onTokenChange = useCallback(
    (token: string | null) => {
      tokenRef.current = token
      if (token === null) return
      hasProblemRef.current = false
      answerWaiters(token)
    },
    [answerWaiters],
  )
  const onProblem = useCallback(() => {
    hasProblemRef.current = true
    answerWaiters(null)
  }, [answerWaiters])

  const armTurnstile = useCallback(() => setIsArmed(true), [])

  const takeTurnstileToken = useCallback(async (): Promise<string | null> => {
    setIsArmed(true)
    let token = tokenRef.current
    if (token === null) {
      if (hasProblemRef.current) return null
      token = await new Promise<string | null>((resolve) => waitersRef.current.push(resolve))
      if (token === null) return null
    }
    tokenRef.current = null
    setResetKey((key) => key + 1)
    return token
  }, [])

  return {
    turnstileCheck: isArmed ? (
      <TurnstileCheck
        action={action}
        resetKey={resetKey}
        onTokenChange={onTokenChange}
        onProblem={onProblem}
      />
    ) : null,
    takeTurnstileToken,
    armTurnstile,
  }
}
