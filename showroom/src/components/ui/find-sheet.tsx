'use client'

import { useEffect, useId, useRef, useState } from 'react'
import { findCopy } from '@/content/showroom'
import { useSmallStore } from '@/lib/create-small-store'
import { findSneakerDesigns, pickSurpriseDesignNumber } from '@/lib/find-sneaker'
import { formatPassNumber, passRarityLabels } from '@/lib/sneaker-design'
import { visitStore } from '@/lib/visit-store'
import { walkController } from '@/visit/walk-controller'
import { PillButton } from './pill'

// Find a Sneaker (brief §10, D-066): one field, a number from 1 to 1,000 or any part of a name,
// matched as you type against the design table, and "Surprise me" (any other design, D-068).
// The pick goes on the counter's stand and the camera comes to it with its tag. It sits at the
// top of the screen, where a phone's keyboard can't cover it.

export function putOnStand(designNumber: number): void {
  visitStore.update({ standDesignNumber: designNumber, isFindOpen: false })
  walkController.lookCloserAtStand()
}

export function FindSheet() {
  const isOpen = useSmallStore(visitStore, (state) => state.isFindOpen)
  if (!isOpen) return null
  return <FindDialog />
}

function FindDialog() {
  const [query, setQuery] = useState('')
  const inputRef = useRef<HTMLInputElement>(null)
  const fieldId = useId()
  const results = findSneakerDesigns(query)
  const trimmedQuery = query.trim()
  const close = () => visitStore.update({ isFindOpen: false })

  useEffect(() => {
    const previouslyFocused = document.activeElement
    inputRef.current?.focus({ preventScroll: true })
    return () => {
      if (previouslyFocused instanceof HTMLElement) previouslyFocused.focus({ preventScroll: true })
    }
  }, [])

  const surprise = () => {
    putOnStand(pickSurpriseDesignNumber({ standDesignNumber: visitStore.read().standDesignNumber }))
  }

  return (
    <div
      data-ui-panel
      className="pointer-events-auto absolute inset-0 z-30 flex justify-center bg-black/45 px-4 pt-[max(16px,env(safe-area-inset-top))] sm:pt-20"
      onPointerDown={(event) => {
        if (event.target === event.currentTarget) close()
      }}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby={`${fieldId}-title`}
        className="flex h-fit max-h-[calc(100dvh-32px)] w-full max-w-[26rem] flex-col gap-3 overflow-y-auto rounded-panel border border-hairline-on-dark bg-dark-panel/95 p-4 backdrop-blur-md"
        onKeyDown={(event) => {
          if (event.key === 'Escape') {
            event.stopPropagation()
            close()
          }
        }}
      >
        <div className="flex items-center justify-between gap-3">
          <h2 id={`${fieldId}-title`} className="font-mono text-label text-on-dark uppercase">
            {findCopy.title}
          </h2>
          <button
            type="button"
            onClick={close}
            className="py-1 font-mono text-label text-on-dark-secondary uppercase underline decoration-hairline-on-dark underline-offset-4 hover:text-on-dark"
          >
            {findCopy.close}
          </button>
        </div>
        <form
          className="flex flex-col gap-2"
          onSubmit={(event) => {
            event.preventDefault()
            const firstResult = results[0]
            if (firstResult !== undefined) putOnStand(firstResult.designNumber)
          }}
        >
          <label htmlFor={fieldId} className="text-[14px] text-on-dark-secondary">
            {findCopy.fieldLabel}
          </label>
          <input
            ref={inputRef}
            id={fieldId}
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder={findCopy.placeholder}
            autoComplete="off"
            autoCapitalize="words"
            spellCheck={false}
            enterKeyHint="go"
            className="h-12 w-full rounded-[8px] border border-hairline-on-dark bg-black/40 px-3.5 text-[16px] text-on-dark placeholder:text-white/35 focus-visible:outline-2 focus-visible:outline-lime"
          />
        </form>
        {trimmedQuery === '' ? null : results.length === 0 ? (
          <p aria-live="polite" className="text-[14px] text-on-dark leading-snug">
            {findCopy.noMatch(trimmedQuery.slice(0, 40))}
          </p>
        ) : (
          <ul aria-label={findCopy.resultsLabel} className="flex flex-col">
            {results.map((design) => (
              <li key={design.designNumber}>
                <button
                  type="button"
                  onClick={() => putOnStand(design.designNumber)}
                  className="flex w-full items-baseline justify-between gap-3 rounded-[8px] px-2 py-2.5 text-left hover:bg-white/8 active:bg-white/12"
                >
                  <span className="flex min-w-0 items-baseline gap-3">
                    <span className="font-mono text-label text-on-dark-secondary">
                      {formatPassNumber(design.designNumber)}
                    </span>
                    <span className="truncate text-[15px] text-on-dark">{design.name}</span>
                  </span>
                  <span className="shrink-0 font-mono text-label text-on-dark-secondary uppercase">
                    {passRarityLabels[design.rarity]}
                  </span>
                </button>
              </li>
            ))}
          </ul>
        )}
        <div>
          <PillButton label={findCopy.surprise} size="compact" onPress={surprise} />
        </div>
      </div>
    </div>
  )
}
