'use client'

import { useEffect, useRef, useState } from 'react'
import { googleClientId } from '@/content/site'
import { waitlistContent } from '@/content/waitlist'
import { loadGoogleIdentity } from '@/lib/google-sign-in'
import { isInAppBrowser } from '@/lib/in-app-browser'

type GoogleSignInButtonProps = {
  /** Google's ID token, for the API to check (`POST /v1/pass/email-google`). */
  onGoogleIdToken: (googleIdToken: string) => void
  /** Google's script didn't load: the email path below still works. */
  onUnavailable?: () => void
}

type ButtonState = 'waiting' | 'inAppBrowser' | 'ready' | 'unavailable'

const MAX_BUTTON_WIDTH_PIXELS = 400
const MIN_BUTTON_WIDTH_PIXELS = 200
// Start loading a little before the form scrolls into view.
const LOAD_ROOT_MARGIN = '200px'

/**
 * Google's own Continue with Google button (D-057). Its script loads only once the form is near
 * the screen, so the landing page's first load never pays for it. In apps' own browsers, where
 * Google refuses to sign in, it's one line pointing at the email path instead. Hidden when the
 * site has no Google client.
 */
export function GoogleSignInButton({ onGoogleIdToken, onUnavailable }: GoogleSignInButtonProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const callbacksRef = useRef({ onGoogleIdToken, onUnavailable })
  callbacksRef.current = { onGoogleIdToken, onUnavailable }
  const [buttonState, setButtonState] = useState<ButtonState>('waiting')

  useEffect(() => {
    if (googleClientId === '') return
    if (isInAppBrowser(navigator.userAgent)) {
      setButtonState('inAppBrowser')
      return
    }
    const container = containerRef.current
    if (container === null) return
    let isCancelled = false
    const observer = new IntersectionObserver(
      (entries) => {
        if (!entries.some((entry) => entry.isIntersecting)) return
        observer.disconnect()
        loadGoogleIdentity()
          .then((googleIdentity) => {
            if (isCancelled) return
            googleIdentity.initialize({
              client_id: googleClientId,
              callback: (response) => {
                if (response.credential !== undefined) {
                  callbacksRef.current.onGoogleIdToken(response.credential)
                }
              },
              ux_mode: 'popup',
              auto_select: false,
              itp_support: true,
              use_fedcm_for_button: true,
            })
            const buttonWidth = Math.round(
              Math.min(
                MAX_BUTTON_WIDTH_PIXELS,
                Math.max(MIN_BUTTON_WIDTH_PIXELS, container.clientWidth),
              ),
            )
            googleIdentity.renderButton(container, {
              type: 'standard',
              theme: 'outline',
              size: 'large',
              text: 'continue_with',
              shape: 'pill',
              logo_alignment: 'left',
              width: buttonWidth,
            })
            setButtonState('ready')
          })
          .catch(() => {
            if (isCancelled) return
            setButtonState('unavailable')
            callbacksRef.current.onUnavailable?.()
          })
      },
      { rootMargin: LOAD_ROOT_MARGIN },
    )
    observer.observe(container)
    return () => {
      isCancelled = true
      observer.disconnect()
    }
  }, [])

  if (googleClientId === '' || buttonState === 'unavailable') return null
  if (buttonState === 'inAppBrowser') {
    return (
      <p className="text-sm leading-[1.45] text-ink-secondary-small">
        {waitlistContent.googleInAppBrowserNote}
      </p>
    )
  }
  // Google draws its button inside; the height holds its place until then.
  return <div ref={containerRef} className="min-h-11 w-full max-w-[400px]" />
}
