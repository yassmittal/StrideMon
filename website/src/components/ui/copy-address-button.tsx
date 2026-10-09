'use client'

import { useEffect, useState } from 'react'

type CopyAddressButtonProps = {
  address: string
  shortAddress: string
  contractName: string
  tone?: 'light' | 'dark'
}

const copiedLabelMilliseconds = 1600

// The address in mono: shortened on phones, in full from tablet up. Clicking copies the full one.
export function CopyAddressButton({
  address,
  shortAddress,
  contractName,
  tone = 'light',
}: CopyAddressButtonProps) {
  const [isCopied, setIsCopied] = useState(false)

  useEffect(() => {
    if (!isCopied) return
    const timeoutId = window.setTimeout(() => setIsCopied(false), copiedLabelMilliseconds)
    return () => window.clearTimeout(timeoutId)
  }, [isCopied])

  async function copyAddress() {
    try {
      await navigator.clipboard.writeText(address)
      setIsCopied(true)
    } catch {
      // Clipboard blocked (insecure context or permission): the address stays selectable.
    }
  }

  return (
    <button
      type="button"
      onClick={copyAddress}
      aria-label={`Copy the ${contractName} address`}
      className="group inline-flex min-h-11 max-w-full items-center gap-3 text-left font-mono text-sm"
    >
      <span className="break-all lg:hidden">{shortAddress}</span>
      <span className="hidden break-all lg:inline">{address}</span>
      <span
        aria-live="polite"
        className={`shrink-0 rounded-full px-2.5 py-1 font-sans text-[0.625rem] font-medium tracking-[0.08em] uppercase transition-colors duration-300 ease-standard ${
          tone === 'dark'
            ? 'bg-dark-track text-on-dark group-hover:bg-on-dark group-hover:text-ink'
            : 'bg-surface-muted group-hover:bg-ink group-hover:text-on-dark'
        }`}
      >
        {isCopied ? 'Copied' : 'Copy'}
      </span>
    </button>
  )
}
