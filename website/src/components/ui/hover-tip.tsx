import type { ReactNode } from 'react'

type HoverTipProps = {
  /** The tip's id. The child points at it with `aria-describedby`. */
  id: string
  text: string
  children: ReactNode
}

/**
 * A short note under a button, on hover and on keyboard focus (D-073). Never anything needed to go
 * on: a phone has no hover, so it taps straight through.
 */
export function HoverTip({ id, text, children }: HoverTipProps) {
  return (
    <span className="group/tip relative inline-flex">
      {children}
      <span
        role="tooltip"
        id={id}
        className="pointer-events-none absolute top-full left-1/2 z-20 mt-3 w-max max-w-[17rem] -translate-x-1/2 translate-y-1 rounded-panel bg-dark-panel px-3.5 py-2.5 text-sm leading-[1.35] text-on-dark opacity-0 transition duration-300 ease-standard group-hover/tip:translate-y-0 group-hover/tip:opacity-100 group-hover/tip:delay-150 group-has-[:focus-visible]/tip:translate-y-0 group-has-[:focus-visible]/tip:opacity-100"
      >
        <span
          aria-hidden="true"
          className="absolute -top-1 left-1/2 size-2.5 -translate-x-1/2 rotate-45 rounded-[2px] bg-dark-panel"
        />
        {text}
      </span>
    </span>
  )
}
