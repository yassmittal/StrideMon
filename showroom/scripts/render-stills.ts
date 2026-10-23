// Renders the lit store's stills from the showroom itself (Part 4): the fallback's portrait and
// landscape pictures (WebP) and the 1200 × 630 share card (JPEG), into public/stills/. They're
// generated files: never edit them by hand; run this again after a visible change to the street.
//
// It drives Google Chrome over the DevTools protocol (no dependency), on the production build:
//   bun run build && bun run start        (in one terminal)
//   bun run render-stills                 (in another; or pass another base URL)
//
// `?still` hides the DOM layer and starts on the lit street; `?tier=high` holds the High tier.

import { mkdir, rm, writeFile } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join } from 'node:path'

const CHROME_PATH = '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome'
const DEBUGGING_PORT = 9333
const OUTPUT_DIRECTORY = join(import.meta.dir, '..', 'public', 'stills')
/** After the store says it's ready: the lit street's fade-in (0.5 s) and a settled frame. */
const SETTLE_MILLISECONDS = 2500

type Still = {
  fileName: string
  width: number
  height: number
  pixelRatio: number
  format: 'webp' | 'jpeg'
  quality: number
}

const STILLS: readonly Still[] = [
  {
    fileName: 'store-landscape.webp',
    width: 1440,
    height: 900,
    pixelRatio: 1.5,
    format: 'webp',
    quality: 72,
  },
  {
    fileName: 'store-portrait.webp',
    width: 430,
    height: 932,
    pixelRatio: 2,
    format: 'webp',
    quality: 72,
  },
  {
    fileName: 'share-card.jpg',
    width: 1200,
    height: 630,
    pixelRatio: 1,
    format: 'jpeg',
    quality: 84,
  },
]

const baseUrl = process.argv[2] ?? 'http://localhost:3002'

class DevToolsSession {
  private nextId = 1
  private readonly pending = new Map<
    number,
    { resolve: (result: unknown) => void; reject: (error: Error) => void }
  >()

  private constructor(private readonly socket: WebSocket) {
    socket.addEventListener('message', (event) => {
      const message = JSON.parse(String(event.data)) as {
        id?: number
        result?: unknown
        error?: { message: string }
      }
      const request = message.id === undefined ? undefined : this.pending.get(message.id)
      if (request === undefined || message.id === undefined) return
      this.pending.delete(message.id)
      if (message.error !== undefined) request.reject(new Error(message.error.message))
      else request.resolve(message.result)
    })
  }

  static async open(webSocketUrl: string): Promise<DevToolsSession> {
    const socket = new WebSocket(webSocketUrl)
    await new Promise((resolve, reject) => {
      socket.addEventListener('open', resolve)
      socket.addEventListener('error', reject)
    })
    return new DevToolsSession(socket)
  }

  send<Result>(method: string, params: Record<string, unknown> = {}): Promise<Result> {
    const id = this.nextId++
    this.socket.send(JSON.stringify({ id, method, params }))
    return new Promise((resolve, reject) =>
      this.pending.set(id, { resolve: resolve as (result: unknown) => void, reject }),
    )
  }

  close(): void {
    this.socket.close()
  }
}

async function waitForChrome(): Promise<string> {
  for (let attempt = 0; attempt < 50; attempt += 1) {
    try {
      const response = await fetch(`http://127.0.0.1:${DEBUGGING_PORT}/json/list`)
      const targets = (await response.json()) as { type: string; webSocketDebuggerUrl: string }[]
      const page = targets.find((target) => target.type === 'page')
      if (page !== undefined) return page.webSocketDebuggerUrl
    } catch {
      // Not up yet.
    }
    await Bun.sleep(200)
  }
  throw new Error('Chrome did not start')
}

async function renderStill(session: DevToolsSession, still: Still): Promise<void> {
  await session.send('Emulation.setDeviceMetricsOverride', {
    width: still.width,
    height: still.height,
    deviceScaleFactor: still.pixelRatio,
    mobile: still.height > still.width,
  })
  await session.send('Page.navigate', { url: `${baseUrl}/?still&tier=high` })
  const startedAt = Date.now()
  for (;;) {
    const { result } = await session.send<{ result: { value?: string } }>('Runtime.evaluate', {
      expression: "document.querySelector('main')?.dataset.loadingPhase ?? ''",
      returnByValue: true,
    })
    if (result.value === 'ready') break
    if (result.value !== 'loading' && result.value !== '' && result.value !== undefined) {
      throw new Error(`The showroom showed its fallback (${result.value}): is WebGL on?`)
    }
    if (Date.now() - startedAt > 60_000) throw new Error('The showroom did not get ready')
    await Bun.sleep(250)
  }
  await Bun.sleep(SETTLE_MILLISECONDS)
  const { data } = await session.send<{ data: string }>('Page.captureScreenshot', {
    format: still.format,
    quality: still.quality,
  })
  const bytes = Buffer.from(data, 'base64')
  await writeFile(join(OUTPUT_DIRECTORY, still.fileName), bytes)
  const pixelSize = `${still.width * still.pixelRatio} × ${still.height * still.pixelRatio}`
  console.log(`${still.fileName}: ${pixelSize}, ${Math.round(bytes.length / 1024)} KB`)
}

const profileDirectory = join(tmpdir(), `stridemon-showroom-stills-${process.pid}`)
const chrome = Bun.spawn(
  [
    CHROME_PATH,
    '--headless=new',
    `--remote-debugging-port=${DEBUGGING_PORT}`,
    `--user-data-dir=${profileDirectory}`,
    '--hide-scrollbars',
    '--no-first-run',
    '--ignore-gpu-blocklist',
    'about:blank',
  ],
  { stdout: 'ignore', stderr: 'ignore' },
)

try {
  await mkdir(OUTPUT_DIRECTORY, { recursive: true })
  const session = await DevToolsSession.open(await waitForChrome())
  await session.send('Page.enable')
  for (const still of STILLS) await renderStill(session, still)
  session.close()
} finally {
  chrome.kill()
  await chrome.exited
  await rm(profileDirectory, { recursive: true, force: true })
}
