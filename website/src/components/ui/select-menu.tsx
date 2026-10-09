'use client'

import { type KeyboardEvent, useEffect, useId, useRef, useState } from 'react'

export type SelectMenuOption<Value extends string> = {
  value: Value
  label: string
  /** Why it can't be picked right now. Shown under its label; `undefined` means it can. */
  disabledReason?: string
}

type SelectMenuProps<Value extends string> = {
  label: string
  value: Value
  options: readonly SelectMenuOption<Value>[]
  onChange: (value: Value) => void
  className?: string
}

/**
 * A pill that opens a short list (D-050), in place of the browser's own `<select>`. The listbox
 * pattern: arrows move, Enter or Space picks, Escape and a click outside close.
 */
export function SelectMenu<Value extends string>({
  label,
  value,
  options,
  onChange,
  className = '',
}: SelectMenuProps<Value>) {
  const [isOpen, setIsOpen] = useState(false)
  const [activeIndex, setActiveIndex] = useState(0)
  const rootRef = useRef<HTMLDivElement>(null)
  const buttonRef = useRef<HTMLButtonElement>(null)
  const listRef = useRef<HTMLDivElement>(null)
  const listId = useId()
  const selectedOption = options.find((option) => option.value === value)

  useEffect(() => {
    if (!isOpen) return
    listRef.current?.focus()
    const closeOnOutsidePress = (event: PointerEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) setIsOpen(false)
    }
    document.addEventListener('pointerdown', closeOnOutsidePress)
    return () => document.removeEventListener('pointerdown', closeOnOutsidePress)
  }, [isOpen])

  function openMenu() {
    const selectedIndex = options.findIndex((option) => option.value === value)
    setActiveIndex(Math.max(0, selectedIndex))
    setIsOpen(true)
  }

  function closeMenu() {
    setIsOpen(false)
    buttonRef.current?.focus()
  }

  function pickOption(optionIndex: number) {
    const option = options[optionIndex]
    if (option === undefined || option.disabledReason !== undefined) return
    onChange(option.value)
    closeMenu()
  }

  function handleButtonKeyDown(event: KeyboardEvent<HTMLButtonElement>) {
    if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
      event.preventDefault()
      openMenu()
    }
  }

  function handleListKeyDown(event: KeyboardEvent<HTMLDivElement>) {
    const lastIndex = options.length - 1
    const moves: Record<string, number> = {
      ArrowDown: Math.min(lastIndex, activeIndex + 1),
      ArrowUp: Math.max(0, activeIndex - 1),
      Home: 0,
      End: lastIndex,
    }
    const nextIndex = moves[event.key]
    if (nextIndex !== undefined) {
      event.preventDefault()
      setActiveIndex(nextIndex)
    } else if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault()
      pickOption(activeIndex)
    } else if (event.key === 'Escape' || event.key === 'Tab') {
      if (event.key === 'Escape') event.preventDefault()
      closeMenu()
    }
  }

  return (
    <div ref={rootRef} className={`relative ${className}`}>
      <button
        ref={buttonRef}
        type="button"
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        aria-controls={isOpen ? listId : undefined}
        onClick={() => (isOpen ? setIsOpen(false) : openMenu())}
        onKeyDown={handleButtonKeyDown}
        className="inline-flex h-10 items-center gap-2 rounded-full bg-surface-muted pr-3 pl-4 text-xs leading-[1.15] font-medium uppercase transition-colors duration-300 ease-standard hover:bg-surface active:bg-surface"
      >
        <span className="text-ink-secondary-small">{label}</span>
        <span>{selectedOption?.label}</span>
        <svg
          aria-hidden="true"
          className={`size-3.5 transition-transform duration-300 ease-standard ${isOpen ? 'rotate-180' : ''}`}
          viewBox="0 0 14 14"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="m3 5.5 4 4 4-4" />
        </svg>
      </button>
      {isOpen ? (
        <div
          ref={listRef}
          id={listId}
          role="listbox"
          tabIndex={-1}
          aria-label={label}
          aria-activedescendant={`${listId}-${activeIndex}`}
          onKeyDown={handleListKeyDown}
          className="select-menu-list absolute top-[calc(100%+6px)] right-0 z-10 flex min-w-[220px] flex-col gap-0.5 rounded-panel bg-surface p-1.5 shadow-floating-pill outline-none"
        >
          {options.map((option, optionIndex) => {
            const isSelected = option.value === value
            const isDisabled = option.disabledReason !== undefined
            return (
              // biome-ignore lint/a11y/useKeyWithClickEvents: the listbox handles the keyboard for its options.
              <div
                key={option.value}
                id={`${listId}-${optionIndex}`}
                role="option"
                tabIndex={-1}
                aria-selected={isSelected}
                aria-disabled={isDisabled}
                onClick={() => pickOption(optionIndex)}
                onPointerMove={() => setActiveIndex(optionIndex)}
                className={`flex items-start justify-between gap-4 rounded-[6px] px-3 py-2.5 text-sm leading-[1.25] ${
                  optionIndex === activeIndex && !isDisabled ? 'bg-surface-muted' : ''
                } ${isDisabled ? 'text-ink-secondary' : ''}`}
              >
                <span className="flex flex-col gap-0.5">
                  {option.label}
                  {isDisabled ? (
                    <span className="text-xs leading-[1.3] text-ink-secondary-small">
                      {option.disabledReason}
                    </span>
                  ) : null}
                </span>
                {isSelected ? (
                  <svg
                    aria-hidden="true"
                    className="mt-0.5 size-3.5 shrink-0"
                    viewBox="0 0 14 14"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="m2.5 7.5 3 3 6-7" />
                  </svg>
                ) : null}
              </div>
            )
          })}
        </div>
      ) : null}
    </div>
  )
}
