type ArrowIconProps = {
  className?: string
}

export function ArrowIcon({ className = '' }: ArrowIconProps) {
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
