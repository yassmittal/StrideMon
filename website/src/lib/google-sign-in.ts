// Google Identity Services, loaded only when an email form is on screen (D-057), so the landing
// page's first load never pays for it.

type GoogleCredentialResponse = { credential?: string }

type GoogleButtonOptions = {
  type: 'standard'
  theme: 'outline' | 'filled_black'
  size: 'large'
  text: 'continue_with' | 'signin_with'
  shape: 'pill'
  logo_alignment: 'left'
  width: number
}

export type GoogleIdentityApi = {
  initialize: (options: {
    client_id: string
    callback: (response: GoogleCredentialResponse) => void
    ux_mode: 'popup'
    auto_select: false
    itp_support: true
    use_fedcm_for_button: true
  }) => void
  renderButton: (container: HTMLElement, options: GoogleButtonOptions) => void
}

declare global {
  interface Window {
    google?: { accounts?: { id?: GoogleIdentityApi } }
  }
}

const GOOGLE_SCRIPT_URL = 'https://accounts.google.com/gsi/client'
const SCRIPT_LOAD_TIMEOUT_MILLISECONDS = 15_000

let scriptLoad: Promise<GoogleIdentityApi> | null = null

/** Google's sign-in API, adding its script the first time. A failed load can be tried again. */
export function loadGoogleIdentity(): Promise<GoogleIdentityApi> {
  const loadedApi = window.google?.accounts?.id
  if (loadedApi !== undefined) return Promise.resolve(loadedApi)
  scriptLoad ??= new Promise<GoogleIdentityApi>((resolve, reject) => {
    const script = document.createElement('script')
    script.src = GOOGLE_SCRIPT_URL
    script.async = true
    const timeoutId = window.setTimeout(() => fail(), SCRIPT_LOAD_TIMEOUT_MILLISECONDS)
    function fail() {
      window.clearTimeout(timeoutId)
      script.remove()
      scriptLoad = null
      reject(new Error('Google sign-in did not load'))
    }
    script.addEventListener('load', () => {
      window.clearTimeout(timeoutId)
      const api = window.google?.accounts?.id
      if (api === undefined) fail()
      else resolve(api)
    })
    script.addEventListener('error', fail)
    document.head.append(script)
  })
  return scriptLoad
}
