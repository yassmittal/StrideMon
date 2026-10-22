import { helpUrl, storeStatusCopy } from '@/content/showroom'

// Placeholders for the loader and the failure (Part 4 builds the real ones). Each says where you
// are and what to do next.

export function StoreLoading({ progress }: { progress: number }) {
  const percent = Math.round(progress * 100)
  return (
    <div className="absolute inset-0 flex items-center justify-center">
      <p className="font-mono text-label text-on-dark-secondary uppercase" role="status">
        {storeStatusCopy.loading} · {percent}%
      </p>
    </div>
  )
}

export function StoreFailed() {
  return (
    <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 px-4 text-center">
      <p className="max-w-sm text-on-dark">{storeStatusCopy.failed}</p>
      <div className="flex gap-2">
        <a href="/" className="rounded-full bg-white px-4 py-2 text-black text-sm">
          {storeStatusCopy.reload}
        </a>
        <a href={helpUrl} className="rounded-full border border-hairline-on-dark px-4 py-2 text-sm">
          {storeStatusCopy.help}
        </a>
      </div>
    </div>
  )
}
