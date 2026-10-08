// Cloudflare Turnstile, loaded only when a step needs it (D-041, D-045): Send code and Mint.

type TurnstileRenderOptions = {
  sitekey: string
  action: string
  appearance: 'always' | 'execute' | 'interaction-only'
  theme: 'light' | 'dark' | 'auto'
  size: 'normal' | 'flexible' | 'compact'
  'refresh-expired': 'auto' | 'manual' | 'never'
  callback: (token: string) => void
  'expired-callback': () => void
  'error-callback': (errorCode: string) => void
}

export type TurnstileApi = {
  render: (container: HTMLElement, options: TurnstileRenderOptions) => string | undefined
  reset: (widgetId: string) => void
  remove: (widgetId: string) => void
}

declare global {
  interface Window {
    turnstile?: TurnstileApi
  }
}

const TURNSTILE_SCRIPT_URL = 'https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit'
const SCRIPT_LOAD_TIMEOUT_MILLISECONDS = 15_000

let scriptLoad: Promise<TurnstileApi> | null = null

/** Turnstile's API, adding its script the first time. A failed load can be tried again. */
export function loadTurnstile(): Promise<TurnstileApi> {
  if (window.turnstile !== undefined) return Promise.resolve(window.turnstile)
  scriptLoad ??= new Promise<TurnstileApi>((resolve, reject) => {
    const script = document.createElement('script')
    script.src = TURNSTILE_SCRIPT_URL
    script.async = true
    const timeoutId = window.setTimeout(() => fail(), SCRIPT_LOAD_TIMEOUT_MILLISECONDS)
    function fail() {
      window.clearTimeout(timeoutId)
      script.remove()
      scriptLoad = null
      reject(new Error('Turnstile did not load'))
    }
    script.addEventListener('load', () => {
      window.clearTimeout(timeoutId)
      if (window.turnstile === undefined) fail()
      else resolve(window.turnstile)
    })
    script.addEventListener('error', fail)
    document.head.append(script)
  })
  return scriptLoad
}
