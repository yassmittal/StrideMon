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

export function ChevronIcon({
  direction,
  className = '',
}: {
  direction: 'up' | 'down'
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
      <path d={direction === 'up' ? 'M4 11.5l5-5 5 5' : 'M4 6.5l5 5 5-5'} />
    </svg>
  )
}
