// The DOM layer's line icons, drawn like the website's arrow (1.5 stroke, round ends).

export function ArrowIcon({ className = '' }: { className?: string }) {
  return (
    <svg
      aria-hidden="true"
      className={`size-4 shrink-0 ${className}`}
      viewBox="0 0 18 18"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M3 9h12M10 4l5 5-5 5" />
    </svg>
  )
}

const chevronPaths = {
  up: 'M4 11.5l5-5 5 5',
  down: 'M4 6.5l5 5 5-5',
  left: 'M11.5 4l-5 5 5 5',
  right: 'M6.5 4l5 5-5 5',
} as const

export function ChevronIcon({
  direction,
  className = '',
}: {
  direction: 'up' | 'down' | 'left' | 'right'
  className?: string
}) {
  return (
    <svg
      aria-hidden="true"
      className={`size-[18px] shrink-0 ${className}`}
      viewBox="0 0 18 18"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d={chevronPaths[direction]} />
    </svg>
  )
}
