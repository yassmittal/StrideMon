'use client'

import { type KeyboardEvent, type ReactNode, useEffect, useRef, useState } from 'react'

export type HashTab = {
  /** The panel's id, which a `#hash` link opens. */
  id: string
  label: string
  panel: ReactNode
}

type HashTabsProps = {
  label: string
  tabs: readonly HashTab[]
}

/**
 * Tabs on a dark section (D-050). Each panel keeps an id, so a link to `#on-chain` selects its
 * tab and scrolls to it. The tabs pattern: arrows, Home and End move between tabs.
 */
export function HashTabs({ label, tabs }: HashTabsProps) {
  const [selectedId, setSelectedId] = useState(tabs[0]?.id ?? '')
  const tabRefs = useRef(new Map<string, HTMLButtonElement>())
  const rootRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const selectFromHash = () => {
      const hashId = window.location.hash.slice(1)
      if (!tabs.some((tab) => tab.id === hashId)) return
      setSelectedId(hashId)
      // The panel was hidden when the browser looked for it: scroll once it shows.
      window.requestAnimationFrame(() => rootRef.current?.scrollIntoView({ block: 'start' }))
    }
    selectFromHash()
    window.addEventListener('hashchange', selectFromHash)
    return () => window.removeEventListener('hashchange', selectFromHash)
  }, [tabs])

  function selectTab(tabIndex: number) {
    const tab = tabs[(tabIndex + tabs.length) % tabs.length]
    if (tab === undefined) return
    setSelectedId(tab.id)
    tabRefs.current.get(tab.id)?.focus()
  }

  function handleKeyDown(event: KeyboardEvent<HTMLDivElement>) {
    const selectedIndex = tabs.findIndex((tab) => tab.id === selectedId)
    const moves: Record<string, number> = {
      ArrowRight: selectedIndex + 1,
      ArrowLeft: selectedIndex - 1,
      Home: 0,
      End: tabs.length - 1,
    }
    const nextIndex = moves[event.key]
    if (nextIndex === undefined) return
    event.preventDefault()
    selectTab(nextIndex)
  }

  return (
    <div ref={rootRef} className="flex scroll-mt-6 flex-col gap-10 md:gap-12">
      <div
        role="tablist"
        aria-label={label}
        tabIndex={-1}
        onKeyDown={handleKeyDown}
        className="flex flex-wrap gap-2"
      >
        {tabs.map((tab) => {
          const isSelected = tab.id === selectedId
          return (
            <button
              key={tab.id}
              ref={(element) => {
                if (element === null) tabRefs.current.delete(tab.id)
                else tabRefs.current.set(tab.id, element)
              }}
              type="button"
              role="tab"
              id={`${tab.id}-tab`}
              aria-selected={isSelected}
              aria-controls={tab.id}
              tabIndex={isSelected ? 0 : -1}
              onClick={() => setSelectedId(tab.id)}
              className={`inline-flex h-10 items-center rounded-full px-4 text-xs leading-[1.15] font-medium uppercase transition-colors duration-300 ease-standard ${
                isSelected
                  ? 'bg-on-dark text-ink'
                  : 'bg-dark-track text-on-dark hover:bg-dark-panel active:bg-dark-panel'
              }`}
            >
              {tab.label}
            </button>
          )
        })}
      </div>
      {tabs.map((tab) => (
        <div
          key={tab.id}
          id={tab.id}
          role="tabpanel"
          aria-labelledby={`${tab.id}-tab`}
          hidden={tab.id !== selectedId}
        >
          {tab.panel}
        </div>
      ))}
    </div>
  )
}
