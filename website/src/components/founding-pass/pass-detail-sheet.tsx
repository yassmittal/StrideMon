'use client'

import { useEffect, useId, useRef } from 'react'
import { passDetailContent } from '@/content/founding-pass'
import { readPassDesign } from '@/lib/founding-pass/pass-design'
import { PassDetails } from './pass-details'

type PassDetailSheetProps = {
  /** The open pass, or null when the sheet is closed. */
  designNumber: number | null
  onClose: () => void
  onSelectDesign: (designNumber: number) => void
}

/**
 * The gallery's detail sheet: a bottom sheet on a phone, a centred panel on a desktop. A modal
 * `<dialog>`, so focus stays inside, Escape closes it, and focus returns to the card afterwards.
 */
export function PassDetailSheet({ designNumber, onClose, onSelectDesign }: PassDetailSheetProps) {
  const dialogRef = useRef<HTMLDialogElement>(null)
  const scrollAreaRef = useRef<HTMLDivElement>(null)
  const headingId = useId()
  const design = designNumber === null ? undefined : readPassDesign(designNumber)

  useEffect(() => {
    const dialog = dialogRef.current
    if (dialog === null) return
    if (design !== undefined && !dialog.open) dialog.showModal()
    if (design === undefined && dialog.open) dialog.close()
  }, [design])

  useEffect(() => {
    // A similar pass opens in place: start it from the top.
    if (designNumber !== null) scrollAreaRef.current?.scrollTo({ top: 0 })
  }, [designNumber])

  return (
    // biome-ignore lint/a11y/useKeyWithClickEvents: the click only catches the backdrop; the keyboard closes a modal dialog with Escape.
    <dialog
      ref={dialogRef}
      aria-labelledby={headingId}
      onClose={onClose}
      onClick={(event) => {
        // A click on the dimmed backdrop lands on the dialog itself.
        if (event.target === dialogRef.current) onClose()
      }}
      className="pass-sheet"
    >
      <div ref={scrollAreaRef} className="pass-sheet-scroll">
        <div className="sticky top-0 z-10 flex justify-end px-3 pt-3 md:px-4 md:pt-4">
          <button
            type="button"
            onClick={onClose}
            aria-label={passDetailContent.closeLabel}
            className="flex size-11 items-center justify-center rounded-full bg-surface-muted shadow-floating-pill transition-colors duration-300 ease-standard active:bg-surface"
          >
            <svg
              aria-hidden="true"
              className="size-4"
              viewBox="0 0 18 18"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
            >
              <path d="M4 4l10 10M14 4 4 14" />
            </svg>
          </button>
        </div>
        <div className="px-4 pt-3 pb-10 md:-mt-11 md:px-[30px] md:pt-0 md:pb-[30px]">
          {design === undefined ? null : (
            <PassDetails
              key={design.designNumber}
              designNumber={design.designNumber}
              headingLevel="h2"
              headingId={headingId}
              onSelectDesign={onSelectDesign}
            />
          )}
        </div>
      </div>
    </dialog>
  )
}
